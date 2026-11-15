import { describe, expect, it, vi } from 'vitest'
import { MemoryStorage, boot, legacyV0 } from './helpers'
import { COMMON, LANGUAGE_NAMES, PURPOSE_INFO, VOCAB, getCommon, getPurposeInfo, getVocab, plural } from '../lib/i18n'
import { LANGUAGES, PURPOSES } from '../lib/preferences'
import i18nSource from '../lib/i18n.ts?raw'

/** Recorre un objeto y devuelve las rutas de todos los textos vacíos. */
function emptyStrings(o: unknown, path = ''): string[] {
  if (typeof o === 'string') return o.trim() === '' ? [path] : []
  if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => emptyStrings(v, `${path}.${k}`))
  return []
}
/** Mismas claves (profundas) en es y en. */
function shape(o: unknown): unknown {
  if (typeof o === 'function') return 'fn'
  if (typeof o === 'string') return 'str'
  return Object.fromEntries(Object.entries(o as object).map(([k, v]) => [k, shape(v)]))
}

describe('terminología: idioma × propósito', () => {
  const expected = {
    es: {
      academic: { exam: 'Examen', assignment: 'Entrega', study: 'Sesión de estudio', subject: 'Asignatura' },
      productivity: { exam: 'Examen', assignment: 'Tarea', study: 'Bloque de concentración', subject: 'Área' },
    },
    en: {
      academic: { exam: 'Exam', assignment: 'Assignment', study: 'Study session', subject: 'Subject' },
      productivity: { exam: 'Exam', assignment: 'Task', study: 'Focus block', subject: 'Area' },
    },
  } as const
  for (const l of LANGUAGES) for (const p of PURPOSES) {
    it(`${l} × ${p}`, () => {
      const v = getVocab(l, p), e = expected[l][p]
      expect(v.kind).toEqual({ exam: e.exam, assignment: e.assignment, study: e.study })
      expect(v.subjectLabel).toBe(e.subject)
      expect(v.newKind.exam.toLowerCase()).toContain(e.exam.toLowerCase())
      expect(v.newKind.assignment.toLowerCase()).toContain(e.assignment.toLowerCase())
    })
  }
  it('un examen es examen y sigue accesible en ambos propósitos', () => {
    for (const l of LANGUAGES) for (const p of PURPOSES) {
      const v = getVocab(l, p)
      expect(v.kind.exam).toBe(l === 'es' ? 'Examen' : 'Exam')
      expect(v.nav.exams).toBeTruthy(); expect(v.filterChip.exam).toBeTruthy(); expect(v.newKind.exam).toBeTruthy()
    }
  })
  it('sin propósito (null) se mantiene el comportamiento académico en ambos idiomas', () => {
    for (const l of LANGUAGES) expect(getVocab(l, null)).toBe(getVocab(l, 'academic'))
  })
  it('inglés NO es español de sustitución: ningún texto inglés coincide con su equivalente español', () => {
    for (const p of PURPOSES) {
      const es = getVocab('es', p), en = getVocab('en', p)
      expect(en.kind.assignment).not.toBe(es.kind.assignment)
      expect(en.subjectLabel).not.toBe(es.subjectLabel)
      expect(en.studyPrompt.exam).not.toBe(es.studyPrompt.exam)
      expect(en.nav.subjectsEmpty).not.toBe(es.nav.subjectsEmpty)
    }
  })
})

describe('nombres y descripciones de propósito', () => {
  it('español', () => {
    expect(getPurposeInfo('es')).toEqual({
      academic: { name: 'Académico', description: 'Asignaturas, exámenes, entregas y sesiones de estudio.' },
      productivity: { name: 'Productividad', description: 'Áreas, tareas y bloques de concentración.' },
    })
  })
  it('inglés', () => {
    expect(getPurposeInfo('en')).toEqual({
      academic: { name: 'Academic', description: 'Subjects, exams, assignments and study sessions.' },
      productivity: { name: 'Productivity', description: 'Areas, tasks and focus blocks.' },
    })
  })
})

describe('integridad de los recursos', () => {
  it('es y en tienen exactamente la misma forma de claves', () => {
    expect(shape(VOCAB.es)).toEqual(shape(VOCAB.en))
    expect(shape(PURPOSE_INFO.es)).toEqual(shape(PURPOSE_INFO.en))
    expect(shape(COMMON.es)).toEqual(shape(COMMON.en))
  })
  it('no hay textos vacíos', () => {
    expect([...emptyStrings(VOCAB), ...emptyStrings(PURPOSE_INFO), ...emptyStrings(COMMON)]).toEqual([])
  })
  it('nombres nativos de idioma', () => expect(LANGUAGE_NAMES).toEqual({ es: 'Español', en: 'English' }))
  it('i18n.ts no importa el store en tiempo de ejecución (sin ciclo)', () => {
    const runtimeStoreImports = i18nSource.split('\n').filter((l) => /from '\.\.\/store'/.test(l) && !/^import type/.test(l))
    expect(runtimeStoreImports).toEqual([])
  })
})

