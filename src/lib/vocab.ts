/**
 * Hooks que leen idioma/propósito desde Zustand. Recursos y funciones puras: `i18n.ts`.
 * Aquí se reexporta para conservar la API pública (`Vocab`, `getVocab`, `getPurposeInfo`, `useVocab`).
 * Los valores devueltos son constantes de módulo → referencias estables.
 */
import { useApp } from '../store'
import { formErrorText, getCommon, getPurposeInfo, getVocab, type Common, type FormError, type PurposeInfo, type Vocab } from './i18n'
import type { Purpose } from './preferences'

export type { Common, FormError, PurposeInfo, Vocab } from './i18n'
export { formErrorText, getCommon, getPurposeInfo, getVocab } from './i18n'

export function useVocab(): Vocab {
  const language = useApp((s) => s.language)
  const purpose = useApp((s) => s.purpose)
  return getVocab(language, purpose)
}

export function usePurposeInfo(): Record<Purpose, PurposeInfo> {
  return getPurposeInfo(useApp((s) => s.language))
}

/** Idioma vigente (reactivo): los formatos de fecha lo reciben como argumento explícito. */
export function useLanguage() {
  return useApp((s) => s.language)
}

export function useCommon(): Common {
  return getCommon(useApp((s) => s.language))
}

/** Devuelve un resolvedor reactivo: el texto de un `FormError` visible cambia de idioma/propósito al instante. */
export function useFormErrorText(): (error: FormError) => string {
  const language = useApp((s) => s.language)
  const purpose = useApp((s) => s.purpose)
  return (error) => formErrorText(language, purpose, error)
}
