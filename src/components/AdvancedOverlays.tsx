import { useEffect, useState } from 'react'
import { useApp, useUI } from '../store'
import { useLanguage } from '../lib/vocab'
import { advancedText, formatMetric } from '../lib/advancedText'
import { useProgress } from '../lib/progress'
import { BackupError, MAX_BACKUP_BYTES, createBackup, importPreview, makeStudyPlan, mergeBackup, parseBackup, planStillFits, statistics, type Backup, type PlanOptions, type PlannedSession } from '../lib/advanced'
import { formatDayMonth, formatEventDateTime, formatFullDate, formatTime, toDateInput } from '../lib/dates'
import { Modal, Field } from './ui'

const close = () => useUI.setState({ modal: null })
const initialOptions = (): PlanOptions => ({ count: 4, duration: 60, from: toDateInput(new Date()), startHour: 16, endHour: 20, weekdaysOnly: false })

function PlannerModal() {
  const modal = useUI((s) => s.modal)
  const items = useApp((s) => s.items)
  const language = useLanguage(); const t = advancedText(language)
  const parent = modal?.type === 'planner' ? items.find((i) => i.id === modal.itemId) : undefined
  const [options, setOptions] = useState(initialOptions)
  const [plan, setPlan] = useState<PlannedSession[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { if (modal?.type === 'planner') { setOptions(initialOptions()); setPlan(null); setError('') } }, [modal])
  const change = (patch: Partial<PlanOptions>) => { setOptions((s) => ({ ...s, ...patch })); setPlan(null); setError('') }
  const generate = () => { if (parent) { setPlan(makeStudyPlan(useApp.getState().items, parent.id, options)); setError('') } }
  const apply = () => {
    if (!parent || !plan || !planStillFits(useApp.getState().items, parent.id, plan)) { setError(t.stale); return }
    useApp.getState().addItems(plan)
    useUI.setState({ modal: null, cursor: new Date(plan[0].start), filter: { kind: 'all' } })
  }
  return (
    <Modal open={modal?.type === 'planner'} onClose={close} labelledBy="planner-title" width="max-w-xl">
      <h2 id="planner-title" className="t-title mb-2">{t.planner}</h2>
      {parent ? <>
        <p className="mb-2 break-words font-semibold">{parent.subject}</p>
        <p className="t-caption mb-3 text-sub">{formatFullDate(language, new Date(parent.start))} · {formatTime(new Date(parent.start))}</p>
        <p className="t-body mb-4 text-sub">{t.plannerIntro}</p>
        <form onSubmit={(e) => { e.preventDefault(); generate() }} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            <Field label={t.count}><input className="field" type="number" min="1" max="30" required value={options.count} onChange={(e) => change({ count: e.target.valueAsNumber })} /></Field>
            <Field label={t.duration}><select className="field" value={options.duration} onChange={(e) => change({ duration: +e.target.value })}>{[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
          </div>
          <Field label={t.from}><input className="field" type="date" required value={options.from} onChange={(e) => change({ from: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.startHour}><select className="field" value={options.startHour} onChange={(e) => change({ startHour: +e.target.value })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></Field>
            <Field label={t.endHour}><select className="field" value={options.endHour} onChange={(e) => change({ endHour: +e.target.value })}>{Array.from({ length: 24 }, (_, h) => <option key={h + 1} value={h + 1}>{String(h + 1).padStart(2, '0')}:00</option>)}</select></Field>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-[13px]"><input type="checkbox" checked={options.weekdaysOnly} onChange={(e) => change({ weekdaysOnly: e.target.checked })} />{t.weekdays}</label>
          <button type="submit" className="btn-primary min-h-11">{t.generate}</button>
        </form>
        {plan && <section aria-live="polite" className="mt-4 rounded-2xl bg-line/5 p-3">
          <h3 className="mb-2 font-semibold">{t.preview} ({plan.length}/{options.count})</h3>
          {!plan.length ? <p className="t-body text-sub">{t.noSlots}</p> : <>
            {plan.length < options.count && <p className="t-body mb-2 text-sub">{t.partial}</p>}
            <ol className="flex max-h-52 flex-col gap-2 overflow-y-auto text-[13px]">{plan.map((s) => <li key={s.start}>{formatEventDateTime(language, new Date(s.start))} · {s.duration} {t.minutes}</li>)}</ol>
            <button onClick={apply} className="btn-primary mt-3 min-h-11 w-full">{t.apply}</button>
          </>}
        </section>}
      </> : <p>{t.missingParent}</p>}
      {error && <p role="alert" className="mt-3 text-[13px] text-red-500">{error}</p>}
      <div className="mt-4 flex justify-end"><button onClick={close} className="btn-ghost min-h-11">{t.close}</button></div>
    </Modal>
  )
}

function StatisticsModal() {
  const open = useUI((s) => s.modal?.type === 'statistics')
  const items = useApp((s) => s.items); const progress = useProgress()
  const language = useLanguage(); const t = advancedText(language)
  const [days, setDays] = useState(7)
  const data = statistics(items, progress, days)
  const cards = [[t.planned, data.plannedMinutes], [t.focused, data.focusMinutes], [t.cycles, data.focusSessions], [t.completed, data.completedItems], [t.activeDays, data.activeDays], [t.streak, data.streak]] as const
  const maximum = Math.max(1, ...data.daily.map((i) => i.minutes))
  return (
    <Modal open={open} onClose={close} labelledBy="statistics-title" width="max-w-3xl">
      <h2 id="statistics-title" className="t-title mb-2">{t.stats}</h2>
      <p className="t-body mb-4 text-sub">{t.statsIntro}</p>
      <Field label={t.period}><select className="field mb-4" value={days} onChange={(e) => setDays(+e.target.value)}>{[7, 30, 90].map((d) => <option key={d} value={d}>{d} {t.days}</option>)}</select></Field>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-2xl bg-line/5 p-3"><dt className="t-caption min-h-8 text-sub">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums text-accent">{formatMetric(language, value)}</dd></div>)}</dl>
      <h3 className="mb-3 mt-6 font-semibold">{t.subjects}</h3>
      {data.subjects.length ? <ul className="flex flex-col gap-2">{data.subjects.map((s) => <li key={s.subject} className="flex justify-between gap-4 rounded-xl bg-line/5 px-3 py-2 text-[13px]"><span className="min-w-0 break-words">{s.subject}</span><span className="shrink-0 tabular-nums">{s.minutes} {t.minutes}</span></li>)}</ul> : <p className="t-body text-sub">{t.empty}</p>}
      <h3 className="mb-3 mt-6 font-semibold">{t.daily}</h3>
      <div className="max-h-64 overflow-y-auto"><table className="w-full text-left text-[12px]"><caption className="sr-only">{t.daily}</caption><thead className="sr-only"><tr><th>{t.days}</th><th>{t.focused}</th></tr></thead><tbody>{data.daily.map((d) => <tr key={d.date}><th scope="row" className="w-[45%] py-1 pr-2 font-normal">{formatDayMonth(language, new Date(d.date))}</th><td className="py-1"><div className="flex items-center gap-2"><span aria-hidden className="h-2 rounded-full bg-accent/70" style={{ width: `${d.minutes / maximum * 70}%`, minWidth: d.minutes ? 2 : 0 }} /><span className="shrink-0 tabular-nums">{d.minutes} {t.minutes}</span></div></td></tr>)}</tbody></table></div>
      <div className="mt-4 flex justify-end"><button onClick={close} className="btn-primary min-h-11">{t.close}</button></div>
    </Modal>
  )
}

function TransferModal() {
  const open = useUI((s) => s.modal?.type === 'transfer')
  const items = useApp((s) => s.items)
  const language = useLanguage(); const t = advancedText(language)
  const [backup, setBackup] = useState<Backup | null>(null)
  const [preferFile, setPreferFile] = useState(false)
  const [preferences, setPreferences] = useState(false)
  const [message, setMessage] = useState<'imported' | 'exported' | ''>('')
  const [error, setError] = useState<'invalid' | 'size' | 'version' | 'relations' | ''>('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (open) { setBackup(null); setError(''); setMessage(''); setPreferences(false); setPreferFile(false) } }, [open])
  const fail = (e: unknown) => setError(e instanceof BackupError ? e.code : 'invalid')
  const exportFile = () => {
    const text = JSON.stringify(createBackup(useApp.getState(), useProgress.getState()), null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `tempora-${toDateInput(new Date())}.json`; document.body.appendChild(a); a.click(); a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('exported'); setError('')
  }
  const selectFile = async (file?: File) => {
    setBackup(null); setError(''); setMessage(''); setLoading(true)
    try { if (file) { if (file.size > MAX_BACKUP_BYTES) throw new BackupError('size'); setBackup(parseBackup(await file.text())) } } catch (e) { fail(e) } finally { setLoading(false) }
  }
  const apply = () => {
    if (!backup) return
    try {
      const merged = mergeBackup(useApp.getState().items, useProgress.getState(), backup, preferFile)
      const { items: ignoredItems, ...prefs } = backup.app
      void ignoredItems
      useApp.setState({ ...(preferences ? prefs : {}), items: merged.items })
      useProgress.setState(merged.progress)
      setBackup(null); setMessage('imported'); setError('')
    } catch (e) { fail(e) }
  }
  const preview = backup ? importPreview(items, backup.app.items) : null
  return (
    <Modal open={open} onClose={close} labelledBy="transfer-title" width="max-w-xl">
      <h2 id="transfer-title" className="t-title mb-2">{t.transfer}</h2>
      <p className="t-body mb-4 text-sub">{t.transferIntro}</p>
      <button onClick={exportFile} className="btn-primary mb-5 min-h-11">{t.export}</button>
      <Field label={t.chooseFile}><input className="field min-w-0 max-w-full" type="file" accept="application/json,.json" disabled={loading} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; void selectFile(file) }} /></Field>
      {backup && preview && <section className="mt-4 rounded-2xl bg-line/5 p-3">
        <p className="t-body mb-3 text-sub">{t.importIntro}</p>
        <dl className="mb-3 grid grid-cols-3 gap-2 text-center">{[[t.added, preview.added], [t.conflicts, preview.conflicts], [t.identical, preview.identical]].map(([label, n]) => <div key={label}><dt className="t-caption text-sub">{label}</dt><dd className="text-xl font-semibold">{n}</dd></div>)}</dl>
        <fieldset className="mb-2 flex flex-col gap-2 text-[13px]"><legend className="sr-only">{t.conflicts}</legend>
          <label className="flex min-h-11 items-center gap-2"><input type="radio" name="conflict" checked={!preferFile} onChange={() => setPreferFile(false)} />{t.preferLocal}</label>
          <label className="flex min-h-11 items-center gap-2"><input type="radio" name="conflict" checked={preferFile} onChange={() => setPreferFile(true)} />{t.preferFile}</label>
        </fieldset>
        <label className="mb-3 flex min-h-11 items-center gap-2 text-[13px]"><input type="checkbox" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} />{t.preferences}</label>
        <button onClick={apply} className="btn-primary min-h-11 w-full">{t.import}</button>
      </section>}
      {message && <p role="status" className="t-body mt-3">{t[message]}</p>}
      {error && <p role="alert" className="t-body mt-3 text-red-500">{t[error]}</p>}
      <div className="mt-4 flex justify-end"><button onClick={close} className="btn-ghost min-h-11">{t.close}</button></div>
    </Modal>
  )
}

export function AdvancedOverlays() { return <><PlannerModal /><StatisticsModal /><TransferModal /></> }
