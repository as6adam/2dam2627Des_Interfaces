import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays } from 'date-fns'
import { BackupError, EMPTY_PROGRESS, createBackup, importPreview, makeStudyPlan, mergeBackup, parseBackup, planStillFits, statistics } from '../lib/advanced'
import { DEFAULT_PERSISTED } from '../lib/preferences'
import type { Item } from '../store'
import { MemoryStorage } from './helpers'

const now = new Date(2028, 0, 3, 9)
const exam: Item = { id: 'exam', kind: 'exam', subject: 'Redes', start: new Date(2028, 0, 10, 9).toISOString(), duration: 90, notes: '' }
const options = { count: 4, duration: 60, from: '2028-01-03', startHour: 16, endHour: 20, weekdaysOnly: false }
const backup = () => createBackup({ ...DEFAULT_PERSISTED, purpose: 'academic', items: [exam] }, EMPTY_PROGRESS, now)

describe('planificación automática', () => {
  it('reparte las sesiones en varios días, antes de la fecha límite y sin modificar los eventos', () => {
    const items = [exam]; const before = JSON.stringify(items)
    const plan = makeStudyPlan(items, exam.id, options, now)
    expect(plan).toHaveLength(4)
    expect(new Set(plan.map((i) => new Date(i.start).getDate())).size).toBe(4)
    expect(planStillFits(items, exam.id, plan, now)).toBe(true)
    expect(plan.every((i) => i.linkedTo === exam.id && Date.parse(i.start) + i.duration * 60000 <= Date.parse(exam.start))).toBe(true)
    expect(JSON.stringify(items)).toBe(before)
  })
  it('evita eventos existentes y los nuevos huecos que ya han sido propuestos', () => {
    const blocked: Item = { ...exam, id: 'busy', start: new Date(2028, 0, 3, 16).toISOString(), duration: 120 }
    const plan = makeStudyPlan([exam, blocked], exam.id, { ...options, count: 10 }, now)
    expect(new Date(plan[0].start).getHours()).toBe(18)
    expect(planStillFits([exam, blocked], exam.id, plan, now)).toBe(true)
  })
  it('respeta los días laborables y descarta los días ya pasados', () => {
    const plan = makeStudyPlan([exam], exam.id, { ...options, count: 10, from: '2027-12-01', weekdaysOnly: true }, now)
    expect(plan.every((i) => Date.parse(i.start) >= +now && ![0, 6].includes(new Date(i.start).getDay()))).toBe(true)
  })
  it('devuelve una propuesta parcial si solo cabe una sesión', () => {
    const due = { ...exam, start: new Date(2028, 0, 3, 17).toISOString() }
    expect(makeStudyPlan([due], due.id, options, now)).toHaveLength(1)
  })
  it('no inventa huecos si el evento venció, desapareció o el horario es inválido', () => {
    expect(makeStudyPlan([exam], exam.id, options, addDays(now, 10))).toEqual([])
    expect(makeStudyPlan([], exam.id, options, now)).toEqual([])
    expect(makeStudyPlan([exam], exam.id, { ...options, startHour: 20, endHour: 16 }, now)).toEqual([])
  })
  it('rechaza una propuesta si el usuario ocupó un hueco, cambió la fecha límite o pasó su inicio', () => {
    const plan = makeStudyPlan([exam], exam.id, options, now)
    expect(planStillFits([exam, { ...plan[0], id: 'another' }], exam.id, plan, now)).toBe(false)
    expect(planStillFits([{ ...exam, start: now.toISOString() }], exam.id, plan, now)).toBe(false)
    expect(planStillFits([exam], exam.id, plan, new Date(Date.parse(plan[0].start) + 1))).toBe(false)
  })
  it('funciona al cruzar el año y el cambio de horario local', () => {
    for (const start of [new Date(2027, 11, 30), new Date(2028, 2, 25)]) {
      const due = { ...exam, start: addDays(start, 6).toISOString() }
      const plan = makeStudyPlan([due], due.id, { ...options, from: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}` }, start)
      expect(plan).toHaveLength(4)
      expect(plan.every((i) => new Date(i.start).getHours() === 16)).toBe(true)
    }
  })
})

describe('transferencia por archivo', () => {
  it('exporta e importa sin perder fechas, preferencias ni notas', () => {
    const b = backup(); b.app.items[0] = { ...exam, notes: 'Árboles\nSQL & <etiquetas>' }
    expect(parseBackup(JSON.stringify(b))).toEqual(b)
  })
  it('importar el mismo archivo dos veces no duplica eventos ni Pomodoros', () => {
    const b = backup(); b.progress.focusLog = [{ id: 'focus-1', endedAt: now.toISOString(), minutes: 25 }]
    const first = mergeBackup([], EMPTY_PROGRESS, b, false)
    const second = mergeBackup(first.items, first.progress, b, false)
    expect(second).toEqual(first)
    expect(importPreview(first.items, b.app.items)).toEqual({ added: 0, conflicts: 0, identical: 1 })
  })
  it('el usuario elige qué versión conservar sin borrar eventos que solo existen localmente', () => {
    const changed = { ...exam, notes: 'Local' }; const extra = { ...exam, id: 'local' }
    const b = backup()
    expect(importPreview([changed, extra], b.app.items).conflicts).toBe(1)
    expect(mergeBackup([changed, extra], EMPTY_PROGRESS, b, false).items.find((i) => i.id === exam.id)?.notes).toBe('Local')
    const imported = mergeBackup([changed, extra], EMPTY_PROGRESS, b, true)
    expect(imported.items.find((i) => i.id === exam.id)?.notes).toBe('')
    expect(imported.items).toHaveLength(2)
  })
  it('rechaza JSON ilegible, versiones desconocidas, fechas y duraciones inválidas y IDs repetidos', () => {
    expect(() => parseBackup('no json')).toThrow(BackupError)
    for (const mutate of [
      (b: ReturnType<typeof backup>) => { (b as { version: number }).version = 2 },
      (b: ReturnType<typeof backup>) => { b.app.items[0] = { ...exam, start: 'invalid' } },
      (b: ReturnType<typeof backup>) => { b.app.items[0] = { ...exam, duration: -30 } },
      (b: ReturnType<typeof backup>) => { b.app.items.push(exam) },
    ]) { const b = backup(); mutate(b); expect(() => parseBackup(JSON.stringify(b))).toThrow(BackupError) }
  })
  it('rechaza sesiones huérfanas o posteriores al examen, también al mezclar dos archivos válidos', () => {
    const b = backup()
    b.app.items.push({ ...exam, id: 'session', kind: 'study', linkedTo: exam.id, start: new Date(2028, 0, 9, 17).toISOString(), duration: 60 })
    expect(parseBackup(JSON.stringify(b)).app.items).toHaveLength(2)
    expect(() => mergeBackup([{ ...exam, start: now.toISOString() }], EMPTY_PROGRESS, b, false)).toThrow(BackupError)
    b.app.items = b.app.items.filter((i) => i.id !== exam.id)
    expect(() => parseBackup(JSON.stringify(b))).toThrow(BackupError)
  })
})

describe('estadísticas reales', () => {
  it('separa tiempo programado de Pomodoros completados y excluye otros periodos', () => {
    const study: Item = { ...exam, id: 'study', kind: 'study', start: now.toISOString(), duration: 90 }
    const data = statistics([exam, study], { completed: { [exam.id]: now.toISOString() }, focusLog: [{ id: '1', endedAt: now.toISOString(), minutes: 25 }, { id: 'old', endedAt: addDays(now, -40).toISOString(), minutes: 25 }] }, 7, now)
    expect(data.plannedMinutes).toBe(90); expect(data.focusMinutes).toBe(25); expect(data.focusSessions).toBe(1)
    expect(data.completedItems).toBe(1); expect(data.subjects).toEqual([{ subject: 'Redes', minutes: 90 }])
  })
  it('una instalación nueva no inventa historial', () => {
    const data = statistics([], EMPTY_PROGRESS, 7, now)
    expect(data.focusMinutes).toBe(0); expect(data.streak).toBe(0); expect(data.daily).toHaveLength(7)
  })
  it('una pausa no se registra como Pomodoro completo y tick no duplica la finalización', async () => {
    vi.resetModules(); vi.stubGlobal('localStorage', new MemoryStorage()); vi.useFakeTimers(); vi.setSystemTime(now)
    try {
      const { usePomodoro, useApp } = await import('../store'); const { useProgress } = await import('../lib/progress')
      useApp.getState().setNotifications(false)
      usePomodoro.getState().start(); vi.advanceTimersByTime(60_000); usePomodoro.getState().pause()
      expect(useProgress.getState().focusLog).toHaveLength(0)
      usePomodoro.getState().start(); vi.advanceTimersByTime(24 * 60_000); usePomodoro.getState().tick(); usePomodoro.getState().tick()
      expect(useProgress.getState().focusLog).toHaveLength(1); expect(useProgress.getState().focusLog[0].minutes).toBe(25)
    } finally { vi.useRealTimers(); vi.unstubAllGlobals() }
  })
})
