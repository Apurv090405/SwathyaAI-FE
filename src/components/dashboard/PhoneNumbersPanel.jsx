import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Phone, Plus, RefreshCw, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import {
    exotelListNumbers,
    telnyxListNumbers,
    telnyxOrderNumber,
    telnyxSearchNumbers,
    vobizListNumbers,
    listPhoneRegistry,
    addPhoneEntry,
    deletePhoneEntry,
} from '@/services/swasthyaApi'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const PROVIDERS = [
    { id: 'telnyx', label: 'Telnyx' },
    { id: 'exotel', label: 'Exotel' },
    { id: 'vobiz', label: 'Vobiz' },
]

const PAGE_SIZE = 7

export default function PhoneNumbersPanel() {
    const { user } = useAuth()
    const userId = user?.id || user?.email || ''
    const [tab, setTab] = useState('telnyx')
    const [telnyxRows, setTelnyxRows] = useState([])
    const [exotelRows, setExotelRows] = useState([])
    const [vobizRows, setVobizRows] = useState([])
    const [manualEntries, setManualEntries] = useState([])
    const [notes, setNotes] = useState({ telnyx: '', exotel: '', vobiz: '' })
    const [loading, setLoading] = useState(false)

    const [modalOpen, setModalOpen] = useState(false)
    const [modalProvider, setModalProvider] = useState('telnyx')

    const [txCountry, setTxCountry] = useState('IN')
    const [txType, setTxType] = useState('local')
    const [txContains, setTxContains] = useState('')
    const [txLimit, setTxLimit] = useState(7)
    const [txSearching, setTxSearching] = useState(false)
    const [txResults, setTxResults] = useState([])
    const [txSelected, setTxSelected] = useState(null)
    const [txPurchaseMsg, setTxPurchaseMsg] = useState('')

    const [manualPhone, setManualPhone] = useState('')
    const [manualLabel, setManualLabel] = useState('')
    const [manualMsg, setManualMsg] = useState('')
    const [page, setPage] = useState(1)

    const refresh = useCallback(async () => {
        setLoading(true)
        const [t, e, v, reg] = await Promise.allSettled([
            telnyxListNumbers(),
            exotelListNumbers(),
            vobizListNumbers(),
            userId ? listPhoneRegistry(userId) : Promise.resolve({ entries: [] }),
        ])
        if (t.status === 'fulfilled') {
            const nums = t.value?.numbers || []
            setTelnyxRows(nums)
            setNotes((n) => ({ ...n, telnyx: t.value?.note || '' }))
        } else {
            setTelnyxRows([])
            setNotes((n) => ({ ...n, telnyx: t.reason?.message || 'Telnyx list failed' }))
        }
        if (e.status === 'fulfilled') {
            setExotelRows(e.value?.numbers || [])
            setNotes((n) => ({ ...n, exotel: e.value?.note || '' }))
        } else {
            setExotelRows([])
        }
        if (v.status === 'fulfilled') {
            setVobizRows(v.value?.numbers || [])
            setNotes((n) => ({ ...n, vobiz: v.value?.note || '' }))
        } else {
            setVobizRows([])
        }
        if (reg.status === 'fulfilled') {
            setManualEntries(reg.value?.entries || [])
        }
        setLoading(false)
        setPage(1)
    }, [userId])

    useEffect(() => {
        refresh()
    }, [refresh])

    useEffect(() => {
        setPage(1)
    }, [tab])

    const openBuyModal = () => {
        setModalProvider(tab)
        setTxResults([])
        setTxSelected(null)
        setTxPurchaseMsg('')
        setManualMsg('')
        setModalOpen(true)
    }

    const runTelnyxSearch = async () => {
        setTxSearching(true)
        setTxPurchaseMsg('')
        setTxSelected(null)
        setTxResults([])
        try {
            const data = await telnyxSearchNumbers({
                country_code: txCountry,
                phone_number_type: txType,
                limit: Math.min(50, Math.max(1, Number(txLimit) || 7)),
                contains: txContains.trim() || undefined,
            })
            setTxResults(data?.numbers || [])
        } catch (err) {
            setTxPurchaseMsg(err.message || 'Search failed')
        } finally {
            setTxSearching(false)
        }
    }

    const runTelnyxPurchase = async () => {
        if (!txSelected?.phone_number) {
            setTxPurchaseMsg('Select a number from the list.')
            return
        }
        setTxSearching(true)
        setTxPurchaseMsg('')
        try {
            const res = await telnyxOrderNumber(txSelected.phone_number)
            setTxPurchaseMsg(res?.message || `Ordered ${txSelected.phone_number}`)
            await refresh()
        } catch (err) {
            setTxPurchaseMsg(err.message || 'Purchase failed')
        } finally {
            setTxSearching(false)
        }
    }

    const registerManualNumber = async () => {
        const pn = manualPhone.trim()
        if (!pn) {
            setManualMsg('Enter a phone number in E.164 or local format.')
            return
        }
        if (!userId) {
            setManualMsg('You must be logged in to register numbers.')
            return
        }
        try {
            await addPhoneEntry({
                user_id: userId,
                phone_number: pn,
                provider: modalProvider,
                label: manualLabel.trim() || 'Manual',
            })
            setManualPhone('')
            setManualLabel('')
            setManualMsg('Number registered successfully.')
            await refresh()
        } catch (e) {
            setManualMsg(e.message || 'Failed to register number.')
        }
    }

    const displayRows = useMemo(() => {
        const manualForTab = manualEntries
            .filter((r) => r.provider === tab)
            .map((r) => ({
                phone_number: r.phone_number,
                id: r.id,
                status: 'manual',
                connection_name: r.label,
                _src: 'manual',
            }))
        if (tab === 'telnyx') {
            return [...telnyxRows.map((r) => ({ ...r, _src: 'api' })), ...manualForTab]
        }
        if (tab === 'exotel') {
            return [...exotelRows.map((r) => ({ ...r, _src: 'api' })), ...manualForTab]
        }
        return [...vobizRows.map((r) => ({ ...r, _src: 'api' })), ...manualForTab]
    }, [tab, telnyxRows, exotelRows, vobizRows, manualEntries])

    const totalPages = Math.max(1, Math.ceil(displayRows.length / PAGE_SIZE))
    const pageRows = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return displayRows.slice(start, start + PAGE_SIZE)
    }, [displayRows, page])

    useEffect(() => {
        setPage((p) => (p > totalPages ? totalPages : p))
    }, [totalPages])

    return (
        <div className="phone-numbers-panel space-y-5">
            <Card className="rounded-3xl border-border/70 bg-card/90">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Phone numbers</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={refresh}>
                            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                            Refresh
                        </Button>
                        <Button type="button" className="rounded-full" onClick={openBuyModal}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Buy phone number
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="default-outbound">Default outbound</Label>
                            <Input id="default-outbound" placeholder="+91 98765 4327" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display-caller-id">Display caller ID</Label>
                            <Input id="display-caller-id" placeholder="+91 11 4000 0000" className="h-11 rounded-xl" />
                        </div>
                    </div>

                    <div className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
                        {PROVIDERS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setTab(p.id)}
                                className={cn(
                                    'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                                    tab === p.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {notes[tab] ? (
                        <p className="rounded-lg border border-amber-500/30 bg-amber-500/7 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                            {notes[tab]}
                        </p>
                    ) : null}

                    <div className="phone-numbers-table-wrap overflow-x-auto rounded-2xl border border-border/70">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="border-b border-border/70 bg-muted/40">
                                <tr>
                                    <th className="px-3 py-2.5 font-medium text-muted-foreground">Number</th>
                                    <th className="px-3 py-2.5 font-medium text-muted-foreground">ID / label</th>
                                    <th className="px-3 py-2.5 font-medium text-muted-foreground">Status</th>
                                    <th className="px-3 py-2.5 font-medium text-muted-foreground">Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-7 text-center text-muted-foreground">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin opacity-50" />
                                        </td>
                                    </tr>
                                ) : displayRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            No numbers yet for {PROVIDERS.find((p) => p.id === tab)?.label}.
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((row, i) => (
                                        <tr
                                            key={`${row.phone_number}-${row.id}-${page}-${i}`}
                                            className="border-b border-border/40"
                                        >
                                            <td className="px-3 py-2 font-mono text-xs">{row.phone_number || '—'}</td>
                                            <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">
                                                {row.connection_name || row.id || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-xs">{row.status || '—'}</td>
                                            <td className="px-3 py-2 text-xs capitalize">{row._src || 'api'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {displayRows.length > PAGE_SIZE ? (
                        <div className="flex items-center justify-end gap-2 text-sm">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {modalOpen ? (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-[160] bg-background/70 backdrop-blur-sm"
                        aria-label="Close"
                        onClick={() => setModalOpen(false)}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="buy-number-title"
                        className="fixed left-1/2 top-1/2 z-[170] flex max-h-[min(90dvh,40rem)] w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl dark:bg-card"
                    >
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-5 py-4">
                            <h2 id="buy-number-title" className="text-lg font-semibold">
                                Buy / register number
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => setModalOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buy-provider">Provider</Label>
                                <NativeSelect
                                    id="buy-provider"
                                    value={modalProvider}
                                    onChange={(e) => {
                                        setModalProvider(e.target.value)
                                        setTxResults([])
                                        setTxSelected(null)
                                        setTxPurchaseMsg('')
                                        setManualMsg('')
                                    }}
                                    className="h-11 rounded-xl"
                                >
                                    {PROVIDERS.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            {modalProvider === 'telnyx' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <NativeSelect
                                                value={txCountry}
                                                onChange={(e) => setTxCountry(e.target.value)}
                                                className="h-11 rounded-xl"
                                            >
                                                <option value="IN">India (IN)</option>
                                                <option value="US">United States (US)</option>
                                            </NativeSelect>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <NativeSelect
                                                value={txType}
                                                onChange={(e) => setTxType(e.target.value)}
                                                className="h-11 rounded-xl"
                                            >
                                                <option value="local">Local</option>
                                                <option value="mobile">Mobile</option>
                                                <option value="toll_free">Toll-free</option>
                                            </NativeSelect>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="area-search">Area code / search (contains)</Label>
                                        <Input
                                            id="area-search"
                                            value={txContains}
                                            onChange={(e) => setTxContains(e.target.value)}
                                            placeholder="e.g. 415 or 22 for Mumbai pattern"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-n">Max results</Label>
                                        <Input
                                            id="limit-n"
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={txLimit}
                                            onChange={(e) => setTxLimit(e.target.value)}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full rounded-full"
                                        disabled={txSearching}
                                        onClick={runTelnyxSearch}
                                    >
                                        {txSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Search available
                                    </Button>

                                    {txResults.length > 0 ? (
                                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border/60 p-2">
                                            {txResults.map((n) => (
                                                <label
                                                    key={n.phone_number}
                                                    className={cn(
                                                        'flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-xs',
                                                        txSelected?.phone_number === n.phone_number
                                                            ? 'border-primary bg-primary/7'
                                                            : 'border-transparent hover:bg-muted/50'
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="tnx-pick"
                                                        className="mt-1"
                                                        checked={txSelected?.phone_number === n.phone_number}
                                                        onChange={() => setTxSelected(n)}
                                                    />
                                                    <span>
                                                        <span className="font-mono font-semibold">{n.phone_number}</span>
                                                        {n.region ? (
                                                            <span className="block text-muted-foreground">{n.region}</span>
                                                        ) : null}
                                                        {n.monthly_cost != null ? (
                                                            <span className="block text-muted-foreground">
                                                                ~{n.monthly_cost}/mo
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : null}

                                    <Button
                                        type="button"
                                        className="w-full rounded-full"
                                        disabled={txSearching || !txSelected}
                                        onClick={runTelnyxPurchase}
                                    >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Purchase selected
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-muted-foreground">
                                        Exotel and Vobiz number purchase is typically done in the provider console.
                                        After you own a number, register it here so it appears in your{' '}
                                        <strong>{modalProvider === 'exotel' ? 'Exotel' : 'Vobiz'}</strong> list in this
                                        browser.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="man-phone">Phone number</Label>
                                        <Input
                                            id="man-phone"
                                            value={manualPhone}
                                            onChange={(e) => setManualPhone(e.target.value)}
                                            placeholder="+91xxxxxxxxxx"
                                            className="h-11 rounded-xl font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="man-label">Label (optional)</Label>
                                        <Input
                                            id="man-label"
                                            value={manualLabel}
                                            onChange={(e) => setManualLabel(e.target.value)}
                                            placeholder="Outbound clinical line"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <Button type="button" variant="secondary" className="w-full rounded-full" onClick={registerManualNumber}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Register number
                                    </Button>
                                </>
                            )}

                            {(txPurchaseMsg || manualMsg) ? (
                                <p
                                    className={cn(
                                        'rounded-lg px-3 py-2 text-xs',
                                        (txPurchaseMsg || manualMsg).toLowerCase().includes('fail') ||
                                            (txPurchaseMsg || manualMsg).toLowerCase().includes('error') ||
                                            (txPurchaseMsg || manualMsg).toLowerCase().includes('select')
                                            ? 'bg-destructive/7 text-destructive'
                                            : 'bg-muted/50 text-foreground'
                                    )}
                                >
                                    {txPurchaseMsg || manualMsg}
                                </p>
                            ) : null}
                        </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}
