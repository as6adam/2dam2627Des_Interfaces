/**
 * TEMPORA-WEB-003C: lógica de distribución adaptable que SÍ se puede verificar en node (sin DOM):
 * funciones puras, estado, sincronía de puntos de ruptura y guardas estáticas de continuidad.
 * El comportamiento visual y de gestos se verificó en Chromium (ver informe); aquí no se prueban clases CSS sueltas.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BREAKPOINTS, MEDIA } from '../lib/layout'
import { validateReschedule } from '../lib/schedule'
import { viewportVars } from '../lib/viewport'
import { COMMON, formErrorText } from '../lib/i18n'
import { MemoryStorage, boot } from './helpers'
import tailwindSource from '../../tailwind.config.js?raw'
// La aplicación vive en app/index.html (la raíz es la landing, 004A): estas comprobaciones siguen apuntando a la entrada de Tempora.
import indexHtml from '../../app/index.html?raw'
import appSource from '../App.tsx?raw'
import panelsSource from '../components/Panels.tsx?raw'
import calendarSource from '../components/CalendarView.tsx?raw'
import cardSource from '../components/EventCard.tsx?raw'
import popoverSource from '../components/ItemPopover.tsx?raw'
import type { Item } from '../store'

// Vitest no entrega el CSS crudo con ?raw: se lee el fichero (declaración mínima de node:fs en ./node-fs.d.ts, sin @types/node).
import { readFileSync } from 'node:fs'
const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

const it0 = (o: Partial<Item> & Pick<Item, 'id' | 'kind' | 'start'>): Item => ({ subject: 'Bases de datos', duration: 60, notes: '', ...o })
const iso = (s: string) => new Date(s).toISOString()

afterEach(() => vi.unstubAllGlobals())

describe('puntos de ruptura: una sola fuente', () => {
  it('Tailwind y lib/layout.ts usan las mismas cifras (md, lg, wide)', () => {
    const screens = /screens:\s*\{([^}]*)\}/.exec(tailwindSource)![1]
    const px = (name: string) => Number(new RegExp(`${name}:\\s*'(\\d+)px'`).exec(screens)![1])
    expect(px('md')).toBe(BREAKPOINTS.tablet)
    expect(px('lg')).toBe(BREAKPOINTS.focusDock)
    expect(px('wide')).toBe(BREAKPOINTS.navDock)
  })
  it('las media queries de JS salen de los mismos valores (móvil = justo por debajo de md)', () => {
    expect(MEDIA.mobile).toBe('(max-width: 767.98px)')
    expect(MEDIA.focusDocked).toBe('(min-width: 1024px)')
    expect(MEDIA.navDocked).toBe('(min-width: 1200px)')
  })
  it('con tres áreas fijas el calendario conserva al menos 588 px (264 + 300 + 2×12 de huecos y 2×12 de márgenes)', () => {
    expect(BREAKPOINTS.navDock - 264 - 300 - 2 * 12 - 2 * 12).toBeGreaterThanOrEqual(588)
  })
})

describe('reglas al cambiar fecha/hora (formulario y arrastre comparten validateReschedule)', () => {
  const items: Item[] = [
    it0({ id: 'exam', kind: 'exam', start: iso('2026-12-10T10:00:00Z'), duration: 90 }),
    it0({ id: 's1', kind: 'study', start: iso('2026-12-09T17:00:00Z'), duration: 60, linkedTo: 'exam' }),
    it0({ id: 'solo', kind: 'assignment', start: iso('2026-12-01T09:00:00Z') }),
  ]
  it('una sesión puede moverse mientras TERMINE antes del examen', () => {
    expect(validateReschedule(items, 's1', new Date('2026-12-10T08:59:00Z'))).toBeNull()
  })
  it('una sesión que acabaría después de empezar el examen se rechaza (el límite exacto vale)', () => {
    expect(validateReschedule(items, 's1', new Date('2026-12-10T09:00:00Z'))).toBeNull() // termina justo cuando empieza
    expect(validateReschedule(items, 's1', new Date('2026-12-10T09:01:00Z'))).toEqual({ code: 'sessionMustEndBefore', kind: 'exam' })
  })
  it('un examen con sesiones no puede empezar antes de que termine la última', () => {
    expect(validateReschedule(items, 'exam', new Date('2026-12-09T17:30:00Z'))).toEqual({ code: 'dueBeforeSessions', kind: 'exam' })
    expect(validateReschedule(items, 'exam', new Date('2026-12-09T18:00:00Z'))).toBeNull()
  })
  it('un elemento sin vínculos se mueve libremente; una fecha inválida se rechaza', () => {
    expect(validateReschedule(items, 'solo', new Date('2020-01-01T00:00:00Z'))).toBeNull()
    expect(validateReschedule(items, 'solo', new Date('no-es-fecha'))).toEqual({ code: 'invalidDateTime' })
  })
  it('un id inexistente no produce error (nada que validar)', () => {
    expect(validateReschedule(items, 'fantasma', new Date())).toBeNull()
  })
  it('los errores nuevos tienen texto en ambos idiomas y propósitos', () => {
    for (const language of ['es', 'en'] as const) for (const purpose of ['academic', 'productivity'] as const) for (const kind of ['exam', 'assignment'] as const) {
      const text = formErrorText(language, purpose, { code: 'dueBeforeSessions', kind })
      expect(text.length).toBeGreaterThan(10)
    }
    expect(formErrorText('es', 'academic', { code: 'dueBeforeSessions', kind: 'exam' })).not.toBe(formErrorText('en', 'academic', { code: 'dueBeforeSessions', kind: 'exam' }))
    expect(formErrorText('es', 'academic', { code: 'dueBeforeSessions', kind: 'exam' })).toMatch(/sesiones de estudio/)
    expect(formErrorText('es', 'productivity', { code: 'dueBeforeSessions', kind: 'exam' })).toMatch(/bloques de concentración/)
  })
})

describe('mover un elemento conserva ID, tipo y relaciones (store real)', () => {
  it('updateItem(start) no toca nada más', async () => {
    const { useApp } = await boot(new MemoryStorage())
    const parent = useApp.getState().addItem({ kind: 'exam', subject: 'Redes', start: iso('2026-12-10T10:00:00Z'), duration: 90, notes: 'n' })
    const child = useApp.getState().addItem({ kind: 'study', subject: 'Redes', start: iso('2026-12-09T17:00:00Z'), duration: 60, notes: '', linkedTo: parent })
    const before = useApp.getState().items.find((i) => i.id === child)!
    useApp.getState().updateItem(child, { start: iso('2026-12-09T15:00:00Z') })
    const after = useApp.getState().items.find((i) => i.id === child)!
    expect({ ...after, start: '' }).toEqual({ ...before, start: '' })
    expect(after.start).toBe(iso('2026-12-09T15:00:00Z'))
    expect(useApp.getState().items).toHaveLength(2)
  })
})

describe('viewport visual (teclado virtual)', () => {
  it('sin teclado (barras del navegador) no se sobrescribe la altura', () => {
    expect(viewportVars(800, { height: 760, offsetTop: 0, scale: 1 })).toBeNull()
  })
  it('con teclado abierto se usa la altura y el desplazamiento del viewport visual', () => {
    expect(viewportVars(800, { height: 420, offsetTop: 0, scale: 1 })).toEqual({ height: 420, top: 0 })
    expect(viewportVars(800, { height: 400.4, offsetTop: 36.2, scale: 1 })).toEqual({ height: 400, top: 36 })
  })
  it('si el usuario ha ampliado (zoom) no se interfiere: el zoom nunca se bloquea ni se «corrige»', () => {
    expect(viewportVars(800, { height: 300, offsetTop: 0, scale: 2 })).toBeNull()
  })
  it('sin visualViewport devuelve null (se usa el fallback dvh)', () => {
    expect(viewportVars(800, null)).toBeNull()
  })
})

describe('vista inicial: solo al arrancar y nunca forzada después', () => {
  it('móvil → día; escritorio → semana; sin matchMedia (node) → semana', async () => {
    const fakeWindow = (mobile: boolean) => ({ matchMedia: (q: string) => ({ matches: mobile && q === MEDIA.mobile, addEventListener() {}, removeEventListener() {} }) })
    vi.stubGlobal('window', fakeWindow(true))
    expect((await boot(new MemoryStorage())).useUI.getState().view).toBe('day')
    vi.stubGlobal('window', fakeWindow(false))
    expect((await boot(new MemoryStorage())).useUI.getState().view).toBe('week')
    vi.unstubAllGlobals()
    expect((await boot(new MemoryStorage())).useUI.getState().view).toBe('week')
  })
  it('la elección del usuario no se anula: ningún efecto escribe `view` salvo los botones de vista y el clic en un día', () => {
    const writes = [...(calendarSource + panelsSource + appSource + cardSource).matchAll(/setState\(\{[^}]*\bview:[^}]*\}\)/g)].map((m) => m[0])
    expect(writes).toHaveLength(2) // selector Semana/Día y cabecera de día → vista diaria (acciones del usuario)
    for (const w of writes) expect(w).toMatch(/view: (id|'day')/)
    expect(appSource).not.toMatch(/view:/) // ningún efecto global de App la toca
  })
})

describe('los paneles son estado de PRESENTACIÓN', () => {
  it('abrir y cerrar paneles no se persiste ni toca datos, Pomodoro ni audio', async () => {
    const storage = new MemoryStorage()
    const m = await boot(storage)
    m.useApp.getState().setPurpose('academic')
    const snapshot = JSON.stringify([m.useApp.getState().items, m.usePomodoro.getState(), { ...m.useAudio.getState() }])
    const stored = storage.getItem('tempora-v1')
    const audioStored = storage.getItem('tempora-audio')
    m.useUI.setState({ panel: 'nav' }); m.useUI.setState({ panel: 'focus' }); m.useUI.setState({ panel: null })
    expect(JSON.stringify([m.useApp.getState().items, m.usePomodoro.getState(), { ...m.useAudio.getState() }])).toBe(snapshot)
    expect(storage.getItem('tempora-v1')).toBe(stored)
    expect(storage.getItem('tempora-audio')).toBe(audioStored)
    expect(storage.keys().sort()).toEqual(['tempora-audio', 'tempora-v1'].filter((k) => storage.keys().includes(k)).sort())
  })
  it('el temporizador en marcha conserva endAt y sesiones al alternar paneles', async () => {
    const m = await boot(new MemoryStorage())
    m.usePomodoro.getState().start()
    const { endAt, sessions } = m.usePomodoro.getState()
    for (const p of ['nav', 'focus', null] as const) m.useUI.setState({ panel: p })
    expect(m.usePomodoro.getState().endAt).toBe(endAt)
    expect(m.usePomodoro.getState().sessions).toBe(sessions)
    expect(m.usePomodoro.getState().running).toBe(true)
  })
})

describe('guardas estáticas de continuidad (no remontar AudioEngine ni el panel)', () => {
  const count = (src: string, re: RegExp) => (src.match(re) ?? []).length
  it('App monta una sola vez AudioEngine, Sidebar, CalendarView y RightPanel, y no ramifica la estructura por tamaño', () => {
    for (const c of ['AudioEngine', 'Sidebar', 'CalendarView', 'RightPanel', 'MobileBar']) expect(count(appSource, new RegExp(`<${c} />`, 'g'))).toBe(1)
    expect(appSource).not.toMatch(/useLayout|useMedia/) // la estructura es única; solo las clases y el estado de los paneles cambian
  })
  it('AudioEngine vive fuera de los paneles y del contenedor inerte', () => {
    expect(appSource.indexOf('<AudioEngine />')).toBeLessThan(appSource.indexOf('app-shell'))
  })
  it('PanelShell nunca desmonta ni duplica su contenido', () => {
    expect(count(panelsSource, /\{children\}/g)).toBe(1)
    expect(panelsSource).not.toMatch(/docked\s*\?\s*<|open\s*&&\s*children/)
  })
  it('un panel cerrado es inerte y NO es role="dialog" (no bloquea el resumen de bienvenida, que espera a que no haya diálogos)', () => {
    expect(panelsSource).toMatch(/role=\{modal \? 'dialog' : undefined\}/)
    expect(panelsSource).toMatch(/hidden \? \{ inert: '' \}/)
  })
  it('el detalle del evento usa la gestión de foco compartida (foco inicial, Escape, restauración)', () => {
    expect(popoverSource).toMatch(/useDialogBehavior\(dialogRef/)
  })
  it('la barra inferior ocupa su sitio en el flujo (sin position: fixed/absolute encima del calendario)', () => {
    const bar = /export function MobileBar\(\) \{[\s\S]*$/.exec(panelsSource)![0]
    expect(bar).not.toMatch(/\bfixed\b|\babsolute\b/)
  })
})

describe('zoom y viewport', () => {
  it('no se bloquea el zoom del navegador', () => {
    expect(indexHtml).not.toMatch(/maximum-scale|user-scalable/i)
    expect(indexHtml).toMatch(/viewport-fit=cover/)
  })
  it('las unidades dvh llevan fallback (declaración previa o @supports) y las áreas seguras se declaran tras un valor sin env()', () => {
    expect(cssSource).toMatch(/#root \{ height: 100vh;/)
    expect(cssSource).toMatch(/@supports \(height: 100dvh\)/)
    expect(cssSource).toMatch(/\.app-shell \{ padding: \.75rem; padding: max\(/)
    expect(cssSource).not.toMatch(/user-scalable|touch-action:\s*none/) // el calendario no desactiva gestos del navegador
  })
  it('el texto no se fija en px en el contenedor raíz (escala con el ajuste del usuario)', () => {
    expect(cssSource).not.toMatch(/html\s*\{[^}]*font-size:\s*\d+px/)
  })
})

describe('textos nuevos en español e inglés', () => {
  const pick = (c: (typeof COMMON)['es']) => ({
    layout: { ...c.layout, running: c.layout.running('12:34') },
    scroll: [c.calendar.scrollHint, c.calendar.regionLabel.week, c.calendar.regionLabel.day, c.calendar.dragReady],
    reschedule: [c.popover.reschedule, c.popover.rescheduleLabel('X'), c.popover.touchMoveHint, c.itemModal.rescheduleTitle, c.itemModal.rescheduleIntro, c.itemModal.newDate, c.itemModal.newTime, c.itemModal.currently, c.itemModal.save, c.sidebar.navLabel],
  })
  it('existen y difieren entre idiomas', () => {
    const es = pick(COMMON.es), en = pick(COMMON.en)
    const flat = (o: unknown): string[] => (typeof o === 'string' ? [o] : Object.values(o as object).flatMap(flat))
    const a = flat(es), b = flat(en)
    expect(a.length).toBe(b.length)
    a.forEach((t, i) => { expect(t.trim().length).toBeGreaterThan(1); expect(b[i].trim().length).toBeGreaterThan(1) })
    expect(a.filter((t, i) => t === b[i] && t.length > 5)).toEqual([]) // nada sin traducir
  })
})
