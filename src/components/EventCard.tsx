import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { animate, motion, useMotionValue } from 'framer-motion'
import { addDays, addMinutes } from 'date-fns'
import { BookOpen, FileText, GraduationCap } from 'lucide-react'
import { Item, Kind, useApp, useUI } from '../store'
import { HOUR_H, START_H, formatDragPreview, formatEventDateTime, formatTime, snap } from '../lib/dates'
import { formErrorText, useCommon, useLanguage, useVocab } from '../lib/vocab'
import { validateReschedule } from '../lib/schedule'
import { useToasts } from '../lib/toasts'
import { SPRING } from '../lib/motion'

export let justDragged = false // lets the column ignore the click that trails a drag

const META: Record<Kind, { color: string; icon: typeof BookOpen }> = {
  exam: { color: 'var(--accent)', icon: GraduationCap },
  assignment: { color: 'var(--assign)', icon: FileText },
  study: { color: 'var(--study)', icon: BookOpen },
}
export const kindMeta = META

/** Mantener pulsado (táctil) este tiempo «agarra» la tarjeta; antes de eso, mover el dedo desplaza el calendario. */
export const LONG_PRESS_MS = 380
/** Táctil: si el dedo se mueve más de esto antes de agarrar, es un desplazamiento (no un arrastre). */
export const LONG_PRESS_SLOP = 8
/** Ratón/lápiz: movimiento mínimo para empezar a arrastrar (por debajo es un clic). */
export const MOUSE_DRAG_SLOP = 4

