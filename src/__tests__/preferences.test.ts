import { describe, expect, it } from 'vitest'
import { DEFAULT_PERSISTED, PERSIST_VERSION, migratePersisted, sanitizePersisted } from '../lib/preferences'
import { legacyV0 } from './helpers'

describe('migratePersisted (v0 → v1)', () => {
  it('conserva items, ids, linkedTo, fechas, notas, tema, modo y notificaciones', () => {
    const out = migratePersisted(legacyV0.state, 0)
    expect(out.items).toEqual(legacyV0.state.items)
    expect(out.items.find((i) => i.id === 'study-1')?.linkedTo).toBe('exam-1')
    expect(out.mode).toBe('dark')
    expect(out.theme).toBe('ruby')
    expect(out.notifications).toBe(false)
  })
  it('añade purpose = null (se pedirá) y language = es', () => {
    const out = migratePersisted(legacyV0.state, 0)
    expect(out.purpose).toBeNull()
    expect(out.language).toBe('es')
  })
  it('no confía en un purpose presente en un estado v0', () => {
    expect(migratePersisted({ ...legacyV0.state, purpose: 'academic' }, 0).purpose).toBeNull()
  })
  it('nunca lanza con entradas inesperadas', () => {
    for (const bad of [null, undefined, 'x', 42, [], [1, 2]]) expect(() => migratePersisted(bad, 0)).not.toThrow()
    expect(migratePersisted(null, 0)).toEqual(DEFAULT_PERSISTED)
  })
  it('la versión actual es 1', () => expect(PERSIST_VERSION).toBe(1))
})

describe('sanitizePersisted', () => {
  it('acepta preferencias válidas', () => {
    const out = sanitizePersisted({ ...legacyV0.state, purpose: 'productivity', language: 'en' })
    expect(out.purpose).toBe('productivity')
    expect(out.language).toBe('en')
  })
  it('purpose o language inválidos → valores iniciales', () => {
    const out = sanitizePersisted({ ...legacyV0.state, purpose: 'hacker', language: 'fr' })
    expect(out.purpose).toBeNull()
    expect(out.language).toBe('es')
  })
  it('tema/modo/notificaciones inválidos → valores iniciales, sin tocar items', () => {
    const out = sanitizePersisted({ items: legacyV0.state.items, mode: 'sepia', theme: 'emerald', notifications: 'yes' })
    expect(out).toMatchObject({ mode: 'light', theme: 'agate', notifications: true })
    expect(out.items).toHaveLength(3)
  })
  it('descarta solo los items inservibles y normaliza notes ausente', () => {
    const out = sanitizePersisted({
      items: [
        { id: 'ok', kind: 'exam', subject: 'A', start: '2026-12-01T09:00:00.000Z', duration: 90 },
        { id: '', kind: 'exam', subject: 'A', start: 'x', duration: 1 },
        { id: 'bad-kind', kind: 'party', subject: 'A', start: 'x', duration: 1 },
        'basura',
      ],
    })
    expect(out.items).toEqual([{ id: 'ok', kind: 'exam', subject: 'A', start: '2026-12-01T09:00:00.000Z', duration: 90, notes: '' }])
  })
})
