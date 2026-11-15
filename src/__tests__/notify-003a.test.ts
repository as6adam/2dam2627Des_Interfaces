import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryStorage, boot } from './helpers'
import { detectPlatform } from '../lib/platform'
import {
  createTauriAdapter, createWebAdapter, getNotifyPermission, notify, requestNotifyPermission, selectAdapter,
  type NotifyAdapter, type NotifyPermission,
} from '../lib/notify'
import { useToasts } from '../lib/toasts'
import { COMMON } from '../lib/i18n'
import { LANGUAGES } from '../lib/preferences'
import notifySource from '../lib/notify.ts?raw'
import hooksSource from '../lib/hooks.ts?raw'

const libs = import.meta.glob('../{lib,components}/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const toasts = () => useToasts.getState().toasts
beforeEach(() => useToasts.setState({ toasts: [] }))
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

/** `Notification` simulado: NINGUNA prueba toca permisos reales. */
function fakeNotification(permission: 'default' | 'granted' | 'denied', grantOnRequest: 'granted' | 'denied' = 'granted') {
  const sent: Array<[string, unknown]> = []
  const requestPermission = vi.fn(async () => { api.permission = grantOnRequest; return grantOnRequest })
  const api = Object.assign(function (this: unknown, t: string, o?: unknown) { sent.push([t, o]) } as unknown as { permission: string }, { requestPermission })
  api.permission = permission
  return { api, sent, requestPermission }
}
const stubAdapter = (over: Partial<NotifyAdapter> = {}): NotifyAdapter => ({
  requestOnSend: false, permission: async () => 'granted', request: async () => 'granted', send: async () => {}, ...over,
})

describe('selección del adaptador', () => {
  it('detectPlatform usa la señal de Tauri 2 (globalThis.isTauri), no el user-agent', () => {
    expect(detectPlatform({ isTauri: true })).toBe('tauri')
    expect(detectPlatform({})).toBe('web')
    expect(detectPlatform({ isTauri: 'true' })).toBe('web') // solo el booleano que inyecta Tauri
    expect(detectPlatform({ navigator: { userAgent: 'Mozilla Tauri/2.0' } })).toBe('web')
  })
  it('web → adaptador de navegador (no pide permiso al enviar); tauri → adaptador nativo', () => {
    expect(selectAdapter('web').requestOnSend).toBe(false)
    expect(selectAdapter('tauri').requestOnSend).toBe(true)
  })
  it('crear/usar el adaptador web no carga el módulo nativo', async () => {
    const load = vi.fn()
    createTauriAdapter(load as never) // crearlo no carga nada
    expect(load).not.toHaveBeenCalled()
    const { api } = fakeNotification('granted')
    await notify('t', 'b', { adapter: createWebAdapter({ Notification: api }) })
    expect(load).not.toHaveBeenCalled()
  })
  it('@tauri-apps solo se importa dinámicamente y solo desde notify.ts', () => {
    expect(notifySource).not.toMatch(/^import[^\n]*@tauri-apps/m)
    expect(notifySource).toMatch(/import\('@tauri-apps\/plugin-notification'\)/)
    for (const [f, src] of Object.entries(libs)) if (!f.endsWith('/notify.ts')) expect(src, f).not.toMatch(/(from\s+|import\()\s*['"]@tauri-apps/)
  })
})

describe('navegador sin Notification', () => {
  it('permiso «unsupported», sin excepciones y con aviso dentro de la app', async () => {
    const web = createWebAdapter({})
    expect(await getNotifyPermission(web)).toBe('unsupported')
    expect(await requestNotifyPermission(web)).toBe('unsupported')
    await expect(notify('Título', 'Cuerpo', { adapter: web })).resolves.toBe('in-app')
    expect(toasts()).toHaveLength(1)
  })
})

describe('permisos default / granted / denied', () => {
  for (const [perm, outcome] of [['default', 'in-app'], ['denied', 'in-app'], ['granted', 'system']] as const) {
    it(`${perm}: resultado ${outcome} y sin solicitar permiso`, async () => {
      const { api, sent, requestPermission } = fakeNotification(perm)
      const web = createWebAdapter({ Notification: api })
      expect(await getNotifyPermission(web)).toBe(perm)
      await expect(notify('A', 'B', { adapter: web })).resolves.toBe(outcome)
      expect(requestPermission).not.toHaveBeenCalled() // notify NUNCA solicita permiso en navegador
      expect(sent).toHaveLength(perm === 'granted' ? 1 : 0)
      expect(toasts()).toHaveLength(perm === 'granted' ? 0 : 1) // sistema XOR dentro de la app
    })
  }
  it('el permiso solo se pide con requestNotifyPermission (acción explícita)', async () => {
    const { api, requestPermission } = fakeNotification('default', 'granted')
    const web = createWebAdapter({ Notification: api })
    expect(requestPermission).not.toHaveBeenCalled()
    expect(await requestNotifyPermission(web)).toBe('granted')
    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(await getNotifyPermission(web)).toBe('granted')
  })
  it('si el usuario deniega al solicitar, el estado pasa a denied', async () => {
    const { api } = fakeNotification('default', 'denied')
    expect(await requestNotifyPermission(createWebAdapter({ Notification: api }))).toBe('denied')
  })
})

describe('errores del adaptador no afectan al flujo principal', () => {
  it('send rechaza → aviso interno, sin rechazo', async () => {
    await expect(notify('A', 'B', { adapter: stubAdapter({ send: async () => { throw new Error('boom') } }) })).resolves.toBe('in-app')
    expect(toasts()).toHaveLength(1)
  })
  it('permission rechaza → aviso interno, sin rechazo', async () => {
    await expect(notify('A', 'B', { adapter: stubAdapter({ permission: async () => { throw new Error('x') } }) })).resolves.toBe('in-app')
  })
  it('request rechaza → se devuelve el permiso actual', async () => {
    const a = stubAdapter({ permission: async () => 'default', request: async () => { throw new Error('x') } })
    expect(await requestNotifyPermission(a)).toBe('default')
  })
  it('un adaptador que lanza de forma síncrona tampoco rompe nada', async () => {
    const bad = { get requestOnSend(): boolean { throw new Error('sync') } } as unknown as NotifyAdapter
    await expect(notify('A', 'B', { adapter: bad })).resolves.toBe('in-app')
  })
})

describe('adaptador de escritorio (módulo nativo simulado)', () => {
  const mod = (granted: boolean, requested: 'granted' | 'denied' | 'default') => ({
    isPermissionGranted: vi.fn(async () => granted), requestPermission: vi.fn(async () => requested), sendNotification: vi.fn(),
  })
  it('concedido: envía con el plugin y no muestra aviso interno', async () => {
    const m = mod(true, 'granted')
    await expect(notify('T', 'B', { adapter: createTauriAdapter(async () => m as never) })).resolves.toBe('system')
    expect(m.sendNotification).toHaveBeenCalledWith({ title: 'T', body: 'B' }); expect(toasts()).toHaveLength(0)
  })
  it('no concedido: conserva la petición nativa previa al emitir', async () => {
    const m = mod(false, 'granted')
    await expect(notify('T', 'B', { adapter: createTauriAdapter(async () => m as never) })).resolves.toBe('system')
    expect(m.requestPermission).toHaveBeenCalledTimes(1)
  })
  it('denegado: aviso interno', async () => {
    const m = mod(false, 'denied')
    await expect(notify('T', 'B', { adapter: createTauriAdapter(async () => m as never) })).resolves.toBe('in-app')
    expect(m.sendNotification).not.toHaveBeenCalled()
  })
  it('el módulo nativo no se puede cargar → aviso interno (no rompe)', async () => {
    await expect(notify('T', 'B', { adapter: createTauriAdapter(async () => { throw new Error('no runtime') }) })).resolves.toBe('in-app')
  })
})

describe('sin avisos duplicados', () => {
  it('con permiso, sale una sola notificación del sistema y ningún aviso interno', async () => {
    const send = vi.fn(async () => {})
    await notify('A', 'B', { adapter: stubAdapter({ send }) })
    expect(send).toHaveBeenCalledTimes(1); expect(toasts()).toHaveLength(0)
  })
  it('el mismo aviso interno repetido no se apila', async () => {
    const a = stubAdapter({ permission: async () => 'denied' })
    await notify('A', 'B', { adapter: a }); await notify('A', 'B', { adapter: a })
    expect(toasts()).toHaveLength(1)
    await notify('A', 'C', { adapter: a }); expect(toasts()).toHaveLength(2)
  })
  it('se limita el número de avisos visibles', () => {
    for (let i = 0; i < 6; i++) useToasts.getState().push('T', String(i))
    expect(toasts().length).toBeLessThanOrEqual(3)
  })
  it('inApp:false (resumen de bienvenida) no crea aviso interno', async () => {
    await expect(notify('A', 'B', { adapter: stubAdapter({ permission: async () => 'denied' }), inApp: false })).resolves.toBe('none')
    expect(toasts()).toHaveLength(0)
    expect(hooksSource).toMatch(/inApp: false/)
  })
})

describe('integración real con el store (Notification simulada, permiso «default»)', () => {
  async function setup(permission: 'default' | 'granted' | 'denied') {
    vi.resetModules()
    const fake = fakeNotification(permission)
    vi.stubGlobal('Notification', fake.api)
    const store = await boot(new MemoryStorage())
    const { useToasts: T } = await import('../lib/toasts') // instancia nueva tras resetModules
    store.useApp.setState({ notifications: true })
    return { ...store, ...fake, T }
  }
  it('terminar un Pomodoro no solicita permiso y avisa dentro de la app, en el idioma vigente', async () => {
    const { useApp, usePomodoro, requestPermission, sent, T } = await setup('default')
    useApp.getState().setLanguage('en')
    usePomodoro.getState().start(); const endAt = usePomodoro.getState().endAt
    useApp.getState().setLanguage('es')
    expect(usePomodoro.getState().endAt).toBe(endAt)
    usePomodoro.setState({ endAt: Date.now() - 1000 }); usePomodoro.getState().tick()
    await vi.waitFor(() => expect(T.getState().toasts).toHaveLength(1))
    expect(T.getState().toasts[0].title).toBe('Sesión de enfoque completada')
    expect(requestPermission).not.toHaveBeenCalled(); expect(sent).toHaveLength(0)
    useApp.getState().setLanguage('en'); useApp.getState().setLanguage('es'); usePomodoro.getState().tick()
    await new Promise((r) => setTimeout(r, 20))
    expect(T.getState().toasts).toHaveLength(1) // cambiar idioma no repite nada
  })
  it('con permiso concedido el aviso sale por el sistema, una vez, sin aviso interno', async () => {
    const { usePomodoro, sent, T } = await setup('granted')
    usePomodoro.setState({ running: true, endAt: Date.now() - 1, phase: 'focus' }); usePomodoro.getState().tick()
    await vi.waitFor(() => expect(sent).toHaveLength(1))
    expect(T.getState().toasts).toHaveLength(0)
  })
  it('las notificaciones desactivadas no emiten nada, ni dentro de la app', async () => {
    const { useApp, usePomodoro, sent, T } = await setup('granted')
    useApp.setState({ notifications: false })
    usePomodoro.setState({ running: true, endAt: Date.now() - 1, phase: 'focus' }); usePomodoro.getState().tick()
    await new Promise((r) => setTimeout(r, 20))
    expect(sent).toHaveLength(0); expect(T.getState().toasts).toHaveLength(0)
  })
  it('cambiar permisos o idioma no toca endAt ni la duración', async () => {
    const { useApp, usePomodoro } = await setup('default')
    usePomodoro.getState().start(); const before = { ...usePomodoro.getState() }
    await requestNotifyPermission(createWebAdapter({ Notification: fakeNotification('default').api }))
    useApp.getState().setLanguage('en')
    expect(usePomodoro.getState().endAt).toBe(before.endAt); expect(usePomodoro.getState().remaining).toBe(before.remaining)
  })
})

describe('textos de estado en Ajustes (traducidos)', () => {
  const perms: NotifyPermission[] = ['unsupported', 'default', 'granted', 'denied']
  for (const l of LANGUAGES) for (const platform of ['web', 'tauri'] as const) for (const perm of perms) for (const enabled of [true, false]) {
    it(`${l} · ${platform} · ${perm} · avisos ${enabled ? 'activados' : 'desactivados'}`, () => {
      const text = COMMON[l].settings.notifications.status(perm, platform, enabled)
      expect(text.trim().length).toBeGreaterThan(10)
      expect(text).not.toMatch(/undefined|\[object/)
    })
  }
  it('el estado distingue idioma y entorno', () => {
    const s = (l: 'es' | 'en', p: 'web' | 'tauri') => COMMON[l].settings.notifications.status('denied', p, true)
    expect(s('es', 'web')).not.toBe(s('en', 'web')); expect(s('es', 'web')).not.toBe(s('es', 'tauri'))
    expect(s('en', 'web')).toContain('Meanwhile'); expect(COMMON.es.settings.notifications.status('granted', 'web', true)).not.toContain('dentro de Tempora')
  })
})
