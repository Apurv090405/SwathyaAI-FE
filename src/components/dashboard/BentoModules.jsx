import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BentoModules({ modules }) {
    return (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {modules.map((module) => {
                const Icon = module.icon
                return (
                    <Card
                        key={module.title}
                        className="dashboard-gradient-border rounded-3xl border-border/60 bg-card/90 transition duration-300 hover:scale-[1.01]"
                    >
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="rounded-xl bg-primary/12 p-2.5 text-primary">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <Badge variant="secondary" className="rounded-full">
                                    {module.badge}
                                </Badge>
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight text-foreground">{module.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {module.description}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </section>
    )
}
