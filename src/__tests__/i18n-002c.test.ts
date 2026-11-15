// La zona horaria se fija ANTES de crear ninguna fecha: Europe/Madrid tiene transiciones de horario de verano conocidas.
declare const process: { env: Record<string, string | undefined> } // sin @types/node en el proyecto
process.env.TZ = 'Europe/Madrid'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryStorage, boot } from './helpers'
import {
  DATE_LOCALES, WEEK_STARTS_ON, formatDayHeading, formatDragPreview, formatEventDateTime, formatFullDate, formatMonthYear,
  formatTime, formatWeekRange, formatWeekdayLong, formatWeekdayNarrow, formatWeekdayShort, hasPassed, relativeDayLabel,
  relativeDayOffset, toDateInput, toTimeInput, weekDays, weekdayRefs,
} from '../lib/dates'
import { sampleEntries, timerNotice, welcomeNotice } from '../lib/i18n'
import { LANGUAGES, PURPOSES } from '../lib/preferences'
import hooksSource from '../lib/hooks.ts?raw'

const sources = import.meta.glob('../components/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('zona horaria del entorno de pruebas', () => {
  it('Europe/Madrid está activa (el caso de horario de verano no corre en UTC)', () => {
    expect(new Date(2026, 6, 1, 12).getTimezoneOffset()).toBe(-120) // verano (CEST)
    expect(new Date(2026, 0, 1, 12).getTimezoneOffset()).toBe(-60) // invierno (CET)
  })
})

describe('formatos de fecha', () => {
  const sun = new Date(2026, 10, 15, 15, 5) // domingo 15 nov 2026
  it('encabezado diario, mes/año y fecha completa', () => {
    expect(formatDayHeading('es', sun)).toBe('domingo, 15 de noviembre')
    expect(formatDayHeading('en', sun)).toBe('Sunday, 15 November')
    expect(formatMonthYear('es', sun)).toBe('noviembre 2026')
    expect(formatMonthYear('en', sun)).toBe('November 2026')
    expect(formatFullDate('es', sun)).toBe('domingo, 15 de noviembre de 2026')
    expect(formatFullDate('en', sun)).toBe('Sunday, 15 November 2026')
  })
  it('días de la semana: corto, largo y letra', () => {
    expect(formatWeekdayShort('es', sun)).toBe('dom'); expect(formatWeekdayShort('en', sun)).toBe('Sun')
    expect(formatWeekdayLong('es', sun)).toBe('domingo'); expect(formatWeekdayLong('en', sun)).toBe('Sunday')
  })
  it('hora de 24 h en ambos idiomas, también por la tarde', () => {
    for (const l of LANGUAGES) {
      expect(formatEventDateTime(l, sun)).toMatch(/15:05$/)
      expect(formatEventDateTime(l, sun)).not.toMatch(/PM|pm|p\. m\./)
    }
    expect(formatEventDateTime('es', sun)).toBe('dom 15 nov · 15:05')
    expect(formatEventDateTime('en', sun)).toBe('Sun 15 Nov · 15:05')
    expect(formatTime(new Date(2026, 10, 15, 0, 7))).toBe('00:07')
  })
  it('previsualización de arrastre', () => {
    expect(formatDragPreview('es', new Date(2026, 10, 16, 9, 30))).toBe('lun 09:30')
    expect(formatDragPreview('en', new Date(2026, 10, 16, 9, 30))).toBe('Mon 09:30')
  })
  it('la semana empieza en lunes en ambos idiomas', () => {
    expect(WEEK_STARTS_ON).toBe(1)
    const days = weekDays(sun, 'week') // el domingo 15 pertenece a la semana del lunes 9
    expect(days.map((d) => d.getDate())).toEqual([9, 10, 11, 12, 13, 14, 15])
    for (const l of LANGUAGES) expect(formatWeekdayLong(l, days[0]).toLowerCase()).toBe(l === 'es' ? 'lunes' : 'monday')
    expect(weekdayRefs().map((d) => formatWeekdayNarrow('es', d))).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
    expect(weekdayRefs().map((d) => formatWeekdayNarrow('en', d))).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })
  it('intervalo semanal, incluido cruce de mes y de año', () => {
    expect(formatWeekRange('es', new Date(2026, 10, 9), new Date(2026, 10, 15))).toBe('9 – 15 nov 2026')
    expect(formatWeekRange('en', new Date(2026, 10, 9), new Date(2026, 10, 15))).toBe('9 – 15 Nov 2026')
    expect(formatWeekRange('es', new Date(2026, 9, 26), new Date(2026, 10, 1))).toBe('26 oct – 1 nov 2026')
    expect(formatWeekRange('en', new Date(2026, 9, 26), new Date(2026, 10, 1))).toBe('26 Oct – 1 Nov 2026')
    expect(formatWeekRange('es', new Date(2026, 11, 28), new Date(2027, 0, 3))).toBe('28 dic 2026 – 3 ene 2027')
    expect(formatWeekRange('en', new Date(2026, 11, 28), new Date(2027, 0, 3))).toBe('28 Dec 2026 – 3 Jan 2027')
  })
  it('un mapa de locales tipado: es y en distintos, sin locale global', () => {
    expect(DATE_LOCALES.es.code).toBe('es'); expect(DATE_LOCALES.en.code).toBe('en-GB')
  })
  it('valores técnicos de inputs no dependen del idioma', () => {
    const d = new Date(2026, 10, 5, 7, 3)
    expect(toDateInput(d)).toBe('2026-11-05'); expect(toTimeInput(d)).toBe('07:03')
  })
})

