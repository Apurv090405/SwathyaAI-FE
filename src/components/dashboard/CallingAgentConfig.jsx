import React, { useMemo, useState, useEffect, useCallback } from 'react'
import {
    Brain,
    ChevronDown,
    Globe,
    Info,
    LayoutDashboard,
    Loader2,
    Mic,
    Phone,
    PhoneCall,
    Settings,
    Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import WebCallPanel from '@/components/dashboard/WebCallPanel'
import {
    getAgentConfig,
    saveAgentConfig,
    telnyxListNumbers,
    telnyxOutbound,
    exotelListNumbers,
    exotelOutbound,
    vobizListNumbers,
    vobizOutbound,
} from '@/services/swasthyaApi'

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'telco', label: 'Telco', icon: Phone },
    { id: 'llm', label: 'LLM', icon: Brain },
    { id: 'transcriber', label: 'Transcriber', icon: Mic },
    { id: 'voice', label: 'Voice', icon: Volume2 },
    { id: 'advanced', label: 'Advanced', icon: Settings },
]

const TELCO = [
    { value: 'telnyx', label: 'Telnyx' },
    { value: 'exotel', label: 'Exotel' },
    { value: 'vobiz', label: 'Vobiz' },
]

const LLM_PROVIDERS = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
]

const MODELS_BY_LLM = {
    openai: [
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
    ],
    gemini: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
}

const TRANSCRIBERS = [
    { value: 'sarvam-stt', label: 'Sarvam AI STT' },
]

const SYNTHESIZERS = [
    { value: 'sarvam-v2', label: 'Sarvam Bulbul v2 (stable)' },
    { value: 'sarvam-v3', label: 'Sarvam Bulbul v3 (advanced)' },
]

const VOICES_BY_SYNTH = {
    'sarvam-v2': [
        { value: 'anushka', label: 'Anushka · Female', gender: 'female' },
        { value: 'manisha', label: 'Manisha · Female', gender: 'female' },
        { value: 'vidya', label: 'Vidya · Female', gender: 'female' },
        { value: 'arya', label: 'Arya · Female', gender: 'female' },
        { value: 'abhilash', label: 'Abhilash · Male', gender: 'male' },
        { value: 'karun', label: 'Karun · Male', gender: 'male' },
        { value: 'hitesh', label: 'Hitesh · Male', gender: 'male' },
    ],
    'sarvam-v3': [
        { value: 'shubh', label: 'Shubh · Male · Conversational / Friendly', gender: 'male' },
        { value: 'shreya', label: 'Shreya · Female · News / Authoritative', gender: 'female' },
        { value: 'manan', label: 'Manan · Male · Conversational / Consistent', gender: 'male' },
        { value: 'ishita', label: 'Ishita · Female · Entertainment / Dynamic', gender: 'female' },
        { value: 'aditya', label: 'Aditya · Male', gender: 'male' },
        { value: 'ritu', label: 'Ritu · Female', gender: 'female' },
        { value: 'priya', label: 'Priya · Female', gender: 'female' },
        { value: 'neha', label: 'Neha · Female', gender: 'female' },
        { value: 'rahul', label: 'Rahul · Male', gender: 'male' },
        { value: 'pooja', label: 'Pooja · Female', gender: 'female' },
        { value: 'rohan', label: 'Rohan · Male', gender: 'male' },
        { value: 'simran', label: 'Simran · Female', gender: 'female' },
        { value: 'kavya', label: 'Kavya · Female', gender: 'female' },
        { value: 'amit', label: 'Amit · Male', gender: 'male' },
        { value: 'dev', label: 'Dev · Male', gender: 'male' },
        { value: 'ratan', label: 'Ratan · Male', gender: 'male' },
        { value: 'varun', label: 'Varun · Male', gender: 'male' },
        { value: 'sumit', label: 'Sumit · Male', gender: 'male' },
        { value: 'roopa', label: 'Roopa · Female', gender: 'female' },
        { value: 'kabir', label: 'Kabir · Male', gender: 'male' },
        { value: 'aayan', label: 'Aayan · Male', gender: 'male' },
        { value: 'ashutosh', label: 'Ashutosh · Male', gender: 'male' },
        { value: 'advait', label: 'Advait · Male', gender: 'male' },
    ],
}

