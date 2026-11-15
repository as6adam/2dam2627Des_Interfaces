import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, isSameDay, setHours, setMinutes } from 'date-fns'
import { ChevronLeft, ChevronRight, MoveHorizontal, Plus, X } from 'lucide-react'
import clsx from 'clsx'
import { Item, useApp, useUI, Filter } from '../store'
import { END_H, HOUR_H, START_H, formatDayHeading, formatWeekRange, formatWeekdayShort, snap, weekDays } from '../lib/dates'
import { SPRING } from '../lib/motion'
import { EventCard, justDragged } from './EventCard'
import { useCommon, useLanguage, useVocab } from '../lib/vocab'
import { registerCalendar } from '../lib/layout'
import { PanelToggle, useDrawerOpen } from './Panels'

export function visibleItems(items: Item[], f: Filter) {
  const byId = new Map(items.map((i) => [i.id, i]))
  const root = (i: Item) => (i.linkedTo ? byId.get(i.linkedTo) ?? i : i)
  if (f.kind === 'all') return items
  if (f.kind === 'subject') return items.filter((i) => i.subject === f.subject)
  return items.filter((i) => root(i).kind === f.kind)
}

/** Side-by-side lanes for overlapping events. */
function layout(list: Item[]) {
  const sorted = [...list].sort((a, b) => +new Date(a.start) - +new Date(b.start))
  const out: Record<string, { lane: number; lanes: number }> = {}
  let cluster: Item[] = []
  let clusterEnd = 0
  const flush = () => {
    const ends: number[] = []
    const lane: Record<string, number> = {}
    for (const it of cluster) {
      const s = +new Date(it.start)
      let l = ends.findIndex((e) => e <= s)
      if (l < 0) l = ends.length
      ends[l] = s + it.duration * 60000
      lane[it.id] = l
    }
    for (const it of cluster) out[it.id] = { lane: lane[it.id], lanes: ends.length }
    cluster = []
  }
  for (const it of sorted) {
    const s = +new Date(it.start)
    if (cluster.length && s >= clusterEnd) { flush(); clusterEnd = 0 }
    cluster.push(it)
    clusterEnd = Math.max(clusterEnd, s + it.duration * 60000)
  }
  flush()
  return out
}

/** Ancho mínimo de una columna de día: por debajo se activa el scroll horizontal DENTRO del calendario (nunca de la página). En rem: escala con el texto. */
const DAY_MIN = '5.5rem'
const GUTTER = '3.5rem'

/** ¿Hay scroll horizontal y hacia qué lado queda contenido? Solo presentación (fundidos de borde y pista). */
function useScrollEdges(ref: React.RefObject<HTMLElement>, watch: unknown) {
  const [edges, setEdges] = useState({ overflow: false, atStart: true, atEnd: true })
  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const overflow = el.scrollWidth > el.clientWidth + 1
    const next = { overflow, atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 }
    setEdges((p) => (p.overflow === next.overflow && p.atStart === next.atStart && p.atEnd === next.atEnd ? p : next))
  }, [ref])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el); if (el.firstElementChild) ro?.observe(el.firstElementChild)
    return () => { el.removeEventListener('scroll', update); ro?.disconnect() }
  }, [ref, update, watch])
  return edges
}

