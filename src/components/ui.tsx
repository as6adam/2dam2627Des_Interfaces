import { ReactNode, RefObject, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { SPRING, SPRING_BOUNCE } from '../lib/motion'
import { focusCalendar } from '../lib/layout'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={clsx('press flex h-[26px] w-[44px] shrink-0 items-center rounded-full p-[3px] transition-colors', checked ? 'justify-end bg-accent' : 'justify-start bg-line/20')}
    >
      <motion.span layout transition={SPRING_BOUNCE} className="size-5 rounded-full bg-white shadow-md" />
    </button>
  )
}

/* ───────── Gestión de foco para diálogos ───────── */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
const stack: symbol[] = [] // el diálogo superior es el único que atiende Esc/Tab (permite diálogos anidados)
let lastOutside: HTMLElement | null = null // último elemento enfocado fuera de cualquier diálogo
if (typeof document !== 'undefined') {
  document.addEventListener('focusin', (e) => {
    const t = e.target as HTMLElement | null
    if (t && !t.closest?.('[role="dialog"]')) lastOutside = t
  }, true)
}

/**
 * Destino de restauración del foco para el PRÓXIMO diálogo que se abra (consumo único). Lo usa un panel plegable al abrir
 * un diálogo desde él: el panel se cierra a la vez, así que «el último elemento enfocado» ya no existe; el foco debe volver al botón que abrió el panel.
 */
let forcedRestore: HTMLElement | null = null
export const setRestoreFocus = (el: HTMLElement | null) => { forcedRestore = el }

/** Elementos alcanzables con Tab; un grupo de radios cuenta como una sola parada (el marcado, o el primero). */
function tabbables(root: HTMLElement) {
  const all = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)
  return all.filter((el) => {
    if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) return true
    const group = all.filter((o): o is HTMLInputElement => o instanceof HTMLInputElement && o.type === 'radio' && o.name === el.name)
    return el === (group.find((o) => o.checked) ?? group[0])
  })
}

/**
 * Comportamiento común de cualquier superficie modal (diálogo, hoja de detalle, panel lateral):
 * foco inicial, Tab atrapado, Escape (solo el superior de la pila) y restauración del foco al cerrar.
 * `active` puede alternarse sin desmontar el contenido (los paneles plegables permanecen montados).
 */
export function useDialogBehavior(ref: RefObject<HTMLElement>, active: boolean, onClose: () => void, dismissible = true) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return
    const root = ref.current
    const token = Symbol('modal')
    stack.push(token)

    const el0 = document.activeElement as HTMLElement | null
    const previous = forcedRestore?.isConnected ? forcedRestore : el0 && el0 !== document.body && !root?.contains(el0) ? el0 : lastOutside
    forcedRestore = null

    if (root && !root.contains(document.activeElement)) {
      const target = root.querySelector<HTMLElement>('[data-autofocus]') ?? tabbables(root)[0] ?? root
      target.focus({ preventScroll: true })
    }

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== token) return
      if (e.key === 'Escape') {
        if (dismissible) { e.preventDefault(); e.stopPropagation(); closeRef.current() }
        return
      }
      const el = ref.current
      if (e.key !== 'Tab' || !el) return
      const list = tabbables(el)
      if (!list.length) { e.preventDefault(); el.focus(); return }
      const first = list[0], last = list[list.length - 1], current = document.activeElement
      if (!el.contains(current)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && current === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && current === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      stack.splice(stack.indexOf(token), 1)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
      else focusCalendar() // el origen ya no existe (p. ej. la tarjeta cambió de día): destino útil
    }
  }, [active, dismissible, ref])
}

export function Modal({
  open, onClose, children, width = 'max-w-md', labelledBy, dismissible = true, onExitComplete,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: string
  /** id del elemento que titula el diálogo (nombre accesible). */
  labelledBy: string
  /** false: ni Esc ni clic en el fondo lo cierran (p. ej. elección obligatoria de primer uso). */
  dismissible?: boolean
  onExitComplete?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDialogBehavior(ref, open, onClose, dismissible)

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          // `vv-fixed`: sigue al viewport visual (teclado virtual) y respeta las áreas seguras; el contenido hace scroll interno.
          className="vv-fixed z-50 grid place-items-center bg-black/30 p-3 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING}
          onPointerDown={dismissible ? onClose : undefined}
        >
          <motion.div
            ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}
            className={clsx('glass-strong max-h-full w-full overflow-y-auto overscroll-contain rounded-3xl p-5 outline-none sm:p-6', width)}
            initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={SPRING_BOUNCE} onPointerDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="t-caption mb-1 block uppercase text-sub">{label}</span>
    {children}
  </label>
)
