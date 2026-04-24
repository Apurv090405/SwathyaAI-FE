import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, FileText, Loader2, RefreshCw, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import {
    listRagSources,
    ragIngestText,
    searchLanceRag,
    uploadPdf,
} from '@/services/swasthyaApi'
import { cn } from '@/lib/utils'

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result ?? ''))
        r.onerror = () => reject(new Error('Failed to read file'))
        r.readAsText(file)
    })
}

export default function KnowledgeRagPanel() {
    const pdfInputRef = useRef(null)
    const docInputRef = useRef(null)

    const [sources, setSources] = useState([])
    const [sourcesLoading, setSourcesLoading] = useState(false)
    const [sourcesError, setSourcesError] = useState('')

    const [pdfKb, setPdfKb] = useState('clinical_guidelines')
    const [pdfUploading, setPdfUploading] = useState(false)
    const [pdfMessage, setPdfMessage] = useState('')

    const [docKb, setDocKb] = useState('pasted_doc')
    const [pastedText, setPastedText] = useState('')
    const [docUploading, setDocUploading] = useState(false)
    const [docMessage, setDocMessage] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [topK, setTopK] = useState(5)
    const [sourceFilter, setSourceFilter] = useState('')
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [searchResults, setSearchResults] = useState(null)

    const loadSources = useCallback(async () => {
        setSourcesLoading(true)
        setSourcesError('')
        try {
            const data = await listRagSources()
            setSources(Array.isArray(data?.sources) ? data.sources : [])
        } catch (e) {
            setSourcesError(e.message || 'Could not load knowledge bases')
            setSources([])
        } finally {
            setSourcesLoading(false)
        }
    }, [])

    useEffect(() => {
        loadSources()
    }, [loadSources])

    const handlePdfChange = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setPdfMessage('Only PDF files are supported for this upload.')
            return
        }
        setPdfUploading(true)
        setPdfMessage('')
        try {
            const res = await uploadPdf(file, pdfKb.trim() || 'uploaded_pdf')
            setPdfMessage(res?.message || `Added ${res?.chunks_added ?? 0} chunks.`)
            await loadSources()
        } catch (err) {
            setPdfMessage(err.message || 'Upload failed')
        } finally {
            setPdfUploading(false)
        }
    }

    const handleIngestPasted = async () => {
        const text = pastedText.trim()
        if (!text) {
            setDocMessage('Paste or type document text first.')
            return
        }
        setDocUploading(true)
        setDocMessage('')
        try {
            const res = await ragIngestText({
                text,
                source: docKb.trim() || 'pasted_doc',
            })
            setDocMessage(res?.message || `Ingested ${res?.chunks_added ?? 0} chunks.`)
            await loadSources()
        } catch (err) {
            setDocMessage(err.message || 'Ingest failed')
        } finally {
            setDocUploading(false)
        }
    }

    const handleDocFile = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        const lower = file.name.toLowerCase()
        if (!lower.endsWith('.txt') && !lower.endsWith('.md')) {
            setDocMessage('Use .txt or .markdown / .md files, or paste text below.')
            return
        }
        setDocUploading(true)
        setDocMessage('')
        try {
            const text = await readFileAsText(file)
            const res = await ragIngestText({
                text,
                source: docKb.trim() || file.name.replace(/\.[^.]+$/, ''),
            })
            setDocMessage(res?.message || `Ingested ${res?.chunks_added ?? 0} chunks from ${file.name}.`)
            setPastedText('')
            await loadSources()
        } catch (err) {
            setDocMessage(err.message || 'Ingest failed')
        } finally {
            setDocUploading(false)
        }
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        const q = searchQuery.trim()
        if (!q) {
            setSearchError('Enter a query.')
            return
        }
        setSearching(true)
        setSearchError('')
        setSearchResults(null)
        try {
            const data = await searchLanceRag(q, {
                top_k: Math.min(50, Math.max(1, Number(topK) || 5)),
                source: sourceFilter.trim() || null,
            })
            setSearchResults(data)
        } catch (err) {
            setSearchError(err.message || 'Search failed')
        } finally {
            setSearching(false)
        }
    }

    const hits = searchResults?.results ?? []

    return (
        <div className="knowledge-rag-panel space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
                <Card className="knowledge-rag-card rounded-3xl border-border/70 bg-card/90 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Upload className="h-5 w-5 text-primary" />
                            Upload PDF
                        </CardTitle>
                        <CardDescription>
                            PDFs are chunked, embedded, and stored in LanceDB under a knowledge-base label (
                            <code className="text-xs">source</code>).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rag-pdf-kb">Knowledge base (source)</Label>
                            <Input
                                id="rag-pdf-kb"
                                value={pdfKb}
                                onChange={(e) => setPdfKb(e.target.value)}
                                placeholder="e.g. clinical_guidelines"
                                className="h-11 rounded-xl border-border/70 bg-background/80"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-full"
                                disabled={pdfUploading}
                                onClick={() => pdfInputRef.current?.click()}
                            >
                                {pdfUploading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <FileText className="mr-2 h-4 w-4" />
                                )}
                                Choose PDF
                            </Button>
                            <input
                                ref={pdfInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handlePdfChange}
                            />
                        </div>
                        {pdfMessage ? (
                            <p
                                className={cn(
                                    'rounded-xl border px-3 py-2 text-sm',
                                    pdfMessage.toLowerCase().includes('fail') ||
                                        pdfMessage.toLowerCase().includes('only')
                                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                        : 'border-border/60 bg-muted/30 text-foreground'
                                )}
                            >
                                {pdfMessage}
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="knowledge-rag-card rounded-3xl border-border/70 bg-card/90 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Text &amp; documents
                        </CardTitle>
                        <CardDescription>
                            Paste notes or upload <code className="text-xs">.txt</code> /{' '}
                            <code className="text-xs">.md</code> — same embedding pipeline as PDF.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rag-doc-kb">Knowledge base (source)</Label>
                            <Input
                                id="rag-doc-kb"
                                value={docKb}
                                onChange={(e) => setDocKb(e.target.value)}
                                placeholder="e.g. policy_notes"
                                className="h-11 rounded-xl border-border/70 bg-background/80"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={docUploading}
                            onClick={() => docInputRef.current?.click()}
                        >
                            Upload .txt / .md
                        </Button>
                        <input
                            ref={docInputRef}
                            type="file"
                            accept=".txt,.md,text/plain,text/markdown"
                            className="hidden"
                            onChange={handleDocFile}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="rag-paste">Or paste text</Label>
                            <Textarea
                                id="rag-paste"
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Paste guideline excerpts, policies, FAQs…"
                                rows={6}
                                className="min-h-[140px] rounded-2xl border-border/70 bg-background/80 font-mono text-sm"
                            />
                        </div>
                        <Button
                            type="button"
                            className="rounded-full"
                            disabled={docUploading}
                            onClick={handleIngestPasted}
                        >
                            {docUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Ingest text
                        </Button>
                        {docMessage ? (
                            <p
                                className={cn(
                                    'rounded-xl border px-3 py-2 text-sm',
                                    docMessage.toLowerCase().includes('fail') ||
                                        docMessage.toLowerCase().includes('paste')
                                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                        : 'border-border/60 bg-muted/30 text-foreground'
                                )}
                            >
                                {docMessage}
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            <Card className="knowledge-rag-card rounded-3xl border-primary/20 bg-gradient-to-b from-card/95 to-muted/20 shadow-md dark:border-primary/25 dark:from-card/90 dark:to-muted/10">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Search className="h-5 w-5 text-primary" />
                            Test RAG
                        </CardTitle>
                        <CardDescription>
                            Semantic search over LanceDB. Optionally restrict to one knowledge base (
                            <code className="text-xs">source</code>).
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full"
                        disabled={sourcesLoading}
                        onClick={() => loadSources()}
                    >
                        <RefreshCw className={cn('mr-2 h-4 w-4', sourcesLoading && 'animate-spin')} />
                        Refresh bases
                    </Button>
                </CardHeader>
                <CardContent>
                    {sourcesError ? (
                        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                            {sourcesError}
                        </p>
                    ) : null}
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                            <div className="space-y-2">
                                <Label htmlFor="rag-query">Query</Label>
                                <Textarea
                                    id="rag-query"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. pediatric fever management guidelines"
                                    rows={3}
                                    className="rounded-2xl border-border/70 bg-background/80"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:w-[280px]">
                                <div className="space-y-2">
                                    <Label htmlFor="rag-topk">Top‑K</Label>
                                    <Input
                                        id="rag-topk"
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={topK}
                                        onChange={(e) => setTopK(e.target.value)}
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="rag-kb-filter">Knowledge base</Label>
                                    <NativeSelect
                                        id="rag-kb-filter"
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="h-11 rounded-xl border-border/70 bg-background/80"
                                    >
                                        <option value="">All sources</option>
                                        {sources.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="rounded-full" disabled={searching}>
                            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Run search
                        </Button>
                        {searchError ? (
                            <p className="text-sm text-destructive" role="alert">
                                {searchError}
                            </p>
                        ) : null}
                    </form>

                    {searchResults ? (
                        <div className="mt-6 space-y-3 border-t border-border/60 pt-6">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{searchResults.count}</span> hit(s)
                                {searchResults.source_filter ? (
                                    <>
                                        {' '}
                                        in <code className="text-xs">{searchResults.source_filter}</code>
                                    </>
                                ) : null}
                            </p>
                            <ul className="space-y-3">
                                {hits.length === 0 ? (
                                    <li className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                        No chunks matched. Try another query, increase top‑K, or clear the knowledge
                                        base filter.
                                    </li>
                                ) : (
                                    hits.map((hit, i) => (
                                        <li
                                            key={`${hit.id ?? i}-${i}`}
                                            className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm"
                                        >
                                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                                                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
                                                    {hit.source || '—'}
                                                </span>
                                                {hit.score != null ? (
                                                    <span className="text-muted-foreground">
                                                        score / distance:{' '}
                                                        <span className="font-mono tabular-nums text-foreground">
                                                            {typeof hit.score === 'number'
                                                                ? hit.score.toFixed(4)
                                                                : hit.score}
                                                        </span>
                                                    </span>
                                                ) : null}
                                            </div>
                                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                                                {hit.text || '—'}
                                            </pre>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    )
}
