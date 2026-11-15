/**
 * Detección de entorno, centralizada. Sin user-agent: usa la misma señal que `isTauri()` de @tauri-apps/api 2.x
 * (Tauri inyecta `globalThis.isTauri = true` en su webview; en un navegador normal no existe).
 * El resto de la aplicación pregunta aquí; los módulos nativos solo se cargan (import dinámico) tras confirmar 'tauri'.
 */
export type Platform = 'tauri' | 'web'

/** `env` inyectable para pruebas; por defecto, el global real. */
export function detectPlatform(env: object = globalThis): Platform {
  return (env as { isTauri?: unknown }).isTauri === true ? 'tauri' : 'web'
}

let cached: Platform | null = null
/** Plataforma actual (se calcula una vez; el entorno no cambia durante la sesión). */
export function getPlatform(): Platform {
  return (cached ??= detectPlatform())
}
