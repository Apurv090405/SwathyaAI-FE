import {
    Activity,
    Brain,
    Clock3,
    HeartPulse,
    Languages,
    PhoneCall,
    ShieldCheck,
    UsersRound,
} from 'lucide-react'

export const dashboardMetrics = [
    {
        title: 'Today Calls',
        value: '--',
        trend: '',
        subtitle: 'Loading...',
        icon: PhoneCall,
    },
    {
        title: 'Success Rate',
        value: '--',
        trend: '',
        subtitle: 'Orchestration completion',
        icon: Brain,
    },
    {
        title: 'Approved',
        value: '--',
        trend: '',
        subtitle: 'Reports reviewed',
        icon: UsersRound,
    },
    {
        title: 'Total Calls',
        value: '--',
        trend: '',
        subtitle: 'All time',
        icon: Clock3,
    },
]

export const focusModules = [
    {
        title: 'AyurScribe',
        description: 'Voice-to-structured OPD notes with bilingual medical context.',
        icon: HeartPulse,
        badge: 'Clinical',
    },
    {
        title: 'Triage Suraksha',
        description: 'Critical risk flags for maternal, pediatric and chronic conditions.',
        icon: ShieldCheck,
        badge: 'Safety',
    },
    {
        title: 'JanBhasha Assistant',
        description: 'Hindi, Gujarati, Marathi and Tamil-first patient communication.',
        icon: Languages,
        badge: 'Language',
    },
    {
        title: 'CarePulse Monitor',
        description: 'Real-time call orchestration visibility for care operations teams.',
        icon: Activity,
        badge: 'Ops',
    },
]

export const liveFeed = []

/** Sidebar order: sticky nav, no internal scroll — labels match product areas */
export const dashboardNavItems = [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'calling-agent', label: 'Calling agent', icon: 'PhoneCall' },
    { key: 'clinical-report', label: 'Clinical report', icon: 'FileText' },
    { key: 'knowledge-rag', label: 'Knowledge and RAG', icon: 'BookOpen' },
    { key: 'analytics-approvals', label: 'Analytics and approvals', icon: 'BarChart3' },
    { key: 'phone-number', label: 'Phone number', icon: 'Smartphone' },
    { key: 'ai-assistants', label: 'AI assistants', icon: 'Bot' },
    { key: 'languages', label: 'Languages', icon: 'Languages' },
    { key: 'call-histories', label: 'Call histories', icon: 'History' },
]