describe('fechas relativas', () => {
  const ref = new Date(2026, 10, 15, 12, 0)
  const at = (days: number, h = 12) => new Date(2026, 10, 15 + days, h, 0)
  it('ayer, hoy, mañana y varios días en ambos idiomas', () => {
    expect([-1, 0, 1].map((n) => relativeDayLabel('es', at(n), ref))).toEqual(['Ayer', 'Hoy', 'Mañana'])
    expect([-1, 0, 1].map((n) => relativeDayLabel('en', at(n), ref))).toEqual(['Yesterday', 'Today', 'Tomorrow'])
    expect(relativeDayLabel('es', at(5), ref)).toBe('Dentro de 5 días'); expect(relativeDayLabel('es', at(-5), ref)).toBe('Hace 5 días')
    expect(relativeDayLabel('en', at(5), ref)).toBe('In 5 days'); expect(relativeDayLabel('en', at(-5), ref)).toBe('5 days ago')
  })
  it('cruce de mes y de año', () => {
    expect(relativeDayLabel('es', new Date(2026, 11, 1, 9), new Date(2026, 10, 30, 23, 59))).toBe('Mañana')
    expect(relativeDayLabel('en', new Date(2027, 0, 3, 9), new Date(2026, 11, 31, 8))).toBe('In 3 days')
    expect(relativeDayLabel('es', new Date(2026, 11, 29, 9), new Date(2027, 0, 2, 8))).toBe('Hace 4 días')
  })
  it('«Hoy» y vencido son comprobaciones independientes', () => {
    const morning = at(0, 8), evening = at(0, 18)
    expect(relativeDayLabel('es', morning, ref)).toBe('Hoy'); expect(hasPassed(morning, ref)).toBe(true)
    expect(relativeDayLabel('es', evening, ref)).toBe('Hoy'); expect(hasPassed(evening, ref)).toBe(false)
    expect(hasPassed(ref, ref)).toBe(false) // el instante exacto aún no ha pasado (misma regla que `upcoming`)
  })
  it('horario de verano (Europe/Madrid): se cuentan días de calendario, no ms/24 h', () => {
    // 29-mar-2026: salto a CEST, el día dura 23 h. Entre las 00:30 del 29 y las 00:10 del 30 pasan 23 h 40 min (< 24 h) pero es «mañana».
    const a = new Date(2026, 2, 29, 0, 30), b = new Date(2026, 2, 30, 0, 10)
    expect((+b - +a) / 864e5).toBeLessThan(1)
    expect(relativeDayOffset(b, a)).toBe(1); expect(relativeDayLabel('es', b, a)).toBe('Mañana')
    // 25-oct-2026: fin de CEST, el día dura 25 h. Las 23:30 del 25 → 00:10 del 26 son 25 h 40 min… pero también «mañana».
    const c = new Date(2026, 9, 24, 23, 30), d = new Date(2026, 9, 26, 0, 10)
    expect(relativeDayOffset(d, c)).toBe(2)
    expect(relativeDayLabel('en', new Date(2026, 9, 26, 0, 10), new Date(2026, 9, 25, 23, 30))).toBe('Tomorrow')
  })
})

