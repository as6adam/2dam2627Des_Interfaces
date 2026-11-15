import { useState } from 'react'
import { Bell, Check, FileText, GraduationCap, Globe } from 'lucide-react'
import clsx from 'clsx'
import { Item, ThemeName, useApp, useUI } from '../store'
import { ASSIGNMENT_WINDOW_DAYS, EXAM_WINDOW_DAYS, upcoming } from '../lib/hooks'
import { formatEventDateTime, relativeDayLabel } from '../lib/dates'
import { notify } from '../lib/notify'
import { useNotifyStatus } from '../lib/useNotifyStatus'
import { LANGUAGES, LANGUAGE_NAMES } from '../lib/i18n'
import { isLanguage } from '../lib/preferences'
import { useCommon, useLanguage, usePurposeInfo, useVocab } from '../lib/vocab'
import { Modal, Switch } from './ui'
import { ItemModal } from './ItemModal'
import { PurposeDialog } from './PurposeDialog'
import { AdvancedOverlays } from './AdvancedOverlays'

const close = () => useUI.setState({ modal: null })

function UpcomingRow({ i }: { i: Item }) {
  const language = useLanguage()
  return (
    <button onClick={() => { useUI.setState({ cursor: new Date(i.start), modal: null }) }} className="press flex w-full items-center gap-3 rounded-xl bg-line/5 px-3 py-2 text-left hover:bg-line/10">
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{i.subject}</span>
      <span className="t-caption tabular-nums text-sub">{formatEventDateTime(language, new Date(i.start))}</span>
      <span className="t-caption rounded-full bg-accent/15 px-2 py-0.5 text-accent">{relativeDayLabel(language, new Date(i.start))}</span>
    </button>
  )
}

function Startup() {
  const open = useUI((s) => s.modal?.type === 'startup')
  const items = useApp((s) => s.items)
  const v = useVocab()
  const t = useCommon().startup
  const { exams, assignments } = upcoming(items)
  return (
    <Modal open={open} onClose={close} width="max-w-lg" labelledBy="startup-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-accent/15 text-accent"><Bell className="size-5" aria-hidden /></span>
        <div><h3 id="startup-title" className="t-title">{t.title}</h3><p className="t-body text-sub">{t.subtitle}</p></div>
      </div>
      {exams.length > 0 && (
        <section className="mb-4">
          <p className="t-caption mb-2 flex items-center gap-1.5 uppercase text-sub"><GraduationCap className="size-3.5" aria-hidden /> {v.startup.exams(EXAM_WINDOW_DAYS)}</p>
          <div className="flex flex-col gap-1.5">{exams.map((i) => <UpcomingRow key={i.id} i={i} />)}</div>
        </section>
      )}
      {assignments.length > 0 && (
        <section className="mb-4">
          <p className="t-caption mb-2 flex items-center gap-1.5 uppercase text-sub"><FileText className="size-3.5" aria-hidden /> {v.startup.assignments(ASSIGNMENT_WINDOW_DAYS)}</p>
          <div className="flex flex-col gap-1.5">{assignments.map((i) => <UpcomingRow key={i.id} i={i} />)}</div>
        </section>
      )}
      <div className="flex justify-end"><button onClick={close} className="btn-primary">{t.gotIt}</button></div>
    </Modal>
  )
}

const GEMS: { id: ThemeName; from: string; to: string }[] = [
  { id: 'ruby', from: '#be123c', to: '#fb7185' },
  { id: 'agate', from: '#5b34c8', to: '#a78bfa' },
  { id: 'diamond', from: '#0891b2', to: '#a5f3fc' },
  { id: 'antimatter', from: '#3b0764', to: '#d946ef' },
]

function ThemeModal() {
  const open = useUI((s) => s.modal?.type === 'theme')
  const { theme, setTheme, mode, setMode } = useApp()
  const t = useCommon().themes
  const { darkMode: { switchLabel }, done } = useCommon().settings
  return (
    <Modal open={open} onClose={close} width="max-w-lg" labelledBy="theme-title">
      <h3 id="theme-title" className="t-title mb-1">{t.title}</h3>
      <p className="t-body mb-4 text-sub">{t.intro}</p>
      <div className="grid grid-cols-2 gap-3">
        {GEMS.map((g) => (
          <button key={g.id} onClick={() => setTheme(g.id)} aria-pressed={theme === g.id} className={clsx('press relative overflow-hidden rounded-2xl p-3 text-left ring-1', theme === g.id ? 'ring-2 ring-accent' : 'ring-line/10')}>
            <span className="mb-2 block h-14 rounded-xl" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, boxShadow: 'inset 0 1px 0 rgb(255 255 255 / .4)' }} />
            <span className="text-[13px] font-semibold">{t.names[g.id].name}</span>
            <span className="t-caption block text-sub">{t.names[g.id].hint}</span>
            {theme === g.id && <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-white/90 text-black"><Check className="size-3" aria-hidden /></span>}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-line/5 px-4 py-3">
        <span className="text-[13px] font-medium">{t.darkMode}</span>
        <Switch label={switchLabel} checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} />
      </div>
      <div className="mt-4 flex justify-end"><button onClick={close} className="btn-primary">{done}</button></div>
    </Modal>
  )
}

function SettingsRow({ title, desc, children, labelFor, descId, live }: { title: string; desc: string; children: React.ReactNode; labelFor?: string; descId?: string; live?: boolean }) {
  const titleCls = 'block text-[13px] font-semibold'
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="min-w-[11rem] flex-1">
        {labelFor ? <label htmlFor={labelFor} className={titleCls}>{title}</label> : <p className={titleCls}>{title}</p>}
        <p id={descId} aria-live={live ? 'polite' : undefined} className="t-caption text-sub">{desc}</p>
      </div>
      {children}
    </div>
  )
}

