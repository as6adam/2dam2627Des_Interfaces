/**
 * Base de despliegue de Vite (`base`), decidida en un único sitio.
 *
 *  - Sin `TEMPORA_BASE` → `'./'`: todas las URLs de los HTML compilados son RELATIVAS a cada documento
 *    (`/index.html` usa `./assets/…`, `/app/index.html` usa `../assets/…`). Funciona igual en la raíz de un dominio,
 *    bajo la subruta de un repositorio servido por HTTP y bajo el protocolo de Tauri, sin conocer la subruta.
 *    (No garantiza `file://`: los navegadores restringen módulos ES en ese protocolo; usar un servidor HTTP.)
 *  - `TEMPORA_BASE=/nombre-del-repo/` → base absoluta bajo esa subruta (se normaliza: barra inicial y final).
 *
 * Es una función pura (sin Node) para poder probarla.
 */
export function resolveBase(value: string | undefined): string {
  const v = (value ?? '').trim()
  if (v === '' || v === './' || v === '.') return './'
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v) || v.startsWith('//')) {
    throw new Error(`TEMPORA_BASE debe ser una ruta (p. ej. /mi-repo/), no una URL completa: "${v}"`)
  }
  if (/[\s?#\\]/.test(v)) throw new Error(`TEMPORA_BASE contiene caracteres no válidos: "${v}"`)
  const body = v.replace(/^\/+|\/+$/g, '')
  return body === '' ? '/' : `/${body}/`
}
