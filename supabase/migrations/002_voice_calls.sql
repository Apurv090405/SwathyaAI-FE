-- Voice call history + post-call orchestrator output per authenticated user.
-- Backend inserts/updates with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Dashboard reads with the user's JWT (anon key + RLS).

create table if not exists public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'telnyx',
  call_id text not null,
  stream_id text,
  direction text,
  from_number text,
  to_number text,
  transcript_full text,
  transcript_messages jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  usage_metrics jsonb not null default '{}'::jsonb,
  latency_metrics jsonb not null default '{}'::jsonb,
  clinical_report jsonb,
  clinical_saved_path text,
  orchestrator_status text not null default 'pending',
  orchestrator_error text,
  orchestrator_completed_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, call_id)
);

create index if not exists voice_calls_user_id_created_at_idx
  on public.voice_calls (user_id, created_at desc);

comment on table public.voice_calls is 'PSTN/voice sessions and supervisor clinical_report per user.';

alter table public.voice_calls enable row level security;

drop policy if exists "voice_calls_select_own" on public.voice_calls;
create policy "voice_calls_select_own"
  on public.voice_calls for select
  using (auth.uid() = user_id);

-- Optional: allow authenticated users to insert their own rows from the client (not required if only API writes)
drop policy if exists "voice_calls_insert_own" on public.voice_calls;
create policy "voice_calls_insert_own"
  on public.voice_calls for insert
  with check (auth.uid() = user_id);

drop policy if exists "voice_calls_update_own" on public.voice_calls;
create policy "voice_calls_update_own"
  on public.voice_calls for update
  using (auth.uid() = user_id);
