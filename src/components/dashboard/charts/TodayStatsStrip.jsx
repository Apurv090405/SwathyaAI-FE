import { ArrowDown, ArrowUp, Minus, Phone, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, trend, trendLabel, color }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
            <div className={cn('rounded-xl p-2.5', color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
                    {trend != null && trend !== 0 && (
                        <span className={cn(
                            'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                            trend > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'
                        )}>
                            {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(trend)}
                        </span>
                    )}
                </div>
                {trendLabel && <p className="text-[10px] text-muted-foreground">{trendLabel}</p>}
            </div>
        </div>
    )
}

export default function TodayStatsStrip({ stats }) {
    if (!stats) return null

    return (
        <Card className="rounded-3xl border-border/70 bg-card/90">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        icon={Phone}
                        label="Today"
                        value={stats.today_calls ?? 0}
                        trend={stats.today_trend}
                        trendLabel="vs yesterday"
                        color="bg-primary/10 text-primary"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Completed"
                        value={stats.completed ?? 0}
                        trendLabel={`of ${stats.total_calls ?? 0} total`}
                        color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Failed"
                        value={stats.failed ?? 0}
                        trendLabel={`${stats.total_calls ? Math.round(((stats.failed || 0) / stats.total_calls) * 100) : 0}% failure rate`}
                        color="bg-red-500/10 text-red-600 dark:text-red-400"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending review"
                        value={stats.pending ?? 0}
                        trendLabel={`${stats.approved ?? 0} approved`}
                        color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
