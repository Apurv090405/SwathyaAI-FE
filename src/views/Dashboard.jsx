import React, { useMemo, useState } from 'react'
import { Bell, LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import HeroPanel from '@/components/dashboard/HeroPanel'
import KpiCards from '@/components/dashboard/KpiCards'
import BentoModules from '@/components/dashboard/BentoModules'
import LiveTimeline from '@/components/dashboard/LiveTimeline'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import OverviewCharts from '@/components/dashboard/charts/OverviewCharts'
import CallingAgentConfig from '@/components/dashboard/CallingAgentConfig'
import ClinicalReportPanel from '@/components/dashboard/ClinicalReportPanel'
import KnowledgeRagPanel from '@/components/dashboard/KnowledgeRagPanel'
import AnalyticsApprovalsPanel from '@/components/dashboard/AnalyticsApprovalsPanel'
import PhoneNumbersPanel from '@/components/dashboard/PhoneNumbersPanel'
import AiAssistantsPanel from '@/components/dashboard/AiAssistantsPanel'
import CallHistoryPanel from '@/components/dashboard/CallHistoryPanel'
import LanguagesVoicesPanel from '@/components/dashboard/LanguagesVoicesPanel'
import {
    dashboardMetrics,
    focusModules,
    liveFeed,
    dashboardNavItems,
} from '@/components/dashboard/dashboardData'
import { useTheme } from '@/hooks/useTheme'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useAuth } from '@/context/AuthContext'
import '../pages/Dashboard.css'
import '@/components/dashboard/dashboard.css'

/** Optional header title overrides (sidebar label used when missing). */
const PAGE_TITLE_OVERRIDES = {
    languages: 'Languages & voice',
}

export default function Dashboard() {
    const { theme, toggleTheme } = useTheme()
    const { profile, user, signOut } = useAuth()
    const [activeSection, setActiveSection] = useState('overview')
    const { loading, metrics, modules, feed, stats, callVolumeData, triageData, pipelineData, funnelData, insightsData } = useDashboardData(dashboardMetrics, focusModules, liveFeed)
    const userName =
        profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

    const headerTitle = useMemo(() => {
        const nav = dashboardNavItems.find((item) => item.key === activeSection)
        return PAGE_TITLE_OVERRIDES[activeSection] || nav?.label || 'Dashboard'
    }, [activeSection])

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (e) {
            console.warn('[auth] sign out', e)
        }
        window.location.hash = '#signin'
    }

    const renderSection = () => {
        if (activeSection === 'overview') {
            return (
                <div className="space-y-5">
                    <HeroPanel userName={userName} />
                    <KpiCards metrics={metrics} loading={loading} />
                    <OverviewCharts
                        callVolumeData={callVolumeData}
                        triageData={triageData}
                        pipelineData={pipelineData}
                        funnelData={funnelData}
                        insightsData={insightsData}
                        stats={stats}
                    />
                    {feed.length > 0 && <LiveTimeline feed={feed} />}
                </div>
            )
        }

        if (activeSection === 'calling-agent') {
            return (
                <div className="space-y-5">
                    <CallingAgentConfig />
                </div>
            )
        }

        if (activeSection === 'clinical-report') {
            return (
                <div className="space-y-5">
                    <ClinicalReportPanel />
                </div>
            )
        }

        if (activeSection === 'knowledge-rag') {
            return (
                <div className="space-y-5">
                    <KnowledgeRagPanel />
                </div>
            )
        }

        if (activeSection === 'phone-number') {
            return (
                <div className="space-y-5">
                    <PhoneNumbersPanel />
                </div>
            )
        }

        if (activeSection === 'analytics-approvals') {
            return (
                <div className="space-y-5">
                    <AnalyticsApprovalsPanel />
                </div>
            )
        }

        if (activeSection === 'call-histories') {
            return (
                <div className="space-y-5">
                    <CallHistoryPanel />
                </div>
            )
        }

        if (activeSection === 'ai-assistants') {
            return (
                <div className="space-y-5">
                    <AiAssistantsPanel />
                </div>
            )
        }

        if (activeSection === 'languages') {
            return (
                <div className="space-y-5">
                    <LanguagesVoicesPanel />
                </div>
            )
        }

        const selected = dashboardNavItems.find((item) => item.key === activeSection)
        return (
            <div className="space-y-5">
                <Card className="rounded-3xl border-border/70 bg-card/90">
                    <CardHeader>
                        <CardTitle>{selected?.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            This section is connected from the sidebar navigation.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <main className="dashboard-root flex items-start">
            <DashboardSidebar
                items={dashboardNavItems}
                activeKey={activeSection}
                onSelect={setActiveSection}
            />
            <section className="dashboard-main-scroll text-foreground mx-auto min-h-screen w-full max-w-[1400px] flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <header className="dashboard-top-header sticky z-[100] mb-5 shrink-0 rounded-2xl border border-border/60 bg-background/85 p-3 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:p-4 dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/70 top-[max(1rem,env(safe-area-inset-top,0px))] lg:top-[max(1.5rem,env(safe-area-inset-top,0px))]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                {headerTitle}
                            </h1>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                            <div className="flex max-w-[200px] items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 sm:max-w-[240px]">
                                <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                <span
                                    className="truncate text-sm font-medium text-foreground"
                                    title={user?.email || userName}
                                >
                                    {userName || 'Signed in'}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-full"
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                            </Button>
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 gap-1.5 rounded-full px-3"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Log out</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {renderSection()}
            </section>
        </main>
    )
}
