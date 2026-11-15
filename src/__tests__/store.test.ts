import { describe, expect, it } from 'vitest'
import { MemoryStorage, boot, legacyV0 } from './helpers'

const KEY = 'tempora-v1'
const saved = (s: MemoryStorage) => JSON.parse(s.getItem(KEY) as string)

describe('almacenamiento nuevo', () => {
  it('hidrata, purpose es null (aparece la elección) y language es es', async () => {
    const { useApp } = await boot(new MemoryStorage())
    expect(useApp.persist.hasHydrated()).toBe(true)
    expect(useApp.getState().purpose).toBeNull()
    expect(useApp.getState().language).toBe('es')
    expect(useApp.getState().items).toEqual([])
  })
})

describe('confirmar y recargar', () => {
  it('persiste el propósito bajo la misma clave y versión 1', async () => {
    const storage = new MemoryStorage()
    const first = await boot(storage)
    first.useApp.getState().setPurpose('productivity')
    expect(saved(storage)).toMatchObject({ version: 1, state: { purpose: 'productivity', language: 'es' } })

    const second = await boot(storage) // «recarga»
    expect(second.useApp.getState().purpose).toBe('productivity')
  })
  it('no introduce otro almacenamiento para las preferencias', async () => {
    const storage = new MemoryStorage()
    const { useApp } = await boot(storage)
    useApp.getState().setPurpose('academic')
    useApp.getState().setLanguage('en')
    expect(storage.keys()).toEqual([KEY])
  })
})

describe('estado antiguo tempora-v1 (version 0)', () => {
  it('conserva los datos y deja purpose = null para solicitarlo', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify(legacyV0))
    const { useApp } = await boot(storage)
    const s = useApp.getState()
    expect(s.items).toEqual(legacyV0.state.items)
    expect(s.items.find((i) => i.id === 'study-1')?.linkedTo).toBe('exam-1')
    expect([s.mode, s.theme, s.notifications]).toEqual(['dark', 'ruby', false])
    expect(s.purpose).toBeNull()
    expect(s.language).toBe('es')
  })
  it('reescribe el estado migrado como versión 1 en la misma clave', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify(legacyV0))
    await boot(storage)
    expect(saved(storage).version).toBe(1)
    expect(saved(storage).state.items).toEqual(legacyV0.state.items)
    expect(storage.keys()).toEqual([KEY])
  })
})

describe('valores recuperados inválidos', () => {
  it('purpose/language inválidos en un estado v1 → valores iniciales, datos intactos', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify({ version: 1, state: { ...legacyV0.state, purpose: 'otro', language: 'fr' } }))
    const { useApp } = await boot(storage)
    expect(useApp.getState().purpose).toBeNull()
    expect(useApp.getState().language).toBe('es')
    expect(useApp.getState().items).toEqual(legacyV0.state.items)
  })
  it('JSON ilegible → la hidratación termina con valores iniciales (no se queda esperando)', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, '{esto no es json')
    const { useApp } = await boot(storage)
    expect(useApp.persist.hasHydrated()).toBe(true)
    expect(useApp.getState().purpose).toBeNull()
  })
})

describe('cambiar de propósito', () => {
  it('conserva eventos y relaciones, y la eliminación en cascada sigue igual', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify(legacyV0))
    const { useApp } = await boot(storage)
    const before = structuredClone(useApp.getState().items)

    useApp.getState().setPurpose('academic')
    useApp.getState().setPurpose('productivity')
    expect(useApp.getState().items).toEqual(before)
    expect(useApp.getState().items.find((i) => i.kind === 'exam')?.id).toBe('exam-1') // un examen sigue siendo examen

    useApp.getState().removeItem('exam-1') // el examen arrastra su sesión enlazada
    expect(useApp.getState().items.map((i) => i.id)).toEqual(['asg-1'])
  })
  it('no toca el Pomodoro ni el audio', async () => {
    const { useApp, usePomodoro, useAudio } = await boot(new MemoryStorage())
    usePomodoro.getState().start()
    useAudio.getState().setPlaying(true)
    useAudio.getState().setVolume(33)
    const pomo = { ...usePomodoro.getState() }
    const audio = { ...useAudio.getState() }

    useApp.getState().setPurpose('academic')
    useApp.getState().setPurpose('productivity')

    expect(usePomodoro.getState().running).toBe(true)
    expect(usePomodoro.getState().endAt).toBe(pomo.endAt)
    expect(usePomodoro.getState().remaining).toBe(pomo.remaining)
    expect(useAudio.getState().playing).toBe(true)
    expect(useAudio.getState().url).toBe(audio.url)
    expect(useAudio.getState().volume).toBe(33)
  })
})