export function CalendarView() {
  const items = useApp((s) => s.items)
  const v = useVocab()
  const t = useCommon().calendar
  const language = useLanguage()
  const { view, cursor, filter, picking } = useUI()
  const days = weekDays(cursor, view)
  const gridRef = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const vis = useMemo(() => visibleItems(items, filter), [items, filter])
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)
  const now = new Date()
  const drawerOpen = useDrawerOpen()
  const layoutT = useCommon().layout
  const edges = useScrollEdges(scroller, `${view}`)
  const [hintSeen, setHintSeen] = useState(false) // la pista de desplazamiento se oculta tras el primer desplazamiento lateral
  const lastLeft = useRef(0)

  useEffect(() => { scroller.current?.scrollTo({ top: (8 - START_H) * HOUR_H }) }, [])
  useEffect(() => {
    if (!picking) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && useUI.setState({ picking: null })
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [picking])

  const filterName = filter.kind === 'subject' ? filter.subject ?? '' : filter.kind === 'exam' ? v.filterChip.exam : v.filterChip.assignment
  const shift = (n: number) => useUI.setState({ cursor: addDays(cursor, view === 'day' ? n : 7 * n) })
  const title = view === 'day' ? formatDayHeading(language, cursor) : formatWeekRange(language, days[0], days[6])

  const onColumnClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    if (e.target !== e.currentTarget || justDragged) return
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const mins = Math.min(snap((y / HOUR_H) * 60 + START_H * 60, 30), (END_H - 1) * 60)
    const start = setMinutes(setHours(day, 0), mins)
    if (picking) {
      const parent = items.find((i) => i.id === picking.itemId)
      // Si el elemento se eliminó mientras se elegía hueco, no se crea una sesión huérfana (ni se guarda un texto de reserva en un idioma).
      if (!parent) { useUI.setState({ picking: null }); return }
      if (+start >= +new Date(parent.start)) return // study must happen before the due date
      useApp.getState().addItem({ kind: 'study', subject: parent.subject, start: start.toISOString(), duration: picking.duration, notes: '', linkedTo: picking.itemId })
      useUI.setState({ picking: null })
    } else {
      useUI.setState({ modal: { type: 'item', start } })
    }
  }

  const cols = (n: number) => ({ gridTemplateColumns: `repeat(${n}, minmax(${view === 'week' ? DAY_MIN : '0px'}, 1fr))` })
  const weekMin = view === 'week' ? `calc(${GUTTER} + ${days.length} * ${DAY_MIN})` : undefined

  return (
    <main ref={registerCalendar} tabIndex={-1} aria-label={layoutT.calendarLabel} {...(drawerOpen ? { inert: '' } : {})} className="glass relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl outline-none">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 pb-3 pt-3 md:px-5 md:pt-4">
        <div className="max-md:hidden wide:hidden"><PanelToggle panel="nav" variant="header" /></div>
        <h2 className="t-display min-w-0 flex-1 basis-40 break-words max-md:!text-[1.25rem] md:max-lg:!text-[1.5rem] md:truncate">{title}</h2>
        {filter.kind !== 'all' && (
          <button onClick={() => useUI.setState({ filter: { kind: 'all' } })} aria-label={t.clearFilter(filterName)} className="press t-caption flex min-h-8 max-w-full items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-accent touch:min-h-11">
            <span className="truncate">{filterName}</span> <X className="size-3 shrink-0" aria-hidden />
          </button>
        )}
        {/* En móvil: segunda fila (vista + navegación). Desde `md` los hijos se integran en la fila principal. */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:contents">
          <div role="group" aria-label={t.viewGroup} className="flex rounded-xl bg-line/10 p-0.5">
            {(['week', 'day'] as const).map((id) => (
              <button key={id} onClick={() => useUI.setState({ view: id })} aria-pressed={view === id} className="press relative rounded-[10px] px-3 py-1 text-[12px] font-semibold touch:min-h-10 touch:px-4">
                {view === id && <motion.span layoutId="view-pill" transition={SPRING} className="absolute inset-0 rounded-[10px] bg-glass/90 shadow-sm" />}
                <span className={clsx('relative', view === id ? 'text-ink' : 'text-sub')}>{t.views[id]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            <button aria-label={t.previous[view]} onClick={() => shift(-1)} className="press grid size-8 place-items-center rounded-lg text-sub hover:bg-line/10 touch:size-11"><ChevronLeft className="size-4" aria-hidden /></button>
            <button onClick={() => useUI.setState({ cursor: new Date() })} className="btn-ghost !px-3 !py-1.5 !text-[12px] touch:min-h-11">{t.today}</button>
            <button aria-label={t.next[view]} onClick={() => shift(1)} className="press grid size-8 place-items-center rounded-lg text-sub hover:bg-line/10 touch:size-11"><ChevronRight className="size-4" aria-hidden /></button>
          </div>
        </div>
        <button onClick={() => useUI.setState({ modal: { type: 'item' } })} className="btn-primary flex items-center gap-1.5 !py-1.5 max-md:hidden"><Plus className="size-4" aria-hidden /> {t.add}</button>
        <div className="max-md:hidden lg:hidden"><PanelToggle panel="focus" variant="header" /></div>
      </header>

      {/* Aviso en el flujo (no flota sobre el calendario ni sobre sus controles). */}
      <AnimatePresence initial={false}>
        {picking && (
          <motion.div role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="shrink-0 overflow-hidden px-3 md:px-5">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-accent px-4 py-2 text-[13px] font-medium text-on-accent">
              <span className="min-w-0 flex-1 basis-40">{v.placeSession}</span>
              <button onClick={() => useUI.setState({ picking: null })} className="press rounded-full bg-black/20 px-3 py-1 text-[12px] font-semibold touch:min-h-11 touch:px-4">{t.cancelPicking}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'week' && edges.overflow && !hintSeen && (
        <p className="t-caption flex shrink-0 items-center gap-1.5 px-4 pb-1.5 text-sub md:px-5"><MoveHorizontal className="size-3.5 shrink-0" aria-hidden /> {t.scrollHint}</p>
      )}

      <div className="relative min-h-0 flex-1">
        {/* Región con scroll propio y enfocable: el desplazamiento horizontal queda confinado aquí, nunca en la página. */}
        <div
          ref={scroller} role="region" tabIndex={0} aria-label={t.regionLabel[view]}
          onScroll={(e) => { const l = e.currentTarget.scrollLeft; if (Math.abs(l - lastLeft.current) > 4) setHintSeen(true); lastLeft.current = l }}
          className="absolute inset-0 overflow-auto overscroll-contain"
        >
          <div style={{ minWidth: weekMin }}>
            <div className="glass sticky top-0 z-20 flex !rounded-none !border-x-0 !border-t-0 !shadow-none">
              <div className="sticky left-0 z-10 w-12 shrink-0 bg-glass/90 md:w-14" />
              <div className="grid flex-1" style={cols(days.length)}>
                {days.map((d) => {
                  const today = isSameDay(d, now)
                  return (
                    <button key={+d} onClick={() => useUI.setState({ cursor: d, view: 'day' })} aria-label={formatDayHeading(language, d)} aria-current={today ? 'date' : undefined} className="press py-2 text-center">
                      <p aria-hidden className="t-caption text-sub">{formatWeekdayShort(language, d)}</p>
                      <p aria-hidden className={clsx('mx-auto mt-0.5 grid size-8 place-items-center rounded-full text-[17px] font-semibold tracking-tight tabular-nums', today && 'bg-accent text-on-accent')}>{d.getDate()}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex" style={{ height: hours.length * HOUR_H }}>
              <div className="sticky left-0 z-10 w-12 shrink-0 bg-glass/90 md:w-14">
                {hours.map((h, i) => i > 0 && (
                  <span key={h} className="t-caption absolute right-2 -translate-y-1/2 tabular-nums text-sub" style={{ top: i * HOUR_H }}>{String(h).padStart(2, '0')}:00</span>
                ))}
              </div>
              <div ref={gridRef} className="relative grid flex-1" style={cols(days.length)}>
                {hours.map((h, i) => <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line/[.07]" style={{ top: i * HOUR_H }} />)}
                {days.map((d) => {
                  const list = vis.filter((i) => isSameDay(new Date(i.start), d))
                  const lay = layout(list)
                  const today = isSameDay(d, now)
                  return (
                    <div key={+d} onClick={(e) => onColumnClick(e, d)} className={clsx('relative border-l border-line/[.07]', picking ? 'cursor-crosshair' : 'cursor-cell', today && 'bg-accent/[.04]')}>
                      {list.map((it) => <EventCard key={it.id} item={it} lane={lay[it.id].lane} lanes={lay[it.id].lanes} dayCount={days.length} gridRef={gridRef} />)}
                      {today && now.getHours() >= START_H && now.getHours() < END_H && (
                        <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: (now.getHours() - START_H + now.getMinutes() / 60) * HOUR_H }}>
                          <span className="-ml-1 size-2 rounded-full bg-accent" /><span className="h-px flex-1 bg-accent" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Fundidos de borde: indican que hay más días a ese lado (la pista de texto lo dice también, no solo el degradado). */}
        {edges.overflow && !edges.atStart && <div aria-hidden className="edge-fade-l pointer-events-none absolute inset-y-0 left-12 w-6 md:left-14" />}
        {edges.overflow && !edges.atEnd && <div aria-hidden className="edge-fade-r pointer-events-none absolute inset-y-0 right-0 w-8" />}
      </div>
    </main>
  )
}
