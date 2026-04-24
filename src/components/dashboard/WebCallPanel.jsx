import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, MicOff, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { startWebCall, getWebCallWsUrl } from '@/services/swasthyaApi'

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4096

/**
 * Browser-based web call panel.
 * Captures mic audio via AudioContext, sends raw PCM 16-bit 16kHz to backend
 * WebSocket, and plays back TTS audio received from the pipeline.
 */
export default function WebCallPanel({ llmProvider = 'openai', userId, onEnd }) {
    const [status, setStatus] = useState('idle') // idle | connecting | active | ended | error
    const [error, setError] = useState('')
    const [muted, setMuted] = useState(false)
    const [duration, setDuration] = useState(0)
    const mutedRef = useRef(false)

    const wsRef = useRef(null)
    const audioCtxRef = useRef(null)
    const streamRef = useRef(null)
    const processorRef = useRef(null)
    const playbackCtxRef = useRef(null)
    const nextPlayTimeRef = useRef(0)
    const timerRef = useRef(null)
    const startTimeRef = useRef(null)

    // Duration timer
    useEffect(() => {
        if (status === 'active') {
            startTimeRef.current = Date.now()
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [status])

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const cleanup = useCallback(() => {
        if (wsRef.current) {
            try { wsRef.current.close() } catch {}
            wsRef.current = null
        }
        if (processorRef.current) {
            try { processorRef.current.disconnect() } catch {}
            processorRef.current = null
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close() } catch {}
            audioCtxRef.current = null
        }
        if (playbackCtxRef.current) {
            try { playbackCtxRef.current.close() } catch {}
            playbackCtxRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const endCall = useCallback(() => {
        cleanup()
        setStatus('ended')
        onEnd?.()
    }, [cleanup, onEnd])

    const startCall = useCallback(async () => {
        setError('')
        setStatus('connecting')
        setDuration(0)

        try {
            // 1. Get mic permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })
            streamRef.current = stream

            // 2. Create web call session on backend
            const session = await startWebCall({ llm_provider: llmProvider, user_id: userId })
            if (!session?.stream_id) {
                throw new Error('Failed to create web call session')
            }

            // 3. Connect WebSocket
            const wsUrl = getWebCallWsUrl(session.stream_id, llmProvider)
            const ws = new WebSocket(wsUrl)
            ws.binaryType = 'arraybuffer'
            wsRef.current = ws

            ws.onopen = () => {
                setStatus('active')

                // 4. Set up audio capture — browser may not honor requested sampleRate
                const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE })
                audioCtxRef.current = audioCtx
                const actualRate = audioCtx.sampleRate
                const needResample = actualRate !== SAMPLE_RATE
                const resampleRatio = needResample ? SAMPLE_RATE / actualRate : 1

                const source = audioCtx.createMediaStreamSource(stream)
                const processor = audioCtx.createScriptProcessor(BUFFER_SIZE, 1, 1)
                processorRef.current = processor

                processor.onaudioprocess = (e) => {
                    if (mutedRef.current || ws.readyState !== WebSocket.OPEN) return
                    let float32 = e.inputBuffer.getChannelData(0)

                    // Resample if browser uses different rate (e.g. 48kHz -> 16kHz)
                    if (needResample) {
                        const outLen = Math.round(float32.length * resampleRatio)
                        const resampled = new Float32Array(outLen)
                        for (let i = 0; i < outLen; i++) {
                            const srcIdx = i / resampleRatio
                            const idx = Math.floor(srcIdx)
                            const frac = srcIdx - idx
                            const a = float32[idx] || 0
                            const b = float32[Math.min(idx + 1, float32.length - 1)] || 0
                            resampled[i] = a + frac * (b - a)
                        }
                        float32 = resampled
                    }

                    // Convert float32 [-1,1] to PCM 16-bit signed LE
                    const pcm16 = new Int16Array(float32.length)
                    for (let i = 0; i < float32.length; i++) {
                        const s = Math.max(-1, Math.min(1, float32[i]))
                        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
                    }
                    ws.send(pcm16.buffer)
                }

                source.connect(processor)
                processor.connect(audioCtx.destination)

                // 5. Set up audio playback for TTS responses
                const playbackCtx = new AudioContext({ sampleRate: SAMPLE_RATE })
                playbackCtxRef.current = playbackCtx
                nextPlayTimeRef.current = 0
            }

            ws.onmessage = (event) => {
                if (!(event.data instanceof ArrayBuffer)) return
                const playCtx = playbackCtxRef.current
                if (!playCtx) return

                // Received PCM 16-bit audio from TTS
                const pcm16 = new Int16Array(event.data)
                const float32 = new Float32Array(pcm16.length)
                for (let i = 0; i < pcm16.length; i++) {
                    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF)
                }

                const buffer = playCtx.createBuffer(1, float32.length, SAMPLE_RATE)
                buffer.getChannelData(0).set(float32)

                const source = playCtx.createBufferSource()
                source.buffer = buffer
                source.connect(playCtx.destination)

                const now = playCtx.currentTime
                const startAt = Math.max(now + 0.01, nextPlayTimeRef.current)
                source.start(startAt)
                nextPlayTimeRef.current = startAt + buffer.duration
            }

            ws.onclose = () => {
                if (status !== 'ended') {
                    setStatus('ended')
                    cleanup()
                    onEnd?.()
                }
            }

            ws.onerror = () => {
                setError('WebSocket connection failed')
                setStatus('error')
                cleanup()
            }
        } catch (e) {
            setError(e.message || 'Failed to start web call')
            setStatus('error')
            cleanup()
        }
    }, [llmProvider, userId, cleanup, onEnd])

    // Update muted ref in processor without restarting
    const toggleMute = useCallback(() => {
        setMuted((m) => {
            mutedRef.current = !m
            return !m
        })
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return cleanup
    }, [cleanup])

    if (status === 'idle') {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-muted/15 p-8 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                    <Mic className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Browser voice call</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Talk to the AI agent directly from your browser. No phone number needed.
                    </p>
                </div>
                <Button
                    type="button"
                    className="rounded-full px-8"
                    onClick={startCall}
                >
                    <Mic className="mr-2 h-4 w-4" />
                    Start web call
                </Button>
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>
        )
    }

    if (status === 'connecting') {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-muted/15 p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Connecting to AI agent...</p>
            </div>
        )
    }

    if (status === 'ended') {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-muted/15 p-8 text-center">
                <p className="text-sm font-semibold text-foreground">Call ended</p>
                <p className="text-xs text-muted-foreground">Duration: {formatDuration(duration)}</p>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => { setStatus('idle'); setError(''); setDuration(0) }}
                >
                    New call
                </Button>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
                <p className="text-sm font-semibold text-destructive">Call failed</p>
                <p className="text-xs text-destructive/80">{error}</p>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => { setStatus('idle'); setError('') }}
                >
                    Try again
                </Button>
            </div>
        )
    }

    // Active call
    return (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-8">
            {/* Pulsing indicator */}
            <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
                <div className="relative rounded-full bg-emerald-500/20 p-4">
                    <Mic className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Call active</p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
                    {formatDuration(duration)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Speak naturally — the AI will respond in your language
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant={muted ? 'destructive' : 'outline'}
                    size="lg"
                    className="h-12 w-12 rounded-full p-0"
                    onClick={toggleMute}
                    title={muted ? 'Unmute' : 'Mute'}
                >
                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    className="h-12 rounded-full px-6"
                    onClick={endCall}
                >
                    <PhoneOff className="mr-2 h-5 w-5" />
                    End call
                </Button>
            </div>
        </div>
    )
}
