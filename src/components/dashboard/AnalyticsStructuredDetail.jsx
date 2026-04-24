import React from 'react'
import { AlertTriangle, ClipboardList, HeartPulse, Stethoscope, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

function humanizeKey(key) {
    if (!key) return ''
    return String(key)
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatScalar(v) {
    if (v == null || v === '') return '—'
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '—'
    return String(v)
}

/** Flat or shallow object → definition list */
export function KeyValueSection({ title, data, icon: Icon, className }) {
    if (!data || typeof data !== 'object') return null
    const entries = Object.entries(data).filter(([, v]) => {
        if (v == null || v === '') return false
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
        return true
    })
    if (!entries.length) return null

    return (
        <section
            className={cn(
                'rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-transparent p-4',
                className
            )}
        >
            {title ? (
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
                    {title}
                </h3>
            ) : null}
            <dl className="grid gap-3 sm:grid-cols-2">
                {entries.map(([k, v]) => (
                    <div key={k} className="min-w-0 sm:col-span-2">
                        <dt className="text-[11px] font-medium text-muted-foreground">{humanizeKey(k)}</dt>
                        <dd className="mt-0.5 text-sm text-foreground">
                            {typeof v === 'object' && v !== null && !Array.isArray(v) ? (
                                <NestedObjectBlock obj={v} />
                            ) : Array.isArray(v) ? (
                                <ul className="mt-1 list-inside list-disc text-sm">
                                    {v.map((item, i) => (
                                        <li key={i} className="break-words">
                                            {typeof item === 'object' ? formatScalar(JSON.stringify(item)) : formatScalar(item)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="break-words">{formatScalar(v)}</span>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

function NestedObjectBlock({ obj }) {
    const entries = Object.entries(obj).filter(([, v]) => v != null && v !== '')
    if (!entries.length) return <span className="text-muted-foreground">—</span>
    return (
        <div className="mt-1 space-y-1 rounded-lg border border-border/40 bg-background/50 p-2 text-xs">
            {entries.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <span className="shrink-0 font-medium text-muted-foreground">{humanizeKey(k)}:</span>
                    <span className="min-w-0 break-words text-foreground">
                        {typeof v === 'object' ? formatScalar(JSON.stringify(v)) : formatScalar(v)}
                    </span>
                </div>
            ))}
        </div>
    )
}

function triageTone(level) {
    const l = String(level || '').toLowerCase()
    if (/(emergent|immediate|emergency|critical|esi\s*1)/i.test(l))
        return 'border-destructive/50 bg-destructive/10 text-destructive'
    if (/(urgent|esi\s*2|high)/i.test(l)) return 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200'
    return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
}

/** Clinical supervisor report → readable sections */
export function ClinicalReportView({ report }) {
    if (!report || typeof report !== 'object') {
        return (
            <p className="rounded-xl border border-border/60 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                No structured report in this event.
            </p>
        )
    }

    const triage = report.triage || {}
    const symptoms = Array.isArray(report.symptoms) ? report.symptoms : []
    const redFlags = Array.isArray(report.red_flags) ? report.red_flags : []
    const risk = report.risk_scores || {}
    const diffs = Array.isArray(report.differential_diagnosis) ? report.differential_diagnosis : []
    const rec = report.recommendations || {}
    const doctor = report.doctor_summary_note || {}
    const meta = report.report_meta || {}
    const pmh = report.past_medical_history

    return (
        <div className="space-y-4">
            {triage.level || triage.explanation ? (
                <div className={cn('rounded-2xl border p-4', triageTone(triage.level))}>
                    <div className="flex flex-wrap items-center gap-2">
                        <HeartPulse className="h-5 w-5 shrink-0 opacity-80" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Triage</span>
                        {triage.level ? (
                            <span className="rounded-full bg-background/60 px-2.5 py-0.5 text-sm font-bold">
                                {triage.level}
                            </span>
                        ) : null}
                    </div>
                    {triage.explanation ? (
                        <p className="mt-3 text-sm leading-relaxed opacity-95">{triage.explanation}</p>
                    ) : null}
                    {triage.recommended_action_window ? (
                        <p className="mt-2 text-xs font-medium opacity-90">
                            Suggested window: {triage.recommended_action_window}
                        </p>
                    ) : null}
                </div>
            ) : null}

            {redFlags.length > 0 ? (
                <div className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] p-4">
                    <div className="mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Reminders / red flags</span>
                    </div>
                    <ul className="space-y-2 text-sm leading-relaxed text-foreground">
                        {redFlags.map((t, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-amber-600 dark:text-amber-400">•</span>
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {symptoms.length > 0 ? (
                <section className="rounded-2xl border border-border/60 bg-card/50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5 text-primary" />
                        Symptoms noted
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {symptoms.map((s, i) => (
                            <div
                                key={i}
                                className="max-w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm"
                            >
                                <p className="font-medium text-foreground">{s.name || 'Symptom'}</p>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                    {s.severity ? <span>Severity: {s.severity}</span> : null}
                                    {s.duration_days != null ? <span>Duration: {s.duration_days} d</span> : null}
                                    {s.onset_description ? <span>{s.onset_description}</span> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {risk && Object.keys(risk).length > 0 ? (
                <KeyValueSection title="Risk scores" data={risk} icon={AlertTriangle} />
            ) : null}

            {diffs.length > 0 ? (
                <section className="rounded-2xl border border-border/60 bg-card/50 p-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Possible conditions (differential)
                    </h3>
                    <div className="space-y-3">
                        {diffs.map((d, i) => (
                            <div key={i} className="rounded-xl border border-border/40 bg-background/60 p-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="font-medium text-foreground">{d.condition || 'Condition'}</p>
                                    {typeof d.confidence === 'number' ? (
                                        <span className="text-xs font-medium text-primary">
                                            {Math.round(d.confidence * 100)}% confidence
                                        </span>
                                    ) : null}
                                </div>
                                {d.rationale ? (
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.rationale}</p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {rec.for_patient_hi || (rec.tests_suggested && rec.tests_suggested.length) ? (
                <section className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        <UserRound className="h-3.5 w-3.5" />
                        Guidance for patient
                    </h3>
                    {rec.for_patient_hi ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{rec.for_patient_hi}</p>
                    ) : null}
                    {rec.tests_suggested?.length ? (
                        <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground">Tests that may be considered</p>
                            <ul className="mt-1 list-inside list-disc text-sm">
                                {rec.tests_suggested.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {rec.referral_suggestion && typeof rec.referral_suggestion === 'object' ? (
                        <div className="mt-3 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
                            {rec.referral_suggestion.urgency ? (
                                <p>
                                    <span className="text-muted-foreground">Referral timing: </span>
                                    {rec.referral_suggestion.urgency}
                                </p>
                            ) : null}
                            {rec.referral_suggestion.recommended_center ? (
                                <p className="mt-1">
                                    <span className="text-muted-foreground">Where: </span>
                                    {rec.referral_suggestion.recommended_center}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </section>
            ) : null}

            {doctor.summary || (doctor.actionables && doctor.actionables.length) ? (
                <section className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <ClipboardList className="h-3.5 w-3.5" />
                        Doctor summary
                    </h3>
                    {doctor.summary ? (
                        <p className="text-sm leading-relaxed text-foreground">{doctor.summary}</p>
                    ) : null}
                    {doctor.actionables?.length ? (
                        <ul className="mt-3 space-y-2">
                            {doctor.actionables.map((a, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                    <span className="text-primary">✓</span>
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            ) : null}

            {pmh?.reported_by_patient && typeof pmh.reported_by_patient === 'object' ? (
                <KeyValueSection title="Patient-reported history" data={pmh.reported_by_patient} />
            ) : null}

            {meta && Object.keys(meta).length > 0 ? (
                <KeyValueSection title="Report details" data={meta} />
            ) : null}
        </div>
    )
}

/** Voice call: metrics / usage / latency as friendly sections */
export function VoiceCallTechnicalView({ detail }) {
    const m = detail?.metrics
    const u = detail?.usage_metrics
    const l = detail?.latency_metrics
    const anyBlock =
        (m && typeof m === 'object' && Object.keys(m).length > 0) ||
        (u && typeof u === 'object' && Object.keys(u).length > 0) ||
        (l && typeof l === 'object' && Object.keys(l).length > 0)

    if (!anyBlock) {
        return (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-3 py-4 text-center text-sm text-muted-foreground">
                No call metrics were stored for this session.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <KeyValueSection title="Call metrics" data={m || {}} />
            <KeyValueSection title="Model usage" data={u || {}} />
            <KeyValueSection title="Latency" data={l || {}} />
        </div>
    )
}

/** Parsed transcript messages as chat bubbles */
export function VoiceTranscriptThread({ detail }) {
    const t = detail?.transcript
    if (!t) {
        return <p className="text-sm text-muted-foreground">No transcript attached.</p>
    }
    const msgs = Array.isArray(t.messages) ? t.messages : []
    const visible = msgs.filter((m) => m.role !== 'system')
    if (visible.length === 0 && t.full_text) {
        return (
            <div className="rounded-2xl border border-border/60 bg-muted/15 p-4 text-sm leading-relaxed text-foreground">
                {t.full_text}
            </div>
        )
    }
    if (visible.length === 0) {
        return <p className="text-sm text-muted-foreground">No conversation turns in this payload.</p>
    }

    return (
        <div className="space-y-3">
            {visible.map((m, i) => {
                const isUser = m.role === 'user'
                return (
                    <div
                        key={i}
                        className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                    >
                        <div
                            className={cn(
                                'max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
                                isUser
                                    ? 'rounded-br-md bg-primary text-primary-foreground'
                                    : 'rounded-bl-md border border-border/60 bg-card text-foreground'
                            )}
                        >
                            <span className="mb-1 block text-[10px] font-semibold uppercase opacity-70">
                                {m.role === 'user' ? 'Caller' : m.role === 'assistant' ? 'Assistant' : m.role}
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content || '—'}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
