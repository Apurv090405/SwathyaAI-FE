import {
    BarChart3,
    BookOpen,
    Bot,
    FileText,
    History,
    Languages,
    LayoutDashboard,
    PhoneCall,
    Smartphone,
} from 'lucide-react'

const iconMap = {
    LayoutDashboard,
    PhoneCall,
    FileText,
    BookOpen,
    BarChart3,
    Smartphone,
    Bot,
    Languages,
    History,
}

export default function DashboardSidebar({ items, activeKey, onSelect }) {
    return (
        <aside className="dashboard-sidebar-sticky hidden w-72 shrink-0 p-4 lg:block">
            <div className="dashboard-sidebar-inner text-muted-foreground rounded-3xl border border-border/70 bg-card/90 p-6 shadow-xl shadow-black/5 backdrop-blur">
                <div className="mb-6">
                    <p className="text-xl font-semibold uppercase tracking-[0.2em] text-primary sm:text-2xl">
                        SwasthyaAI
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground/80">
                        Bharat-first intelligent health operations.
                    </p>
                </div>
                <nav className="dashboard-sidebar-nav space-y-2">
                    {items.map((item) => {
                        const Icon = iconMap[item.icon] || LayoutDashboard
                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => onSelect(item.key)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                    item.key === activeKey
                                        ? 'bg-primary/12 font-medium text-primary'
                                        : 'hover:bg-secondary/80 hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>
        </aside>
    )
}