/** Select nativo con nombre accesible (la etiqueta de la fila) y globo decorativo. El cambio se aplica al instante. */
function LanguageSetting() {
  const language = useApp((s) => s.language)
  const setLanguage = useApp((s) => s.setLanguage)
  const t = useCommon().settings.language
  return (
    <SettingsRow title={t.title} desc={t.desc} labelFor="language-select" descId="language-desc">
      <div className="relative">
        <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-sub" aria-hidden />
        <select
          id="language-select" aria-describedby="language-desc" value={language}
          onChange={(e) => { if (isLanguage(e.target.value)) setLanguage(e.target.value) }}
          className="field !w-auto min-w-[9rem] cursor-pointer !pl-8"
        >
          {LANGUAGES.map((l) => <option key={l} value={l} lang={l}>{LANGUAGE_NAMES[l]}</option>)}
        </select>
      </div>
    </SettingsRow>
  )
}

function SettingsModal() {
  const open = useUI((s) => s.modal?.type === 'settings')
  const { mode, setMode, notifications, setNotifications, loadSample, clearAll, items, purpose } = useApp()
  const t = useCommon().settings
  const info = usePurposeInfo()
  const [confirm, setConfirm] = useState(false)
  const notifyStatus = useNotifyStatus(open)
  const purposeName = info[purpose ?? 'academic'].name
  return (
    <Modal open={open} onClose={() => { setConfirm(false); close() }} labelledBy="settings-title">
      <h3 id="settings-title" className="t-title mb-2">{t.title}</h3>
      <div className="divide-y divide-line/10">
        <SettingsRow title={t.darkMode.title} desc={t.darkMode.desc}><Switch label={t.darkMode.switchLabel} checked={mode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} /></SettingsRow>
        <LanguageSetting />
        <SettingsRow title={t.purpose.title} desc={t.purpose.desc(purposeName)}>
          <button onClick={() => useUI.setState({ purposeChange: true })} aria-haspopup="dialog" aria-label={t.purpose.changeLabel} className="btn-ghost !py-1.5">{t.purpose.change}</button>
        </SettingsRow>
        <SettingsRow title={t.notifications.title} desc={t.notifications.desc}>
          <div className="flex items-center gap-2">
            <button onClick={() => { void notify('Tempora', t.notifications.testBody) }} disabled={!notifications} aria-label={t.notifications.testLabel} className="btn-ghost !px-2 !py-1 !text-[12px] disabled:opacity-40">{t.notifications.test}</button>
            <Switch label={t.notifications.switchLabel} checked={notifications} onChange={setNotifications} />
          </div>
        </SettingsRow>
        {/* Tres cosas distintas: preferencia (interruptor), permiso real y disponibilidad (ambos en este estado). */}
        <SettingsRow title={t.notifications.permissionTitle} desc={notifyStatus.permission === null ? '' : t.notifications.status(notifyStatus.permission, notifyStatus.platform, notifications)} descId="notify-status" live>
          {notifyStatus.permission === 'default' && (
            <button onClick={() => { void notifyStatus.request() }} aria-label={t.notifications.allowLabel} aria-describedby="notify-status" className="btn-ghost !py-1.5">{t.notifications.allow}</button>
          )}
        </SettingsRow>
        <SettingsRow title={t.sample.title} desc={t.sample.desc}><button onClick={loadSample} aria-label={t.sample.loadLabel} className="btn-ghost !py-1.5">{t.sample.load}</button></SettingsRow>
        <SettingsRow title={t.clear.title} desc={t.clear.desc(items.length)}>
          {confirm
            ? <button onClick={() => { clearAll(); setConfirm(false) }} className="btn !bg-red-500 !py-1.5 text-white">{t.clear.confirm}</button>
            : <button onClick={() => setConfirm(true)} disabled={!items.length} aria-label={t.clear.clearLabel} className="btn-ghost !py-1.5 !text-red-500 disabled:opacity-40">{t.clear.clear}</button>}
        </SettingsRow>
      </div>
      <div className="mt-3 flex justify-end"><button onClick={() => { setConfirm(false); close() }} className="btn-primary">{t.done}</button></div>
    </Modal>
  )
}

export function Overlays() {
  return (<><ItemModal /><Startup /><ThemeModal /><SettingsModal /><PurposeDialog /><AdvancedOverlays /></>)
}
