/**
 * Altura visible real con teclado virtual. `dvh` no basta en iOS: el teclado reduce el viewport VISUAL pero no el de diseño.
 * Se publican dos variables CSS (`--vvh`, `--vvt`); sin `visualViewport` (o con zoom del usuario) no se definen y
 * las hojas usan el fallback `100dvh`. NUNCA se bloquea el zoom.
 */
export interface VV { height: number; offsetTop: number; scale: number }

/** Pura (probada en node). `null` = no sobrescribir: usar el fallback CSS. */
export function viewportVars(innerHeight: number, vv: VV | null | undefined): { height: number; top: number } | null {
  if (!vv) return null
  if (vv.scale > 1.01) return null // el usuario ha ampliado: el diálogo sigue el viewport de diseño
  const covered = innerHeight - vv.height - vv.offsetTop
  if (covered < 80) return null // sin teclado (barras del navegador ≈ <80 px)
  return { height: Math.round(vv.height), top: Math.round(vv.offsetTop) }
}

export function installViewportVars(root: HTMLElement = document.documentElement): () => void {
  const vv = window.visualViewport
  if (!vv) return () => {}
  const apply = () => {
    const r = viewportVars(window.innerHeight, vv)
    if (r) { root.style.setProperty('--vvh', `${r.height}px`); root.style.setProperty('--vvt', `${r.top}px`) }
    else { root.style.removeProperty('--vvh'); root.style.removeProperty('--vvt') }
  }
  apply()
  vv.addEventListener('resize', apply)
  vv.addEventListener('scroll', apply)
  return () => { vv.removeEventListener('resize', apply); vv.removeEventListener('scroll', apply); root.style.removeProperty('--vvh'); root.style.removeProperty('--vvt') }
}
