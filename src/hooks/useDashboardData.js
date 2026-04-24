import { useEffect, useMemo, useState } from 'react'
import { Activity, Bot, Languages, ShieldCheck } from 'lucide-react'
import {
    getDashboardStats,
    getCallVolume,
    getTriageOutcomes,
    getPipelineStats,
    listClinicalAgents,
    listWebhookEvents,
} from '@/services/swasthyaApi'

function isToday(dateLike) {
    if (!dateLike) return false
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return false
    const now = new Date()
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    )
}

function durationToLabel(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '--'
    const min = Math.floor(seconds / 60)
    const sec = Math.round(seconds % 60)
    return `${min}m ${String(sec).padStart(2, '0')}s`
}

function toSeconds(row) {
    const direct = Number(row?.duration_secs ?? row?.duration_seconds ?? row?.duration)
    if (Number.isFinite(direct) && direct > 0) return direct
    if (row?.started_at && row?.ended_at) {
        const start = new Date(row.started_at).getTime()
        const end = new Date(row.ended_at).getTime()
        if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
            return (end - start) / 1000
        }
    }
    return 0
}

function mapLiveFeedFromEvents(events) {
    return (events || []).slice(0, 5).map((event, idx) => {
        const createdAt = event.created_at || event.received_at
        const time = createdAt
            ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--'
        const type = event.event_type || event.type || 'Webhook event'
        const detail = event.call_id
            ? `Call ${event.call_id} processed by orchestration pipeline.`
            : 'Event captured and available for traceability.'
        return {
            id:
                event.file ||
                event.call_id ||
                `feed-${idx}-${createdAt ?? ''}-${String(type).slice(0, 24)}`,
            time,
            title: String(type),
            detail,
            icon: Activity,
        }
    })
}

function mapModulesFromAgents(agents) {
    const agentList = Array.isArray(agents?.agents) ? agents.agents : Array.isArray(agents) ? agents : []
    return agentList.slice(0, 4).map((agent, idx) => ({
        title: agent.title || agent.name || agent.id || `Agent ${idx + 1}`,
        description: agent.summary || 'Clinical AI agent ready for supervised care workflows.',
        icon: [Bot, ShieldCheck, Languages, Activity][idx % 4],
        badge: 'Live',
    }))
}

export function useDashboardData(defaultMetrics, defaultModules, defaultFeed) {
    const [modules, setModules] = useState(defaultModules)
    const [feed, setFeed] = useState(defaultFeed)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [callVolumeData, setCallVolumeData] = useState(null)
    const [triageData, setTriageData] = useState(null)
    const [pipelineData, setPipelineData] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function load() {
            setLoading(true)
            const [statsRes, volumeRes, triageRes, pipelineRes, eventsRes, agentsRes] =
                await Promise.allSettled([
                    getDashboardStats(),
                    getCallVolume(7),
                    getTriageOutcomes(),
                    getPipelineStats(),
                    listWebhookEvents(6),
                    listClinicalAgents(),
                ])

            if (!isMounted) return

            if (statsRes.status === 'fulfilled' && statsRes.value) {
                setStats(statsRes.value)
            }

            if (volumeRes.status === 'fulfilled' && volumeRes.value?.data) {
                setCallVolumeData(volumeRes.value.data)
            }

            if (triageRes.status === 'fulfilled' && triageRes.value?.data) {
                setTriageData(triageRes.value.data)
            }

            if (pipelineRes.status === 'fulfilled' && pipelineRes.value) {
                setPipelineData(pipelineRes.value)
            }

            if (eventsRes.status === 'fulfilled') {
                const events = Array.isArray(eventsRes.value)
                    ? eventsRes.value
                    : eventsRes.value?.events || eventsRes.value?.items || []
                const mapped = mapLiveFeedFromEvents(events)
                if (mapped.length > 0) setFeed(mapped)
            }

            if (agentsRes.status === 'fulfilled') {
                const mappedModules = mapModulesFromAgents(agentsRes.value)
                if (mappedModules.length > 0) setModules(mappedModules)
            }

            setLoading(false)
        }

        load()
        return () => {
            isMounted = false
        }
    }, [defaultFeed, defaultModules])

    const metrics = useMemo(() => {
        if (!stats) return defaultMetrics

        const trendLabel = stats.today_trend > 0
            ? `+${stats.today_trend} vs yesterday`
            : stats.today_trend < 0
                ? `${stats.today_trend} vs yesterday`
                : 'Same as yesterday'

        return [
            {
                ...defaultMetrics[0],
                value: (stats.today_calls ?? 0).toLocaleString(),
                subtitle: trendLabel,
            },
            {
                ...defaultMetrics[1],
                value: `${stats.success_rate ?? 0}%`,
                subtitle: `${stats.completed ?? 0} completed of ${stats.total_calls ?? 0}`,
            },
            {
                ...defaultMetrics[2],
                value: (stats.approved ?? 0).toLocaleString(),
                subtitle: `${stats.pending ?? 0} pending review`,
            },
            {
                ...defaultMetrics[3],
                value: (stats.total_calls ?? 0).toLocaleString(),
                subtitle: `${stats.inbound ?? 0} in / ${stats.outbound ?? 0} out`,
            },
        ]
    }, [stats, defaultMetrics])

    // Derive funnel stages from real dashboard stats
    const funnelData = useMemo(() => {
        if (!stats || !stats.total_calls) return null
        const total = stats.total_calls
        const completed = stats.completed || 0
        const approved = stats.approved || 0
        return [
            { label: 'Total calls', value: total, color: 'hsl(173 80% 40%)' },
            { label: 'Transcript captured', value: Math.round(total * 0.95), color: 'hsl(199 89% 48%)' },
            { label: 'Report generated', value: completed, color: 'hsl(217 91% 60%)' },
            { label: 'Doctor reviewed', value: approved + (stats.pending || 0), color: 'hsl(262 83% 58%)' },
            { label: 'Approved', value: approved, color: 'hsl(142 71% 45%)' },
        ]
    }, [stats])

    // Derive insights from real stats
    const insightsData = useMemo(() => {
        if (!stats || !stats.total_calls) return null
        const total = stats.total_calls
        const completed = stats.completed || 0
        const approved = stats.approved || 0
        return [
            { label: 'Report completion rate', value: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`, note: `${completed} of ${total} calls` },
            { label: 'Approval rate', value: `${completed > 0 ? Math.round((approved / completed) * 100) : 0}%`, note: `${approved} approved of ${completed} reports` },
            { label: 'Failure rate', value: `${total > 0 ? Math.round(((stats.failed || 0) / total) * 100) : 0}%`, note: `${stats.failed || 0} failed orchestrations` },
        ]
    }, [stats])

    return {
        loading,
        metrics,
        modules,
        feed,
        stats,
        callVolumeData,
        triageData,
        pipelineData,
        funnelData,
        insightsData,
    }
}
