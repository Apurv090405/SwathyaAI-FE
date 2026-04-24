import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartColors } from './chartTheme'

export default function OverviewLineChart({ data }) {
    const hasData = Array.isArray(data) && data.length > 0

    return (
        <Card className="rounded-3xl border-border/70 bg-card/90">
            <CardHeader>
                <CardTitle>Voice &amp; ASR quality</CardTitle>
                <p className="text-sm font-normal text-muted-foreground">
                    Mean ASR confidence vs duplex session stability (different from call counts &amp; outcomes)
                </p>
            </CardHeader>
            <CardContent className="pl-0 pr-2">
                {hasData ? (
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: chartColors.text, fontSize: 12 }}
                                    axisLine={{ stroke: chartColors.grid }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[50, 100]}
                                    tick={{ fill: chartColors.text, fontSize: 12 }}
                                    axisLine={{ stroke: chartColors.grid }}
                                    tickLine={false}
                                    unit="%"
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 12,
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line
                                    type="monotone"
                                    dataKey="asrConfidence"
                                    name="ASR confidence"
                                    stroke={chartColors.tertiary}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="duplexStability"
                                    name="Duplex stability"
                                    stroke={chartColors.secondary}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
                        Voice and ASR quality data will appear here as calls are processed through the pipeline.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
