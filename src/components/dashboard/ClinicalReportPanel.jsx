import React, { useCallback, useState } from 'react'
import { ClipboardCopy, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { analyzeTranscript } from '@/services/swasthyaApi'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

function formatJson(value) {
    try {
        return JSON.stringify(value, null, 2)
    } catch {
        return String(value)
    }
}

export default function ClinicalReportPanel() {
    const { user } = useAuth()
    const [transcript, setTranscript] = useState('')
    const [llmProvider, setLlmProvider] = useState('openai')
    const [userid, setUserid] = useState(() => user?.id || user?.email || 'dashboard-user')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)
    const [copied, setCopied] = useState(false)

    React.useEffect(() => {
        if (user?.id) setUserid(user.id)
        else if (user?.email) setUserid(user.email)
    }, [user?.id, user?.email])

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            setError('')
            setResult(null)
            const trimmed = transcript.trim()
            if (!trimmed) {
                setError('Enter a transcript (conversation text) to analyze.')
                return
            }
            setLoading(true)
            try {
                const data = await analyzeTranscript({
                    userid: userid.trim() || 'dashboard-user',
                    transcript: trimmed,
                    location: location.trim() || undefined,
                    llm_provider: llmProvider,
                })
                setResult(data)
            } catch (err) {
                setError(err.message || 'Request failed')
            } finally {
                setLoading(false)
            }
        },
        [transcript, userid, location, llmProvider]
    )

    const copyOutput = useCallback(() => {
        if (result == null) return
        const text = formatJson(result)
        void navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [result])

    const outputText = result != null ? formatJson(result) : ''

    return (
        <div className="clinical-report-panel space-y-5">
            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Clinical supervisor report
                    </CardTitle>
                    <CardDescription className="text-base">
                        Paste a call or session transcript. The orchestrator runs the full clinical supervisor
                        workflow and returns structured JSON (similar in spirit to saved webhook / analyze events).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="clinical-transcript" className="text-sm font-medium">
                                Transcript
                            </Label>
                            <Textarea
                                id="clinical-transcript"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Paste user and assistant turns, or raw conversation text…"
                                className={cn(
                                    'min-h-[min(22rem,50vh)] resize-y rounded-2xl border-border/70 bg-background/80 font-mono text-sm leading-relaxed',
                                    'placeholder:font-sans'
                                )}
                                rows={14}
                                spellCheck="false"
                            />
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="min-w-[200px] flex-1 space-y-2">
                                <Label htmlFor="clinical-llm" className="text-sm font-medium">
                                    LLM provider
                                </Label>
                                <NativeSelect
                                    id="clinical-llm"
                                    value={llmProvider}
                                    onChange={(e) => setLlmProvider(e.target.value)}
                                    className="h-11 rounded-xl border-border/70 bg-background/80"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="gemini">Gemini</option>
                                </NativeSelect>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Label htmlFor="clinical-userid" className="text-sm font-medium">
                                        User ID <span className="font-normal text-muted-foreground">(required by API)</span>
                                    </Label>
                                    <Input
                                        id="clinical-userid"
                                        value={userid}
                                        onChange={(e) => setUserid(e.target.value)}
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                        placeholder="e.g. supabase user id or email"
                                    />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Label htmlFor="clinical-location" className="text-sm font-medium">
                                        Location <span className="font-normal text-muted-foreground">(optional)</span>
                                    </Label>
                                    <Input
                                        id="clinical-location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                        placeholder="City / region"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 shrink-0 rounded-full px-8"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Running…
                                    </>
                                ) : (
                                    'Generate report'
                                )}
                            </Button>
                        </div>

                        {error ? (
                            <p
                                className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                                role="alert"
                            >
                                {error}
                            </p>
                        ) : null}
                    </form>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                    <div>
                        <CardTitle className="text-lg">Orchestrator output</CardTitle>
                        <CardDescription>
                            Pretty-printed JSON from <code className="text-xs">POST /analyze_transcript</code>
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={!outputText}
                        onClick={copyOutput}
                    >
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        {copied ? 'Copied' : 'Copy JSON'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {outputText ? (
                        <pre
                            className={cn(
                                'max-h-[min(70vh,48rem)] overflow-auto rounded-2xl border border-border/60 bg-muted/30 p-4 text-left',
                                'text-[13px] leading-relaxed text-foreground',
                                'whitespace-pre font-mono',
                                'dark:bg-muted/20'
                            )}
                            tabIndex={0}
                        >
                            {outputText}
                        </pre>
                    ) : (
                        <div className="flex min-h-[min(24rem,40vh)] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                            Run a report to see the supervisor JSON here — same shape as stored analyze / webhook-style
                            payloads (nested objects, metrics, clinical fields, etc.).
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
