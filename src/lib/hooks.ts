import { useEffect, useState } from 'react'
import { Item, useApp, usePomodoro, useUI } from '../store'
import type { Purpose } from './preferences'
import { hasPassed } from './dates'
import { notify } from './notify'
import { getCommon, welcomeNotice } from './i18n'
import { useStorageHealth } from './storageHealth'
import { useToasts } from './toasts'

export const EXAM_WINDOW_DAYS = 15
export const ASSIGNMENT_WINDOW_DAYS = 30

const byStart = (a: Item, b: Item) => +new Date(a.start) - +new Date(b.start)

/** Exams due ≤15 days out, assignments ≤30 days out. Anything further (or already past) is ignored. */
export function upcoming(items: Item[]) {
  const now = Date.now()
  const within = (i: Item, days: number) => {
    const t = +new Date(i.start)
    return !hasPassed(t, now) && t <= now + days * 864e5
  }
  return {
    exams: items.filter((i) => i.kind === 'exam' && within(i, EXAM_WINDOW_DAYS)).sort(byStart),
    assignments: items.filter((i) => i.kind === 'assignment' && within(i, ASSIGNMENT_WINDOW_DAYS)).sort(byStart),
  }
}

/** `true` cuando el estado persistido ya se ha aplicado al store. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useApp.persist.hasHydrated())
  useEffect(() => {
    setHydrated(useApp.persist.hasHydrated())
    return useApp.persist.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}

/**
 * El flujo de bienvenida solo arranca cuando: hay preferencias hidratadas, el propósito está elegido,
 * el selector ya no está en pantalla (ni animando su salida) y todavía no se ha lanzado en esta sesión.
 */
export const canRunWelcome = (s: { hydrated: boolean; purpose: Purpose | null; purposeVisible: boolean; launched: boolean }) =>
  s.hydrated && s.purpose !== null && !s.purposeVisible && !s.launched

let launched = false // una sola vez por sesión; también protege del doble efecto de StrictMode
export function useStartupAlerts() {
  const hydrated = useHydrated()
  const purpose = useApp((s) => s.purpose)
  const purposeVisible = useUI((s) => s.purposeVisible)

  useEffect(() => {
    if (!canRunWelcome({ hydrated, purpose, purposeVisible, launched })) return
    let frame = 0
    let cancelled = false
    // Espera (por fotograma) a que no quede ningún diálogo en el DOM, incluido uno que aún anima su salida:
    // así el resumen nunca coexiste con el selector. `launched` solo se marca al lanzar de verdad.
    const run = () => {
      if (cancelled) return
      if (document.querySelector('[role="dialog"]')) { frame = requestAnimationFrame(run); return }
      launched = true
      const { exams, assignments } = upcoming(useApp.getState().items)
      if (!exams.length && !assignments.length) return
      useUI.setState({ modal: { type: 'startup' } })
      const app = useApp.getState()
      if (app.notifications) {
        // Idioma y propósito se leen aquí, al emitir (no al evaluar el módulo ni al montar el efecto).
        const n = welcomeNotice(app.language, app.purpose, { exams: exams.length, examDays: EXAM_WINDOW_DAYS, assignments: assignments.length, assignmentDays: ASSIGNMENT_WINDOW_DAYS })
        void notify(n.title, n.body, { inApp: false }) // el propio resumen de bienvenida ya es el aviso dentro de la app
      }
    }
    frame = requestAnimationFrame(run)
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [hydrated, purpose, purposeVisible])
}

export function usePomodoroTicker() {
  useEffect(() => {
    const tick = () => usePomodoro.getState().tick()
    const id = setInterval(tick, 250)
    // Una pestaña inactiva ralentiza los temporizadores; al volver se reconcilia al instante con `endAt` (marca de tiempo real).
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tick)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', tick) }
  }, [])
}

/** Avisa UNA vez (al pasar de «guardando» a «no se puede guardar») y en el idioma vigente en ese momento; nunca dice «guardado». */
export function watchStorageHealth() {
  const warn = () => useToasts.getState().push('Tempora', getCommon(useApp.getState().language).storage.writeFailed)
  if (useStorageHealth.getState().failing) warn() // el fallo pudo producirse en la hidratación, antes de montar la app (un aviso idéntico no se apila)
  return useStorageHealth.subscribe((s, prev) => { if (s.failing && !prev.failing) warn() })
}
export function useStorageNotice() {
  useEffect(() => watchStorageHealth(), [])
}
