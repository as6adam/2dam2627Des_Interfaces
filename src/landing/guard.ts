import type { Platform } from '../lib/platform'

/** Entrada de la aplicación relativa al documento (`app/index.html`), válida en cualquier base de despliegue. */
export const APP_ENTRY = 'app/index.html'

/**
 * Red de seguridad para el escritorio: la entrada de Tauri se fija en `tauri.conf.json` (ventana `url: "app/index.html"`).
 * Si por cualquier motivo la ventana cargase esta landing, en Tauri se salta directamente a la aplicación.
 * En un navegador (`web`) devuelve null: la landing se muestra normalmente.
 */
export function tauriRedirectTarget(platform: Platform): string | null {
  return platform === 'tauri' ? APP_ENTRY : null
}

/** URL del enlace «Ir a Tempora»: respeta la base de despliegue (`./` relativa, o `/repo/` absoluta). Nunca `/app/` fijo. */
export function appHref(baseUrl: string): string {
  return `${baseUrl}${APP_ENTRY}`
}
