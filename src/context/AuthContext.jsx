'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
const AUTH_TIMEOUT_MS = 12000

const notConfiguredError = () =>
  new Error(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a file named .env in the project root (see .env.example), then restart the dev server.'
  )

const withTimeout = (promise, ms = AUTH_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      window.setTimeout(() => reject(new Error('Supabase request timed out')), ms)
    ),
  ])

function normalizeAuthError(error, actionLabel) {
  const message = error?.message || ''
  const networkLike =
    /Failed to fetch|NetworkError|Load failed|timed out|timeout|fetch/i.test(message) ||
    error?.name === 'AbortError'
  if (networkLike) {
    const err = new Error(
      `Unable to reach Supabase during ${actionLabel}. Check internet/VPN/firewall and try again.`
    )
    err.status = 503
    err.code = 'SUPABASE_UNREACHABLE'
    return err
  }
  return error
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const loadProfile = useCallback(async (userId) => {
    if (!userId || !supabase) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.warn('[auth] profile load:', error.message)
      setProfile(null)
      return
    }
    setProfile(data)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      setProfile(null)
      setInitialized(true)
      return undefined
    }

    let cancelled = false

    withTimeout(supabase.auth.getSession(), 8000)
      .then(({ data: { session: s } }) => {
        if (cancelled) return
        setSession(s)
        if (s?.user?.id) {
          loadProfile(s.user.id)
        } else {
          setProfile(null)
        }
      })
      .catch((err) => {
        console.warn('[auth] getSession fallback:', err?.message || err)
        if (cancelled) return
        setSession(null)
        setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setInitialized(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user?.id) {
        loadProfile(s.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw notConfiguredError()
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      )
      if (error) throw error
      return data
    } catch (error) {
      throw normalizeAuthError(error, 'sign in')
    }
  }, [])

  const signUp = useCallback(async ({ email, password, fullName, phone }) => {
    if (!supabase) throw notConfiguredError()
    const emailRedirectTo = (
      process.env.NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_TO ||
      viteEnv?.VITE_SUPABASE_EMAIL_REDIRECT_TO ||
      ''
    ).trim()
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            ...(emailRedirectTo ? { emailRedirectTo } : {}),
            data: {
              full_name: fullName,
              phone: phone || '',
            },
          },
        })
      )
      if (error) throw error
      return data
    } catch (error) {
      throw normalizeAuthError(error, 'sign up')
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw notConfiguredError()
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      initialized,
      supabaseReady: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
    }),
    [session, profile, initialized, signIn, signUp, signOut, signInWithGoogle]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
