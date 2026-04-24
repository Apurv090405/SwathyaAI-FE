import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

/**
 * Distinct metric: orchestrator pipeline completion vs weekly target (not SLA pie/bar).
 * UI: dual-arc gauge + stat chips.
 */
export default function OrchestratorGauge({ current = 73, target = 85, unit = '%', totalRuns }) {
    const capped = Math.min(Math.max(current, 0), 100)
    const cx = 100
    const cy = 102
    const r = 76
    const strokeBg = 10
    const strokeFg = 10
    const arcLen = Math.PI * r
    const dash = (capped / 100) * arcLen
    const rest = arcLen - dash

    const angle = Math.PI - (target / 100) * Math.PI
    const tx = cx + (r - 4) * Math.cos(angle)
    const ty = cy - (r - 4) * Math.sin(angle)

    return (
        <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-card/90">
            <CardHeader className="pb-2">
                <CardTitle>Pipeline completion</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Multi-agent runs finished vs weekly goal (unique to this widget)
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)] sm:items-center">
                    <div className="relative mx-auto flex max-w-[220px] flex-col items-center">
                        <div className="absolute inset-x-8 top-2 h-16 rounded-full bg-primary/10 blur-2xl" />
                        <svg width="220" height="130" viewBox="0 0 200 130" className="relative overflow-visible">
                            <defs>
                                <linearGradient id="gaugeArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={chartColors.tertiary} />
                                    <stop offset="50%" stopColor={chartColors.primary} />
                                    <stop offset="100%" stopColor={chartColors.secondary} />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                                fill="none"
                                stroke="hsl(var(--muted))"
                                strokeWidth={strokeBg}
                                strokeLinecap="round"
                                opacity={0.45}
                            />
                            <path
                                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                                fill="none"
                                stroke="url(#gaugeArcGrad)"
                                strokeWidth={strokeFg}
                                strokeLinecap="round"
                                strokeDasharray={`${dash} ${rest}`}
                            />
                            <circle cx={tx} cy={ty} r={6} fill="hsl(var(--card))" stroke="#fbbf24" strokeWidth={3} />
                        </svg>
                        <div className="-mt-2 text-center">
                            <p className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                                {capped}
                                {unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Actual · goal <span className="font-medium text-amber-600 dark:text-amber-400">{target}{unit}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/40 to-transparent p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Gap to goal</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                                {Math.max(0, target - capped)}
                                {unit}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Runs this week</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                                {totalRuns != null
                                    ? totalRuns >= 1000
                                        ? `${(totalRuns / 1000).toFixed(1)}k`
                                        : totalRuns
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
