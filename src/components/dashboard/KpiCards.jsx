import { Card, CardContent } from '@/components/ui/card'

export default function KpiCards({ metrics, loading }) {
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                    <Card
                        key={metric.title}
                        className="group overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {metric.title}
                                </p>
                                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Icon className="h-4 w-4" />
                                </span>
                            </div>
                            <p className="text-3xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-medium text-emerald-600 dark:text-emerald-400">
                                    {metric.trend}
                                </span>
                                <span className="text-muted-foreground">{metric.subtitle}</span>
                            </div>
                            {loading ? (
                                <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-secondary" />
                            ) : null}
                        </CardContent>
                    </Card>
                )
            })}
        </section>
    )
}
