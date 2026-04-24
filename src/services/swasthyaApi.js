import { API_BASE_URL } from '../config/env'

async function parseJsonResponse(res) {
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const detail = data?.detail ?? data?.message ?? res.statusText
    const err = new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    )
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}

export async function apiHealth() {
  const res = await fetch(`${API_BASE_URL}/`)
  return parseJsonResponse(res)
}

/** Single-agent chat (not the full supervisor). */
export async function listClinicalAgents() {
  const res = await fetch(`${API_BASE_URL}/clinical_agents`)
  return parseJsonResponse(res)
}

export async function agentChat({
  agent_id,
  message,
  history = [],
  llm_provider = 'openai',
}) {
  const res = await fetch(`${API_BASE_URL}/agent_chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id,
      message,
      history,
      llm_provider,
    }),
  })
  return parseJsonResponse(res)
}

export async function analyzeTranscript({
  userid,
  transcript,
  location,
  llm_provider = 'openai',
}) {
  const res = await fetch(`${API_BASE_URL}/analyze_transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userid,
      transcript,
      location: location || null,
      llm_provider,
    }),
  })
  return parseJsonResponse(res)
}

export async function uploadPdf(file, source = 'uploaded_pdf') {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('source', source)
  const res = await fetch(`${API_BASE_URL}/upload_pdf`, {
    method: 'POST',
    body: fd,
  })
  return parseJsonResponse(res)
}

export async function getVoiceCalls() {
  const res = await fetch(`${API_BASE_URL}/voice/calls`)
  return parseJsonResponse(res)
}

export async function listWebhookEvents(limit = 50) {
  const res = await fetch(
    `${API_BASE_URL}/webhook-receiver/webhook/events?limit=${limit}`
  )
  return parseJsonResponse(res)
}

export async function getWebhookEventByCallId(callId) {
  const enc = encodeURIComponent(callId)
  const res = await fetch(
    `${API_BASE_URL}/webhook-receiver/webhook/events/${enc}`
  )
  return parseJsonResponse(res)
}

/** Load exact saved JSON by filename (basename only). */
export async function getWebhookEventByFile(filename) {
  const enc = encodeURIComponent(filename)
  const res = await fetch(
    `${API_BASE_URL}/webhook-receiver/webhook/events/by-file/${enc}`
  )
  return parseJsonResponse(res)
}

export async function searchRag(query, top_k = 5) {
  const q = encodeURIComponent(query)
  const res = await fetch(
    `${API_BASE_URL}/voice/rag/search?query=${q}&top_k=${top_k}`
  )
  return parseJsonResponse(res)
}

/** LanceDB RAG (same index as /upload_pdf and /rag/ingest_text). */
export async function listRagSources() {
  const res = await fetch(`${API_BASE_URL}/rag/sources`)
  return parseJsonResponse(res)
}

export async function searchLanceRag(query, { top_k = 5, source = null } = {}) {
  const params = new URLSearchParams({
    query,
    top_k: String(top_k),
  })
  if (source && String(source).trim()) {
    params.set('source', String(source).trim())
  }
  const res = await fetch(`${API_BASE_URL}/rag/search?${params.toString()}`)
  return parseJsonResponse(res)
}

export async function ragIngestText({
  text,
  source = 'pasted_doc',
  chunk_size = null,
  overlap = null,
}) {
  const res = await fetch(`${API_BASE_URL}/rag/ingest_text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      source,
      chunk_size,
      overlap,
    }),
  })
  return parseJsonResponse(res)
}

export async function addRagText(text, source) {
  const params = new URLSearchParams({
    text,
    source,
  })
  const res = await fetch(
    `${API_BASE_URL}/voice/rag/add-text?${params.toString()}`,
    { method: 'POST' }
  )
  return parseJsonResponse(res)
}

export async function uploadRagPdf(file, metadata = null) {
  const fd = new FormData()
  fd.append('file', file)
  if (metadata) {
    fd.append('metadata', JSON.stringify(metadata))
  }
  const res = await fetch(`${API_BASE_URL}/voice/rag/upload-pdf`, {
    method: 'POST',
    body: fd,
  })
  return parseJsonResponse(res)
}

/** Exotel REST outbound — requires server-side Exotel credentials. */
export async function exotelOutbound(body) {
  const res = await fetch(`${API_BASE_URL}/voice/exotel/outbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

/** Simulated inbound metadata (for testing integrations). */
export async function exotelInbound(body) {
  const res = await fetch(`${API_BASE_URL}/voice/exotel/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function exotelListNumbers() {
  const res = await fetch(`${API_BASE_URL}/voice/exotel/phone-numbers`)
  return parseJsonResponse(res)
}

/** Vobiz — requires provider credentials on the server. */
export async function vobizOutbound(body) {
  const res = await fetch(`${API_BASE_URL}/vobiz/outbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function vobizListNumbers() {
  const res = await fetch(`${API_BASE_URL}/vobiz/phone-numbers`)
  return parseJsonResponse(res)
}

// ── Telnyx ────────────────────────────────────────────────────────

export async function telnyxSearchNumbers(params = {}) {
  const res = await fetch(`${API_BASE_URL}/telnyx/phone-numbers/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return parseJsonResponse(res)
}

export async function telnyxOrderNumber(phone_number) {
  const res = await fetch(`${API_BASE_URL}/telnyx/phone-numbers/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number }),
  })
  return parseJsonResponse(res)
}

export async function telnyxListNumbers() {
  const res = await fetch(`${API_BASE_URL}/telnyx/phone-numbers`)
  return parseJsonResponse(res)
}

export async function telnyxOutbound(body) {
  const res = await fetch(`${API_BASE_URL}/telnyx/outbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function telnyxListCalls() {
  const res = await fetch(`${API_BASE_URL}/telnyx/calls`)
  return parseJsonResponse(res)
}

// ── Report Delivery Callback ────────────────────────────────────────

/** Call the user back to deliver their clinical report */
export async function telnyxReportCallback({ to, call_id, from_number, llm_provider = 'openai', user_id }) {
  const res = await fetch(`${API_BASE_URL}/telnyx/report-callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, call_id, from_number, llm_provider, user_id }),
  })
  return parseJsonResponse(res)
}

