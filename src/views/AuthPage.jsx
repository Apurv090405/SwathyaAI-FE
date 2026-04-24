import React, { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import {
    ArrowRight,
    Crosshair,
    Eye,
    EyeOff,
    Globe2,
    Lock,
    Mail,
    Phone,
    Smartphone,
    User,
} from 'lucide-react'
import { gsap } from '../utils/gsapConfig'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import '@/components/dashboard/dashboard.css'
import '../pages/AuthPage.css'

const AuthPage = ({ forcedMode = null, onRouteChange = null }) => {
    const { signIn, signUp, signInWithGoogle, supabaseReady } = useAuth()
    useTheme()
    const getInitialMode = () => {
        if (forcedMode === 'signup') return false
        if (forcedMode === 'signin') return true
        return window.location.hash === '#signup' ? false : true
    }
    const [isLogin, setIsLogin] = useState(getInitialMode)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [authError, setAuthError] = useState(null)
    const [authInfo, setAuthInfo] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState('Preparing authentication…')
    const [connectionState, setConnectionState] = useState('checking')
    const [checkVersion, setCheckVersion] = useState(0)
    const [signupCooldownUntil, setSignupCooldownUntil] = useState(0)
    const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0)
    const [lastAuthDebug, setLastAuthDebug] = useState(null)
    const [showDebugDetails, setShowDebugDetails] = useState(false)
    const containerRef = useRef(null)
    const formRef = useRef(null)

    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        const root = document.getElementById('root')
        const prevHtml = html.style.overflow
        const prevBody = body.style.overflow
        const prevRootOverflow = root?.style.overflow ?? ''
        const prevRootHeight = root?.style.height ?? ''
        const prevRootMaxH = root?.style.maxHeight ?? ''
        html.style.overflow = 'hidden'
        body.style.overflow = 'hidden'
        if (root) {
            root.style.overflow = 'hidden'
            root.style.height = '100dvh'
            root.style.maxHeight = '100dvh'
        }
        return () => {
            html.style.overflow = prevHtml
            body.style.overflow = prevBody
            if (root) {
                root.style.overflow = prevRootOverflow
                root.style.height = prevRootHeight
                root.style.maxHeight = prevRootMaxH
            }
        }
    }, [])

    useEffect(() => {
        if (forcedMode) return undefined
        const handleHashChange = () => {
            const signup = window.location.hash === '#signup'
            setIsLogin(!signup)
            setAuthError(null)
            if (signup) {
                setAuthInfo(null)
                setTermsAccepted(false)
            }
        }
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [forcedMode])

    useGSAP(() => {
        gsap.fromTo(
            '.auth-brand-panel .relative.z-10',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }
        )
        gsap.fromTo(formRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 })
    }, { scope: containerRef })

    useEffect(() => {
        let cancelled = false

        const withTimeout = (promise, ms = 5000) =>
            Promise.race([
                promise,
                new Promise((_, reject) =>
                    window.setTimeout(() => reject(new Error('Supabase check timed out')), ms)
                ),
            ])

        const runConnectionChecks = async () => {
            if (!supabaseReady || !supabase) {
                setConnectionState('missing')
                setConnectionStatus(
                    'Supabase env is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env, then restart.'
                )
                return
            }

            // Never block auth UX on health probes.
            setConnectionState('checking')
            setConnectionStatus('Auth ready. You can sign in/sign up.')

            try {
                const { error: sessionError } = await withTimeout(supabase.auth.getSession(), 5000)
                if (cancelled) return
                if (sessionError) {
                    setConnectionState('error')
                    setConnectionStatus(`Supabase auth check failed: ${sessionError.message}`)
                    return
                }

                const { error: profilesError } = await withTimeout(
                    supabase.from('profiles').select('id').limit(1),
                    5000
                )
                if (cancelled) return
                if (profilesError?.code === '42P01') {
                    setConnectionState('partial')
                    setConnectionStatus(
                        'Auth is working. Profiles table missing (run db migration when possible).'
                    )
                    return
                }
                if (profilesError) {
                    setConnectionState('partial')
                    setConnectionStatus(`Auth works, profiles check issue: ${profilesError.message}`)
                    return
                }

                setConnectionState('connected')
                setConnectionStatus('Supabase connection looks good. You can sign up/sign in.')
            } catch (err) {
                if (cancelled) return
                setConnectionState('timeout')
                setConnectionStatus(
                    `Auth ready. Optional health check skipped: ${err?.message || 'network timeout'}`
                )
            }
        }

        runConnectionChecks()
        return () => {
            cancelled = true
        }
    }, [supabaseReady, checkVersion])

    const connectionBadgeClass =
        connectionState === 'connected'
            ? 'auth-banner-success'
            : connectionState === 'timeout'
              ? 'auth-banner-warn'
              : connectionState === 'missing' || connectionState === 'error'
                ? 'auth-banner-error'
                : 'auth-banner-info'

    const connectionBadgeLabel =
        connectionState === 'connected'
            ? 'Connected'
            : connectionState === 'timeout'
              ? 'Timed out'
              : connectionState === 'missing'
                ? 'Config missing'
                : connectionState === 'error'
                  ? 'Connection issue'
                  : connectionState === 'partial'
                    ? 'Partial'
                    : 'Checking'

    useEffect(() => {
        if (!signupCooldownUntil) return undefined
        const tick = () => {
            const seconds = Math.max(0, Math.ceil((signupCooldownUntil - Date.now()) / 1000))
            setCooldownSecondsLeft(seconds)
            if (seconds === 0) setSignupCooldownUntil(0)
        }
        tick()
        const timer = window.setInterval(tick, 1000)
        return () => window.clearInterval(timer)
    }, [signupCooldownUntil])

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setAuthError(null)
        setAuthInfo(null)
        setLastAuthDebug(null)
        if (isLogin) {
            if (!formData.email.trim()) return setAuthError('Please enter your email.')
            if (!formData.password) return setAuthError('Please enter your password.')
        }
        if (!isLogin) {
            if (Date.now() < signupCooldownUntil) return setAuthError(`Too many attempts. Please wait ${cooldownSecondsLeft || 60}s before trying signup again.`)
            if (!formData.name.trim()) return setAuthError('Please enter your full name.')
            if (formData.password !== formData.confirmPassword) return setAuthError('Passwords do not match.')
            if (formData.password.length < 6) return setAuthError('Password must be at least 6 characters.')
            if (!termsAccepted) return setAuthError('Please accept the Terms of Service and Privacy Policy.')
            const digits = formData.phone.replace(/\D/g, '')
            if (digits && digits.length !== 10) return setAuthError('Phone must be exactly 10 digits (or leave it empty).')
        }
        setSubmitting(true)
        try {
            if (isLogin) {
                await signIn(formData.email.trim(), formData.password)
                if (onRouteChange) onRouteChange('dashboard')
                else window.location.hash = '#dashboard'
            } else {
                const digits = formData.phone.replace(/\D/g, '')
                const data = await signUp({
                    email: formData.email.trim(),
                    password: formData.password,
                    fullName: formData.name.trim(),
                    phone: digits ? `+91${digits}` : '',
                })
                if (data.session) {
                    if (onRouteChange) onRouteChange('dashboard')
                    else window.location.hash = '#dashboard'
                } else {
                    setAuthInfo('Account created. Check your email to confirm (if Supabase has “Confirm email” enabled), then sign in below.')
                    if (onRouteChange) onRouteChange('signin')
                    else window.location.hash = '#signin'
                    setIsLogin(true)
                }
            }
        } catch (err) {
            const status = Number(err?.status)
            const baseMsg = err?.message || err?.msg || (typeof err === 'string' ? err : null) || 'Something went wrong.'
            setLastAuthDebug({ mode: isLogin ? 'signin' : 'signup', status: Number.isFinite(status) && status > 0 ? status : null, code: err?.code || null, name: err?.name || null, message: baseMsg })
            const msg = status === 429 ? 'Too many auth attempts right now (Supabase rate limit). Wait 60-120 seconds and try again.' : status === 400 ? `Auth request rejected (400). ${baseMsg} Check Supabase Auth settings (Email provider enabled, valid redirect URL allowlist).` : baseMsg
            if (status === 429 && !isLogin) {
                setSignupCooldownUntil(Date.now() + 90 * 1000)
                setCooldownSecondsLeft(90)
            }
            setAuthError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogle = async () => {
        setAuthError(null)
        setAuthInfo(null)
        try {
            await signInWithGoogle()
        } catch (err) {
            setAuthError(err.message || 'Google sign-in failed. Enable Google in Supabase Auth providers.')
        }
    }

    const switchMode = (toSignup) => {
        gsap.to(formRef.current, {
            opacity: 0,
            x: toSignup ? -20 : 20,
            duration: 0.2,
            onComplete: () => {
                const route = toSignup ? 'signup' : 'signin'
                if (onRouteChange) onRouteChange(route)
                else window.location.hash = route
                gsap.fromTo(formRef.current, { opacity: 0, x: toSignup ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
            }
        })
    }

    return (
        <main className="dashboard-root auth-page-shell text-foreground" ref={containerRef}>
            <div className="auth-two-col flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
                    <div className="dashboard-hero auth-brand-panel relative flex w-full shrink-0 flex-col justify-center overflow-hidden border-b border-border/60 p-8 sm:p-10 lg:h-auto lg:min-h-0 lg:w-1/2 lg:max-w-none lg:basis-1/2 lg:border-b-0 lg:border-r lg:border-border/60 lg:px-10 xl:px-14">
                        <div className="relative z-10">
                            <div className="brand-logo mb-6">
                                <svg
                                    className="text-primary"
                                    width="56"
                                    height="56"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    aria-hidden
                                >
                                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" />
                                    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="20" cy="20" r="6" fill="currentColor" />
                                </svg>
                            </div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                SwasthyaAI
                            </p>
                            <h1 className="brand-title text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Voice health for Bharat
                            </h1>
                            <p className="brand-tagline mt-2 text-sm italic text-muted-foreground">
                                स्वस्थ भारत, सशक्त भारत
                            </p>
                            <p className="brand-description mt-4 text-sm leading-relaxed text-muted-foreground">
                                Same dashboard you use for operations — sign in to manage calling agents, clinical
                                reports, and approvals.
                            </p>
                            <div className="brand-features mt-6 hidden flex-col gap-2 sm:flex sm:flex-col">
                                <div className="feature-item">
                                    <Crosshair className="brand-feature-icon h-4 w-4 shrink-0 text-primary" aria-hidden />
                                    <span>AI-powered health triage</span>
                                </div>
                                <div className="feature-item">
                                    <Globe2 className="brand-feature-icon h-4 w-4 shrink-0 text-primary" aria-hidden />
                                    <span>12+ Indian languages</span>
                                </div>
                                <div className="feature-item">
                                    <Smartphone className="brand-feature-icon h-4 w-4 shrink-0 text-primary" aria-hidden />
                                    <span>Works on any phone</span>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-orb dashboard-orb-1 opacity-60" />
                        <div className="dashboard-orb dashboard-orb-2 opacity-50" />
                    </div>
                    <div
                        className="auth-form-section flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background px-5 py-6 sm:px-8 sm:py-8 lg:w-1/2 lg:basis-1/2 lg:px-10 lg:py-8 xl:px-14"
                        ref={formRef}
                    >
                        <div
                            className={cn(
                                'auth-card mx-auto flex w-full flex-col',
                                isLogin
                                    ? 'min-h-0 max-w-md flex-1 justify-center py-2 lg:py-4'
                                    : 'min-h-0 max-w-2xl flex-1 justify-center py-2 lg:max-w-none lg:px-2'
                            )}
                        >
                        <div className="auth-header shrink-0">
                            <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Join SwasthyaAI'}</h2>
                            <p className="auth-subtitle">{isLogin ? 'Sign in to access your health dashboard' : 'Create an account to start your health journey'}</p>
                            {!supabaseReady && <p className="auth-banner auth-banner-warn">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>, then restart <code>pnpm dev</code>.</p>}
                            <div className={`auth-banner ${connectionBadgeClass}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <span>
                                        <strong>{connectionBadgeLabel}:</strong> {connectionStatus}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => setCheckVersion((v) => v + 1)}
                                    >
                                        Retry check
                                    </Button>
                                </div>
                            </div>
                            {authError && <p className="auth-banner auth-banner-error">{authError}</p>}
                            {authInfo && <p className="auth-banner auth-banner-info">{authInfo}</p>}
                            {lastAuthDebug && <div className="auth-banner auth-banner-info"><Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={() => setShowDebugDetails((v) => !v)}>{showDebugDetails ? 'Hide debug details' : 'Show debug details'}</Button>{showDebugDetails && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastAuthDebug, null, 2)}</pre>}</div>}
                        </div>
                        <div className="auth-tabs shrink-0">
                            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => !isLogin && switchMode(false)}>Sign In</button>
                            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => isLogin && switchMode(true)}>Sign Up</button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className={cn(
                                'auth-form-outer flex flex-col overflow-visible',
                                isLogin ? 'auth-form-outer--signin' : 'auth-form-outer--signup'
                            )}
                            noValidate
                        >
                            {isLogin ? (
                                <div className="auth-form-fields auth-form-fields--signin">
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Email
                                        </label>
                                        <div className="input-wrapper">
                                            <span className="input-icon-slot">
                                                <Mail className="h-4 w-4" aria-hidden />
                                            </span>
                                            <Input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="you@example.com"
                                                className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <div className="input-wrapper">
                                            <span className="input-icon-slot">
                                                <Lock className="h-4 w-4" aria-hidden />
                                            </span>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="form-options">
                                        <label className="checkbox-label">
                                            <input type="checkbox" className="checkbox" />
                                            <span>Remember me</span>
                                        </label>
                                        <a href="#forgot" className="forgot-link">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="auth-form-fields auth-form-fields--signup">
                                    <div className="auth-signup-grid">
                                        <div className="form-group">
                                            <label htmlFor="name" className="form-label">
                                                Full name
                                            </label>
                                            <div className="input-wrapper">
                                                <span className="input-icon-slot">
                                                    <User className="h-4 w-4" aria-hidden />
                                                </span>
                                                <Input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Full name"
                                                    className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                    autoComplete="name"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email" className="form-label">
                                                Email
                                            </label>
                                            <div className="input-wrapper">
                                                <span className="input-icon-slot">
                                                    <Mail className="h-4 w-4" aria-hidden />
                                                </span>
                                                <Input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="you@example.com"
                                                    className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group auth-signup-span-2">
                                            <label htmlFor="phone" className="form-label">
                                                Phone <span className="optional-label">(optional)</span>
                                            </label>
                                            <div className="input-wrapper">
                                                <span className="input-icon-slot">
                                                    <Phone className="h-4 w-4" aria-hidden />
                                                </span>
                                                <div className="phone-input">
                                                    <span className="country-code">+91</span>
                                                    <Input
                                                        type="tel"
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="10-digit number"
                                                        className="form-input phone border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                        inputMode="numeric"
                                                        autoComplete="tel"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="form-label">
                                                Password
                                            </label>
                                            <div className="input-wrapper">
                                                <span className="input-icon-slot">
                                                    <Lock className="h-4 w-4" aria-hidden />
                                                </span>
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Min. 6 characters"
                                                    className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                    autoComplete="new-password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword" className="form-label">
                                                Confirm password
                                            </label>
                                            <div className="input-wrapper">
                                                <span className="input-icon-slot">
                                                    <Lock className="h-4 w-4" aria-hidden />
                                                </span>
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Repeat password"
                                                    className="form-input border-0 bg-transparent shadow-none focus-visible:ring-0"
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group auth-signup-span-2">
                                            <label className="checkbox-label text-left leading-snug">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                />
                                                <span>
                                                    I agree to the <a href="#terms">Terms</a> and{' '}
                                                    <a href="#privacy">Privacy Policy</a>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="auth-form-actions shrink-0 border-t border-border/40 pt-3">
                                <Button
                                    type="submit"
                                    className="auth-submit-btn group flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-md sm:text-base"
                                    disabled={submitting || !supabaseReady || (!isLogin && cooldownSecondsLeft > 0)}
                                >
                                    {submitting
                                        ? 'Please wait…'
                                        : !isLogin && cooldownSecondsLeft > 0
                                          ? `Retry in ${cooldownSecondsLeft}s`
                                          : isLogin
                                            ? 'Sign in'
                                            : 'Create account'}
                                    <ArrowRight
                                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
                                        aria-hidden
                                    />
                                </Button>
                            </div>
                        </form>
                        <div className="auth-divider shrink-0"><span>or continue with</span></div>
                        <div className="social-auth shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                className="social-btn google h-10 w-full gap-2 border-2 border-border/80 bg-background text-sm"
                                onClick={handleGoogle}
                                disabled={!supabaseReady}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="social-btn phone social-btn-disabled h-10 w-full gap-2 text-sm"
                                disabled
                                title="Use email sign-up for now"
                            >
                                <Phone className="h-4 w-4 opacity-60" aria-hidden />
                                Phone OTP
                            </Button>
                        </div>
                        <p className="auth-footer-text shrink-0">{isLogin ? "Don't have an account? " : 'Already have an account? '}<Button type="button" variant="link" className="switch-mode-btn h-auto p-0 text-primary" onClick={() => switchMode(isLogin)}>{isLogin ? 'Sign Up' : 'Sign In'}</Button></p>
                        </div>
                    </div>
            </div>
        </main>
    )
}

export default AuthPage
