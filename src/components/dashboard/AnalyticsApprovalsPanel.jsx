import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, ChevronRight, Loader2, Pencil, PhoneCall, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    getWebhookEventByCallId,
    getWebhookEventByFile,
    listWebhookEvents,
    approveReport,
    revokeApproval,
    listApprovals,
    telnyxReportCallback,
} from '@/services/swasthyaApi'
import { useAuth } from '@/context/AuthContext'
import {
    ClinicalReportView,
    VoiceCallTechnicalView,
    VoiceTranscriptThread,
    KeyValueSection,
} from '@/components/dashboard/AnalyticsStructuredDetail'

const PAGE_SIZE = 8

function formatWhen(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return String(ts)
    return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'medium',
    })
}

function directionLabel(d) {
    if (!d) return '—'
    const x = String(d).toLowerCase()
    if (x === 'supervisor') return 'Supervisor'
    if (x === 'inbound' || x === 'outbound') return x.charAt(0).toUpperCase() + x.slice(1)
    return String(d)
}

export default function AnalyticsApprovalsPanel() {
    const { user } = useAuth()
    const userId = user?.id || user?.email || ''
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [listError, setListError] = useState('')
    const [page, setPage] = useState(1)
    const [approvedIds, setApprovedIds] = useState(new Set())

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedCallId, setSelectedCallId] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState('')
    const [detail, setDetail] = useState(null)
    const [detailRaw, setDetailRaw] = useState('')
    const [editing, setEditing] = useState(false)
    const [editError, setEditError] = useState('')

    const refreshList = useCallback(async () => {
        setLoading(true)
        setListError('')
        try {
            const [eventsData, approvalsData] = await Promise.allSettled([
                listWebhookEvents(120),
                userId ? listApprovals(userId) : Promise.resolve({ approvals: [] }),
            ])
            if (eventsData.status === 'fulfilled') {
                const ev = Array.isArray(eventsData.value?.events) ? eventsData.value.events : []
                setRows(ev)
            }
            if (approvalsData.status === 'fulfilled') {
                const ids = (approvalsData.value?.approvals || []).map((a) => a.call_id)
                setApprovedIds(new Set(ids))
            }
            setPage(1)
        } catch (e) {
            setListError(e.message || 'Failed to load events')
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        refreshList()
    }, [refreshList])

    useEffect(() => {
        if (!sidebarOpen) return
        const onKey = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [sidebarOpen])

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
    const pageRows = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return rows.slice(start, start + PAGE_SIZE)
    }, [rows, page])

    const openDetail = async (row) => {
        const callId = row?.call_id
        const file = row?.file
        if (!callId && !file) return
        setSelectedCallId(callId || file)
        setSidebarOpen(true)
        setDetail(null)
        setDetailRaw('')
        setDetailError('')
        setEditing(false)
        setEditError('')
        setDetailLoading(true)
        try {
            let payload = null
            let lastErr = null
            if (callId && callId !== 'unknown') {
                try {
                    payload = await getWebhookEventByCallId(callId)
                } catch (e) {
                    lastErr = e
                }
            }
            if (!payload && file) {
                try {
                    payload = await getWebhookEventByFile(file)
                } catch (e) {
                    lastErr = e
                }
            }
            if (!payload) {
                throw lastErr || new Error('Could not load details')
            }
            const stableId =
                payload.call_id ||
                payload.request?.userid ||
                callId ||
                (file && file !== 'unknown' ? file : null)
            if (stableId) setSelectedCallId(stableId)
            setDetail(payload)
            setDetailRaw(JSON.stringify(payload, null, 2))
        } catch (e) {
            setDetailError(e.message || 'Could not load details')
        } finally {
            setDetailLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!selectedCallId || !userId) return
        try {
            await approveReport({ call_id: selectedCallId, user_id: userId })
            const next = new Set(approvedIds)
            next.add(selectedCallId)
            setApprovedIds(next)
        } catch (e) {
            console.warn('Approval failed, saving locally:', e)
            const next = new Set(approvedIds)
            next.add(selectedCallId)
            setApprovedIds(next)
        }
    }

    const handleSaveEdit = () => {
        setEditError('')
        try {
            const parsed = JSON.parse(detailRaw)
            setDetail(parsed)
            setEditing(false)
        } catch {
            setEditError('Invalid JSON — fix syntax or cancel.')
        }
    }

    const [callbackLoading, setCallbackLoading] = useState(false)
    const [callbackMsg, setCallbackMsg] = useState('')
    const [manualToNumber, setManualToNumber] = useState('')
    const [showManualInput, setShowManualInput] = useState(false)

    // Detect patient's phone number from the call detail
    const detectedToNumber = (() => {
        if (!detail) return ''
        const ci = detail.call_info || {}
        const dir = (ci.direction || '').toLowerCase()
        let num = null
        if (dir === 'outbound') num = ci.to || detail.to_number
        else if (dir === 'inbound') num = ci.from || detail.from_number
        else num = ci.to || ci.from || detail.to_number || detail.from_number
        const own = ci.from && dir === 'outbound' ? ci.from : null
        if (num && num === own) num = ci.to || detail.to_number
        return (num && num !== 'unknown') ? num : ''
    })()

    const handleReportCallback = async (overrideNumber) => {
        if (!selectedCallId) return
        const toNumber = overrideNumber || detectedToNumber || manualToNumber.trim()
        if (!toNumber) {
            setShowManualInput(true)
            setCallbackMsg('')
            return
        }
        setCallbackLoading(true)
        setCallbackMsg('')
        try {
            const res = await telnyxReportCallback({
                to: toNumber,
                call_id: selectedCallId,
                user_id: userId,
            })
            setCallbackMsg(res?.message || `Calling ${toNumber} to deliver report`)
            setShowManualInput(false)
        } catch (e) {
            setCallbackMsg(e.message || 'Failed to initiate callback')
        } finally {
            setCallbackLoading(false)
        }
    }

    const callInfo = detail?.call_info || {}
    const isAnalyze = detail?.event_type === 'analyze_transcript'

    return (
        <div className="analytics-approvals relative">
            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Approvals queue</CardTitle>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={refreshList}>
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {listError ? (
                        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {listError}
                        </p>
                    ) : null}

                    <div className="analytics-approvals-table-wrap flex flex-col overflow-x-auto rounded-2xl border border-border/70">
                        <table className="analytics-approvals-table w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40">
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">From</th>
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">To</th>
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">Calling type</th>
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">Transcript</th>
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">Status</th>
                                    <th className="px-3 py-3 font-semibold text-muted-foreground">Time</th>
                                    <th className="px-3 py-3 pr-4 text-right font-semibold text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin opacity-60" />
                                        </td>
                                    </tr>
                                ) : pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                            No saved webhook events yet. Complete a voice call or run a clinical report
                                            to populate this table.
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((row, idx) => {
                                        const cid = row.call_id
                                        const approved = cid && approvedIds.has(cid)
                                        return (
                                            <tr
                                                key={`${row.file || idx}-${cid}`}
                                                className="analytics-approvals-row border-b border-border/50 transition-colors hover:bg-muted/30"
                                            >
                                                <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs">
                                                    {row.from_number || '—'}
                                                </td>
                                                <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs">
                                                    {row.to_number || '—'}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <span className="inline-flex rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                                                        {directionLabel(row.direction)}
                                                    </span>
                                                </td>
                                                <td className="max-w-[280px] px-3 py-2.5 text-xs text-muted-foreground">
                                                    <span className="line-clamp-2">
                                                        {row.transcript_preview || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {approved ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                            <Check className="h-3 w-3" />
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-300">
                                                            {row.status || 'Completed'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                                                    {formatWhen(row.timestamp)}
                                                </td>
                                                <td className="px-3 py-2.5 pr-4 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-full text-xs"
                                                        disabled={!cid && !row.file}
                                                        onClick={() => openDetail(row)}
                                                    >
                                                        View more
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {rows.length > PAGE_SIZE ? (
                        <div className="flex items-center justify-end gap-2 text-sm">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-muted-foreground">
                                Page {page} / {totalPages}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {sidebarOpen && typeof document !== 'undefined'
                ? createPortal(
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-[220] bg-background/60 backdrop-blur-sm"
                        aria-label="Close panel"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 right-0 z-[230] flex h-dvh max-h-dvh w-full max-w-xl flex-col overflow-hidden border-l border-border/80 bg-card shadow-2xl dark:bg-card">
                        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border/70 px-4 py-3">
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold tracking-tight">
                                    {isAnalyze ? 'Clinical report review' : 'Call review'}
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {isAnalyze ? 'Supervisor pipeline output' : 'Voice session details'}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-full"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            {detailLoading ? (
                                <div className="flex min-h-0 flex-1 items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : detailError ? (
                                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                    <p className="text-sm text-destructive">{detailError}</p>
                                </div>
                            ) : detail ? (
                                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                    <Tabs defaultValue="summary" className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3">
                                        <TabsList className="grid w-full shrink-0 grid-cols-3 rounded-xl bg-muted/50 p-1">
                                            <TabsTrigger value="summary" className="rounded-lg text-xs sm:text-sm">
                                                Summary
                                            </TabsTrigger>
                                            <TabsTrigger value="transcript" className="rounded-lg text-xs sm:text-sm">
                                                Transcript
                                            </TabsTrigger>
                                            <TabsTrigger value="advanced" className="rounded-lg text-xs sm:text-sm">
                                                Advanced
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent
                                            value="summary"
                                            className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
                                        >
                                            <div className="mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-transparent p-4">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Session information
                                                </span>
                                                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                                                    <div>
                                                        <dt className="text-xs text-muted-foreground">When</dt>
                                                        <dd className="font-medium text-foreground">
                                                            {formatWhen(detail.timestamp)}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-muted-foreground">Type</dt>
                                                        <dd className="font-medium text-foreground">
                                                            {isAnalyze
                                                                ? 'Clinical analysis'
                                                                : directionLabel(callInfo.direction)}
                                                        </dd>
                                                    </div>
                                                    {!isAnalyze ? (
                                                        <>
                                                            <div>
                                                                <dt className="text-xs text-muted-foreground">From</dt>
                                                                <dd className="break-all font-mono text-xs text-foreground">
                                                                    {callInfo.from || '—'}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-xs text-muted-foreground">To</dt>
                                                                <dd className="break-all font-mono text-xs text-foreground">
                                                                    {callInfo.to || '—'}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-xs text-muted-foreground">
                                                                    Phone provider
                                                                </dt>
                                                                <dd className="capitalize text-foreground">
                                                                    {callInfo.provider || '—'}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-xs text-muted-foreground">
                                                                    LLM (call)
                                                                </dt>
                                                                <dd className="text-foreground">
                                                                    {callInfo.llm_provider || '—'}
                                                                </dd>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="col-span-2">
                                                                <dt className="text-xs text-muted-foreground">
                                                                    Patient / session ID
                                                                </dt>
                                                                <dd className="break-all font-mono text-xs text-foreground">
                                                                    {detail.request?.userid || detail.call_id || '—'}
                                                                </dd>
                                                            </div>
                                                            <div>
                                                                <dt className="text-xs text-muted-foreground">
                                                                    Report LLM
                                                                </dt>
                                                                <dd className="text-foreground">
                                                                    {detail.request?.llm_provider || '—'}
                                                                </dd>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="col-span-2">
                                                        <dt className="text-xs text-muted-foreground">
                                                            Internal call ID
                                                        </dt>
                                                        <dd className="break-all font-mono text-[11px] text-foreground">
                                                            {detail.call_id || selectedCallId}
                                                        </dd>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <dt className="text-xs text-muted-foreground">Stream ID</dt>
                                                        <dd className="break-all font-mono text-[11px] text-foreground">
                                                            {detail.stream_id || '—'}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {isAnalyze ? (
                                                <ClinicalReportView report={detail.report} />
                                            ) : (
                                                <VoiceCallTechnicalView detail={detail} />
                                            )}

                                            {detail.report?.input_summary &&
                                            typeof detail.report.input_summary === 'object' ? (
                                                <KeyValueSection
                                                    title="Input summary"
                                                    data={detail.report.input_summary}
                                                />
                                            ) : null}
                                        </TabsContent>
                                        <TabsContent
                                            value="transcript"
                                            className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
                                        >
                                            {isAnalyze ? (
                                                <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        Original conversation text
                                                    </p>
                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                                        {detail.request?.transcript || '—'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <VoiceTranscriptThread detail={detail} />
                                            )}
                                        </TabsContent>
                                        <TabsContent
                                            value="advanced"
                                            className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
                                        >
                                            <p className="mb-3 text-xs text-muted-foreground">
                                                Technical: raw JSON for debugging or local edits. Most reviewers can stay
                                                on Summary and Transcript.
                                            </p>
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant={editing ? 'secondary' : 'outline'}
                                                    size="sm"
                                                    className="h-8 gap-1 rounded-full text-xs"
                                                    onClick={() => {
                                                        if (editing) {
                                                            setDetailRaw(JSON.stringify(detail, null, 2))
                                                            setEditing(false)
                                                            setEditError('')
                                                        } else {
                                                            setEditing(true)
                                                        }
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    {editing ? 'Cancel editing' : 'Edit raw JSON'}
                                                </Button>
                                            </div>
                                            {editing ? (
                                                <div className="space-y-2">
                                                    {editError ? (
                                                        <p className="text-xs text-destructive">{editError}</p>
                                                    ) : null}
                                                    <Textarea
                                                        value={detailRaw}
                                                        onChange={(e) => setDetailRaw(e.target.value)}
                                                        className="min-h-[280px] font-mono text-[11px]"
                                                        spellCheck={false}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="rounded-full"
                                                        onClick={handleSaveEdit}
                                                    >
                                                        Apply JSON changes
                                                    </Button>
                                                </div>
                                            ) : (
                                                <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border/60 bg-muted/20 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                                                    {JSON.stringify(detail, null, 2)}
                                                </pre>
                                            )}
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex shrink-0 flex-col gap-2 border-t border-border/70 bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/85">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                className="flex-1 rounded-full"
                                                onClick={handleApprove}
                                                disabled={!selectedCallId || approvedIds.has(selectedCallId)}
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                {approvedIds.has(selectedCallId) ? 'Approved' : 'Approve'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="rounded-full"
                                                disabled={callbackLoading || !selectedCallId}
                                                onClick={() => handleReportCallback()}
                                            >
                                                {callbackLoading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <PhoneCall className="mr-2 h-4 w-4" />
                                                )}
                                                {callbackLoading ? 'Calling...' : 'Call with report'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                Close
                                            </Button>
                                        </div>

                                        {/* Manual number input — shown when no phone number detected */}
                                        {(showManualInput || (!detectedToNumber && approvedIds.has(selectedCallId))) ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    value={manualToNumber}
                                                    onChange={(e) => setManualToNumber(e.target.value)}
                                                    placeholder="Enter patient phone number (e.g. +919876543210)"
                                                    className="h-9 flex-1 rounded-lg border-border/70 font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-9 shrink-0 rounded-lg"
                                                    disabled={callbackLoading || !manualToNumber.trim()}
                                                    onClick={() => handleReportCallback(manualToNumber.trim())}
                                                >
                                                    <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                                                    Call
                                                </Button>
                                            </div>
                                        ) : null}

                                        {callbackMsg ? (
                                            <p className="rounded-lg px-3 py-2 text-xs text-muted-foreground bg-muted/50">
                                                {callbackMsg}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </aside>
                </>,
                document.body
            )
                : null}
        </div>
    )
}