/** Recommended voices per language — all voices work for all languages,
 *  but these sound most natural for each. */
const RECOMMENDED_VOICES = {
    'hi-IN': { v2: 'anushka', v3: 'shubh', label: 'Hindi' },
    'en-IN': { v2: 'vidya', v3: 'shreya', label: 'English' },
    'bn-IN': { v2: 'manisha', v3: 'ritu', label: 'Bengali' },
    'gu-IN': { v2: 'arya', v3: 'kavya', label: 'Gujarati' },
    'kn-IN': { v2: 'anushka', v3: 'priya', label: 'Kannada' },
    'ml-IN': { v2: 'vidya', v3: 'ishita', label: 'Malayalam' },
    'mr-IN': { v2: 'manisha', v3: 'neha', label: 'Marathi' },
    'ta-IN': { v2: 'arya', v3: 'simran', label: 'Tamil' },
    'te-IN': { v2: 'anushka', v3: 'pooja', label: 'Telugu' },
    'pa-IN': { v2: 'karun', v3: 'manan', label: 'Punjabi' },
    'od-IN': { v2: 'manisha', v3: 'roopa', label: 'Odia' },
    'as-IN': { v2: 'vidya', v3: 'ritu', label: 'Assamese' },
}

const FIRST_MESSAGE_MODES = [
    { value: 'assistant-first', label: 'Assistant speaks first' },
    { value: 'user-first', label: 'Wait for caller' },
    { value: 'beep-then-assistant', label: 'Beep, then assistant' },
]

const LANG_LABELS = {
    auto: 'Auto-detect (all 12 languages)',
    'hi-IN': 'Hindi (हिन्दी)',
    'en-IN': 'English (India)',
    'bn-IN': 'Bengali (বাংলা)',
    'gu-IN': 'Gujarati (ગુજરાતી)',
    'kn-IN': 'Kannada (ಕನ್ನಡ)',
    'ml-IN': 'Malayalam (മലയാളം)',
    'mr-IN': 'Marathi (मराठी)',
    'ta-IN': 'Tamil (தமிழ்)',
    'te-IN': 'Telugu (తెలుగు)',
    'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
    'od-IN': 'Odia (ଓଡ଼ିଆ)',
    'as-IN': 'Assamese (অসমীয়া)',
}

const RATE_LABELS = { '0.85': '0.85×', '1.0': '1.0×', '1.1': '1.1×', '1.2': '1.2×' }
const STAB_LABELS = { '0.35': 'More expressive', '0.5': 'Balanced', '0.75': 'More stable' }

function optLabel(list, value) {
    return list.find((o) => o.value === value)?.label ?? value
}

function FieldHint({ text }) {
    return (
        <button
            type="button"
            title={text}
            className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={text}
        >
            <Info className="h-3.5 w-3.5" />
        </button>
    )
}

function SelectField({ id, label, hint, value, onChange, children, className }) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <div className="flex items-center gap-1">
                <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
                    {label}
                </Label>
                {hint ? <FieldHint text={hint} /> : null}
            </div>
            <div className="relative">
                <NativeSelect
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 rounded-xl border-border/70 bg-background/80 pr-10"
                >
                    {children}
                </NativeSelect>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-60" />
            </div>
        </div>
    )
}

function CollapsiblePanel({ title, subtitle, icon: Icon, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
            >
                <div className="flex min-w-0 items-center gap-3">
                    {Icon ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                        </span>
                    ) : null}
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {title}
                        </p>
                        {subtitle ? (
                            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{subtitle}</p>
                        ) : null}
                    </div>
                </div>
                <ChevronDown
                    className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
                />
            </button>
            {open ? <div className="border-t border-border/60 px-4 py-4">{children}</div> : null}
        </div>
    )
}

function MetricStripOverview({ label, value, valueClass, segments }) {
    return (
        <div className="calling-agent-metric-overview">
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className={cn('font-mono text-sm font-semibold tabular-nums', valueClass)}>{value}</span>
            </div>
            <div className="mt-3 flex h-2.5 gap-px overflow-hidden rounded-full bg-muted/60 dark:bg-muted/40">
                {segments.map((s, i) => (
                    <div
                        key={i}
                        className="min-w-[4px] rounded-sm opacity-95"
                        style={{ flex: s.flex, backgroundColor: s.color }}
                        title={s.label}
                    />
                ))}
            </div>
        </div>
    )
}

