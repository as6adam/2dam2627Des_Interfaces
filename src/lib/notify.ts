import type { Platform } from './platform'
import { getPlatform } from './platform'
import { useToasts } from './toasts'

/**
 * Notificaciones: una interfaz compartida (`notify`) y un adaptador por plataforma.
 * Se distinguen TRES cosas: la preferencia interna (`useApp.notifications`, la gestionan los llamadores),
 * el permiso real del entorno (`NotifyPermission`) y la disponibilidad de la API ('unsupported').
 * `notify` NUNCA rechaza y NUNCA pide permiso en navegador: el permiso solo se solicita con `requestNotifyPermission`,
 * llamado desde un control explícito de Ajustes.
 */
export type NotifyPermission = 'unsupported' | 'default' | 'granted' | 'denied'
/** Dónde acabó el aviso: sistema, dentro de la app (alternativa) o en ninguna parte (`inApp: false` y sin sistema). */
export type NotifyOutcome = 'system' | 'in-app' | 'none'

export interface NotifyAdapter {
  permission(): Promise<NotifyPermission>
  request(): Promise<NotifyPermission>
  send(title: string, body: string): Promise<void>
  /** Escritorio: se conserva el comportamiento previo (pedir el permiso nativo al emitir). Navegador: nunca. */
  requestOnSend: boolean
}

type PermissionLike = 'default' | 'granted' | 'denied'
interface WebNotificationApi {
  permission: PermissionLike
  requestPermission: () => Promise<PermissionLike> | PermissionLike | void
}

/** Navegador: `Notification` del entorno, comprobada en cada llamada. `env` inyectable para pruebas. */
export function createWebAdapter(env: { Notification?: unknown } = globalThis): NotifyAdapter {
  const api = () => (typeof env.Notification === 'function' || typeof env.Notification === 'object' ? (env.Notification as WebNotificationApi | undefined) : undefined)
  const map = (p: unknown): NotifyPermission => (p === 'granted' || p === 'denied' || p === 'default' ? p : 'unsupported')
  return {
    requestOnSend: false,
    permission: async () => { const n = api(); return n ? map(n.permission) : 'unsupported' },
    request: async () => {
      const n = api()
      if (!n) return 'unsupported'
      await n.requestPermission() // Safari antiguo usa callback; se relee el valor resultante
      return map(n.permission)
    },
    send: async (title, body) => {
      const Ctor = env.Notification as (new (t: string, o?: { body?: string }) => unknown) | undefined
      if (!Ctor) throw new Error('Notification unavailable')
      new Ctor(title, { body })
    },
  }
}

type TauriNotificationModule = typeof import('@tauri-apps/plugin-notification')
/** Escritorio (Tauri): el plugin se carga con import dinámico, solo cuando se usa y solo si la plataforma es 'tauri'. */
export function createTauriAdapter(load: () => Promise<TauriNotificationModule> = () => import('@tauri-apps/plugin-notification')): NotifyAdapter {
  return {
    requestOnSend: true,
    permission: async () => ((await load()).isPermissionGranted().then((ok) => (ok ? 'granted' : 'default'))),
    request: async () => {
      const r = await (await load()).requestPermission()
      return r === 'granted' ? 'granted' : r === 'denied' ? 'denied' : 'default'
    },
    send: async (title, body) => { (await load()).sendNotification({ title, body }) },
  }
}

export function selectAdapter(platform: Platform = getPlatform()): NotifyAdapter {
  return platform === 'tauri' ? createTauriAdapter() : createWebAdapter()
}

/** Permiso actual sin pedir nada. Un fallo del adaptador se trata como «no disponible». */
export async function getNotifyPermission(adapter: NotifyAdapter = selectAdapter()): Promise<NotifyPermission> {
  try { return await adapter.permission() } catch { return 'unsupported' }
}

/** Solicita permiso. SOLO debe llamarse desde una acción explícita del usuario. */
export async function requestNotifyPermission(adapter: NotifyAdapter = selectAdapter()): Promise<NotifyPermission> {
  try { return await adapter.request() } catch { return getNotifyPermission(adapter) }
}

/**
 * Emite un aviso. Nunca rechaza ni bloquea a quien llama (los llamadores no lo esperan).
 * - Permiso concedido → notificación del sistema (y nada más: sin duplicado dentro de la app).
 * - Si no puede mostrarse (sin API, sin permiso, error) → aviso dentro de la app, salvo `inApp: false`
 *   (p. ej. el resumen de bienvenida, que ya muestra su propio diálogo).
 * El llamador decide ANTES si la preferencia de avisos está activada.
 */
export async function notify(title: string, body: string, opts: { inApp?: boolean; adapter?: NotifyAdapter } = {}): Promise<NotifyOutcome> {
  const inApp = opts.inApp ?? true
  try {
    const adapter = opts.adapter ?? selectAdapter()
    let permission = await getNotifyPermission(adapter)
    if (permission !== 'granted' && adapter.requestOnSend && permission !== 'unsupported' && permission !== 'denied') permission = await requestNotifyPermission(adapter)
    if (permission === 'granted') {
      try { await adapter.send(title, body); return 'system' } catch { /* cae al aviso interno */ }
    }
  } catch { /* nada de lo anterior debe afectar al flujo principal */ }
  if (!inApp) return 'none'
  useToasts.getState().push(title, body)
  return 'in-app'
}
