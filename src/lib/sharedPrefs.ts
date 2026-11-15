import { DEFAULT_PERSISTED, PERSIST_NAME, PERSIST_VERSION, migratePersisted, type Language } from './preferences'
import type { Mode, ThemeName } from '../store' // solo tipos: se borran al compilar, no se importa el store

/**
 * Lectura/escritura MÍNIMA de las preferencias de presentación que comparten la landing y la aplicación
 * (idioma, modo claro/oscuro y tema). Usa la MISMA clave persistida (`tempora-v1`) que el store, pero sin importarlo:
 * importar `store.ts` arrastraría Zustand, audio, Pomodoro y notificaciones a una página que solo muestra información.
 *
 * Garantías (todas probadas):
 *  - Nunca lanza (almacenamiento bloqueado, JSON ilegible…).
 *  - Escribir una preferencia conserva TODO lo demás del valor guardado (eventos, propósito, notificaciones, campos
 *    desconocidos) y su versión; solo cambia el campo indicado.
 *  - Un valor ilegible NO se sobrescribe (la aplicación lo copia a `.unreadable` en su próximo arranque).
 *  - Sin valor guardado se usan los iniciales de la aplicación (español, modo claro, tema ágata).
 */
export interface SharedPrefs { language: Language; mode: Mode; theme: ThemeName; /** ¿Hay un modo guardado? Si no, la landing sigue el del sistema. */ hasMode: boolean }

type KV = Pick<Storage, 'getItem' | 'setItem'>
const defaultStorage = (): KV | null => { try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null } }
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function readRaw(store: KV | null): { kind: 'none' } | { kind: 'unreadable' } | { kind: 'ok'; value: Record<string, unknown> } {
  if (!store) return { kind: 'none' }
  let raw: string | null
  try { raw = store.getItem(PERSIST_NAME) } catch { return { kind: 'none' } }
  if (raw === null) return { kind: 'none' }
  try {
    const parsed: unknown = JSON.parse(raw.replace(/^﻿/, ''))
    return isRecord(parsed) ? { kind: 'ok', value: parsed } : { kind: 'unreadable' }
  } catch { return { kind: 'unreadable' } }
}

export function readSharedPrefs(storage: KV | null = defaultStorage()): SharedPrefs {
  const r = readRaw(storage)
  if (r.kind !== 'ok') return { language: DEFAULT_PERSISTED.language, mode: DEFAULT_PERSISTED.mode, theme: DEFAULT_PERSISTED.theme, hasMode: false }
  const version = typeof r.value.version === 'number' ? r.value.version : 0
  const s = migratePersisted(r.value.state, version) // mismos validadores y migraciones que la aplicación
  const state = isRecord(r.value.state) ? r.value.state : {}
  return { language: s.language, mode: s.mode, theme: s.theme, hasMode: s.mode === state.mode }
}

/** Guarda UNA preferencia. Devuelve false si no se pudo escribir (la página sigue funcionando en memoria). */
export function saveSharedPref(patch: { language: Language } | { mode: Mode }, storage: KV | null = defaultStorage()): boolean {
  if (!storage) return false
  const r = readRaw(storage)
  if (r.kind === 'unreadable') return false // no se destruye lo que no se entiende
  const base = r.kind === 'ok' ? r.value : {}
  const prevVersion = typeof base.version === 'number' ? base.version : r.kind === 'ok' ? 0 : PERSIST_VERSION
  const prevState = isRecord(base.state) ? base.state : {}
  // v0 → v1 con la MISMA regla que `migratePersisted` (purpose pendiente, idioma inicial) pero sin sanear los eventos:
  // aquí no se valida nada ajeno al campo que se cambia, así que no se puede perder ni un evento ni un campo desconocido.
  const carried = prevVersion < PERSIST_VERSION ? { ...prevState, purpose: null, language: DEFAULT_PERSISTED.language } : prevState
  const next = { ...base, state: { ...carried, ...patch }, version: Math.max(prevVersion, PERSIST_VERSION) }
  try { storage.setItem(PERSIST_NAME, JSON.stringify(next)); return true } catch { return false }
}
