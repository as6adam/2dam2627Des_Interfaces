import { useSyncExternalStore } from 'react'

/**
 * Puntos de ruptura (px de ancho CSS). Fuente única: `tailwind.config.js` define las mismas cifras
 * (`md` = 768, `lg` = 1024, `wide` = 1200) y una prueba comprueba que no se desincronizan.
 *
 *   < 768        móvil     → barra inferior; navegación y concentración en paneles a pantalla casi completa.
 *   768 – 1023   tableta   → ambos paneles plegables, abiertos desde botones de la cabecera.
 *   1024 – 1199  tableta+  → concentración fija (300 px); navegación plegable.
 *   ≥ 1200       escritorio→ las tres áreas fijas (el calendario conserva ≥ 588 px).
 */
export const BREAKPOINTS = { tablet: 768, focusDock: 1024, navDock: 1200 } as const

export const MEDIA = {
  /** Móvil: justo por debajo de `md` (Tailwind usa min-width: 768px). */
  mobile: `(max-width: ${BREAKPOINTS.tablet - 0.02}px)`,
  focusDocked: `(min-width: ${BREAKPOINTS.focusDock}px)`,
  navDocked: `(min-width: ${BREAKPOINTS.navDock}px)`,
  /** Dispositivo de entrada principal táctil (la emulación de ventana NO lo cambia). */
  coarse: '(pointer: coarse)',
} as const

const supported = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

/** Lectura puntual (fuera de React). Sin `matchMedia` (pruebas en node) → false. */
export const matches = (query: string) => (supported() ? window.matchMedia(query).matches : false)

function subscribe(query: string, cb: () => void) {
  if (!supported()) return () => {}
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Suscripción reactiva a una media query; un cambio de tamaño no remonta nada, solo re-renderiza a quien la usa. */
export function useMedia(query: string) {
  return useSyncExternalStore((cb) => subscribe(query, cb), () => matches(query), () => false)
}

export interface LayoutMode { mobile: boolean; navDocked: boolean; focusDocked: boolean }
export function useLayout(): LayoutMode {
  return { mobile: useMedia(MEDIA.mobile), navDocked: useMedia(MEDIA.navDocked), focusDocked: useMedia(MEDIA.focusDocked) }
}
export const getLayout = (): LayoutMode => ({ mobile: matches(MEDIA.mobile), navDocked: matches(MEDIA.navDocked), focusDocked: matches(MEDIA.focusDocked) })

/** Vista inicial del calendario: diaria en móvil, semanal en el resto. Se evalúa UNA vez al crear el estado; después manda el usuario. */
export const initialCalendarView = (): 'week' | 'day' => (matches(MEDIA.mobile) ? 'day' : 'week')

/* ───────── Foco tras una acción de navegación en un panel ───────── */
let calendarEl: HTMLElement | null = null
export const registerCalendar = (el: HTMLElement | null) => { calendarEl = el }
/** Lleva el foco al calendario (destino útil tras elegir fecha/filtro en un panel que se cierra). */
export const focusCalendar = () => { calendarEl?.focus({ preventScroll: true }) }
