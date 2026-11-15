import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { reportStorageWrite } from './storageHealth'

/** Sufijo de la copia de seguridad de un valor ilegible (misma clave + `.unreadable`). */
export const UNREADABLE_SUFFIX = '.unreadable'

/**
 * Almacenamiento JSON sobre `localStorage` que NUNCA lanza:
 * - Lectura imposible (bloqueado) o sin dato → `null` (la app arranca con valores iniciales).
 * - JSON ilegible → `null`, pero el texto original se conserva en `<clave>.unreadable` (sin sobrescribir una copia anterior)
 *   para que no se pierda al escribir el estado nuevo; no se borra ni se «arregla» a ciegas.
 * - Escritura fallida → se informa a `storageHealth` (la app sigue en memoria) y no se propaga la excepción.
 */
export function createSafeStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      let raw: string | null
      try { raw = localStorage.getItem(name) } catch { return null }
      if (raw === null) return null
      try {
        const parsed = JSON.parse(raw.replace(/^﻿/, '')) as StorageValue<T> | null
        return typeof parsed === 'object' && parsed !== null ? parsed : null
      } catch {
        try { if (localStorage.getItem(name + UNREADABLE_SUFFIX) === null) localStorage.setItem(name + UNREADABLE_SUFFIX, raw) } catch { /* sin espacio: se sigue sin copia */ }
        return null
      }
    },
    setItem: (name, value) => {
      try { localStorage.setItem(name, JSON.stringify(value)); reportStorageWrite(true) } catch { reportStorageWrite(false) }
    },
    removeItem: (name) => { try { localStorage.removeItem(name) } catch { /* noop */ } },
  }
}
