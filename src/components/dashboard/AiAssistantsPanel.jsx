import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MessageSquare, RotateCcw, Search, Send, Sparkles, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { agentChat, listClinicalAgents } from '@/services/swasthyaApi'
import { cn } from '@/lib/utils'

const LLM_OPTIONS = [
    { value: 'openai', label: 'OpenAI (GPT-4.1)' },
    { value: 'gemini', label: 'Google Gemini (2.0 Flash)' },
]

function agentInitials(title, id) {
    const s = (title || id || '?').trim()
    const parts = s.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return s.slice(0, 2).toUpperCase() || 'AI'
}

export default function AiAssistantsPanel() {
    const [agents, setAgents] = useState([])
    const [loadError, setLoadError] = useState('')
    const [loadingList, setLoadingList] = useState(true)
    const [selectedId, setSelectedId] = useState(null)
    const [llmProvider, setLlmProvider] = useState('openai')
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [chatError, setChatError] = useState('')
    const [agentFilter, setAgentFilter] = useState('')
    const scrollRef = useRef(null)
    const bottomRef = useRef(null)

    const refreshAgents = useCallback(async () => {
        setLoadingList(true)
        setLoadError('')
        try {
            const data = await listClinicalAgents()
            const list = Array.isArray(data?.agents) ? data.agents : []
            setAgents(list)
            setSelectedId((prev) => (prev && list.some((a) => a.id === prev) ? prev : list[0]?.id || null))
        } catch (e) {
            setLoadError(e.message || 'Could not load agents')
            setAgents([])
        } finally {
            setLoadingList(false)
        }
    }, [])

    useEffect(() => {
        refreshAgents()
    }, [refreshAgents])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, sending])

    const selected = useMemo(
        () => agents.find((a) => a.id === selectedId) || null,
        [agents, selectedId]
    )

    const filteredAgents = useMemo(() => {
        const q = agentFilter.trim().toLowerCase()
        if (!q) return agents
        return agents.filter(
            (a) =>
                (a.title || '').toLowerCase().includes(q) ||
                (a.id || '').toLowerCase().includes(q) ||
                (a.summary || '').toLowerCase().includes(q)
        )
    }, [agents, agentFilter])

    const selectAgent = (id) => {
        setSelectedId(id)
        setMessages([])
        setChatError('')
        setInput('')
    }

    const clearChat = () => {
        setMessages([])
        setChatError('')
    }

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || !selectedId) return
        setChatError('')
        setSending(true)
        const priorHistory = messages.map((x) => ({ role: x.role, content: x.content }))
        const userTurn = { role: 'user', content: text }
        setMessages((m) => [...m, userTurn])
        setInput('')
        try {
            const res = await agentChat({
                agent_id: selectedId,
                message: text,
                history: priorHistory,
                llm_provider: llmProvider,
            })
            const reply = res?.reply || res?.message || ''
            setMessages((m) => [...m, { role: 'assistant', content: reply || '(empty reply)' }])
        } catch (e) {
            setChatError(e.message || 'Chat failed')
            setMessages((m) => m.slice(0, -1))
        } finally {
            setSending(false)
        }
    }

    const llmLabel = LLM_OPTIONS.find((o) => o.value === llmProvider)?.label || llmProvider

    return (
        <div className="ai-assistants-panel">
            <div className="ai-assistants-inner-grid">
                <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
                    <CardHeader className="space-y-2.5 border-b border-border/40 bg-muted/20 px-4 pb-3 pt-4">
                        <div className="flex items-baseline justify-between gap-2">
                            <CardTitle className="text-base font-semibold tracking-tight">Agents</CardTitle>
                            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                                {loadingList ? '…' : agents.length}
                            </span>
                        </div>
                        <CardDescription className="text-xs leading-snug">
                            {loadingList ? 'Loading specialists…' : 'Choose a clinical specialist for this chat.'}
                        </CardDescription>
                        <div className="relative pt-0.5">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                placeholder="Search name, id, or role…"
                                className="h-9 rounded-lg border-border/60 bg-background/80 pl-9 text-sm"
                                disabled={loadingList}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="ai-assistants-agent-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 pb-3 pt-2">
                        {loadError ? (
                            <p className="text-sm text-destructive">{loadError}</p>
                        ) : null}
                        {loadingList ? (
                            <div className="flex flex-1 items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredAgents.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No agents match your search.</p>
                        ) : (
                            filteredAgents.map((a) => {
                                const active = selectedId === a.id
                                const initials = agentInitials(a.title, a.id)
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => selectAgent(a.id)}
                                        className={cn(
                                            'group flex gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200',
                                            active
                                                ? 'border-primary/80 bg-primary/[0.07] shadow-sm ring-1 ring-primary/15'
                                                : 'border-transparent bg-transparent hover:border-border/60 hover:bg-muted/40'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-tight',
                                                active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/80 text-muted-foreground group-hover:bg-muted'
                                            )}
                                        >
                                            {initials}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold leading-tight text-foreground">
                                                {a.title || a.id}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                                                {a.summary || 'Clinical agent'}
                                            </p>
                                            <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70">
                                                {a.id}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
                    <div className="shrink-0 border-b border-border/50 bg-gradient-to-r from-muted/30 via-background to-background px-4 py-3 sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-lg font-semibold tracking-tight">
                                        {selected ? selected.title : 'Assistant chat'}
                                    </CardTitle>
                                    {selected ? (
                                        <Badge variant="secondary" className="rounded-full px-2.5 py-0 text-xs font-normal">
                                            {llmLabel}
                                        </Badge>
                                    ) : null}
                                </div>
                                <CardDescription className="mt-1 max-w-xl text-xs leading-relaxed">
                                    {selected
                                        ? `Replies for this thread use ${llmLabel}.`
                                        : 'Select an agent from the list to start.'}
                                </CardDescription>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-end gap-2 sm:justify-end">
                                <div className="space-y-1">
                                    <Label htmlFor="assistant-llm" className="text-[11px] text-muted-foreground">
                                        Model
                                    </Label>
                                    <NativeSelect
                                        id="assistant-llm"
                                        className="h-9 min-w-[9.5rem] rounded-lg border-border/60 bg-background text-sm"
                                        value={llmProvider}
                                        onChange={(e) => {
                                            setLlmProvider(e.target.value)
                                            setChatError('')
                                        }}
                                    >
                                        {LLM_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                {selectedId ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-lg text-xs"
                                        onClick={clearChat}
                                    >
                                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                        Clear
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
                        {!selectedId ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                                <div className="rounded-2xl border border-border/50 bg-muted/15 p-4 ring-1 ring-border/30">
                                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
                                </div>
                                <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                                    Pick a specialist on the left — each agent is tuned for triage, RAG, reporting, or
                                    other clinical tasks.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={scrollRef}
                                    className="ai-assistants-chat-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-muted/5 px-4 py-4 sm:px-5"
                                >
                                    {messages.length === 0 ? (
                                        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
                                            <div className="rounded-full bg-primary/10 p-3 ring-1 ring-primary/15">
                                                <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />
                                            </div>
                                            <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">
                                                Ask in plain language. This agent uses the tools and prompts configured on
                                                your server.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const isUser = msg.role === 'user'
                                            return (
                                                <div
                                                    key={`${i}-${msg.role}`}
                                                    className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm',
                                                            isUser
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'border border-border/60 bg-card text-primary'
                                                        )}
                                                    >
                                                        {isUser ? (
                                                            <User className="h-4 w-4" />
                                                        ) : (
                                                            <Sparkles className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'max-w-[min(100%,520px)] rounded-2xl px-4 py-3 text-sm shadow-sm',
                                                            isUser
                                                                ? 'rounded-tr-sm bg-primary text-primary-foreground'
                                                                : 'rounded-tl-sm border border-border/60 bg-card text-foreground'
                                                        )}
                                                    >
                                                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                            {isUser ? 'You' : selected?.title || 'Assistant'}
                                                        </span>
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                    {sending ? (
                                        <div className="flex gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-primary">
                                                <Sparkles className="h-4 w-4 animate-pulse" />
                                            </div>
                                            <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                                <Loader2 className="inline h-4 w-4 animate-spin" />
                                                <span className="ml-2">Thinking…</span>
                                            </div>
                                        </div>
                                    ) : null}
                                    <div ref={bottomRef} className="h-1 w-full shrink-0" aria-hidden />
                                </div>

                                <div className="shrink-0 border-t border-border/50 bg-card/90 p-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/85 sm:p-4">
                                    {chatError ? (
                                        <p className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                            {chatError}
                                        </p>
                                    ) : null}
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                        <Textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Message… Enter to send, Shift+Enter for newline"
                                            className="min-h-[44px] flex-1 resize-none rounded-xl border-border/60 bg-background text-sm shadow-sm"
                                            disabled={sending}
                                            rows={2}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    sendMessage()
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            className="h-11 shrink-0 rounded-xl px-6 sm:h-auto sm:min-h-[44px]"
                                            disabled={sending || !input.trim()}
                                            onClick={sendMessage}
                                        >
                                            {sending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
