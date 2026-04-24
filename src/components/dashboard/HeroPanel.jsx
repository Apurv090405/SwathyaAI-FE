import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroPanel({ userName }) {
    return (
        <section className="dashboard-hero relative overflow-hidden rounded-3xl border border-border/60 px-6 py-7 sm:px-8">
            <div className="relative z-10 max-w-3xl">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/45 px-3 py-1 text-xs font-medium text-primary dark:bg-black/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    Clinical intelligence for Bharat
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    SwasthyaAI Dashboard
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    High-trust voice healthcare operations with multilingual care, real-time triage and
                    AI-assisted clinical workflows.
                </p>
                {userName ? (
                    <p className="mt-3 text-sm font-medium text-foreground/90">
                        Namaste, {userName}. Your operations snapshot is now synced with live data.
                    </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button className="rounded-full px-5">Start New Care Flow</Button>
                    <Button variant="outline" className="rounded-full bg-background/70 px-5">
                        View Clinical Reports
                    </Button>
                </div>
            </div>
            <div className="dashboard-orb dashboard-orb-1" />
            <div className="dashboard-orb dashboard-orb-2" />
        </section>
    )
}
