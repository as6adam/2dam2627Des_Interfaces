import { describe, expect, it } from 'vitest'
import { validateReschedule } from '../lib/schedule'
import { toDateInput } from '../lib/dates'
import type { Item } from '../store'

const exam: Item = { id: 'exam', kind: 'exam', subject: 'Redes', start: new Date(2026, 10, 11, 9).toISOString(), duration: 90, notes: '' }

describe('fechas futuras y límite de preparación', () => {
  for (const year of [2027, 2028]) {
    it(`permite reprogramar un examen a ${year} y preparar sesiones en ese año`, () => {
      const due = new Date(year, 2, 10, 9)
      expect(validateReschedule([exam], exam.id, due)).toBeNull()
      expect(toDateInput(due)).toBe(`${year}-03-10`)
      const moved = { ...exam, start: due.toISOString() }
      const study: Item = { id: 'study', kind: 'study', subject: 'Redes', linkedTo: exam.id, start: new Date(year, 2, 9, 17).toISOString(), duration: 60, notes: '' }
      expect(validateReschedule([moved, study], study.id, new Date(year, 2, 10, 8))).toBeNull()
      expect(validateReschedule([moved, study], study.id, new Date(year, 2, 10, 8, 30))).toEqual({ code: 'sessionMustEndBefore', kind: 'exam' })
    })
  }
})
