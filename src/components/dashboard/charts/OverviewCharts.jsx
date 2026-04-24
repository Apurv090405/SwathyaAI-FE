import CallValuesChart from './CallValuesChart'
import CallVolumeAreaChart from './CallVolumeAreaChart'
import CallDirectionDonut from './CallDirectionDonut'
import SuccessRateRadial from './SuccessRateRadial'
import TranscriptionDepthFunnel from './TranscriptionDepthFunnel'
import TranscriptionFunnelInsights from './TranscriptionFunnelInsights'
import TriageOutcomesPie from './TriageOutcomesPie'
import OrchestratorGauge from './OrchestratorGauge'

export default function OverviewCharts({ callVolumeData, triageData, pipelineData, funnelData, insightsData, stats }) {
    return (
        <div className="flex w-full flex-col gap-5">
            {/* Row 1: Call volume charts */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <CallValuesChart data={callVolumeData || undefined} />
                <CallVolumeAreaChart data={callVolumeData || undefined} />
            </div>

            {/* Row 3: Direction + Success — equal height pair */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <CallDirectionDonut
                    inbound={stats?.inbound ?? 0}
                    outbound={stats?.outbound ?? 0}
                    web={stats?.web ?? 0}
                    reportDelivery={stats?.report_delivery ?? 0}
                />
                <SuccessRateRadial
                    successRate={stats?.success_rate ?? 0}
                    completed={stats?.completed ?? 0}
                    failed={stats?.failed ?? 0}
                    pending={stats?.pending ?? 0}
                />
            </div>

            {/* Row 4: Pipeline funnel + insights */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <TranscriptionDepthFunnel stages={funnelData || undefined} />
                <TranscriptionFunnelInsights insights={insightsData || undefined} />
            </div>

            {/* Row 5: Triage + Gauge */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <TriageOutcomesPie data={triageData || undefined} />
                <OrchestratorGauge
                    current={pipelineData?.current ?? undefined}
                    target={pipelineData?.target ?? undefined}
                    totalRuns={pipelineData?.total_runs}
                />
            </div>
        </div>
    )
}
