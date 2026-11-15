import { vi } from 'vitest'

export class MemoryStorage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  getItem(k: string) { return this.m.has(k) ? (this.m.get(k) as string) : null }
  setItem(k: string, v: string) { this.m.set(k, String(v)) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
  keys() { return [...this.m.keys()] }
}

/** Simula un arranque nuevo de la app: localStorage dado + módulos recién evaluados (como tras recargar). */
export async function boot(storage: MemoryStorage) {
  vi.resetModules()
  vi.stubGlobal('localStorage', storage)
  return import('../store')
}

/** Estado persistido por la versión ORIGINAL (sin `version` en el código → zustand escribe version: 0). */
export const legacyV0 = {
  state: {
    items: [
      { id: 'exam-1', kind: 'exam', subject: 'Databases', start: '2026-12-01T09:00:00.000Z', duration: 90, notes: 'SQL joins' },
      { id: 'study-1', kind: 'study', subject: 'Databases', start: '2026-11-30T17:00:00.000Z', duration: 60, notes: '', linkedTo: 'exam-1' },
      { id: 'asg-1', kind: 'assignment', subject: 'Android', start: '2026-11-25T20:00:00.000Z', duration: 30, notes: 'Entrega en el aula virtual' },
    ],
    mode: 'dark',
    theme: 'ruby',
    notifications: false,
  },
  version: 0,
}
