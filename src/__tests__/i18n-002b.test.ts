import { describe, expect, it } from 'vitest'
import { COMMON, formErrorText, getCommon, getVocab, type FormError } from '../lib/i18n'
import { LANGUAGES, PURPOSES } from '../lib/preferences'
import { PHASES, PRESETS } from '../store'

const sources = import.meta.glob('../components/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('errores tipados: se resuelven al renderizar, en el idioma activo', () => {
  const errors: FormError[] = [
    { code: 'subjectRequired' }, { code: 'invalidDateTime' },
    { code: 'sessionMustEndBefore', kind: 'exam' }, { code: 'sessionMustEndBefore', kind: 'assignment' },
  ]
  for (const l of LANGUAGES) for (const p of PURPOSES) for (const e of errors) {
    it(`${l} × ${p} × ${e.code}${'kind' in e ? ':' + e.kind : ''}`, () => {
      const text = formErrorText(l, p, e)
      expect(text.trim()).not.toBe('')
      expect(text).not.toMatch(/undefined|\[object/)
    })
  }
  it('el mismo código da textos distintos según el idioma (cambio instantáneo)', () => {
    for (const e of errors) expect(formErrorText('es', 'academic', e)).not.toBe(formErrorText('en', 'academic', e))
  })
  it('el texto depende del propósito cuando el vocabulario cambia', () => {
    expect(formErrorText('en', 'productivity', { code: 'subjectRequired' })).toBe('Give it an area name.')
    expect(formErrorText('en', 'academic', { code: 'subjectRequired' })).toBe('Give it a subject name.')
  })
  it('un error es un dato serializable, no una frase', () => {
    for (const e of errors) expect(JSON.parse(JSON.stringify(e))).toEqual(e)
  })
})

describe('singular / plural', () => {
  it('sesiones completadas (es)', () => {
    const t = COMMON.es.timer
    expect(t.sessionsDone(0)).toBe('0 completadas'); expect(t.sessionsDone(1)).toBe('1 completada'); expect(t.sessionsDone(2)).toBe('2 completadas')
    expect(t.sessionsDoneLabel(1)).toBe('1 sesión de enfoque completada'); expect(t.sessionsDoneLabel(3)).toBe('3 sesiones de enfoque completadas')
  })
  it('sesiones completadas (en)', () => {
    const t = COMMON.en.timer
    expect(t.sessionsDone(1)).toBe('1 done'); expect(t.sessionsDone(5)).toBe('5 done')
    expect(t.sessionsDoneLabel(1)).toBe('1 focus session completed'); expect(t.sessionsDoneLabel(2)).toBe('2 focus sessions completed')
  })
  for (const l of LANGUAGES) for (const p of PURPOSES) {
    it(`deleteWithSessions ${l} × ${p}: singular ≠ plural y el plural lleva el número`, () => {
      const v = getVocab(l, p)
      expect(v.deleteWithSessions(1)).not.toBe(v.deleteWithSessions(3))
      expect(v.deleteWithSessions(3)).toContain('3')
      expect(v.deleteWithSessions(1)).not.toMatch(/\b1\b/)
    })
  }
})

describe('cobertura de las 4 combinaciones idioma × propósito', () => {
  for (const l of LANGUAGES) for (const p of PURPOSES) {
    it(`${l} × ${p}: claves nuevas rellenas`, () => {
      const v = getVocab(l, p)
      for (const s of [v.placeSession, v.sessionDateLabel, v.sessionTimeLabel, v.removeSession, v.errors.subjectRequired, v.errors.sessionMustEndBefore.exam, v.errors.sessionMustEndBefore.assignment])
        expect(s.trim()).not.toBe('')
    })
  }
  for (const l of LANGUAGES) {
    it(`${l}: temas, fases y presets cubren todos los IDs del store`, () => {
      const c = getCommon(l)
      for (const id of Object.keys(PHASES)) expect(c.timer.phases[id as keyof typeof PHASES].trim()).not.toBe('')
      for (const p of PRESETS) expect(c.audio.presets[p.id].trim()).not.toBe('')
      for (const n of ['ruby', 'agate', 'diamond', 'antimatter'] as const) expect(c.themes.names[n].name.trim()).not.toBe('')
    })
  }
  it('IDs, duraciones y URLs de PHASES/PRESETS no se tocan', () => {
    expect(PRESETS.map((p) => p.id)).toEqual(['lofi', 'white', 'alpha'])
    expect(PHASES.focus.secs).toBe(25 * 60)
  })
})

describe('guarda estática: sin textos de interfaz sueltos en componentes', () => {
  const files = Object.entries(sources).filter(([f]) => !/\/(ui|PurposeDialog)\.tsx$/.test(f))
  const attrs = /\b(aria-label|aria-description|placeholder|title|alt)="[^"{]*[A-Za-zÁ-ú][^"]*"/g
  for (const [file, src] of files) {
    it(`${file.split('/').pop()}: sin atributos accesibles literales`, () => {
      expect(src.match(attrs) ?? []).toEqual([])
    })
  }
  it('los textos visibles antiguos ya no aparecen como literales', () => {
    const old = ['Plan. Focus. Pass.', 'All events', 'Theme Customization', 'Schedule prep', 'Not now', 'Add to calendar', 'Welcome back', 'Got it', 'Focus audio', 'Now playing', 'Pick a valid date', 'Give it a subject name', 'Click a time slot', 'Previous month', 'Short break', "Can't play this source"]
    const all = files.map(([, s]) => s).join('\n')
    for (const t of old) expect(all, t).not.toContain(t)
  })
  it('el idioma no se usa como key, ni como dependencia de efectos de inicialización', () => {
    for (const [file, src] of Object.entries(sources)) {
      expect(src, file).not.toMatch(/key=\{[^}]*language/)
      expect(src, file).not.toMatch(/useEffect\([^]*?\},\s*\[[^\]]*language[^\]]*\]\)/)
    }
  })
})
