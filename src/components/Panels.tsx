import { ReactNode, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Plus, Timer, X } from 'lucide-react'
import clsx from 'clsx'
import { Panel, usePomodoro, useUI } from '../store'
import { SPRING } from '../lib/motion'
import { focusCalendar, useLayout } from '../lib/layout'
import { useCommon } from '../lib/vocab'
import { setRestoreFocus, useDialogBehavior } from './ui'

export const PANEL_ID: Record<Panel, string> = { nav: 'panel-nav', focus: 'panel-focus' }
const closePanel = () => useUI.setState({ panel: null })

/** ¿Está el panel fijo (escritorio) o es plegable? Se decide solo con el ancho; el DOM es siempre el mismo. */
export function usePanelDocked(panel: Panel) {
  const { navDocked, focusDocked } = useLayout()
  return panel === 'nav' ? navDocked : focusDocked
}

/** Hay un panel plegable abierto (modal): el resto de la app queda inerte detrás. */
export function useDrawerOpen() {
  const panel = useUI((s) => s.panel)
  const { navDocked, focusDocked } = useLayout()
  return panel === 'nav' ? !navDocked : panel === 'focus' ? !focusDocked : false
}

/** Abre un diálogo desde un panel plegable: el panel se cierra y, al cerrar el diálogo, el foco vuelve al botón visible que abrió el panel. */
export function openDialogFromPanel(panel: Panel, patch: Partial<ReturnType<typeof useUI.getState>>) {
  const toggles = Array.from(document.querySelectorAll<HTMLElement>(`[aria-controls="${PANEL_ID[panel]}"]`))
  setRestoreFocus(toggles.find((b) => b.getClientRects().length > 0) ?? null)
  useUI.setState({ panel: null, ...patch })
}

/** Tras elegir algo en el panel de navegación plegable: se cierra y el foco va al calendario (destino útil). Fijo en escritorio: no hace nada. */
export function afterNavigation(docked: boolean) {
  if (docked) return
  closePanel()
  requestAnimationFrame(() => focusCalendar())
}

/**
 * Contenedor de un panel. Fijo: una columna normal. Plegable: panel lateral modal que SIGUE MONTADO cuando está cerrado
 * (fuera de pantalla e inerte), de modo que su contenido —el iframe de YouTube, formularios, el mes del minicalendario— no se
 * remonta nunca al abrir, cerrar o cambiar de tamaño.
 */
export function PanelShell({ panel, label, side, dockedClass, children }: { panel: Panel; label: string; side: 'left' | 'right'; dockedClass: string; children: ReactNode }) {
  const docked = usePanelDocked(panel)
  const open = useUI((s) => s.panel === panel)
  const ref = useRef<HTMLElement>(null)
  const modal = !docked && open
  const hidden = !docked && !open
  useDialogBehavior(ref, modal, closePanel)
  const off = side === 'left' ? '-108%' : '108%'
  return (
    <motion.aside
      ref={ref} id={PANEL_ID[panel]} aria-label={label}
      // Solo ES un diálogo mientras está abierto como panel; cerrado o fijo es un complemento normal (y no bloquea el aviso de bienvenida).
      role={modal ? 'dialog' : undefined} aria-modal={modal || undefined} tabIndex={modal ? -1 : undefined}
      {...(hidden ? { inert: '' } : {})}
      initial={false} animate={{ x: hidden ? off : 0, opacity: hidden ? 0 : 1 }} transition={SPRING}
      className={clsx(docked ? dockedClass : clsx('drawer sheet-surface flex flex-col gap-3 overflow-y-auto overscroll-contain rounded-3xl p-3 outline-none', side === 'left' ? 'drawer-l' : 'drawer-r'))}
    >
      {children}
    </motion.aside>
  )
}

/** Cabecera de un panel plegable (título + cerrar). En el panel fijo no se muestra. */
export function PanelHeader({ panel, title, leading }: { panel: Panel; title: string; leading?: ReactNode }) {
  const docked = usePanelDocked(panel)
  const t = useCommon().layout
  if (docked) return null
  return (
    <div className="flex shrink-0 items-center gap-2 px-1">
      {leading}
      <h2 className="t-title min-w-0 flex-1 hyphens-auto break-words">{title}</h2>
      <button onClick={closePanel} aria-label={t.closePanel} className="press grid size-11 shrink-0 place-items-center rounded-full text-sub hover:bg-line/10 hover:text-ink"><X className="size-5" aria-hidden /></button>
    </div>
  )
}

export function Scrim() {
  const open = useDrawerOpen()
  return (
    <AnimatePresence>
      {open && <motion.div aria-hidden className="fixed inset-0 z-40 bg-black/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING} onPointerDown={closePanel} />}
    </AnimatePresence>
  )
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** Botón que abre/cierra un panel. Nombre constante + aria-expanded (estado abierto/cerrado), no solo color ni icono. */
export function PanelToggle({ panel, variant }: { panel: Panel; variant: 'header' | 'bar' }) {
  const open = useUI((s) => s.panel === panel)
  const left = usePomodoro((s) => (panel === 'focus' && s.running ? s.remaining : null)) // el tiempo restante visible: «rápido acceso» al Pomodoro
  const t = useCommon().layout
  const name = panel === 'nav' ? (variant === 'bar' ? t.menu : t.navTitle) : variant === 'bar' ? t.focus : t.focusTitle
  const Icon = panel === 'nav' ? Menu : Timer
  const toggle = () => useUI.setState({ panel: open ? null : panel })
  const common = { 'aria-expanded': open, 'aria-controls': PANEL_ID[panel], 'aria-haspopup': 'dialog' as const, onClick: toggle }
  const time = left !== null && <><span aria-hidden className="tabular-nums">{mmss(left)}</span><span className="sr-only">{t.running(mmss(left))}</span></>
  if (variant === 'header') {
    return (
      <button {...common} title={name} className="press btn-ghost flex size-10 items-center justify-center gap-1.5 !px-0 md:w-auto md:!px-3">
        <Icon className="size-[18px]" aria-hidden /><span className="sr-only">{name}</span>{time && <span className="t-caption !font-semibold text-ink">{time}</span>}
      </button>
    )
  }
  return (
    <button {...common} className="press flex min-h-12 min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 text-center text-sub hover:text-ink landscape-short:flex-row landscape-short:gap-2">
      <Icon className="size-5" aria-hidden />
      <span className="min-w-0 max-w-full hyphens-auto break-words text-[11px] font-semibold leading-tight">{name}{time && <> · {time}</>}</span>
    </button>
  )
}

/** Barra inferior (solo móvil). Ocupa su propio espacio en el flujo: no flota sobre el calendario ni sobre sus controles. */
export function MobileBar() {
  const t = useCommon().layout
  const drawer = useDrawerOpen()
  return (
    <nav aria-label={t.barLabel} {...(drawer ? { inert: '' } : {})} className="glass mt-2 flex shrink-0 items-stretch gap-1 rounded-3xl p-1 md:hidden">
      <PanelToggle panel="nav" variant="bar" />
      <button onClick={() => useUI.setState({ modal: { type: 'item' } })} className="press btn-primary mx-1 flex min-h-12 min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 !rounded-2xl !px-2 landscape-short:flex-none landscape-short:basis-auto landscape-short:!px-6">
        <Plus className="size-5" aria-hidden /> {t.add}
      </button>
      <PanelToggle panel="focus" variant="bar" />
    </nav>
  )
}
