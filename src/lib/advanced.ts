import { addDays, startOfDay } from 'date-fns'
import type { Item } from '../store'
import type { PersistedApp } from './preferences'
import { sanitizePersisted } from './preferences'

export interface FocusEntry { id: string; endedAt: string; minutes: number }
export interface ProgressData { completed: Record<string, string>; focusLog: FocusEntry[] }
export const EMPTY_PROGRESS: ProgressData = { completed: {}, focusLog: [] }
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const validDate = (x: unknown): x is string => typeof x === 'string' && Number.isFinite(Date.parse(x))
export function cleanProgress(raw: unknown): ProgressData {
  const r = record(raw) ? raw : {}
  const completed = Object.fromEntries(Object.entries(record(r.completed) ? r.completed : {}).filter(([, v]) => validDate(v))) as Record<string, string>
  const seen = new Set<string>()
  const focusLog = (Array.isArray(r.focusLog) ? r.focusLog : []).filter((x): x is FocusEntry => {
    if (!record(x) || typeof x.id !== 'string' || !x.id || seen.has(x.id) || !validDate(x.endedAt) || typeof x.minutes !== 'number' || !Number.isFinite(x.minutes) || x.minutes <= 0 || x.minutes > 1440) return false
    seen.add(x.id); return true
  }).map(({ id, endedAt, minutes }) => ({ id, endedAt, minutes }))
  return { completed, focusLog }
}

export interface PlanOptions { count: number; duration: number; from: string; startHour: number; endHour: number; weekdaysOnly: boolean }
export type PlannedSession = Omit<Item, 'id'>
const overlap = (a: number, b: number, i: Pick<Item, 'start' | 'duration'>) => a < Date.parse(i.start) + i.duration * 60000 && b > Date.parse(i.start)
export function makeStudyPlan(items: Item[], parentId: string, options: PlanOptions, now = new Date()): PlannedSession[] {
  const parent = items.find((i) => i.id === parentId && i.kind !== 'study')
  const { count, duration, startHour, endHour, weekdaysOnly } = options
  const from = new Date(`${options.from}T00:00:00`)
  if (!parent || !Number.isFinite(+from) || !Number.isInteger(count) || count < 1 || count > 30 || !Number.isInteger(duration) || duration < 15 || duration > 120 || duration % 15 || !Number.isInteger(startHour) || !Number.isInteger(endHour) || startHour < 0 || endHour > 24 || endHour <= startHour) return []
  const due = Date.parse(parent.start)
  const first = startOfDay(+from > +now ? from : now)
  const days: Date[] = []
  for (let day = first; +day < due && days.length < 366; day = addDays(day, 1)) days.push(day)
  const result: PlannedSession[] = []
  // One session per available day per round, then reuse days if more sessions are requested.
  while (result.length < count) {
    let added = false
    for (const day of days) {
      if (weekdaysOnly && [0, 6].includes(day.getDay())) continue
      const end = new Date(day); end.setHours(endHour, 0, 0, 0)
      const occupied = [...items, ...result].filter((i) => overlap(+day, +addDays(day, 1), i))
      for (let m = startHour * 60; m < endHour * 60; m += 15) {
        const start = new Date(day); start.setHours(0, m, 0, 0)
        const finish = +start + duration * 60000
        if (+start < +now || finish > due || finish > +end || occupied.some((i) => overlap(+start, finish, i))) continue
        result.push({ kind: 'study', subject: parent.subject, linkedTo: parent.id, start: start.toISOString(), duration, notes: '' })
        added = true; break
      }
      if (result.length === count) break
    }
    if (!added) break
  }
  return result.sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
}
export function planStillFits(items: Item[], parentId: string, plan: PlannedSession[], now = new Date()): boolean {
  const parent = items.find((i) => i.id === parentId && i.kind !== 'study')
  if (!parent || !plan.length) return false
  return plan.every((s, index) => s.linkedTo === parentId && Date.parse(s.start) >= +now && Date.parse(s.start) + s.duration * 60000 <= Date.parse(parent.start) && ![...items, ...plan.slice(0, index)].some((i) => overlap(Date.parse(s.start), Date.parse(s.start) + s.duration * 60000, i)))
}

export function statistics(items: Item[], progress: ProgressData, days: number, now = new Date()) {
  const from = +addDays(startOfDay(now), -(days - 1)); const end = +addDays(startOfDay(now), 1)
  const within = (date: string) => Date.parse(date) >= from && Date.parse(date) < end
  const study = items.filter((i) => i.kind === 'study' && within(i.start))
  const completedItems = items.filter((i) => within(progress.completed[i.id] ?? ''))
  const log = progress.focusLog.filter((i) => within(i.endedAt))
  const subjects = [...new Set(study.map((i) => i.subject))].map((subject) => ({ subject, minutes: study.filter((i) => i.subject === subject).reduce((n, i) => n + i.duration, 0) })).sort((a, b) => b.minutes - a.minutes)
  const daily = Array.from({ length: days }, (_, n) => {
    const d = addDays(startOfDay(now), n - days + 1); const next = addDays(d, 1)
    return { date: d.toISOString(), minutes: log.filter((i) => Date.parse(i.endedAt) >= +d && Date.parse(i.endedAt) < +next).reduce((n, i) => n + i.minutes, 0) }
  })
  const activeDays = new Set(log.map((i) => startOfDay(new Date(i.endedAt)).getTime()))
  let streak = 0; let cursor = startOfDay(now)
  if (!activeDays.has(+cursor)) cursor = addDays(cursor, -1)
  while (activeDays.has(+cursor)) { streak++; cursor = addDays(cursor, -1) }
  return { plannedMinutes: study.reduce((n, i) => n + i.duration, 0), completedItems: completedItems.length, focusMinutes: log.reduce((n, i) => n + i.minutes, 0), focusSessions: log.length, activeDays: activeDays.size, streak, subjects, daily }
}