describe('avisos de bienvenida (idioma × propósito, cantidades 0/1/2)', () => {
  const c = (exams: number, assignments: number) => ({ exams, examDays: 15, assignments, assignmentDays: 30 })
  it('español + académico', () => {
    expect(welcomeNotice('es', 'academic', c(0, 1)).body).toBe('Sin exámenes en los próximos 15 días. 1 entrega en los próximos 30 días.')
    expect(welcomeNotice('es', 'academic', c(1, 2)).body).toBe('1 examen en los próximos 15 días. 2 entregas en los próximos 30 días.')
    expect(welcomeNotice('es', 'academic', c(2, 0)).body).toBe('2 exámenes en los próximos 15 días. Sin entregas en los próximos 30 días.')
  })
  it('español + productividad', () => {
    expect(welcomeNotice('es', 'productivity', c(1, 2)).body).toBe('1 examen en los próximos 15 días. 2 tareas en los próximos 30 días.')
    expect(welcomeNotice('es', 'productivity', c(0, 1)).body).toContain('1 tarea en')
  })
  it('English + Academic', () => {
    expect(welcomeNotice('en', 'academic', c(0, 1)).body).toBe('No exams in the next 15 days. 1 assignment in the next 30 days.')
    expect(welcomeNotice('en', 'academic', c(2, 2)).body).toBe('2 exams in the next 15 days. 2 assignments in the next 30 days.')
  })
  it('English + Productivity', () => {
    expect(welcomeNotice('en', 'productivity', c(1, 0)).body).toBe('1 exam in the next 15 days. No tasks in the next 30 days.')
    expect(welcomeNotice('en', 'productivity', c(1, 2)).body).toContain('2 tasks')
  })
  it('título por idioma; el propósito null usa el vocabulario académico', () => {
    expect(welcomeNotice('es', 'academic', c(1, 0)).title).toBe('Tempora — aviso')
    expect(welcomeNotice('en', 'academic', c(1, 0)).title).toBe('Tempora — heads up')
    expect(welcomeNotice('en', null, c(0, 1)).body).toContain('assignment')
  })
})

describe('avisos del temporizador', () => {
  it('fin de concentración: descanso corto o largo, en cada idioma', () => {
    expect(timerNotice('es', 'focus', 'short')).toEqual({ title: 'Sesión de enfoque completada', body: 'Buen trabajo. Toca un descanso corto.' })
    expect(timerNotice('es', 'focus', 'long').body).toBe('Buen trabajo. Toca un descanso largo.')
    expect(timerNotice('en', 'focus', 'short')).toEqual({ title: 'Focus session complete', body: 'Nice work. Time for a short break.' })
    expect(timerNotice('en', 'focus', 'long').body).toBe('Nice work. Time for a long break.')
  })
  it('fin de descanso (corto y largo)', () => {
    for (const f of ['short', 'long'] as const) {
      expect(timerNotice('es', f, 'focus')).toEqual({ title: 'El descanso ha terminado', body: '¿Listo para otra sesión de enfoque?' })
      expect(timerNotice('en', f, 'focus')).toEqual({ title: 'Break is over', body: 'Ready for another focus session?' })
    }
  })
})

