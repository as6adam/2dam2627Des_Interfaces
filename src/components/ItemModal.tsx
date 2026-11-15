import { useEffect, useState } from 'react'
import { useApp, useUI, Kind, DEFAULT_DURATION } from '../store'
import { useCommon, useFormErrorText, useVocab } from '../lib/vocab'
import type { FormError } from '../lib/vocab'
import { formatEventDateTime, toDateInput, toTimeInput } from '../lib/dates'
import { validateReschedule } from '../lib/schedule'
import { useLanguage } from '../lib/vocab'
import { Field, Modal } from './ui'

export function ItemModal() {
  const modal = useUI((s) => s.modal)
  const items = useApp((s) => s.items)
  const open = modal?.type === 'item'
  const v = useVocab()
  const t = useCommon().itemModal
  const errorText = useFormErrorText()
  const language = useLanguage()
  const close = () => useUI.setState({ modal: null })
  const editId = modal?.type === 'item' ? modal.editId : undefined
  const editing = editId ? items.find((i) => i.id === editId) : undefined // solo lectura: contexto; nunca se modifican ID, tipo ni vínculos

  const [kind, setKind] = useState<Kind>('exam')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<FormError | null>(null)

  useEffect(() => {
    if (modal?.type !== 'item') return
    if (modal.editId) {
      // Cambiar fecha/hora de un evento existente: se parte de su fecha actual (se lee del store para no reiniciar el formulario al editar otros datos).
      const it = useApp.getState().items.find((i) => i.id === modal.editId)
      if (it) { const s0 = new Date(it.start); setDate(toDateInput(s0)); setTime(toTimeInput(s0)); setError(null) }
      return
    }
    const d = modal.start ?? new Date()
    // Creación inicial por propósito (se lee del store para no reiniciar el formulario al cambiarlo)
    setKind(useApp.getState().purpose === 'productivity' ? 'assignment' : 'exam'); setSubject(''); setNotes(''); setError(null)
    setDate(toDateInput(d))
    setTime(modal.start ? toTimeInput(d) : '09:00')
  }, [modal])

  const submit = () => {
    if (editId) {
      if (!editing) return close() // se eliminó mientras estaba abierto
      const next = new Date(`${date}T${time}`)
      const err = validateReschedule(useApp.getState().items, editId, next) // mismas reglas que el arrastre
      if (err) return setError(err)
      if (+next !== +new Date(editing.start)) useApp.getState().updateItem(editId, { start: next.toISOString() }) // solo `start`
      useUI.setState({ modal: null, cursor: next })
      return
    }
    if (!subject.trim()) return setError({ code: 'subjectRequired' })
    const start = new Date(`${date}T${time}`)
    if (isNaN(+start)) return setError({ code: 'invalidDateTime' })
    useApp.getState().addItem({ kind, subject: subject.trim(), start: start.toISOString(), duration: DEFAULT_DURATION[kind], notes: notes.trim() })
    useUI.setState({ modal: null, cursor: start })
  }
  const subjects = [...new Set(items.filter((i) => i.kind !== 'study').map((i) => i.subject))]

  return (
    <Modal open={open} onClose={close} labelledBy="item-title">
      <h3 id="item-title" className="t-title mb-4 break-words">{editing ? t.rescheduleTitle : kind === 'exam' ? v.newKind.exam : v.newKind.assignment}</h3>
      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex flex-col gap-3.5">
        {editing && (
          <div className="rounded-2xl bg-line/5 p-3.5">
            <p className="t-caption uppercase text-sub">{v.kind[editing.kind]}</p>
            <p className="break-words text-[14px] font-semibold">{editing.subject}</p>
            <p className="t-body text-sub">{t.currently}: <span className="tabular-nums">{formatEventDateTime(language, new Date(editing.start))}</span></p>
            <p className="t-caption mt-1 text-sub">{t.rescheduleIntro}</p>
          </div>
        )}
        {!editing && <>
        <Field label={t.type}>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className="field">
            <option value="exam">{v.kind.exam}</option>
            <option value="assignment">{v.kind.assignment}</option>
          </select>
        </Field>
        <Field label={v.subjectLabel}>
          <input autoFocus list="subjects" value={subject} onChange={(e) => { setSubject(e.target.value); setError(null) }} placeholder={v.subjectPlaceholder} className="field" />
          <datalist id="subjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        </>}
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          <Field label={editing ? t.newDate : t.dueDate}><input type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(null) }} data-autofocus={editing ? '' : undefined} className="field" /></Field>
          <Field label={editing ? t.newTime : t.time}><input type="time" value={time} onChange={(e) => { setTime(e.target.value); setError(null) }} className="field" /></Field>
        </div>
        {!editing && <Field label={t.notes}><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t.notesPlaceholder} className="field resize-none" /></Field>}
        {error && <p role="alert" className="text-[12px] font-medium text-red-500">{errorText(error)}</p>}
        <div className="mt-1 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={close} className="btn-ghost touch:min-h-11">{t.cancel}</button>
          <button type="submit" className="btn-primary touch:min-h-11">{editing ? t.save : t.add}</button>
        </div>
      </form>
    </Modal>
  )
}
