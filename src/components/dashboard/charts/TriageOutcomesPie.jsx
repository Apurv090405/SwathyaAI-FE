import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

function formatPct(value, total) {
    return `${Math.round((value / total) * 100)}%`
}

const OUTCOME_COLORS = [
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.primary,
    'hsl(var(--muted-foreground) / 0.45)',
]

export default function TriageOutcomesPie({ data: rawData }) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return (
            <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Triage outcomes</CardTitle>
                    <p className="text-sm font-normal text-muted-foreground">
                        How supervised calls closed (distinct from channel volume above)
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                        No triage outcome data available yet. Complete clinical sessions to populate this chart.
                    </div>
                </CardContent>
            </Card>
        )
    }

    const data = rawData.map((d, i) => ({
        ...d,
        color: d.color || OUTCOME_COLORS[i % OUTCOME_COLORS.length],
    }))
    const total = data.reduce((s, d) => s + d.value, 0)

    return (
        <Card className="overflow-hidden rounded-3xl border-border/70 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle>Triage outcomes</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    How supervised calls closed (distinct from channel volume above)
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="relative mx-auto h-[240px] w-[240px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <linearGradient id="pieGradResolved" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={chartColors.secondary} stopOpacity={1} />
                                        <stop offset="100%" stopColor={chartColors.tertiary} stopOpacity={0.85} />
                                    </linearGradient>
                                    <linearGradient id="pieGradFollow" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={chartColors.tertiary} stopOpacity={1} />
                                        <stop offset="100%" stopColor={chartColors.tertiary} stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="pieGradEsc" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={chartColors.primary} stopOpacity={1} />
                                        <stop offset="100%" stopColor="#c2410c" stopOpacity={0.9} />
                                    </linearGradient>
                                </defs>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={72}
                                    outerRadius={96}
                                    paddingAngle={3}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="hsl(var(--card))"
                                    strokeWidth={3}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`c-${index}`}
                                            fill={
                                                index === 0
                                                    ? 'url(#pieGradResolved)'
                                                    : index === 1
                                                      ? 'url(#pieGradFollow)'
                                                      : index === 2
                                                        ? 'url(#pieGradEsc)'
                                                        : entry.color
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v, n) => [`${v} (${formatPct(v, total)})`, n]}
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 12,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Sessions
                            </span>
                            <span className="text-3xl font-bold tabular-nums text-foreground">{total}</span>
                        </div>
                    </div>
                    <ul className="min-w-0 flex-1 space-y-2">
                        {data.map((row) => (
                            <li
                                key={row.name}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2.5"
                            >
                                <span className="flex items-center gap-2 text-sm text-foreground">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ background: row.color || chartColors.primary }}
                                    />
                                    {row.name}
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                    {formatPct(row.value, total)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
