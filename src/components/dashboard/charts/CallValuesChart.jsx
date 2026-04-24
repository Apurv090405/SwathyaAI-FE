import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

export default function CallValuesChart({ data }) {
    const hasData = Array.isArray(data) && data.length > 0

    return (
        <Card className="h-full w-full rounded-3xl border-border/70 bg-card/90">
            <CardHeader>
                <CardTitle>Daily call volume by channel</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Stacked counts only — not outcomes or pipeline completion (see charts below)
                </p>
            </CardHeader>
            <CardContent className="w-full pl-0 pr-2 pt-2">
                {hasData ? (
                    <div className="h-[280px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fill: chartColors.text, fontSize: 12 }}
                                    axisLine={{ stroke: chartColors.grid }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: chartColors.text, fontSize: 12 }}
                                    axisLine={{ stroke: chartColors.grid }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 12,
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar
                                    dataKey="inbound"
                                    name="Inbound"
                                    stackId="a"
                                    fill={chartColors.tertiary}
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="outbound"
                                    name="Outbound"
                                    stackId="a"
                                    fill={chartColors.secondary}
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="web"
                                    name="Web"
                                    stackId="a"
                                    fill={chartColors.primary}
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                        No call volume data available yet. Complete voice calls to populate this chart.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
