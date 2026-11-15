import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, setHours, setMinutes } from 'date-fns'
import { CalendarClock, CalendarPlus, MousePointerClick, Trash2, X } from 'lucide-react'
import clsx from 'clsx'
import { useApp, useUI } from '../store'
import { SPRING, SPRING_BOUNCE } from '../lib/motion'
import { formatEventDateTime, formatFullDate, relativeDayLabel, toDateInput, toTimeInput } from '../lib/dates'
import { useCommon, useFormErrorText, useLanguage, useVocab } from '../lib/vocab'
import type { FormError } from '../lib/vocab'
import { kindMeta } from './EventCard'
import { useDialogBehavior } from './ui'
import { useLayout } from '../lib/layout'

const W = 344
const DURATIONS = [30, 60, 90, 120]

function defaultStudyStart(due: Date) {
  let d = setMinutes(setHours(addDays(due, -1), 17), 0)
  if (+d <= Date.now()) { d = new Date(); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0) }
  return d
}

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const f = () => setSize((p) => (p.w === window.innerWidth && p.h === window.innerHeight ? p : { w: window.innerWidth, h: window.innerHeight }))
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return size
}

export function ItemPopover() {
  const pop = useUI((s) => s.popover)
  const items = useApp((s) => s.items)
  const item = items.find((i) => i.id === pop?.id)
  const v = useVocab()
  const t = useCommon().popover
  const language = useLanguage()
  const errorText = useFormErrorText()
  const close = () => useUI.setState({ popover: null })
  const { mobile } = useLayout() // móvil: hoja inferior a ancho completo (el popover anclado de 344 px no cabe ni tiene dónde anclarse)
  const win = useWindowSize()
  const dialogRef = useRef<HTMLDivElement>(null)
  // Foco al abrir, Tab atrapado, Escape y restauración del foco en la tarjeta que lo abrió (mismo comportamiento que los diálogos).
  useDialogBehavior(dialogRef, !!pop && !!item, close)

  const [asking, setAsking] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('17:00')
  const [dur, setDur] = useState(60)
  const [error, setError] = useState<FormError | null>(null)

  useEffect(() => {
    setAsking(false); setError(null)
    if (item && item.kind !== 'study') {
      const d = defaultStudyStart(new Date(item.start))
      setDate(toDateInput(d)); setTime(toTimeInput(d)); setDur(60)
    }
  }, [pop?.id])
  const add = () => {
    if (!item) return
    const start = new Date(`${date}T${time}`)
    if (isNaN(+start)) return setError({ code: 'invalidDateTime' })
    if (+start + dur * 60000 > +new Date(item.start)) return setError({ code: 'sessionMustEndBefore', kind: item.kind === 'exam' ? 'exam' : 'assignment' })
    useApp.getState().addItem({ kind: 'study', subject: item.subject, start: start.toISOString(), duration: dur, notes: '', linkedTo: item.id })
    useUI.setState({ cursor: start }); setAsking(false); setError(null)
  }
  const pick = () => {
    if (!item) return
    useUI.setState({ picking: { itemId: item.id, duration: dur }, popover: null, cursor: new Date(item.start) })
  }

  const left = pop ? (pop.rect.right + 12 + W < win.w ? pop.rect.right + 12 : Math.max(12, Math.min(pop.rect.left - W - 12, win.w - W - 12))) : 0
  const top = pop ? Math.min(Math.max(12, pop.rect.top - 8), Math.max(12, win.h - 540)) : 0
  const meta = item ? kindMeta[item.kind] : null
  const sessions = item ? items.filter((i) => i.linkedTo === item.id).sort((a, b) => +new Date(a.start) - +new Date(b.start)) : []
  const due = item ? new Date(item.start) : new Date()
  const duePassed = +due <= Date.now()
  const reschedule = () => item && useUI.setState({ popover: null, modal: { type: 'item', editId: item.id } })

  return (
    <AnimatePresence>
      {pop && item && meta && (
        <>
          {/* Hoja (móvil): tarea modal → se atenúa el fondo. Popover anclado: sin velo, solo captura el clic de cierre. */}
          <div className={clsx('fixed inset-0 z-40', mobile && 'bg-black/35')} onPointerDown={close} />
          <motion.div
            key={item.id} ref={dialogRef} role="dialog" aria-modal="true" aria-label={t.dialogLabel(item.subject)} tabIndex={-1}
            initial={mobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={mobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.96 }} // la hoja sale por donde entró
            transition={mobile ? SPRING : SPRING_BOUNCE}
            className={clsx('flex flex-col overflow-hidden outline-none', mobile ? 'sheet-bottom sheet-surface rounded-t-3xl' : 'glass-strong fixed z-50 rounded-3xl')}
            style={mobile ? undefined : { left, top, width: W, maxHeight: win.h - 24, transformOrigin: 'left top' }}
          >
            <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-5">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: `rgb(${meta.color})` }} />
              <div className="min-w-0 flex-1">
                <p className="t-caption uppercase" style={{ color: `rgb(${meta.color})` }}>{v.kind[item.kind]}</p>
                <h3 className="t-title break-words">{item.subject}</h3>
                <p className="t-body text-sub">
                  {formatEventDateTime(language, due)}{item.kind !== 'study' && <> · <span className="font-medium text-ink">{relativeDayLabel(language, due)}</span></>}
                </p>
              </div>
              <button aria-label={t.close} onClick={close} className="press grid size-8 shrink-0 place-items-center rounded-full text-sub hover:bg-line/10 touch:size-11"><X className="size-4" aria-hidden /></button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 pb-3">
            {item.notes && <p className="t-body break-words rounded-xl bg-line/5 p-3 text-sub">{item.notes}</p>}

            {item.kind !== 'study' && (
              <>
                <div className="rounded-2xl p-3.5" style={{ background: `rgb(var(--study) / .12)` }}>
                  <p className="text-[13px] font-semibold leading-snug">{duePassed ? t.pastDue : v.studyPrompt[item.kind === 'exam' ? 'exam' : 'assignment']}</p>
                  <AnimatePresence initial={false} mode="wait">
                    {duePassed ? (
                      <button onClick={reschedule} className="btn-primary mt-3 flex items-center gap-1.5 touch:min-h-11"><CalendarClock className="size-4" aria-hidden /> {t.reschedule}</button>
                    ) : !asking ? (
                      <motion.div key="cta" exit={{ opacity: 0 }} className="mt-3 flex gap-2">
                        <button onClick={() => setAsking(true)} className="btn-primary flex items-center gap-1.5 !py-1.5 touch:min-h-11"><CalendarPlus className="size-4" aria-hidden /> {t.schedulePrep}</button>
                        <button onClick={close} className="btn-ghost !py-1.5 touch:min-h-11">{t.notNow}</button>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex flex-col gap-2.5 overflow-hidden px-0.5 pb-0.5">
                        <p id="session-deadline-hint" className="t-caption text-sub">{t.sessionLimit(`${formatFullDate(language, due)} · ${toTimeInput(due)}`)}</p>
                        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                          <input aria-label={v.sessionDateLabel} aria-describedby="session-deadline-hint" type="date" value={date} max={toDateInput(due)} onChange={(e) => { setDate(e.target.value); setError(null) }} className="field" />
                          <input aria-label={v.sessionTimeLabel} type="time" value={time} onChange={(e) => { setTime(e.target.value); setError(null) }} className="field" />
                        </div>
                        <button onClick={reschedule} className="btn-ghost text-left !text-[12px] touch:min-h-11">{t.reschedule}</button>
                        <div role="group" aria-label={t.durationGroup} className="flex gap-1.5">
                          {DURATIONS.map((d) => (
                            <button key={d} onClick={() => setDur(d)} aria-pressed={dur === d} className={clsx('press flex-1 rounded-lg py-1 text-[12px] font-semibold touch:min-h-11', dur === d ? 'bg-accent text-on-accent' : 'bg-line/10 text-sub')}>{t.minutes(d)}</button>
                          ))}
                        </div>
                        {error && <p role="alert" className="text-[12px] font-medium text-red-500">{errorText(error)}</p>}
                        <div className="flex gap-2">
                          <button onClick={add} className="btn-primary flex-1 !py-1.5 touch:min-h-11">{t.addToCalendar}</button>
                          <button onClick={pick} title={t.pickHint} className="btn-ghost flex items-center gap-1 !px-3 !py-1.5 touch:min-h-11"><MousePointerClick className="size-4" aria-hidden /> {t.pick}</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {sessions.length > 0 && (
                  <div>
                    <p className="t-caption mb-1 uppercase text-sub">{v.studySessions}</p>
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 rounded-lg px-1 py-1 text-[13px]">
                        <span className="size-2 rounded-full" style={{ background: 'rgb(var(--study))' }} />
                        <button className="min-h-8 flex-1 text-left tabular-nums hover:underline touch:min-h-11" onClick={() => { useUI.setState({ cursor: new Date(s.start), popover: null }) }}>
                          {formatEventDateTime(language, new Date(s.start))} · {t.minutes(s.duration)}
                        </button>
                        <button aria-label={v.removeSession} onClick={() => useApp.getState().removeItem(s.id)} className="press grid size-8 place-items-center text-sub hover:text-red-500 touch:size-11"><Trash2 className="size-3.5" aria-hidden /></button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            </div>

            <div className="shrink-0 border-t border-line/10 px-5 pb-4 pt-2">
              <p className="t-caption mb-1.5 hidden text-sub touch:block">{t.touchMoveHint}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button onClick={() => useUI.setState({ popover: null, modal: { type: 'item', editId: item.id } })} aria-label={t.rescheduleLabel(item.subject)} className="btn-ghost flex items-center gap-1.5 !px-2.5 !py-1.5 !text-[12px] touch:min-h-11">
                  <CalendarClock className="size-4" aria-hidden /> {t.reschedule}
                </button>
                <button onClick={() => { useApp.getState().removeItem(item.id); close() }} className="press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-red-500 hover:bg-red-500/10 touch:min-h-11">
                  <Trash2 className="size-3.5 shrink-0" aria-hidden /> {item.kind !== 'study' && sessions.length ? v.deleteWithSessions(sessions.length) : t.delete}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