function SavedTile({ k, children }) {
    return (
        <div className="calling-agent-saved-tile">
            <dt>{k}</dt>
            <dd>{children}</dd>
        </div>
    )
}

const DEFAULTS = {
    telco: 'telnyx',
    fromNumber: '',
    toNumber: '',
    llmProvider: 'openai',
    llmModel: 'gpt-4.1',
    transcriber: 'sarvam-stt',
    transcribeLang: 'auto',
    synthesizer: 'sarvam-v2',
    voiceId: 'anushka',
    speakingRate: '1.0',
    stability: '0.5',
    firstMessageMode: 'assistant-first',
    firstMessage:
        'Namaste, this is SwasthyaAI. How may I help you with your health query today?',
    maxDurationMin: '15',
    recordCalls: true,
    callChannel: 'pstn',
}

function buildSnapshot(state) {
    return {
        telco: state.telco,
        fromNumber: state.fromNumber,
        toNumber: state.toNumber,
        llmProvider: state.llmProvider,
        llmModel: state.llmModel,
        transcriber: state.transcriber,
        transcribeLang: state.transcribeLang,
        synthesizer: state.synthesizer,
        voiceId: state.voiceId,
        speakingRate: state.speakingRate,
        stability: state.stability,
        firstMessageMode: state.firstMessageMode,
        firstMessage: state.firstMessage,
        maxDurationMin: state.maxDurationMin,
        recordCalls: state.recordCalls,
        callChannel: state.callChannel,
    }
}

