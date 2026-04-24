import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TranscriptionFunnelInsights({ insights }) {
    const hasData = Array.isArray(insights) && insights.length > 0

    return (
        <Card className="h-full rounded-3xl border-border/70 bg-card/90">
            <CardHeader>
                <CardTitle className="text-lg">Transcription analytics</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Summary metrics alongside the depth funnel (not shown in other charts)
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasData ? (
                    insights.map((row) => (
                        <div
                            key={row.label}
                            className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3"
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {row.label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{row.value}</p>
                            <p className="text-xs text-muted-foreground">{row.note}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                        Transcription analytics will appear here once voice pipeline data is available.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
