import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

export default function CallVolumeAreaChart({ data }) {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <Card className="h-full rounded-3xl border-border/70 bg-card/90">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Call volume trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                        No trend data yet.
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Compute total per day for the area chart
    const areaData = data.map((d) => ({
        ...d,
        total: (d.inbound || 0) + (d.outbound || 0) + (d.web || 0),
    }))

    return (
        <Card className="h-full rounded-3xl border-border/70 bg-card/90">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Call volume trend</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Total daily calls over time
                </p>
            </CardHeader>
            <CardContent className="pl-0 pr-2">
                <div className="h-[280px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                            <XAxis
                                dataKey="period"
                                tick={{ fill: chartColors.text, fontSize: 10 }}
                                axisLine={{ stroke: chartColors.grid }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: chartColors.text, fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 12,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Total calls"
                                stroke={chartColors.primary}
                                strokeWidth={2.5}
                                fill="url(#areaGrad)"
                                dot={{ r: 3, fill: 'hsl(var(--card))', strokeWidth: 2, stroke: chartColors.primary }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
