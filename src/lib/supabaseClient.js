import { createClient } from '@supabase/supabase-js'

const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || viteEnv?.VITE_SUPABASE_URL || '').trim()
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  viteEnv?.VITE_SUPABASE_ANON_KEY ||
  ''
).trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[SwasthyaAI] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env, fill in values from Supabase → Project Settings → API, then restart `pnpm dev`.'
  )
}

/** Null when env is missing — AuthContext handles this without throwing. */
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
