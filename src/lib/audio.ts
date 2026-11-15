/** Funciones PURAS de audio: validación de fuentes y saneado del estado persistido. Sin React, sin Zustand, sin DOM. */

export type AudioProblem = 'blocked' | 'source' | 'unavailable' | 'network'
export type AudioUrlError = 'empty' | 'invalid' | 'protocol' | 'unsupported'

export type ParsedSource =
  | { ok: true; kind: 'youtube'; id: string; url: string }
  | { ok: true; kind: 'direct'; url: string }
  | { ok: false; reason: AudioUrlError }

const ID = /^[\w-]{11}$/
const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])

/** Id de vídeo de una URL de YouTube (watch?v=, youtu.be/, embed/, live/, shorts/); `null` si no es YouTube o no apunta a un vídeo. */
export function youtubeId(u: URL): string | null {
  const host = u.hostname.toLowerCase()
  if (host === 'youtu.be' || host === 'www.youtu.be') { const id = u.pathname.split('/')[1] ?? ''; return ID.test(id) ? id : null }
  if (!YT_HOSTS.has(host)) return null
  const v = u.searchParams.get('v')
  if (v && ID.test(v)) return v
  const m = u.pathname.match(/^\/(?:embed|live|shorts|v)\/([\w-]{11})(?:[/?]|$)/)
  return m ? m[1] : null
}
const isYouTubeHost = (u: URL) => YT_HOSTS.has(u.hostname.toLowerCase()) || /^(www\.)?youtu\.be$/i.test(u.hostname)

/**
 * Valida lo que escribe el usuario. Solo http(s). Una URL válida NO garantiza que haya audio reproducible:
 * eso solo se sabe al intentar reproducirla.
 */
export function parseAudioSource(input: string): ParsedSource {
  const text = typeof input === 'string' ? input.trim() : ''
  if (!text) return { ok: false, reason: 'empty' }
  let u: URL | null = null
  try { u = new URL(text) } catch { /* puede ser un enlace sin esquema: «youtube.com/watch?v=…» */ }
  if (!u && !/\s/.test(text) && /^[\w-]+(\.[\w-]+)+([/?#:]|$)/.test(text)) { try { u = new URL(`https://${text}`) } catch { u = null } }
  if (!u) return { ok: false, reason: 'invalid' }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, reason: 'protocol' }
  if (!u.hostname) return { ok: false, reason: 'invalid' }
  const href = u.toString()
  const id = youtubeId(u)
  if (id) return { ok: true, kind: 'youtube', id, url: href }
  if (isYouTubeHost(u)) return { ok: false, reason: 'unsupported' } // lista, canal… sin vídeo concreto
  return { ok: true, kind: 'direct', url: href }
}

/* ───────── Estado persistido (clave `tempora-audio`, sin versión: el esquema no cambia) ───────── */
export interface PersistedAudio { preset: string; url: string; volume: number }
export const DEFAULT_VOLUME = 60

export const clampVolume = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : DEFAULT_VOLUME

/**
 * Convierte CUALQUIER valor recuperado en fuente + volumen válidos. Nunca lanza.
 * Un preset conocido recupera su URL oficial; una fuente personalizada debe seguir pasando la validación.
 */
export function sanitizeAudio(raw: unknown, presets: readonly { id: string; url: string }[]): PersistedAudio {
  const r = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const volume = clampVolume(r.volume)
  const preset = presets.find((p) => p.id === r.preset)
  if (preset) return { preset: preset.id, url: preset.url, volume }
  if (r.preset === 'custom' && typeof r.url === 'string') {
    const p = parseAudioSource(r.url)
    if (p.ok) return { preset: 'custom', url: p.url, volume }
  }
  return { preset: presets[0].id, url: presets[0].url, volume }
}
