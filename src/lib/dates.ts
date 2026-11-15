import { addDays, differenceInCalendarDays, format, startOfWeek } from 'date-fns'
import { enGB } from 'date-fns/locale/en-GB'
import { es } from 'date-fns/locale/es'
import type { Locale } from 'date-fns'
import type { Language } from './preferences'
import { getCommon } from './i18n'

/* ───────── Geometría del calendario (sin cambios) ───────── */
export const HOUR_H = 56
export const START_H = 0
export const END_H = 24

/** Decisión de producto: la semana empieza en lunes en TODOS los idiomas (no depende del locale). */
export const WEEK_STARTS_ON = 1 as const
export const weekDays = (cursor: Date, view: 'week' | 'day') =>
  view === 'day' ? [cursor] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON }), i))

export const snap = (minutes: number, step = 15) => Math.round(minutes / step) * step

/* ───────── Locales y formatos (idioma explícito; no hay locale global mutable) ───────── */
/** es → español; en → inglés británico (d MMM, lunes primero y 24 h, coherente con los patrones de abajo). */
export const DATE_LOCALES: Record<Language, Locale> = { es, en: enGB }

/** Patrones por idioma. La hora es SIEMPRE HH:mm (24 h) en ambos: decisión de producto, no de traducción. */
const TIME = 'HH:mm'
const PATTERNS: Record<Language, { dayHeading: string; dayMonth: string; dayMonthYear: string; monthYear: string; fullDate: string }> = {
  es: { dayHeading: "EEEE, d 'de' MMMM", dayMonth: 'd MMM', dayMonthYear: 'd MMM yyyy', monthYear: 'MMMM yyyy', fullDate: "EEEE, d 'de' MMMM 'de' yyyy" },
  en: { dayHeading: 'EEEE, d MMMM', dayMonth: 'd MMM', dayMonthYear: 'd MMM yyyy', monthYear: 'MMMM yyyy', fullDate: 'EEEE, d MMMM yyyy' },
}
const fmt = (language: Language, d: Date, pattern: string) => format(d, pattern, { locale: DATE_LOCALES[language] })

/** «domingo, 15 de noviembre» / «Sunday, 15 November». */
export const formatDayHeading = (language: Language, d: Date) => fmt(language, d, PATTERNS[language].dayHeading)
/** «9 – 15 nov 2026» (mismo mes), «26 oct – 1 nov 2026» (cruza mes), «28 dic 2026 – 3 ene 2027» (cruza año). */
export function formatWeekRange(language: Language, first: Date, last: Date) {
  const p = PATTERNS[language]
  if (first.getFullYear() !== last.getFullYear()) return `${fmt(language, first, p.dayMonthYear)} – ${fmt(language, last, p.dayMonthYear)}`
  if (first.getMonth() === last.getMonth()) return `${first.getDate()} – ${fmt(language, last, p.dayMonthYear)}`
  return `${fmt(language, first, p.dayMonth)} – ${fmt(language, last, p.dayMonthYear)}`
}
export const formatMonthYear = (language: Language, d: Date) => fmt(language, d, PATTERNS[language].monthYear)
export const formatFullDate = (language: Language, d: Date) => fmt(language, d, PATTERNS[language].fullDate)
export const formatWeekdayShort = (language: Language, d: Date) => fmt(language, d, 'EEE')
export const formatWeekdayLong = (language: Language, d: Date) => fmt(language, d, 'EEEE')
/** Iniciales de cabecera (índice = getDay(), domingo = 0). Tabla explícita: la convención española usa «X» para miércoles y el locale solo da «m». */
const NARROW_WEEKDAYS: Record<Language, readonly string[]> = {
  es: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}
export const formatWeekdayNarrow = (language: Language, d: Date) => NARROW_WEEKDAYS[language][d.getDay()]
export const formatTime = (d: Date) => format(d, TIME)
/** «dom 15 nov · 15:00». */
export const formatEventDateTime = (language: Language, d: Date) => `${fmt(language, d, 'EEE d MMM')} · ${formatTime(d)}`
/** Previsualización mientras se arrastra: «lun 09:30». */
export const formatDragPreview = (language: Language, d: Date) => `${fmt(language, d, 'EEE')} ${formatTime(d)}`
/** Los siete días de la semana (lunes primero) tomando `ref` como semana de referencia. */
export const weekdayRefs = (ref: Date = new Date()) => weekDays(ref, 'week')

/* ───────── Valores técnicos (NO dependen del idioma; son los de <input type=date|time>) ───────── */
export const toDateInput = (d: Date) => format(d, 'yyyy-MM-dd')
export const toTimeInput = (d: Date) => format(d, 'HH:mm')

/* ───────── Fechas relativas ───────── */
/** Días de CALENDARIO locales (no ms/86 400 000): robusto frente a los cambios de horario de verano. */
export const relativeDayOffset = (d: Date, ref: Date = new Date()) => differenceInCalendarDays(d, ref)

/** Etiqueta de calendario: «Hoy», «Mañana», «Ayer», «Dentro de N días», «Hace N días». `ref` permite pruebas deterministas. */
export function relativeDayLabel(language: Language, d: Date, ref: Date = new Date()): string {
  const n = relativeDayOffset(d, ref)
  const r = getCommon(language).relative
  if (n === 0) return r.today
  if (n === 1) return r.tomorrow
  if (n === -1) return r.yesterday
  return n > 0 ? r.inDays(n) : r.daysAgo(-n)
}

/** Comprobación EXACTA (instante), independiente de la etiqueta: un evento de esta mañana es «Hoy» y a la vez está vencido. */
export const hasPassed = (start: Date | string | number, now: Date | number = Date.now()) => +new Date(start) < +now