export function EventCard({ item, lane, lanes, dayCount, gridRef }: { item: Item; lane: number; lanes: number; dayCount: number; gridRef: React.RefObject<HTMLDivElement> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<Date | null>(null) // se guarda la FECHA: el texto se formatea al renderizar, con el idioma vigente
  const [armed, setArmed] = useState(false) // la tarjeta está «agarrada» y sigue al puntero
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const track = useRef<(() => void) | null>(null) // limpia los oyentes del gesto en curso
  const swallowClick = useRef(false)
  const language = useLanguage()
  const start = new Date(item.start)
  const top = (start.getHours() - START_H + start.getMinutes() / 60) * HOUR_H
  const height = Math.max(30, (item.duration / 60) * HOUR_H - 2)
  const v = useVocab()
  const t = useCommon().calendar
  const { color, icon: Icon } = META[item.kind]
  const label = v.kind[item.kind]

  useEffect(() => () => { track.current?.() }, [])

  /** Pointer offset → new start. Y snaps to 15 min, X snaps to whole day columns. */
  const target = (dx: number, dy: number) => {
    const colW = (gridRef.current?.clientWidth ?? 1) / dayCount
    const mins = snap((dy / HOUR_H) * 60)
    return addMinutes(addDays(start, Math.round(dx / colW)), mins)
  }

  const openDetail = () => {
    const r = ref.current!.getBoundingClientRect()
    useUI.setState({ popover: { id: item.id, rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } } })
  }

  /** Aplica (o rechaza con explicación) un cambio de inicio: mismas reglas para ratón, táctil y formulario. */
  const commit = (next: Date) => {
    if (+next === +start) return
    const error = validateReschedule(useApp.getState().items, item.id, next)
    if (error) {
      const { language: lang, purpose } = useApp.getState()
      useToasts.getState().push('Tempora', formErrorText(lang, purpose, error)) // la tarjeta vuelve a su sitio y se explica por qué
      return
    }
    useApp.getState().updateItem(item.id, { start: next.toISOString() })
  }

  const springHome = () => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) { mx.set(0); my.set(0) } // sin movimiento: cambio directo
    else { animate(mx, 0, SPRING); animate(my, 0, SPRING) }
  }

  /**
   * Gesto propio (ratón, lápiz y dedo) sobre una tarjeta:
   *  · ratón/lápiz: arrastra al superar un pequeño umbral;
   *  · dedo: mover antes de la pulsación larga = desplazar el calendario; mantener pulsado «agarra» y desde ahí el dedo es de la tarjeta
   *    (se cancela el scroll nativo del resto del gesto). La tarjeta se mueve con valores de movimiento, limitada al calendario.
   */
  const begin = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    track.current?.()
    swallowClick.current = false
    const { pointerId, clientX: x0, clientY: y0 } = e
    const touch = e.pointerType === 'touch'
    const el = e.currentTarget
    let dragging = false
    let timer = 0
    let limits = { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)
    const stopScroll = (ev: TouchEvent) => { if (ev.cancelable) ev.preventDefault() }

    const grab = () => {
      const grid = gridRef.current?.getBoundingClientRect(); const me = el.getBoundingClientRect()
      if (!grid) return
      dragging = true; swallowClick.current = true
      limits = { minX: grid.left - me.left, maxX: grid.right - me.right, minY: grid.top - me.top, maxY: grid.bottom - me.bottom }
      setArmed(true)
      try { el.setPointerCapture(pointerId) } catch { /* el puntero ya terminó */ }
      if (touch) { try { navigator.vibrate?.(8) } catch { /* sin vibración: el cambio visual y el texto bastan */ } window.addEventListener('touchmove', stopScroll, { passive: false }) }
    }
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      const rx = ev.clientX - x0, ry = ev.clientY - y0
      if (!dragging) {
        const dist = Math.hypot(rx, ry)
        if (touch) { if (dist > LONG_PRESS_SLOP) stop() } // es un desplazamiento: el calendario lo gestiona el navegador
        else if (dist > MOUSE_DRAG_SLOP) grab()
        if (!dragging) return
      }
      const dx = clamp(rx, limits.minX, limits.maxX), dy = clamp(ry, limits.minY, limits.maxY)
      mx.set(dx); my.set(dy)
      const next = target(dx, dy)
      setPreview((p) => (p && +p === +next ? p : next))
    }
    const stop = () => {
      clearTimeout(timer)
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); window.removeEventListener('touchmove', stopScroll)
      track.current = null
    }
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      const dropped = dragging && ev.type === 'pointerup' ? target(mx.get(), my.get()) : null
      const was = dragging
      stop()
      if (was) {
        justDragged = true; setTimeout(() => (justDragged = false), 60)
        setArmed(false); setPreview(null); springHome()
        if (dropped) commit(dropped)
      }
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    track.current = stop
    if (touch) timer = window.setTimeout(grab, LONG_PRESS_MS)
  }

  return (
    <motion.div
      ref={ref} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={t.eventLabel(label, item.subject, formatEventDateTime(language, start))}
      whileTap={{ scale: 0.985 }}
      onPointerDown={begin}
      onContextMenu={(e) => { if (armed || track.current) e.preventDefault() }} // el menú contextual de la pulsación larga no debe tapar el agarre
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); openDetail() } }}
      onClick={() => { if (swallowClick.current) { swallowClick.current = false; return } openDetail() }}
      initial={false}
      className={clsx('absolute touch-pan-x touch-pan-y overflow-hidden rounded-xl px-2.5 py-1.5 [-webkit-touch-callout:none]', armed ? 'cursor-grabbing' : 'cursor-grab')}
      style={{
        top, height, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)`, zIndex: armed ? 40 : 10, x: mx, y: my, scale: armed ? 1.03 : 1,
        background: `linear-gradient(135deg, rgb(${color} / .26), rgb(${color} / .12))`,
        border: `1px solid rgb(${color} / .5)`,
        boxShadow: armed ? `0 0 0 2px rgb(${color}), 0 18px 40px -12px rgb(0 0 0 / .45)` : `inset 0 1px 0 rgb(255 255 255 / .3), 0 4px 14px -6px rgb(${color} / .6)`,
        backdropFilter: 'blur(10px) saturate(160%)', WebkitBackdropFilter: 'blur(10px) saturate(160%)',
      }}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: `rgb(${color})` }} />
      <div className="flex items-center gap-1.5 pl-1">
        <Icon aria-hidden className="size-3 shrink-0" style={{ color: `rgb(${color})` }} />
        <span className="truncate text-[12px] font-semibold tracking-tight">{item.subject}</span>
      </div>
      <p aria-hidden className="t-caption truncate pl-1 text-sub tabular-nums">
        {preview ? formatDragPreview(language, preview) : armed ? t.dragReady : `${label} · ${formatTime(start)}`}
      </p>
    </motion.div>
  )
}
