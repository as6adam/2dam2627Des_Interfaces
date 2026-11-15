import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CalendarClock, ChevronDown, ClipboardList, FolderOpen, Moon, Palette, Settings, Sun, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import logo from '../assets/logo.png'
import { Filter, Kind, useApp, useUI } from '../store'
import { SPRING } from '../lib/motion'
import { useCommon, usePurposeInfo, useVocab } from '../lib/vocab'
import { MiniCalendar } from './MiniCalendar'
import { PanelHeader, PanelShell, afterNavigation, openDialogFromPanel, usePanelDocked } from './Panels'
import { Switch } from './ui'
import { advancedText } from '../lib/advancedText'
import { useLanguage } from '../lib/vocab'
import { BarChart3, FolderSync } from 'lucide-react'

function NavItem({ icon: Icon, label, active, badge, onClick, trailing, haspopup, expanded }: { icon: LucideIcon; label: string; active?: boolean; badge?: number; onClick: () => void; trailing?: React.ReactNode; haspopup?: boolean; expanded?: boolean }) {
  return (
    <button onClick={onClick} aria-haspopup={haspopup ? 'dialog' : undefined} aria-expanded={expanded} className="press relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-sub hover:text-ink touch:min-h-11">
      {active && <motion.span layoutId="nav-pill" transition={SPRING} className="absolute inset-0 rounded-xl bg-accent/15 ring-1 ring-accent/25" />}
      <Icon aria-hidden className={clsx('relative size-4', active && 'text-accent')} />
      <span className={clsx('relative flex-1', active && 'text-ink')}>{label}</span>
      {badge ? <span className="t-caption relative rounded-full bg-line/10 px-1.5 py-0.5 tabular-nums">{badge}</span> : null}
      {trailing}
    </button>
  )
}

export function Sidebar() {
  const items = useApp((s) => s.items)
  const { mode, setMode, purpose } = useApp()
  const v = useVocab()
  const common = useCommon()
  const t = common.sidebar
  const advanced = advancedText(useLanguage())
  const purposeInfo = usePurposeInfo()
  const filter = useUI((s) => s.filter)
  const modal = useUI((s) => s.modal)
  const purposeChange = useUI((s) => s.purposeChange)
  const [open, setOpen] = useState(false)
  const docked = usePanelDocked('nav')

  const count = (k: Kind) => items.filter((i) => i.kind === k).length
  const subjects = [...new Set(items.filter((i) => i.kind !== 'study').map((i) => i.subject))].sort()

  const apply = (f: Filter, jumpTo?: Kind) => {
    const next = items.filter((i) => i.kind === jumpTo && +new Date(i.start) >= Date.now()).sort((a, b) => +new Date(a.start) - +new Date(b.start))[0]
    useUI.setState({ filter: f, ...(next ? { cursor: new Date(next.start) } : {}) })
    afterNavigation(docked)
  }
  /** Diálogos (propósito, tema, ajustes): el panel plegable se cierra y el diálogo toma el foco; al cerrarlo, el foco vuelve al botón del menú. */
  const openDialog = (patch: Partial<ReturnType<typeof useUI.getState>>) => (docked ? useUI.setState(patch) : openDialogFromPanel('nav', patch))

  return (
    <PanelShell panel="nav" side="left" label={t.navLabel} dockedClass="glass flex w-[264px] shrink-0 flex-col gap-4 overflow-y-auto rounded-3xl p-4">
      <PanelHeader panel="nav" title={common.layout.navTitle} />
      <div className="flex items-center gap-3 px-1 pt-1">
        <img src={logo} alt={t.logoAlt} className="size-11 rounded-[14px] shadow-lg shadow-accent/30" draggable={false} />
        <div>
          <h1 className="t-title">Tempora</h1>
          <p className="t-caption text-sub">{t.tagline}</p>
        </div>
      </div>

      <MiniCalendar onPick={() => afterNavigation(docked)} />

      <nav className="flex flex-col gap-0.5">
        <NavItem icon={CalendarDays} label={t.allEvents} active={filter.kind === 'all'} onClick={() => apply({ kind: 'all' })} />
        <NavItem icon={CalendarClock} label={v.nav.exams} badge={count('exam')} active={filter.kind === 'exam'} onClick={() => apply({ kind: 'exam' }, 'exam')} />
        <NavItem icon={ClipboardList} label={v.nav.assignments} badge={count('assignment')} active={filter.kind === 'assignment'} onClick={() => apply({ kind: 'assignment' }, 'assignment')} />
        <NavItem
          icon={FolderOpen} label={v.nav.subjects} active={filter.kind === 'subject'} expanded={open} onClick={() => setOpen(!open)}
          trailing={<ChevronDown aria-hidden className={clsx('relative size-4 transition-transform', open && 'rotate-180')} />}
        />
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SPRING} className="overflow-hidden pl-4">
              {subjects.length === 0 && <p className="t-caption px-3 py-2 text-sub">{v.nav.subjectsEmpty}</p>}
              {subjects.map((s) => (
                <button key={s} onClick={() => { useUI.setState({ filter: { kind: 'subject', subject: s } }); afterNavigation(docked) }}
                  className={clsx('press flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[12.5px] hover:bg-line/10 touch:min-h-11', filter.subject === s ? 'font-semibold text-accent' : 'text-sub')}>
                  <FolderOpen className="size-3.5" /> <span className="truncate">{s}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <NavItem icon={Target} label={t.purposeControl(purposeInfo[purpose ?? 'academic'].name)} haspopup active={purposeChange} onClick={() => openDialog({ purposeChange: true })} />
        <NavItem icon={Palette} label={t.themes} active={modal?.type === 'theme'} onClick={() => openDialog({ modal: { type: 'theme' } })} />
        <NavItem icon={Settings} label={t.settings} active={modal?.type === 'settings'} onClick={() => openDialog({ modal: { type: 'settings' } })} />
        <NavItem icon={BarChart3} label={advanced.stats} active={modal?.type === 'statistics'} onClick={() => openDialog({ modal: { type: 'statistics' } })} />
        <NavItem icon={FolderSync} label={advanced.transfer} active={modal?.type === 'transfer'} onClick={() => openDialog({ modal: { type: 'transfer' } })} />
      </nav>

      <div className="mt-auto flex items-center justify-between rounded-2xl bg-line/5 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium">
          {mode === 'dark' ? <Moon className="size-4 text-accent" /> : <Sun className="size-4 text-accent" />}
          {t.mode[mode]}
        </span>
        <Switch label={common.settings.darkMode.switchLabel} checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />
      </div>
    </PanelShell>
  )
}