describe('emisión real: idioma vigente al emitir, sin duplicados ni cambios de endAt', () => {
  async function setup() {
    vi.resetModules()
    const notify = vi.fn().mockResolvedValue(undefined)
    vi.doMock('../lib/notify', () => ({ notify }))
    const store = await boot(new MemoryStorage())
    store.useApp.setState({ notifications: true })
    return { notify, ...store }
  }
  it('el aviso sale en el idioma activo al terminar, no en el del arranque', async () => {
    const { notify, useApp, usePomodoro } = await setup()
    useApp.getState().setLanguage('en')
    usePomodoro.getState().start()
    const endAt = usePomodoro.getState().endAt
    useApp.getState().setLanguage('es') // cambia a mitad de sesión
    expect(usePomodoro.getState().endAt).toBe(endAt); expect(usePomodoro.getState().running).toBe(true)
    expect(notify).not.toHaveBeenCalled() // cambiar idioma no emite nada
    usePomodoro.setState({ endAt: Date.now() - 1000 })
    usePomodoro.getState().tick()
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith('Sesión de enfoque completada', 'Buen trabajo. Toca un descanso corto.')
    usePomodoro.getState().tick(); useApp.getState().setLanguage('en'); usePomodoro.getState().tick()
    expect(notify).toHaveBeenCalledTimes(1) // ni duplicado al seguir ticando ni al volver a cambiar de idioma
    expect(usePomodoro.getState().sessions).toBe(1)
  })
  it('con las notificaciones desactivadas no se emite nada', async () => {
    const { notify, useApp, usePomodoro } = await setup()
    useApp.setState({ notifications: false })
    usePomodoro.getState().start(); usePomodoro.setState({ endAt: Date.now() - 1 }); usePomodoro.getState().tick()
    expect(notify).not.toHaveBeenCalled()
  })
  it('descanso largo tras 4 sesiones, en inglés', async () => {
    const { notify, useApp, usePomodoro } = await setup()
    useApp.getState().setLanguage('en')
    usePomodoro.setState({ sessions: 3, running: true, endAt: Date.now() - 1, phase: 'focus' })
    usePomodoro.getState().tick()
    expect(notify).toHaveBeenCalledWith('Focus session complete', 'Nice work. Time for a long break.')
  })
  it('datos de ejemplo en el idioma vigente, sin tocar los ya guardados', async () => {
    const { useApp } = await setup()
    useApp.getState().setLanguage('es')
    const before = useApp.getState().items.length
    useApp.getState().loadSample()
    const after = useApp.getState().items
    expect(after.length).toBe(before + sampleEntries('es').length)
    expect(after.some((i) => i.subject === 'Bases de datos')).toBe(true)
    useApp.getState().setLanguage('en')
    expect(useApp.getState().items.some((i) => i.subject === 'Bases de datos')).toBe(true) // cambiar idioma no reescribe eventos
  })
})

describe('«upcoming» conserva sus ventanas y reglas', () => {
  it('excluye vencidos y lo que supera 15/30 días', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 15, 12))
    const { upcoming } = await import('../lib/hooks')
    const mk = (id: string, kind: 'exam' | 'assignment', start: Date) => ({ id, kind, subject: id, start: start.toISOString(), duration: 60, notes: '' })
    const r = upcoming([
      mk('past-today', 'exam', new Date(2026, 10, 15, 8)), mk('later-today', 'exam', new Date(2026, 10, 15, 18)),
      mk('e15', 'exam', new Date(2026, 10, 30, 12)), mk('e16', 'exam', new Date(2026, 11, 1, 12)),
      mk('a30', 'assignment', new Date(2026, 11, 15, 12)), mk('a31', 'assignment', new Date(2026, 11, 16, 12)),
    ])
    expect(r.exams.map((i) => i.id)).toEqual(['later-today', 'e15'])
    expect(r.assignments.map((i) => i.id)).toEqual(['a30'])
  })
})

describe('guardas estáticas', () => {
  it('el efecto de bienvenida no depende del idioma ni lo captura fuera del momento de emitir', () => {
    expect(hooksSource).not.toMatch(/\[[^\]]*language[^\]]*\]\)/)
    expect(hooksSource).toMatch(/welcomeNotice\(app\.language, app\.purpose/)
  })
  it('ningún componente formatea fechas con patrones dependientes del idioma ni con relDays', () => {
    for (const [file, src] of Object.entries(sources)) {
      expect(src, file).not.toMatch(/relDays/)
      expect(src, file).not.toMatch(/from 'date-fns'[^\n]*\bformat\b|\bformat\(/)
      expect(src, file).not.toMatch(/\b(EEE|EEEE|MMM|MMMM)\b/)
      expect(src, file).not.toMatch(/\['M', 'T', 'W'/)
    }
  })
  it('todas las combinaciones tienen sample y avisos', () => {
    for (const l of LANGUAGES) for (const p of PURPOSES) expect(welcomeNotice(l, p, { exams: 1, examDays: 15, assignments: 1, assignmentDays: 30 }).body.length).toBeGreaterThan(10)
    for (const l of LANGUAGES) expect(sampleEntries(l).length).toBe(6)
  })
})
