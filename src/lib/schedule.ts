import type { Item } from '../store'
import type { FormError } from './i18n'

/**
 * Reglas al cambiar fecha/hora de un elemento existente (formulario Y arrastre usan la misma):
 *  · una sesión de estudio debe TERMINAR antes de que empiece su examen/tarea;
 *  · un examen/tarea no puede pasar a empezar antes de que termine alguna de sus sesiones.
 * ID, tipo, duración y relaciones no cambian (solo `start`). Devuelve un error tipado (el texto se resuelve al renderizar).
 */
export function validateReschedule(items: Item[], id: string, next: Date): FormError | null {
  const item = items.find((i) => i.id === id)
  if (!item) return null
  if (isNaN(+next)) return { code: 'invalidDateTime' }
  if (item.kind === 'study') {
    const parent = item.linkedTo ? items.find((i) => i.id === item.linkedTo) : undefined
    if (parent && +next + item.duration * 60000 > +new Date(parent.start)) return { code: 'sessionMustEndBefore', kind: parent.kind === 'exam' ? 'exam' : 'assignment' }
    return null
  }
  const lastEnd = Math.max(0, ...items.filter((i) => i.linkedTo === id).map((s) => +new Date(s.start) + s.duration * 60000))
  if (lastEnd > +next) return { code: 'dueBeforeSessions', kind: item.kind === 'exam' ? 'exam' : 'assignment' }
  return null
}
