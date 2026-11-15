import { describe, expect, it, vi } from 'vitest'
import { MemoryStorage } from './helpers'

describe('puerta del resumen de bienvenida', () => {
  it('solo corre hidratado, con propósito, sin selector visible y una vez', async () => {
    vi.resetModules(); vi.stubGlobal('localStorage', new MemoryStorage())
    const { canRunWelcome } = await import('../lib/hooks')
    const ok = { hydrated: true, purpose: 'academic' as const, purposeVisible: false, launched: false }
    expect(canRunWelcome(ok)).toBe(true)
    expect(canRunWelcome({ ...ok, hydrated: false })).toBe(false)
    expect(canRunWelcome({ ...ok, purpose: null })).toBe(false) // primer uso: manda el selector
    expect(canRunWelcome({ ...ok, purposeVisible: true })).toBe(false) // selector aún en pantalla / animando salida
    expect(canRunWelcome({ ...ok, launched: true })).toBe(false) // una sola vez
  })
})
