import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

const COLORS = ['hsl(173 80% 40%)', 'hsl(217 91% 60%)', 'hsl(262 83% 58%)', 'hsl(24 95% 53%)']

export default function CallDirectionDonut({ inbound = 0, outbound = 0, web = 0, reportDelivery = 0 }) {
    const data = [
        { name: 'Outbound', value: outbound },
        { name: 'Inbound', value: inbound },
        { name: 'Web calls', value: web },
        { name: 'Report delivery', value: reportDelivery },
    ].filter((d) => d.value > 0)

    const total = data.reduce((s, d) => s + d.value, 0)
    if (total === 0) {
        return (
            <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Call types</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">No call data yet.</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full overflow-hidden rounded-3xl border-border/70 bg-gradient-to-br from-card/95 via-card/90 to-primary/[0.04] shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Call types</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Breakdown by direction
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative mx-auto h-[180px] w-[180px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="hsl(var(--card))"
                                    strokeWidth={3}
                                >
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v, n) => [`${v} (${Math.round((v / total) * 100)}%)`, n]}
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 12,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold tabular-nums text-foreground">{total}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {data.map((row, i) => (
                            <div
                                key={row.name}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2"
                            >
                                <span className="flex items-center gap-2 text-sm text-foreground">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ background: COLORS[i % COLORS.length] }}
                                    />
                                    {row.name}
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