describe('singular y plural', () => {
  it('plural() usa las reglas de cada idioma', () => {
    expect(plural('es', 1, { one: 'a', other: 'b' })).toBe('a')
    expect(plural('es', 2, { one: 'a', other: 'b' })).toBe('b')
    expect(plural('en', 1, { one: 'a', other: 'b' })).toBe('a')
    expect(plural('en', 0, { one: 'a', other: 'b' })).toBe('b')
  })
  it('ventana de avisos (días)', () => {
    expect(getVocab('es', 'academic').startup.exams(1)).toBe('Exámenes en el próximo día')
    expect(getVocab('es', 'academic').startup.exams(15)).toBe('Exámenes en los próximos 15 días')
    expect(getVocab('en', 'academic').startup.assignments(1)).toBe('Assignments in the next day')
    expect(getVocab('en', 'productivity').startup.assignments(30)).toBe('Tasks in the next 30 days')
  })
  it('descripción de «borrar eventos» según el recuento', () => {
    const es = getCommon('es').settings.clear.desc, en = getCommon('en').settings.clear.desc
    expect(es(0)).toBe('No hay eventos que borrar.')
    expect(es(1)).toBe('Elimina el único evento. No se puede deshacer.')
    expect(es(4)).toBe('Elimina los 4 eventos. No se puede deshacer.')
    expect(en(0)).toBe('There are no events to clear.')
    expect(en(1)).toBe("Removes the only event. This can't be undone.")
    expect(en(4)).toBe("Removes all 4 events. This can't be undone.")
  })
  it('funciones con parámetros', () => {
    expect(getCommon('es').settings.purpose.desc('Académico')).toContain('Académico')
    expect(getCommon('en').sidebar.purposeControl('Academic')).toBe('Purpose: Academic')
  })
})

const KEY = 'tempora-v1'
describe('persistencia de English', () => {
  it('sobrevive a una recarga bajo la misma clave y sin subir la versión', async () => {
    const storage = new MemoryStorage()
    const first = await boot(storage)
    first.useApp.getState().setPurpose('productivity')
    first.useApp.getState().setLanguage('en')
    expect(JSON.parse(storage.getItem(KEY)!)).toMatchObject({ version: 1, state: { language: 'en', purpose: 'productivity' } })
    const second = await boot(storage)
    expect(second.useApp.getState().language).toBe('en')
    expect(storage.keys()).toEqual([KEY])
  })
  it('el idioma inicial es es aunque el navegador diga otra cosa', async () => {
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US'] })
    const { useApp } = await boot(new MemoryStorage())
    expect(useApp.getState().language).toBe('es')
    vi.unstubAllGlobals()
  })
  it('PERSIST_VERSION sigue en 1 (el esquema no cambia)', async () => {
    expect((await import('../lib/preferences')).PERSIST_VERSION).toBe(1)
  })
})

describe('cambiar idioma conserva datos, Pomodoro y audio', () => {
  it('items, ids, linkedTo, fechas y notas idénticos; cascada intacta', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify(legacyV0))
    const { useApp } = await boot(storage)
    const before = structuredClone(useApp.getState().items)
    useApp.getState().setLanguage('en'); useApp.getState().setLanguage('es'); useApp.getState().setLanguage('en')
    expect(useApp.getState().items).toEqual(before)
    expect(useApp.getState().items.find((i) => i.id === 'study-1')?.linkedTo).toBe('exam-1')
    useApp.getState().removeItem('exam-1')
    expect(useApp.getState().items.map((i) => i.id)).toEqual(['asg-1'])
  })
  it('no toca mode, theme, notifications ni purpose', async () => {
    const storage = new MemoryStorage()
    storage.setItem(KEY, JSON.stringify(legacyV0))
    const { useApp } = await boot(storage)
    useApp.getState().setPurpose('academic')
    useApp.getState().setLanguage('en')
    const s = useApp.getState()
    expect([s.mode, s.theme, s.notifications, s.purpose]).toEqual(['dark', 'ruby', false, 'academic'])
  })
  it('no reinicia el Pomodoro ni el audio', async () => {
    const { useApp, usePomodoro, useAudio } = await boot(new MemoryStorage())
    usePomodoro.getState().start(); useAudio.getState().setPlaying(true); useAudio.getState().setVolume(41)
    const pomo = { ...usePomodoro.getState() }, audio = { ...useAudio.getState() }
    useApp.getState().setLanguage('en'); useApp.getState().setLanguage('es')
    expect(usePomodoro.getState()).toMatchObject({ running: true, endAt: pomo.endAt, remaining: pomo.remaining, phase: pomo.phase, sessions: pomo.sessions })
    expect(useAudio.getState()).toMatchObject({ playing: true, url: audio.url, preset: audio.preset, volume: 41 })
  })
})
