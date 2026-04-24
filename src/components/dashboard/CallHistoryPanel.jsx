import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    getCallsHistory,
    getWebhookEventByCallId,
    getWebhookEventByFile,
} from '@/services/swasthyaApi'
import { cn } from '@/lib/utils'

function formatWhen(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return String(ts)
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

function directionLabel(d) {
    if (!d) return '—'
    const x = String(d).toLowerCase()
    if (x === 'supervisor') return 'Supervisor / clinical'
    if (x === 'inbound' || x === 'outbound') return x.charAt(0).toUpperCase() + x.slice(1)
    return String(d)
}

function eventTypeLabel(et) {
    if (et === 'analyze_transcript') return 'Clinical report'
    if (!et || et === 'voice_call') return 'Voice call'
    return String(et)
}

const PAGE_SIZE = 9

export default function CallHistoryPanel() {
    const [rows, setRows] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sheetOpen, setSheetOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState('')
    const [detail, setDetail] = useState(null)

    const load = useCallback(async (targetPage = 1) => {
        setLoading(true)
        setError('')
        try {
            const data = await getCallsHistory({ page: targetPage, limit: PAGE_SIZE })
            const items = Array.isArray(data?.calls) ? data.calls : Array.isArray(data?.items) ? data.items : Array.isArray(data?.events) ? data.events : []
            setRows(items)
            setTotalPages(Math.max(1, data?.total_pages || Math.ceil((data?.total || items.length) / PAGE_SIZE)))
            setPage(targetPage)
        } catch (e) {
            setError(e.message || 'Failed to load call history')
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load(1)
    }, [load])

    const pageRows = rows

    useEffect(() => {
        if (!sheetOpen) return
        const onKey = (e) => {
            if (e.key === 'Escape') setSheetOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [sheetOpen])

    const openSheet = async (row) => {
        const callId = row?.call_id
        const file = row?.file
        if (!callId && !file) return
        setSheetOpen(true)
        setDetail(null)
        setDetailError('')
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
            if (!payload) throw lastErr || new Error('Could not load record')
            setDetail(payload)
        } catch (e) {
            setDetailError(e.message || 'Could not load record')
        } finally {
            setDetailLoading(false)
        }
    }

    const callInfo = detail?.call_info || {}
    const triage = (detail?.report || {}).triage || {}
    const isAnalyze = detail?.event_type === 'analyze_transcript'

    const sheetBody = useMemo(() => {
        if (detailLoading) {
            return (
                <div className="flex flex-1 items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        }
        if (detailError) {
            return <p className="p-4 text-sm text-destructive">{detailError}</p>
        }
        if (!detail) return null

        const fromN = isAnalyze ? '—' : callInfo.from || '—'
        const toN = isAnalyze ? '—' : callInfo.to || '—'
        const dir = isAnalyze ? 'supervisor' : callInfo.direction
        const telco = isAnalyze ? '—' : callInfo.provider || '—'
        const llm = isAnalyze ? detail.request?.llm_provider || '—' : callInfo.llm_provider || '—'
        const mins = isAnalyze
            ? '—'
            : (() => {
                  const m = detail.metrics || {}
                  const s = m.call_duration_seconds || m.duration_seconds || m.duration || m.total_seconds
                  return typeof s === 'number' && s > 0 ? `${(s / 60).toFixed(2)} min` : '—'
              })()
        const critical = isAnalyze
            ? (() => {
                  const lvl = String(triage.level || '').toLowerCase()
                  const urgent = ['emergent', 'immediate', 'urgent', 'critical', 'esi 1', 'esi 2', 'emergency'].some(
                      (k) => lvl.includes(k)
                  )
                  return urgent ? 'Yes' : triage.level ? 'No' : '—'
              })()
            : '—'

        return (
            <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-28">
                <dl className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Call / session ID</dt>
                        <dd className="break-all font-mono text-xs text-foreground">
                            {detail.call_id || detail.request?.userid || '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Stream ID</dt>
                        <dd className="break-all font-mono text-xs text-foreground">
                            {detail.stream_id || '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">From</dt>
                        <dd className="font-mono text-foreground">{fromN}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">To</dt>
                        <dd className="font-mono text-foreground">{toN}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Call type</dt>
                        <dd className="text-foreground">{directionLabel(dir)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Event type</dt>
                        <dd className="text-foreground">{eventTypeLabel(detail.event_type)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Telco provider</dt>
                        <dd className="capitalize text-foreground">{telco}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">LLM (session)</dt>
                        <dd className="text-foreground">{llm}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Duration (approx.)</dt>
                        <dd className="text-foreground">{mins}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-muted-foreground">Critical case</dt>
                        <dd
                            className={cn(
                                'font-medium',
                                critical === 'Yes' && 'text-destructive',
                                critical === 'No' && 'text-emerald-600 dark:text-emerald-400'
                            )}
                        >
                            {critical}
                        </dd>
                    </div>
                    {isAnalyze && triage.level ? (
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-medium text-muted-foreground">Triage level</dt>
                            <dd className="text-foreground">{triage.level}</dd>
                        </div>
                    ) : null}
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-muted-foreground">Timestamp</dt>
                        <dd className="text-foreground">{formatWhen(detail.timestamp)}</dd>
                    </div>
                </dl>
                <div className="rounded-2xl border border-border/60 bg-muted/10 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Transcript / text</p>
                    {isAnalyze ? (
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
                            {detail.request?.transcript || '—'}
                        </pre>
                    ) : (
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
                            {detail.transcript?.full_text ||
                                (detail.transcript?.messages || [])
                                    .filter((m) => m.role !== 'system')
                                    .map((m) => `${m.role}: ${m.content || ''}`)
                                    .join('\n\n') ||
                                '—'}
                        </pre>
                    )}
                </div>
            </div>
        )
    }, [detail, detailLoading, detailError, isAnalyze, callInfo, triage])

    return (
        <div className="call-history-panel space-y-4">
            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardContent className="pt-5">
                    <div className="mb-3 flex justify-end">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => load(page)}>
                            Refresh
                        </Button>
                    </div>
                    {error ? (
                        <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}
                    <div className="call-history-table-wrap rounded-2xl border border-border/70">
                        <table className="w-full table-fixed text-left text-sm">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40">
                                    <th className="w-[15%] px-2 py-2 text-xs font-medium text-muted-foreground">Time</th>
                                    <th className="w-[10%] px-2 py-2 text-xs font-medium text-muted-foreground">Type</th>
                                    <th className="w-[12%] px-2 py-2 text-xs font-medium text-muted-foreground">From</th>
                                    <th className="w-[12%] px-2 py-2 text-xs font-medium text-muted-foreground">To</th>
                                    <th className="w-[14%] px-2 py-2 text-xs font-medium text-muted-foreground">Direction</th>
                                    <th className="w-[10%] px-2 py-2 text-xs font-medium text-muted-foreground">Provider</th>
                                    <th className="w-[7%] px-2 py-2 text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="w-[8%] px-2 py-2 text-xs font-medium text-muted-foreground">Approved</th>
                                    <th className="w-[12%] px-2 py-2 pr-2 text-right text-xs font-medium text-muted-foreground">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin opacity-60" />
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                                            No saved calls yet.
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((row, idx) => {
                                        const crit =
                                            row.event_type === 'analyze_transcript'
                                                ? row.critical_case === true
                                                    ? 'Yes'
                                                    : row.critical_case === false
                                                      ? 'No'
                                                      : '—'
                                                : '—'
                                        const status = row.orchestrator_status || '—'
                                        return (
                                            <tr key={row.id || row.call_id || `${page}-${idx}`} className="border-b border-border/50">
                                                <td className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                                                    {formatWhen(row.created_at || row.ended_at || row.timestamp)}
                                                </td>
                                                <td className="truncate px-2 py-1.5 text-[11px]">
                                                    {directionLabel(row.direction)}
                                                </td>
                                                <td className="truncate px-2 py-1.5 font-mono text-[11px]">
                                                    {row.from_number || '—'}
                                                </td>
                                                <td className="truncate px-2 py-1.5 font-mono text-[11px]">
                                                    {row.to_number || '—'}
                                                </td>
                                                <td className="truncate px-2 py-1.5 text-[11px]">
                                                    {directionLabel(row.direction)}
                                                </td>
                                                <td className="truncate px-2 py-1.5 text-[11px] capitalize">
                                                    {row.provider || row.telco_provider || '—'}
                                                </td>
                                                <td className="truncate px-2 py-1.5 text-[11px]">
                                                    {status}
                                                </td>
                                                <td className="truncate px-2 py-1.5 text-[11px] font-medium">{row.approved ? 'Yes' : '—'}</td>
                                                <td className="truncate px-2 py-1.5 pr-2 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-full text-xs"
                                                        onClick={() => openSheet(row)}
                                                    >
                                                        View sheet
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 ? (
                        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1 || loading}
                                onClick={() => load(Math.max(1, page - 1))}
                                aria-label="Previous page"
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
                                disabled={page >= totalPages || loading}
                                onClick={() => load(Math.min(totalPages, page + 1))}
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {sheetOpen && typeof document !== 'undefined'
                ? createPortal(
                      <>
                          <button
                              type="button"
                              className="fixed inset-0 z-[220] bg-background/60 backdrop-blur-sm"
                              aria-label="Close"
                              onClick={() => setSheetOpen(false)}
                          />
                          <aside className="fixed inset-y-0 right-0 z-[230] flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden border-l border-border/80 bg-card shadow-2xl">
                              <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
                                  <h2 className="text-lg font-semibold">Call details</h2>
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-full"
                                      onClick={() => setSheetOpen(false)}
                                  >
                                      <X className="h-5 w-5" />
                                  </Button>
                              </div>
                              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                                  {sheetBody}
                              </div>
                              <div className="shrink-0 border-t border-border/70 bg-card/95 p-3 backdrop-blur">
                                  <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full rounded-full"
                                      onClick={() => setSheetOpen(false)}
                                  >
                                      Close
                                  </Button>
                              </div>
                          </aside>
                      </>,
                      document.body
                  )
                : null}
        </div>
    )
}
