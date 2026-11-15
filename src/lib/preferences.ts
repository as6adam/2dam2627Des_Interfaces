import type { Item, Kind, Mode, ThemeName } from '../store'

/* ───────── Preferencias ───────── */
export type Purpose = 'academic' | 'productivity'
export type Language = 'es' | 'en'

export const PURPOSES: readonly Purpose[] = ['academic', 'productivity']
export const LANGUAGES: readonly Language[] = ['es', 'en']
export const DEFAULT_LANGUAGE: Language = 'es'

export const isPurpose = (v: unknown): v is Purpose => typeof v === 'string' && (PURPOSES as readonly string[]).includes(v)
export const isLanguage = (v: unknown): v is Language => typeof v === 'string' && (LANGUAGES as readonly string[]).includes(v)

/* ───────── Estado persistido (clave `tempora-v1`) ───────── */
export const PERSIST_NAME = 'tempora-v1'
/** 0 = estado original (items, mode, theme, notifications). 1 = añade purpose y language. */
export const PERSIST_VERSION = 1

export interface PersistedApp {
  items: Item[]
  mode: Mode
  theme: ThemeName
  notifications: boolean
  purpose: Purpose | null
  language: Language
}

export const DEFAULT_PERSISTED: PersistedApp = {
  items: [],
  mode: 'light',
  theme: 'agate',
  notifications: true,
  purpose: null,
  language: DEFAULT_LANGUAGE,
}

const KINDS: readonly Kind[] = ['exam', 'assignment', 'study']
const MODES: readonly Mode[] = ['light', 'dark']
const THEMES: readonly ThemeName[] = ['ruby', 'agate', 'diamond', 'antimatter']

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Un item válido conserva TODOS sus campos (id, linkedTo, fechas, notas…); solo se normaliza `notes` ausente. */
function asItem(v: unknown): Item | null {
  if (!isRecord(v)) return null
  const { id, kind, subject, start, duration, notes, linkedTo } = v
  if (typeof id !== 'string' || !id) return null
  if (typeof kind !== 'string' || !(KINDS as readonly string[]).includes(kind)) return null
  if (typeof subject !== 'string' || typeof start !== 'string') return null
  if (typeof duration !== 'number' || !Number.isFinite(duration)) return null
  const item: Item = { id, kind: kind as Kind, subject, start, duration, notes: typeof notes === 'string' ? notes : '' }
  if (typeof linkedTo === 'string') item.linkedTo = linkedTo
  return item
}

/**
 * Convierte CUALQUIER valor recuperado en un estado completo y válido. Nunca lanza.
 * Lo que falta o es inválido recibe su valor inicial (purpose → null, language → 'es').
 */
export function sanitizePersisted(raw: unknown): PersistedApp {
  const r = isRecord(raw) ? raw : {}
  const d = DEFAULT_PERSISTED
  return {
    items: Array.isArray(r.items) ? r.items.map(asItem).filter((i): i is Item => i !== null) : d.items,
    mode: (MODES as readonly unknown[]).includes(r.mode) ? (r.mode as Mode) : d.mode,
    theme: (THEMES as readonly unknown[]).includes(r.theme) ? (r.theme as ThemeName) : d.theme,
    notifications: typeof r.notifications === 'boolean' ? r.notifications : d.notifications,
    purpose: isPurpose(r.purpose) ? r.purpose : null,
    language: isLanguage(r.language) ? r.language : DEFAULT_LANGUAGE,
  }
}

/**
 * Migraciones encadenadas por versión. Nunca lanza.
 *  v0 → v1: añade purpose (null: se pedirá al usuario) y language ('es'); el resto se conserva.
 */
export function migratePersisted(persisted: unknown, version: number): PersistedApp {
  let state: Record<string, unknown> = isRecord(persisted) ? { ...persisted } : {}
  if (version < 1) state = { ...state, purpose: null, language: DEFAULT_LANGUAGE }
  return sanitizePersisted(state)
}
