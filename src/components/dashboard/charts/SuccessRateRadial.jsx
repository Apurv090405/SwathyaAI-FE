import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SuccessRateRadial({ successRate = 0, completed = 0, failed = 0, pending = 0 }) {
    const total = completed + failed + pending
    if (total === 0) {
        return (
            <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-card/90">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Success rate</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">No pipeline data yet.</div>
                </CardContent>
            </Card>
        )
    }

    const rate = Math.round(successRate)
    const circumference = 2 * Math.PI * 60
    const successDash = (rate / 100) * circumference
    const failDash = (Math.round((failed / total) * 100) / 100) * circumference

    return (
        <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-card/90">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Success rate</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Pipeline orchestration health
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                    <div className="relative mx-auto h-[160px] w-[160px] shrink-0">
                        <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
                            {/* Background ring */}
                            <circle
                                cx="80" cy="80" r="60"
                                fill="none"
                                stroke="hsl(var(--muted))"
                                strokeWidth="12"
                                opacity="0.3"
                            />
                            {/* Success arc */}
                            <circle
                                cx="80" cy="80" r="60"
                                fill="none"
                                stroke="hsl(142 71% 45%)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${successDash} ${circumference}`}
                                transform="rotate(-90 80 80)"
                            />
                            {/* Fail arc */}
                            <circle
                                cx="80" cy="80" r="60"
                                fill="none"
                                stroke="hsl(0 84% 60%)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${failDash} ${circumference}`}
                                strokeDashoffset={-successDash}
                                transform="rotate(-90 80 80)"
                            />
                        </svg>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold tabular-nums text-foreground">{rate}%</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Success</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
                            <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{completed}</p>
                        </div>
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Failed</p>
                            <p className="text-xl font-bold tabular-nums text-red-600 dark:text-red-400">{failed}</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
                            <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{pending}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
