import { useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { useApp, useUI } from '../store'
import { useCommon, useLanguage } from '../lib/vocab'
import { WEEK_STARTS_ON, formatFullDate, formatMonthYear, formatWeekdayLong, formatWeekdayNarrow, weekdayRefs } from '../lib/dates'

export function MiniCalendar({ onPick }: { onPick?: () => void } = {}) {
  const cursor = useUI((s) => s.cursor)
  const t = useCommon().miniCalendar
  const language = useLanguage()
  const items = useApp((s) => s.items)
  const [month, setMonth] = useState(startOfMonth(cursor))
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }), end: endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }) })
  const mark = (d: Date) => items.some((i) => isSameDay(new Date(i.start), d))

  return (
    <div className="px-1" role="group" aria-label={t.group}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold tracking-tight">{formatMonthYear(language, month)}</span>
        <div className="flex gap-0.5">
          {[-1, 1].map((n) => (
            <button key={n} aria-label={n < 0 ? t.previousMonth : t.nextMonth} onClick={() => setMonth(addMonths(month, n))} className="press grid size-6 place-items-center rounded-lg text-sub hover:bg-line/10 hover:text-ink touch:size-11">
              {n < 0 ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {weekdayRefs().map((d) => (
          <span key={+d} className="t-caption py-1 text-sub">
            <span aria-hidden>{formatWeekdayNarrow(language, d)}</span>
            <span className="sr-only">{formatWeekdayLong(language, d)}</span>
          </span>
        ))}
        {days.map((d) => {
          const sel = isSameDay(d, cursor)
          const today = isSameDay(d, new Date())
          return (
            <button
              key={+d} onClick={() => { useUI.setState({ cursor: d }); onPick?.() }} aria-pressed={sel} aria-current={today ? 'date' : undefined}
              aria-label={mark(d) ? `${formatFullDate(language, d)}, ${t.withEvents}` : formatFullDate(language, d)}
              className={clsx('press relative mx-auto grid size-7 place-items-center rounded-full text-[12px] tabular-nums touch:size-10 touch:text-[14px]',
                sel ? 'bg-accent font-semibold text-on-accent' : today ? 'font-semibold text-accent' : isSameMonth(d, month) ? 'hover:bg-line/10' : 'text-sub/50 hover:bg-line/10')}
            >
              {d.getDate()}
              {mark(d) && <span aria-hidden className={clsx('absolute bottom-0.5 size-1 rounded-full', sel ? 'bg-on-accent' : 'bg-accent')} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
