/**
 * Backend base URL for the SwasthyaAI FastAPI app (default: local uvicorn).
 * Set in `.env`: VITE_SWASTHYA_API_URL=http://localhost:8000
 */
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_SWASTHYA_API_URL ||
  viteEnv?.VITE_SWASTHYA_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '')