export interface Backup { format: 'tempora-backup'; version: 1; exportedAt: string; app: PersistedApp; progress: ProgressData }
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024
export function createBackup(app: PersistedApp, progress: ProgressData, now = new Date()): Backup {
  return { format: 'tempora-backup', version: 1, exportedAt: now.toISOString(), app: sanitizePersisted(app), progress: cleanProgress(progress) }
}
export class BackupError extends Error {
  constructor(public code: 'invalid' | 'size' | 'version' | 'relations') { super(code) }
}
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new BackupError('size')
  let raw: unknown; try { raw = JSON.parse(text) } catch { throw new BackupError('invalid') }
  if (!record(raw) || raw.format !== 'tempora-backup') throw new BackupError('invalid')
  if (raw.version !== 1) throw new BackupError('version')
  if (!record(raw.app) || !Array.isArray(raw.app.items) || raw.app.items.length > 10000 || !validDate(raw.exportedAt)) throw new BackupError('invalid')
  const ids = new Set<string>()
  for (const i of raw.app.items) {
    if (!record(i) || typeof i.id !== 'string' || !i.id || ['__proto__', 'constructor', 'prototype'].includes(i.id) || i.id.length > 200 || ids.has(i.id) || !['exam', 'assignment', 'study'].includes(String(i.kind)) || typeof i.subject !== 'string' || !i.subject.trim() || i.subject.length > 500 || !validDate(i.start) || typeof i.duration !== 'number' || !Number.isFinite(i.duration) || i.duration <= 0 || i.duration > 1440 || typeof i.notes !== 'string' || i.notes.length > 20000 || (i.linkedTo !== undefined && typeof i.linkedTo !== 'string')) throw new BackupError('invalid')
    ids.add(i.id)
  }
  const app = sanitizePersisted(raw.app)
  if (['mode', 'theme', 'notifications', 'purpose', 'language'].some((key) => app[key as keyof PersistedApp] !== (raw.app as Record<string, unknown>)[key])) throw new BackupError('invalid')
  assertRelations(app.items)
  if (!record(raw.progress) || !record(raw.progress.completed) || !Array.isArray(raw.progress.focusLog)) throw new BackupError('invalid')
  const progress = cleanProgress(raw.progress)
  if (Object.keys(progress.completed).length !== Object.keys(raw.progress.completed).length || progress.focusLog.length !== raw.progress.focusLog.length) throw new BackupError('invalid')
  return { format: 'tempora-backup', version: 1, exportedAt: raw.exportedAt, app, progress }
}
function assertRelations(items: Item[]) {
  const byId = new Map(items.map((i) => [i.id, i]))
  for (const i of items) if (i.linkedTo) {
    const parent = byId.get(i.linkedTo)
    if (i.kind !== 'study' || !parent || parent.kind === 'study' || Date.parse(i.start) + i.duration * 60000 > Date.parse(parent.start)) throw new BackupError('relations')
  }
}
const sameItem = (a: Item, b: Item) => a.id === b.id && a.kind === b.kind && a.subject === b.subject && a.start === b.start && a.duration === b.duration && a.notes === b.notes && a.linkedTo === b.linkedTo
export function importPreview(local: Item[], incoming: Item[]) {
  const byId = new Map(local.map((i) => [i.id, i]))
  return { added: incoming.filter((i) => !byId.has(i.id)).length, conflicts: incoming.filter((i) => byId.has(i.id) && !sameItem(byId.get(i.id)!, i)).length, identical: incoming.filter((i) => byId.has(i.id) && sameItem(byId.get(i.id)!, i)).length }
}
export function mergeBackup(local: Item[], progress: ProgressData, backup: Backup, preferFile: boolean) {
  const byId = new Map(local.map((i) => [i.id, i]))
  for (const i of backup.app.items) if (preferFile || !byId.has(i.id)) byId.set(i.id, i)
  const items = [...byId.values()]; assertRelations(items)
  const logs = new Map(progress.focusLog.map((i) => [i.id, i]))
  for (const i of backup.progress.focusLog) if (preferFile || !logs.has(i.id)) logs.set(i.id, i)
  const completed = preferFile ? { ...progress.completed, ...backup.progress.completed } : { ...backup.progress.completed, ...progress.completed }
  return { items, progress: { completed, focusLog: [...logs.values()] } }
}