// ── Web Call (browser-based, no telephony) ──────────────────────────

/** Start a web call session — returns stream_id and ws_url */
export async function startWebCall({ llm_provider = 'openai', user_id = null } = {}) {
  const params = new URLSearchParams({ llm_provider })
  if (user_id) params.set('user_id', user_id)
  const res = await fetch(`${API_BASE_URL}/web/start?${params.toString()}`, {
    method: 'POST',
  })
  return parseJsonResponse(res)
}

/** Get the full WebSocket URL for a web call */
export function getWebCallWsUrl(streamId, llmProvider = 'openai') {
  const base = API_BASE_URL.replace(/^http/, 'ws')
  return `${base}/ws/web/${streamId}?llm_provider=${llmProvider}`
}

// ── Dashboard Analytics ──────────────────────────────────────────────

/** KPI stats: today calls, success rate, trends */
export async function getDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard`)
  return parseJsonResponse(res)
}

/** Daily call volume by channel for bar chart */
export async function getCallVolume(days = 7) {
  const res = await fetch(`${API_BASE_URL}/analytics/call-volume?days=${days}`)
  return parseJsonResponse(res)
}

/** Triage outcome distribution for pie chart */
export async function getTriageOutcomes() {
  const res = await fetch(`${API_BASE_URL}/analytics/triage-outcomes`)
  return parseJsonResponse(res)
}

/** Pipeline completion stats for gauge chart */
export async function getPipelineStats() {
  const res = await fetch(`${API_BASE_URL}/analytics/pipeline-stats`)
  return parseJsonResponse(res)
}

// ── Paginated Call History ───────────────────────────────────────────

export async function getCallsHistory({ page = 1, limit = 20, direction, provider, status } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (direction) params.set('direction', direction)
  if (provider) params.set('provider', provider)
  if (status) params.set('status', status)
  const res = await fetch(`${API_BASE_URL}/calls/history?${params.toString()}`)
  return parseJsonResponse(res)
}

// ── Report Approvals ────────────────────────────────────────────────

/** List approved reports for a user */
export async function listApprovals(userId) {
  const res = await fetch(`${API_BASE_URL}/reports/approvals?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse(res)
}

/** Approve a clinical report */
export async function approveReport({ call_id, user_id, notes = null }) {
  const res = await fetch(`${API_BASE_URL}/reports/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call_id, user_id, notes }),
  })
  return parseJsonResponse(res)
}

/** Revoke approval */
export async function revokeApproval({ call_id, user_id }) {
  const res = await fetch(`${API_BASE_URL}/reports/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call_id, user_id }),
  })
  return parseJsonResponse(res)
}

// ── Agent Config ────────────────────────────────────────────────────

/** Load saved agent config */
export async function getAgentConfig(userId) {
  const res = await fetch(`${API_BASE_URL}/agent-config?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse(res)
}

/** Save agent config */
export async function saveAgentConfig({ user_id, name = 'Default', config }) {
  const res = await fetch(`${API_BASE_URL}/agent-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, name, config }),
  })
  return parseJsonResponse(res)
}

// ── User Preferences ────────────────────────────────────────────────

/** Load user preferences */
export async function getUserPreferences(userId) {
  const res = await fetch(`${API_BASE_URL}/user-preferences?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse(res)
}

/** Save user preferences */
export async function saveUserPreferences({ user_id, preferences }) {
  const res = await fetch(`${API_BASE_URL}/user-preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, preferences }),
  })
  return parseJsonResponse(res)
}

// ── Phone Registry ──────────────────────────────────────────────────

/** List manual phone numbers */
export async function listPhoneRegistry(userId) {
  const res = await fetch(`${API_BASE_URL}/phone-registry?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse(res)
}

/** Add phone number to registry */
export async function addPhoneEntry({ user_id, phone_number, provider = 'manual', label, is_default = false }) {
  const res = await fetch(`${API_BASE_URL}/phone-registry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, phone_number, provider, label, is_default }),
  })
  return parseJsonResponse(res)
}

/** Delete phone number from registry */
export async function deletePhoneEntry({ entry_id, user_id }) {
  const res = await fetch(`${API_BASE_URL}/phone-registry/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry_id, user_id }),
  })
  return parseJsonResponse(res)
}
