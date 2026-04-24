import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Globe, Play, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { getUserPreferences, saveUserPreferences } from '@/services/swasthyaApi'

const LANG_PREF_KEY = 'swasthya-dashboard-ui-language'
const VOICE_PREF_KEY = 'swasthya-dashboard-ui-voice-uri'

/** Sarvam AI supported languages for STT (saarika:v2.5) and TTS (bulbul:v2). */
const AVAILABLE_LANGUAGES = [
    { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी', note: 'Default SwasthyaAI voice locale' },
    { code: 'en-IN', label: 'English (India)', native: 'English', note: 'Clinical + mixed codeswitch' },
    { code: 'bn-IN', label: 'Bengali', native: 'বাংলা', note: 'Sarvam STT + TTS supported' },
    { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી', note: 'Sarvam STT + TTS supported' },
    { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ', note: 'Sarvam STT + TTS supported' },
    { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം', note: 'Sarvam STT + TTS supported' },
    { code: 'mr-IN', label: 'Marathi', native: 'मराठी', note: 'Sarvam STT + TTS supported' },
    { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்', note: 'Sarvam STT + TTS supported' },
    { code: 'te-IN', label: 'Telugu', native: 'తెలుగు', note: 'Sarvam STT + TTS supported' },
    { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', note: 'Sarvam STT + TTS supported' },
    { code: 'od-IN', label: 'Odia', native: 'ଓଡ଼ିଆ', note: 'Sarvam STT + TTS supported' },
    { code: 'as-IN', label: 'Assamese', native: 'অসমীয়া', note: 'Sarvam STT + TTS supported' },
]

/**
 * Recommended voice per language — all Sarvam voices work for all languages,
 * but these are curated for best quality per language.
 * Each entry has samples in the native language for browser preview.
 */
const VOICES_PER_LANGUAGE = [
    {
        lang: 'hi-IN', langLabel: 'Hindi', native: 'हिन्दी',
        voices: [
            { id: 'anushka', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'नमस्ते, मैं SwasthyaAI से बोल रही हूँ। क्या यह बात करने का सही समय है?' },
            { id: 'shubh', engine: 'Bulbul v3', gender: 'Male', recommended: true, style: 'Conversational / Friendly', sample: 'नमस्ते, मैं SwasthyaAI से बोल रहा हूँ। आपकी कैसे मदद कर सकता हूँ?' },
            { id: 'abhilash', engine: 'Bulbul v2', gender: 'Male', sample: 'नमस्ते, अभिलाष बोल रहा हूँ। आपकी सेवा में हाज़िर हूँ।' },
        ],
    },
    {
        lang: 'en-IN', langLabel: 'English', native: 'English',
        voices: [
            { id: 'vidya', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'Hello, this is SwasthyaAI. How may I help you with your health query today?' },
            { id: 'shreya', engine: 'Bulbul v3', gender: 'Female', recommended: true, style: 'News / Authoritative', sample: 'Hello, I am Shreya from SwasthyaAI. How can I assist you today?' },
            { id: 'manan', engine: 'Bulbul v3', gender: 'Male', style: 'Conversational / Consistent', sample: 'Hi there, this is Manan from SwasthyaAI. What can I help you with?' },
        ],
    },
    {
        lang: 'bn-IN', langLabel: 'Bengali', native: 'বাংলা',
        voices: [
            { id: 'manisha', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'নমস্কার, আমি SwasthyaAI থেকে বলছি। আপনাকে কিভাবে সাহায্য করতে পারি?' },
            { id: 'ritu', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'নমস্কার, আমি রিতু। আপনার স্বাস্থ্য সম্পর্কে কিছু জানতে চান?' },
        ],
    },
    {
        lang: 'ta-IN', langLabel: 'Tamil', native: 'தமிழ்',
        voices: [
            { id: 'arya', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'வணக்கம், நான் SwasthyaAI-இலிருந்து பேசுகிறேன். உங்களுக்கு எப்படி உதவ முடியும்?' },
            { id: 'simran', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'வணக்கம், நான் சிம்ரன். உங்கள் உடல்நலம் பற்றி பேசலாமா?' },
        ],
    },
    {
        lang: 'te-IN', langLabel: 'Telugu', native: 'తెలుగు',
        voices: [
            { id: 'anushka', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'నమస్కారం, నేను SwasthyaAI నుండి మాట్లాడుతున్నాను. మీకు ఎలా సహాయం చేయగలను?' },
            { id: 'pooja', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'నమస్కారం, నేను పూజ. మీ ఆరోగ్యం గురించి మాట్లాడదామా?' },
        ],
    },
    {
        lang: 'mr-IN', langLabel: 'Marathi', native: 'मराठी',
        voices: [
            { id: 'manisha', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'नमस्कार, मी SwasthyaAI वरून बोलत आहे. मी तुम्हाला कशी मदत करू शकते?' },
            { id: 'neha', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'नमस्कार, मी नेहा. तुमच्या आरोग्याबद्दल बोलूया का?' },
        ],
    },
    {
        lang: 'gu-IN', langLabel: 'Gujarati', native: 'ગુજરાતી',
        voices: [
            { id: 'arya', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'નમસ્તે, હું SwasthyaAI તરફથી બોલી રહી છું. હું તમને કેવી રીતે મદદ કરી શકું?' },
            { id: 'kavya', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'નમસ્તે, હું કાવ્યા. તમારા સ્વાસ્થ્ય વિશે વાત કરીએ?' },
        ],
    },
    {
        lang: 'kn-IN', langLabel: 'Kannada', native: 'ಕನ್ನಡ',
        voices: [
            { id: 'anushka', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'ನಮಸ್ಕಾರ, ನಾನು SwasthyaAI ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' },
            { id: 'priya', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'ನಮಸ್ಕಾರ, ನಾನು ಪ್ರಿಯಾ. ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಮಾತನಾಡೋಣವೇ?' },
        ],
    },
    {
        lang: 'ml-IN', langLabel: 'Malayalam', native: 'മലയാളം',
        voices: [
            { id: 'vidya', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'നമസ്കാരം, ഞാൻ SwasthyaAI-ൽ നിന്ന് സംസാരിക്കുന്നു. നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?' },
            { id: 'ishita', engine: 'Bulbul v3', gender: 'Female', recommended: true, style: 'Entertainment / Dynamic', sample: 'നമസ്കാരം, ഞാൻ ഇഷിത. നിങ്ങളുടെ ആരോഗ്യത്തെ കുറിച്ച് സംസാരിക്കാമോ?' },
        ],
    },
    {
        lang: 'pa-IN', langLabel: 'Punjabi', native: 'ਪੰਜਾਬੀ',
        voices: [
            { id: 'karun', engine: 'Bulbul v2', gender: 'Male', recommended: true, sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ SwasthyaAI ਤੋਂ ਬੋਲ ਰਿਹਾ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?' },
            { id: 'manan', engine: 'Bulbul v3', gender: 'Male', recommended: true, style: 'Conversational', sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਮਨਨ ਹਾਂ। ਤੁਹਾਡੀ ਸਿਹਤ ਬਾਰੇ ਗੱਲ ਕਰੀਏ?' },
        ],
    },
    {
        lang: 'od-IN', langLabel: 'Odia', native: 'ଓଡ଼ିଆ',
        voices: [
            { id: 'manisha', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'ନମସ୍କାର, ମୁଁ SwasthyaAI ରୁ କହୁଛି। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?' },
            { id: 'roopa', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'ନମସ୍କାର, ମୁଁ ରୂପା। ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ କଥା ହେବା?' },
        ],
    },
    {
        lang: 'as-IN', langLabel: 'Assamese', native: 'অসমীয়া',
        voices: [
            { id: 'vidya', engine: 'Bulbul v2', gender: 'Female', recommended: true, sample: 'নমস্কাৰ, মই SwasthyaAI ৰ পৰা কৈ আছোঁ। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?' },
            { id: 'ritu', engine: 'Bulbul v3', gender: 'Female', recommended: true, sample: 'নমস্কাৰ, মই ৰিতু। আপোনাৰ স্বাস্থ্যৰ বিষয়ে কথা পাতোঁ আহক?' },
        ],
    },
]

function loadPref(key, fallback) {
    try {
        return localStorage.getItem(key) || fallback
    } catch {
        return fallback
    }
}

export default function LanguagesVoicesPanel() {
    const { user } = useAuth()
    const userId = user?.id || user?.email || ''
    const [tab, setTab] = useState('languages')
    const [selectedLang, setSelectedLang] = useState(() => loadPref(LANG_PREF_KEY, 'hi-IN'))
    const [browserVoices, setBrowserVoices] = useState([])
    const [pickedVoiceUri, setPickedVoiceUri] = useState(() => loadPref(VOICE_PREF_KEY, ''))

    // Load preferences from backend on mount
    useEffect(() => {
        if (!userId) return
        let cancelled = false
        getUserPreferences(userId)
            .then((res) => {
                if (cancelled || !res?.preferences) return
                const p = res.preferences
                if (p.language) {
                    setSelectedLang(p.language)
                    try { localStorage.setItem(LANG_PREF_KEY, p.language) } catch {}
                }
                if (p.voice_uri) {
                    setPickedVoiceUri(p.voice_uri)
                    try { localStorage.setItem(VOICE_PREF_KEY, p.voice_uri) } catch {}
                }
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [userId])

    const refreshVoices = useCallback(() => {
        const synth = window.speechSynthesis
        if (!synth) return
        setBrowserVoices(synth.getVoices() || [])
    }, [])

    useEffect(() => {
        refreshVoices()
        const synth = window.speechSynthesis
        if (synth && synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = refreshVoices
        }
        return () => {
            if (synth) synth.onvoiceschanged = null
        }
    }, [refreshVoices])

    const syncPrefs = useCallback((lang, voiceUri) => {
        if (!userId) return
        saveUserPreferences({
            user_id: userId,
            preferences: { language: lang, voice_uri: voiceUri },
        }).catch(() => {})
    }, [userId])

    const pickLanguage = (code) => {
        setSelectedLang(code)
        try { localStorage.setItem(LANG_PREF_KEY, code) } catch {}
        syncPrefs(code, pickedVoiceUri)
    }

    const pickBrowserVoice = (v) => {
        const uri = `${v.voiceURI}::${v.lang}`
        setPickedVoiceUri(uri)
        try { localStorage.setItem(VOICE_PREF_KEY, uri) } catch {}
        syncPrefs(selectedLang, uri)
    }

    const speak = (text, lang, voice) => {
        const synth = window.speechSynthesis
        if (!synth) return
        synth.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.lang = lang || 'hi-IN'
        if (voice) {
            u.voice = voice
        }
        synth.speak(u)
    }

    const sortedBrowserVoices = useMemo(() => {
        return [...browserVoices].sort((a, b) => (a.localService === b.localService ? 0 : a.localService ? -1 : 1))
    }, [browserVoices])

    return (
        <div className="languages-voices-panel space-y-5">
            <div className="flex gap-1 border-b border-border/60 pb-px">
                {[
                    { id: 'languages', label: 'Languages' },
                    { id: 'voices', label: 'Voices' },
                ].map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                            tab === t.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'languages' ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {AVAILABLE_LANGUAGES.map((L) => (
                        <Card
                            key={L.code}
                            className={cn(
                                'rounded-2xl border-border/70 transition-colors',
                                selectedLang === L.code && 'border-primary ring-1 ring-primary/30'
                            )}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-base">{L.label}</CardTitle>
                                        <p className="text-lg font-medium text-foreground/90">{L.native}</p>
                                    </div>
                                    <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
                                </div>
                                <CardDescription>{L.note}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={selectedLang === L.code ? 'default' : 'outline'}
                                    className="rounded-full"
                                    onClick={() => pickLanguage(L.code)}
                                >
                                    {selectedLang === L.code ? (
                                        <>
                                            <Check className="mr-1 h-3.5 w-3.5" />
                                            Selected
                                        </>
                                    ) : (
                                        'Use locale'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-full"
                                    onClick={() =>
                                        speak(`This is a sample in ${L.label}.`, L.code)
                                    }
                                >
                                    <Play className="mr-1 h-3.5 w-3.5" />
                                    Preview
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Browser voices (Web Speech)</h3>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            {sortedBrowserVoices.length
                                ? `${sortedBrowserVoices.length} voices reported by your browser. Pick one for previews.`
                                : 'No voices yet — try Chrome / Edge, or wait a moment and refresh.'}
                        </p>
                        <div className="grid max-h-[min(55vh,480px)] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                            {sortedBrowserVoices.map((v) => {
                                const uri = `${v.voiceURI}::${v.lang}`
                                const picked = pickedVoiceUri === uri
                                return (
                                    <Card
                                        key={uri}
                                        className={cn(
                                            'rounded-2xl border-border/70',
                                            picked && 'border-primary ring-1 ring-primary/25'
                                        )}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm leading-tight">{v.name}</CardTitle>
                                            <CardDescription className="font-mono text-[11px]">
                                                {v.lang}
                                                {v.localService ? ' · local' : ''}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                className="rounded-full"
                                                onClick={() =>
                                                    speak(
                                                        'SwasthyaAI voice preview. क्या मैं आपकी मदद कर सकती हूँ?',
                                                        v.lang,
                                                        v
                                                    )
                                                }
                                            >
                                                <Play className="mr-1 h-3.5 w-3.5" />
                                                Preview
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={picked ? 'default' : 'outline'}
                                                className="rounded-full"
                                                onClick={() => pickBrowserVoice(v)}
                                            >
                                                {picked ? 'Default' : 'Set default'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Recommended voices per language</h3>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            All Sarvam voices work for all 11 languages. These are curated recommendations
                            for the most natural sound per language. Preview uses your browser's speech engine.
                        </p>
                        <div className="space-y-6">
                            {VOICES_PER_LANGUAGE.map((langGroup) => (
                                <div key={langGroup.lang}>
                                    <div className="mb-2 flex items-baseline gap-2">
                                        <h4 className="text-sm font-semibold text-foreground">{langGroup.langLabel}</h4>
                                        <span className="text-lg text-foreground/80">{langGroup.native}</span>
                                        <span className="font-mono text-[10px] text-muted-foreground">{langGroup.lang}</span>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {langGroup.voices.map((vc) => (
                                            <Card
                                                key={`${langGroup.lang}-${vc.id}`}
                                                className={cn(
                                                    'rounded-2xl border-border/70',
                                                    vc.recommended && 'border-primary/50 bg-primary/[0.03]'
                                                )}
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                {vc.id.charAt(0).toUpperCase() + vc.id.slice(1)}
                                                                {vc.recommended ? (
                                                                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                                        <Check className="mr-0.5 h-3 w-3" />
                                                                        Recommended
                                                                    </span>
                                                                ) : null}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {vc.engine} · {vc.gender}
                                                                {vc.style ? ` · ${vc.style}` : ''}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                                                        {vc.sample}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        className="rounded-full"
                                                        onClick={() => {
                                                            const match =
                                                                sortedBrowserVoices.find((x) => x.lang === langGroup.lang) ||
                                                                sortedBrowserVoices[0]
                                                            speak(vc.sample, langGroup.lang, match || null)
                                                        }}
                                                    >
                                                        <Play className="mr-1 h-3.5 w-3.5" />
                                                        Preview
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                        <Label className="text-foreground">Stored preferences</Label>
                        <p className="mt-1 font-mono text-[11px]">
                            Language: {selectedLang} · Default voice URI: {pickedVoiceUri || '—'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