export default function CallingAgentConfig() {
    const { user } = useAuth()
    const userId = user?.id || user?.email || ''
    const [tab, setTab] = useState('overview')
    const [saving, setSaving] = useState(false)

    const [callChannel, setCallChannel] = useState(DEFAULTS.callChannel)
    const [telco, setTelco] = useState(DEFAULTS.telco)
    const [fromNumber, setFromNumber] = useState(DEFAULTS.fromNumber)
    const [toNumber, setToNumber] = useState(DEFAULTS.toNumber)

    const [llmProvider, setLlmProvider] = useState(DEFAULTS.llmProvider)
    const [llmModel, setLlmModel] = useState(DEFAULTS.llmModel)

    const [transcriber, setTranscriber] = useState(DEFAULTS.transcriber)
    const [transcribeLang, setTranscribeLang] = useState(DEFAULTS.transcribeLang)

    const [synthesizer, setSynthesizer] = useState(DEFAULTS.synthesizer)
    const [voiceId, setVoiceId] = useState(DEFAULTS.voiceId)
    const [speakingRate, setSpeakingRate] = useState(DEFAULTS.speakingRate)
    const [stability, setStability] = useState(DEFAULTS.stability)

    const [firstMessageMode, setFirstMessageMode] = useState(DEFAULTS.firstMessageMode)
    const [firstMessage, setFirstMessage] = useState(DEFAULTS.firstMessage)
    const [maxDurationMin, setMaxDurationMin] = useState(DEFAULTS.maxDurationMin)
    const [recordCalls, setRecordCalls] = useState(DEFAULTS.recordCalls)

    const [savedConfig, setSavedConfig] = useState(null)

    const modelOptions = useMemo(
        () => MODELS_BY_LLM[llmProvider] || MODELS_BY_LLM.openai,
        [llmProvider]
    )
    const voiceOptions = useMemo(
        () => VOICES_BY_SYNTH[synthesizer] || VOICES_BY_SYNTH['sarvam-v2'],
        [synthesizer]
    )

    // Auto-populate from-number from the selected telco provider's available numbers
    useEffect(() => {
        if (fromNumber) return // don't overwrite if already set
        let cancelled = false
        const fetchDefaultNumber = async () => {
            try {
                let res
                if (telco === 'telnyx') res = await telnyxListNumbers()
                else if (telco === 'exotel') res = await exotelListNumbers()
                else if (telco === 'vobiz') res = await vobizListNumbers()
                if (cancelled) return
                const nums = res?.numbers || []
                if (nums.length > 0) {
                    setFromNumber(nums[0].phone_number || '')
                }
            } catch {}
        }
        fetchDefaultNumber()
        return () => { cancelled = true }
    }, [telco, fromNumber])

    // Load saved config from backend on mount
    useEffect(() => {
        if (!userId) return
        let cancelled = false
        getAgentConfig(userId)
            .then((res) => {
                if (cancelled || !res?.found || !res.config) return
                const c = res.config
                if (c.telco) setTelco(c.telco)
                if (c.fromNumber) setFromNumber(c.fromNumber)
                if (c.toNumber) setToNumber(c.toNumber)
                if (c.llmProvider) setLlmProvider(c.llmProvider)
                if (c.llmModel) setLlmModel(c.llmModel)
                if (c.transcriber) setTranscriber(c.transcriber)
                if (c.transcribeLang) setTranscribeLang(c.transcribeLang)
                if (c.synthesizer) setSynthesizer(c.synthesizer)
                if (c.voiceId) setVoiceId(c.voiceId)
                if (c.speakingRate) setSpeakingRate(c.speakingRate)
                if (c.stability) setStability(c.stability)
                if (c.firstMessageMode) setFirstMessageMode(c.firstMessageMode)
                if (c.firstMessage) setFirstMessage(c.firstMessage)
                if (c.maxDurationMin) setMaxDurationMin(c.maxDurationMin)
                if (c.recordCalls != null) setRecordCalls(c.recordCalls)
                if (c.callChannel) setCallChannel(c.callChannel)
                setSavedConfig(c)
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [userId])

    useEffect(() => {
        const opts = MODELS_BY_LLM[llmProvider] || MODELS_BY_LLM.openai
        setLlmModel(opts[0]?.value || 'gpt-4.1')
    }, [llmProvider])

    useEffect(() => {
        const opts = VOICES_BY_SYNTH[synthesizer] || VOICES_BY_SYNTH['sarvam-v2']
        setVoiceId(opts[0]?.value || 'anushka')
    }, [synthesizer])

    const costSegments = useMemo(
        () => [
            { flex: 3, color: 'hsl(173 80% 40%)', label: 'LLM' },
            { flex: 2, color: 'hsl(24 95% 53%)', label: 'Voice' },
            { flex: 2, color: 'hsl(217 91% 60%)', label: 'Telco' },
            { flex: 1.5, color: 'hsl(262 83% 58%)', label: 'Transcriber' },
        ],
        []
    )

    const latencySegments = useMemo(
        () => [
            { flex: 4, color: 'hsl(142 71% 45%)', label: 'ASR' },
            { flex: 3, color: 'hsl(173 80% 40%)', label: 'LLM' },
            { flex: 3, color: 'hsl(45 93% 47%)', label: 'TTS' },
            { flex: 2, color: 'hsl(217 91% 60%)', label: 'Network' },
        ],
        []
    )

    const currentSnapshot = useMemo(
        () =>
            buildSnapshot({
                telco,
                fromNumber,
                toNumber,
                llmProvider,
                llmModel,
                transcriber,
                transcribeLang,
                synthesizer,
                voiceId,
                speakingRate,
                stability,
                firstMessageMode,
                firstMessage,
                maxDurationMin,
                recordCalls,
                callChannel,
            }),
        [
            telco,
            fromNumber,
            toNumber,
            llmProvider,
            llmModel,
            transcriber,
            transcribeLang,
            synthesizer,
            voiceId,
            speakingRate,
            stability,
            firstMessageMode,
            firstMessage,
            maxDurationMin,
            recordCalls,
            callChannel,
        ]
    )

    const displaySnapshot = savedConfig ?? currentSnapshot
    const isDraftOverview = savedConfig === null

    const resolveVoiceLabel = useCallback(
        (snap) => {
            const v = optLabel(VOICES_BY_SYNTH[snap.synthesizer] || [], snap.voiceId)
            return v
        },
        []
    )

    const handleSave = useCallback(async () => {
        const snap = { ...currentSnapshot }
        setSavedConfig(snap)
        if (!userId) return
        setSaving(true)
        try {
            await saveAgentConfig({ user_id: userId, name: 'Default', config: snap })
        } catch (e) {
            console.warn('Failed to save agent config to backend:', e)
        } finally {
            setSaving(false)
        }
    }, [currentSnapshot, userId])

    const handleReset = useCallback(() => {
        setCallChannel(DEFAULTS.callChannel)
        setTelco(DEFAULTS.telco)
        setFromNumber(DEFAULTS.fromNumber)
        setToNumber(DEFAULTS.toNumber)
        setLlmProvider(DEFAULTS.llmProvider)
        setLlmModel(DEFAULTS.llmModel)
        setTranscriber(DEFAULTS.transcriber)
        setTranscribeLang(DEFAULTS.transcribeLang)
        setSynthesizer(DEFAULTS.synthesizer)
        setVoiceId(DEFAULTS.voiceId)
        setSpeakingRate(DEFAULTS.speakingRate)
        setStability(DEFAULTS.stability)
        setFirstMessageMode(DEFAULTS.firstMessageMode)
        setFirstMessage(DEFAULTS.firstMessage)
        setMaxDurationMin(DEFAULTS.maxDurationMin)
        setRecordCalls(DEFAULTS.recordCalls)
        setSavedConfig(null)
    }, [])

    const [calling, setCalling] = useState(false)
    const [callResult, setCallResult] = useState('')
    const [webCallActive, setWebCallActive] = useState(false)

    const handleStartCall = useCallback(async () => {
        if (!toNumber.trim()) {
            setCallResult('Enter a destination "To number" first.')
            return
        }
        setCalling(true)
        setCallResult('')
        const body = {
            to: toNumber.trim(),
            from: fromNumber.trim() || undefined,
            llm_provider: llmProvider,
        }
        try {
            let res
            if (telco === 'telnyx') {
                res = await telnyxOutbound({ ...body, from_number: fromNumber.trim() || undefined, user_id: userId || undefined })
            } else if (telco === 'exotel') {
                res = await exotelOutbound(body)
            } else if (telco === 'vobiz') {
                res = await vobizOutbound(body)
            }
            setCallResult(res?.message || res?.status || `Call initiated via ${telco}`)
        } catch (e) {
            setCallResult(e.message || 'Failed to start call')
        } finally {
            setCalling(false)
        }
    }, [toNumber, fromNumber, llmProvider, telco, userId])

    return (
        <div className="calling-agent-config space-y-5">
            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border/60 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors',
                                    tab === id
                                        ? 'border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4 opacity-90" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'overview' && (
                        <div className="calling-agent-overview-shell space-y-5 p-4 sm:p-5">
                            {/* Two buttons: Web call / Phone call */}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    size="lg"
                                    variant={webCallActive ? 'default' : 'outline'}
                                    className="h-12 rounded-full px-6"
                                    onClick={() => setWebCallActive((v) => !v)}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Web call
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="h-12 rounded-full px-6"
                                    disabled={calling || !toNumber.trim()}
                                    onClick={handleStartCall}
                                >
                                    {calling ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <PhoneCall className="mr-2 h-4 w-4" />
                                    )}
                                    {calling ? 'Calling…' : 'Phone call'}
                                </Button>
                                {!toNumber.trim() && (
                                    <p className="self-center text-xs text-muted-foreground">
                                        Set a &quot;To number&quot; in the Telco tab to enable phone calls
                                    </p>
                                )}
                            </div>

                            {/* Call result message */}
                            {callResult ? (
                                <p className={cn(
                                    'rounded-xl px-4 py-3 text-sm',
                                    callResult.toLowerCase().includes('fail') || callResult.toLowerCase().includes('error') || callResult.toLowerCase().includes('missing')
                                        ? 'border border-destructive/40 bg-destructive/10 text-destructive'
                                        : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                )}>
                                    {callResult}
                                </p>
                            ) : null}

                            {/* Web call panel — only shown when toggled */}
                            {webCallActive && (
                                <WebCallPanel
                                    llmProvider={llmProvider}
                                    userId={userId}
                                    onEnd={() => setWebCallActive(false)}
                                />
                            )}

                            <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-semibold text-foreground">Configuration summary</h4>
                                    {isDraftOverview ? (
                                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                            Draft — not saved
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                            Saved
                                        </span>
                                    )}
                                </div>
                                <dl className="calling-agent-saved-grid">
                                    <SavedTile k="Call mode">
                                        {displaySnapshot.callChannel === 'web' ? 'Web call' : 'Phone call'}
                                    </SavedTile>
                                    <SavedTile k="Telco">{optLabel(TELCO, displaySnapshot.telco)}</SavedTile>
                                    <SavedTile k="From number">
                                        {displaySnapshot.fromNumber?.trim() || '—'}
                                    </SavedTile>
                                    <SavedTile k="To number">
                                        {displaySnapshot.toNumber?.trim() || '—'}
                                    </SavedTile>
                                    <SavedTile k="LLM">
                                        {optLabel(LLM_PROVIDERS, displaySnapshot.llmProvider)} ·{' '}
                                        {optLabel(MODELS_BY_LLM[displaySnapshot.llmProvider] || [], displaySnapshot.llmModel)}
                                    </SavedTile>
                                    <SavedTile k="Transcriber">
                                        {optLabel(TRANSCRIBERS, displaySnapshot.transcriber)}
                                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                            {LANG_LABELS[displaySnapshot.transcribeLang] || displaySnapshot.transcribeLang}
                                        </span>
                                    </SavedTile>
                                    <SavedTile k="Synthesizer & voice">
                                        {optLabel(SYNTHESIZERS, displaySnapshot.synthesizer)}
                                        <span className="mt-1 block text-sm">
                                            {resolveVoiceLabel(displaySnapshot)}
                                        </span>
                                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                            Rate {RATE_LABELS[displaySnapshot.speakingRate] ?? displaySnapshot.speakingRate} ·{' '}
                                            {STAB_LABELS[displaySnapshot.stability] ?? displaySnapshot.stability}
                                        </span>
                                    </SavedTile>
                                    <SavedTile k="Session policy">
                                        {optLabel(FIRST_MESSAGE_MODES, displaySnapshot.firstMessageMode)}
                                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                            Max {displaySnapshot.maxDurationMin} min · Recording{' '}
                                            {displaySnapshot.recordCalls ? 'on' : 'off'}
                                        </span>
                                    </SavedTile>
                                </dl>
                                <p className="mt-3 line-clamp-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground/80">First message: </span>
                                    {displaySnapshot.firstMessage?.trim() || '—'}
                                </p>
                            </div>
                        </div>
                    )}

                    {tab === 'telco' && (
                        <CollapsiblePanel title="Telco" subtitle="Carrier & caller / callee numbers" icon={Phone}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="telco-provider"
                                    label="Telco provider"
                                    hint="PSTN or CPaaS used for this agent leg"
                                    value={telco}
                                    onChange={setTelco}
                                    className="sm:col-span-2"
                                >
                                    {TELCO.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <div className="space-y-1.5">
                                    <Label htmlFor="from-num" className="text-xs text-muted-foreground">
                                        From number (caller ID)
                                    </Label>
                                    <Input
                                        id="from-num"
                                        value={fromNumber}
                                        onChange={(e) => setFromNumber(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="to-num" className="text-xs text-muted-foreground">
                                        To number (destination)
                                    </Label>
                                    <Input
                                        id="to-num"
                                        value={toNumber}
                                        onChange={(e) => setToNumber(e.target.value)}
                                        placeholder="+91 11 4000 0000"
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                    />
                                </div>
                            </div>
                        </CollapsiblePanel>
                    )}

                    {tab === 'llm' && (
                        <CollapsiblePanel title="Model" subtitle="Assistant reasoning & tools" icon={Brain}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="llm-provider"
                                    label="Provider"
                                    hint="LLM API used for dialogue and tool calls"
                                    value={llmProvider}
                                    onChange={setLlmProvider}
                                >
                                    {LLM_PROVIDERS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    id="llm-model"
                                    label="Model"
                                    hint="Pick a deployment your API key can access"
                                    value={llmModel}
                                    onChange={setLlmModel}
                                >
                                    {modelOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </CollapsiblePanel>
                    )}

                    {tab === 'transcriber' && (
                        <CollapsiblePanel title="Transcriber" subtitle="Speech-to-text" icon={Mic}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="transcriber-engine"
                                    label="Engine"
                                    hint="Realtime or batch ASR stack"
                                    value={transcriber}
                                    onChange={setTranscriber}
                                    className="sm:col-span-2"
                                >
                                    {TRANSCRIBERS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    id="transcribe-lang"
                                    label="Language / locale"
                                    hint="Sarvam auto-detects language, or pick a specific locale"
                                    value={transcribeLang}
                                    onChange={setTranscribeLang}
                                    className="sm:col-span-2"
                                >
                                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                                        <option key={code} value={code}>{label}</option>
                                    ))}
                                </SelectField>
                            </div>
                        </CollapsiblePanel>
                    )}

                    {tab === 'voice' && (
                        <CollapsiblePanel title="Voice" subtitle="Synthesizer & playback" icon={Volume2}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="synthesizer"
                                    label="Synthesizer"
                                    hint="TTS provider — voice list updates with this"
                                    value={synthesizer}
                                    onChange={setSynthesizer}
                                    className="sm:col-span-2"
                                >
                                    {SYNTHESIZERS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    id="voice-id"
                                    label="Voice"
                                    hint="Choices depend on selected synthesizer"
                                    value={voiceId}
                                    onChange={setVoiceId}
                                    className="sm:col-span-2"
                                >
                                    {voiceOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    id="speaking-rate"
                                    label="Speaking rate"
                                    hint="Relative playback speed"
                                    value={speakingRate}
                                    onChange={setSpeakingRate}
                                >
                                    <option value="0.85">0.85×</option>
                                    <option value="1.0">1.0×</option>
                                    <option value="1.1">1.1×</option>
                                    <option value="1.2">1.2×</option>
                                </SelectField>
                                <SelectField
                                    id="voice-stability"
                                    label="Stability / expressiveness"
                                    hint="Where supported by the TTS API"
                                    value={stability}
                                    onChange={setStability}
                                >
                                    <option value="0.35">More expressive</option>
                                    <option value="0.5">Balanced</option>
                                    <option value="0.75">More stable</option>
                                </SelectField>
                            </div>
                        </CollapsiblePanel>
                    )}

                    {tab === 'advanced' && (
                        <CollapsiblePanel title="Advanced" subtitle="Session policy & prompts" icon={Settings}>
                            <div className="space-y-4">
                                <SelectField
                                    id="first-msg-mode"
                                    label="First message mode"
                                    hint="Who speaks first when the call connects"
                                    value={firstMessageMode}
                                    onChange={setFirstMessageMode}
                                >
                                    {FIRST_MESSAGE_MODES.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="first-msg" className="text-xs text-muted-foreground">
                                            First message
                                        </Label>
                                        <FieldHint text="Spoken or sent when the assistant opens the session" />
                                    </div>
                                    <Textarea
                                        id="first-msg"
                                        value={firstMessage}
                                        onChange={(e) => setFirstMessage(e.target.value)}
                                        rows={3}
                                        className="rounded-xl border-border/70 bg-background/80"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="max-dur" className="text-xs text-muted-foreground">
                                            Max call duration (minutes)
                                        </Label>
                                        <Input
                                            id="max-dur"
                                            type="number"
                                            min={1}
                                            max={120}
                                            value={maxDurationMin}
                                            onChange={(e) => setMaxDurationMin(e.target.value)}
                                            className="h-11 rounded-xl border-border/70 bg-background/80"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end gap-2 pb-1">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                            <input
                                                type="checkbox"
                                                checked={recordCalls}
                                                onChange={(e) => setRecordCalls(e.target.checked)}
                                                className="h-4 w-4 rounded border-border text-primary"
                                            />
                                            Record &amp; retain audio (compliance permitting)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </CollapsiblePanel>
                    )}

                    <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" className="rounded-full" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save configuration'}
                            </Button>
                            <Button type="button" variant="outline" className="rounded-full" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                        {tab === 'overview' ? (
                            <p className="text-xs text-muted-foreground">
                                Saving pins the summary below and marks it <span className="font-medium text-foreground">Saved</span>.
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
