import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

/**
 * Funnel-style pipeline (CanvasJS-style labels: "{label} [{pct}%]").
 * Pure CSS clip-path — no external chart lib; avoids CanvasJS licensing on CDN.
 */
export default function TranscriptionDepthFunnel({ stages, className = '' }) {
    if (!Array.isArray(stages) || stages.length === 0) {
        return (
            <Card className={`h-full rounded-3xl border-border/70 bg-card/90 ${className}`}>
                <CardHeader>
                    <CardTitle>Transcription depth</CardTitle>
                    <p className="text-sm font-normal text-muted-foreground">
                        Pipeline from capture to clinical-ready narrative
                    </p>
                </CardHeader>
                <CardContent className="pb-6">
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                        Transcription depth data will appear here once voice calls are processed through the pipeline.
                    </div>
                </CardContent>
            </Card>
        )
    }

    const top = stages[0]?.value || 1

    return (
        <Card className={`h-full rounded-3xl border-border/70 bg-card/90 ${className}`}>
            <CardHeader>
                <CardTitle>Transcription depth</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Pipeline from capture to clinical-ready narrative
                </p>
            </CardHeader>
            <CardContent className="pb-6">
                <div
                    className="transcription-funnel-stack mx-auto flex w-full max-w-lg flex-col items-center gap-1 px-1"
                    style={{ minHeight: 300 }}
                    role="list"
                >
                    {stages.map((stage, i) => {
                        const pct = Math.round((stage.value / top) * 100)
                        const widthRatio = stage.value / top
                        const widthPct = 26 + widthRatio * 64
                        const toolTip = `${stage.label} – ${pct}% (${stage.value.toLocaleString()})`
                        const isLast = i === stages.length - 1
                        return (
                            <div
                                key={stage.label}
                                role="listitem"
                                title={toolTip}
                                className="transcription-funnel-segment relative flex min-h-[48px] w-full cursor-default items-center justify-center px-2 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-[filter,transform] duration-200 hover:z-[1] hover:brightness-[1.06] hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                style={{
                                    width: `${widthPct}%`,
                                    minWidth: 200,
                                    background: stage.color,
                                    clipPath: isLast
                                        ? 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'
                                        : 'polygon(6% 0%, 94% 0%, 90% 100%, 10% 100%)',
                                }}
                            >
                                <div className="pointer-events-none text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-95 sm:text-xs">
                                        {stage.label}{' '}
                                        <span className="font-bold tabular-nums normal-case tracking-normal">
                                            [{pct}%]
                                        </span>
                                    </p>
                                    <p className="mt-0.5 text-base font-bold tabular-nums leading-tight sm:text-lg">
                                        {stage.value.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
