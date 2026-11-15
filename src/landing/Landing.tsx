import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowRight, CalendarDays, Check, ChevronDown, CircleDashed, Globe, HardDrive, Headphones, Languages as LanguagesIcon,
  Link2, MonitorSmartphone, Moon, Palette, Sun, Timer,
} from 'lucide-react'
import clsx from 'clsx'
import logo from '../assets/logo-288.png'
import { LANGUAGES, PERSIST_NAME, isLanguage, type Language } from '../lib/preferences'
import { readSharedPrefs, saveSharedPref } from '../lib/sharedPrefs'
import { appHref } from './guard'
import { INITIAL_SAVE_NOTICE, applySaveResult, dismissSaveNotice, isSaveNoticeVisible } from './noticeState'
import { SaveNotice } from './SaveNotice'
import { PromptLog } from './Log'
import { ScreenshotGallery } from './ScreenshotGallery'
import { getLanding, type FeatureIcon, type LandingText, type Phase, type Status } from './content'

const ICONS: Record<FeatureIcon, typeof Timer> = {
  calendar: CalendarDays, link: Link2, timer: Timer, audio: Headphones,
  language: LanguagesIcon, palette: Palette, devices: MonitorSmartphone, storage: HardDrive,
}
const APP_URL = appHref(import.meta.env.BASE_URL)

const systemPrefersDark = () => { try { return window.matchMedia('(prefers-color-scheme: dark)').matches } catch { return false } }

/** Idioma, modo y tema que comparte con la aplicación (misma clave persistida; ver lib/sharedPrefs). */
function useSharedPrefs() {
  const [prefs, setPrefs] = useState(() => {
    const p = readSharedPrefs()
    return { language: p.language, dark: p.hasMode ? p.mode === 'dark' : systemPrefersDark(), theme: p.theme }
  })
  // Si la aplicación (otra pestaña) cambia idioma/modo/tema, esta página los sigue.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== PERSIST_NAME) return
      const p = readSharedPrefs()
      setPrefs((cur) => ({ language: p.language, dark: p.hasMode ? p.mode === 'dark' : cur.dark, theme: p.theme }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  // `saveSharedPref` devuelve false si no pudo guardar (almacenamiento bloqueado/lleno, o un valor ilegible que NO se sobrescribe).
  // El cambio se aplica igualmente en memoria; el resultado decide el aviso (nunca se confirma un guardado que no ocurrió).
  // El guardado se hace FUERA de los actualizadores de estado (deben ser puros; StrictMode los ejecuta dos veces).
  const [notice, setNotice] = useState(INITIAL_SAVE_NOTICE)
  const setLanguage = (language: Language) => { setPrefs((p) => ({ ...p, language })); const saved = saveSharedPref({ language }); setNotice((n) => applySaveResult(n, saved)) }
  const setDark = (dark: boolean) => { setPrefs((p) => ({ ...p, dark })); const saved = saveSharedPref({ mode: dark ? 'dark' : 'light' }); setNotice((n) => applySaveResult(n, saved)) }
  const dismissNotice = () => setNotice(dismissSaveNotice)
  return { ...prefs, setLanguage, setDark, noticeVisible: isSaveNoticeVisible(notice), dismissNotice }
}

export function Landing() {
  const { language, dark, theme, setLanguage, setDark, noticeVisible, dismissNotice } = useSharedPrefs()
  const t = getLanding(language)

  // Fragment targets are inserted by React after the browser's initial anchor lookup.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || id.startsWith('log-')) return
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Documento: lang, título, descripción, modo y tema (mismo `<html>` que usa la aplicación).
  useEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.classList.toggle('dark', dark)
    root.dataset.theme = theme
    document.title = t.documentTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription)
  }, [language, dark, theme, t])

  return (
    <div id="top">
      <a href="#main" className="skip-link">{t.skip}</a>
      <Header t={t} language={language} dark={dark} onLanguage={setLanguage} onDark={setDark} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-5 outline-none sm:px-8">
        <Hero t={t} />
        <About t={t} />
        <Features t={t} />
        <ScreenshotGallery language={language} />
        <Tech t={t} />
        <Phases t={t} language={language} />
        <Access t={t} />
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 text-ink/75 sm:px-8">
        <p className="l-small">{t.footer.text}</p>
        <a href="#top" className="l-link l-small">{t.footer.top}</a>
      </footer>
      <SaveNotice visible={noticeVisible} text={t.notices.saveFailed} dismissLabel={t.notices.dismiss} onDismiss={dismissNotice} />
    </div>
  )
}

/* ───────── Cabecera ───────── */
const SECTIONS = ['about', 'features', 'tech', 'phases'] as const

/** Al saltar a una sección, el foco pasa a su encabezado (sin volver a desplazar): el lector de pantalla anuncia el destino. */
const focusHeading = (id: string) => () => { requestAnimationFrame(() => document.getElementById(`${id}-title`)?.focus({ preventScroll: true })) }

function Header({ t, language, dark, onLanguage, onDark }: { t: LandingText; language: Language; dark: boolean; onLanguage: (l: Language) => void; onDark: (d: boolean) => void }) {
  return (
    <header className="relative z-30 px-3 pt-3 sm:px-8 md:sticky md:top-3">
      <div className="glass mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl px-3 py-2">
        <a href="#top" aria-label={t.header.homeLabel} className="press mr-auto flex min-h-11 items-center gap-2 rounded-xl pr-2 font-semibold tracking-tight">
          <img src={logo} alt="" width={28} height={28} className="size-7" />
          <span className="text-[1.0625rem]">Tempora</span>
        </a>
        <nav aria-label={t.header.navLabel} className="order-last w-full md:order-none md:w-auto">
          <ul className="flex flex-wrap items-center md:gap-x-0.5">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={focusHeading(id)} className="inline-flex min-h-11 items-center rounded-xl px-1.5 text-[0.875rem] font-medium md:px-3 md:text-[0.9375rem] text-ink/80 transition-colors hover:bg-line/10 hover:text-ink">{t.nav[id]}</a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button" aria-pressed={dark} aria-label={t.header.modeLabel} title={t.header.modeLabel} onClick={() => onDark(!dark)}
          className="l-ctrl"
        >
          {dark ? <Moon className="size-5" aria-hidden /> : <Sun className="size-5" aria-hidden />}
        </button>
        <LanguageSelect t={t} language={language} onChange={onLanguage} />
        <a href={APP_URL} className="l-btn-primary hidden sm:inline-flex">{t.header.open}</a>
      </div>
    </header>
  )
}

function LanguageSelect({ t, language, onChange }: { t: LandingText; language: Language; onChange: (l: Language) => void }) {
  return (
    <div className="relative max-w-full">
      <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/75" aria-hidden />
      <select
        aria-label={t.header.languageLabel} value={language}
        onChange={(e) => { if (isLanguage(e.target.value)) onChange(e.target.value) }}
        className="press min-h-11 w-full cursor-pointer appearance-none rounded-xl bg-transparent py-2 pl-9 pr-8 text-[0.9375rem] font-medium text-ink hover:bg-line/10"
        style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--line) / .18)' }}
      >
        {LANGUAGES.map((l) => <option key={l} value={l} lang={l}>{t.languageNames[l]}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink/75" aria-hidden />
    </div>
  )
}

/* ───────── Secciones ───────── */
function Section({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={clsx('pt-20 sm:pt-28', className)}>
      <h2 id={`${id}-title`} tabIndex={-1} className="l-h2 mb-4 max-w-[22ch] outline-none">{title}</h2>
      {children}
    </section>
  )
}

function Hero({ t }: { t: LandingText }) {
  return (
    <section aria-labelledby="hero-title" className="grid grid-cols-1 items-center gap-8 pb-4 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12 lg:pt-24">
      <div>
        <p className="l-eyebrow l-rise mb-4 flex items-center gap-2 text-ink/75"><span aria-hidden className="size-2 rounded-full bg-accent" />{t.hero.eyebrow}</p>
        <h1 id="hero-title" className="l-display l-rise" style={{ '--d': '60ms' } as CSSProperties}>Tempora</h1>
        <p className="l-lead l-rise mt-5 max-w-[34rem] text-ink/80" style={{ '--d': '120ms' } as CSSProperties}>{t.hero.lead}</p>
        <div className="l-rise mt-8 flex flex-wrap items-center gap-3" style={{ '--d': '180ms' } as CSSProperties}>
          <a href={APP_URL} className="l-btn-primary">{t.hero.primary}<ArrowRight className="size-4" aria-hidden /></a>
          <a href="#phases" onClick={focusHeading('phases')} className="l-btn-ghost">{t.hero.secondary}</a>
        </div>
        <p className="l-small l-rise mt-6 max-w-[34rem] text-ink/75" style={{ '--d': '240ms' } as CSSProperties}>{t.hero.note}</p>
      </div>
      <div className="l-rise relative mx-auto grid aspect-square w-60 max-w-full place-items-center sm:w-80" style={{ '--d': '140ms' } as CSSProperties}>
        <div className="l-halo absolute inset-0" aria-hidden />
        <img src={logo} alt={t.hero.logoAlt} width={288} height={288} className="relative size-36 drop-shadow-[0_18px_30px_rgb(0_0_0/0.28)] sm:size-48" />
      </div>
    </section>
  )
}

function About({ t }: { t: LandingText }) {
  const a = t.about
  return (
    <Section id="about" title={a.title}>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
        <div className="space-y-4 text-ink/85">
          {a.intro.map((p) => <p key={p} className="l-body max-w-[38rem]">{p}</p>)}
        </div>
        <div>
          <h3 className="l-h3 mb-3">{a.purposes.title}</h3>
          <dl className="divide-y divide-line/10 border-y border-line/10">
            {([a.purposes.academic, a.purposes.productivity]).map((p) => (
              <div key={p.name} className="grid gap-1 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                <dt className="font-semibold">{p.name}</dt>
                <dd className="l-body text-ink/80">{p.text}</dd>
              </div>
            ))}
          </dl>
          <p className="l-small mt-3 text-ink/75">{a.purposes.note}</p>
        </div>
      </div>
      <div className="mt-12 border-l-2 border-accent pl-5">
        <h3 className="l-h3 mb-1.5">{a.context.title}</h3>
        <p className="l-body max-w-[46rem] text-ink/85">{a.context.text}</p>
      </div>
    </Section>
  )
}

function Features({ t }: { t: LandingText }) {
  const f = t.features
  return (
    <Section id="features" title={f.title}>
      <p className="l-body max-w-[38rem] text-ink/80">{f.intro}</p>
      <dl className="mt-8 border-b border-line/10">
        {f.items.map((it) => {
          const Icon = ICONS[it.icon]
          return (
            <div key={it.title} className="grid grid-cols-1 gap-2 border-t border-line/10 py-5 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-10">
              <dt className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Icon className="size-[1.125rem]" /></span>
                <span className="l-h3 min-w-0">{it.title}</span>
              </dt>
              <dd className="l-body max-w-[40rem] text-ink/80">{it.text}</dd>
            </div>
          )
        })}
      </dl>
      <div className="mt-10 rounded-2xl p-5" style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--line) / .16)' }}>
        <h3 className="l-h3 mb-1">{f.notYet.title}</h3>
        <p className="l-small mb-3 text-ink/75">{f.notYet.intro}</p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {f.notYet.items.map((i) => (
            <li key={i} className="l-body flex items-start gap-2 text-ink/85"><CircleDashed className="mt-1 size-4 shrink-0 text-ink/70" aria-hidden />{i}</li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function Tech({ t }: { t: LandingText }) {
  return (
    <Section id="tech" title={t.tech.title}>
      <p className="l-body max-w-[38rem] text-ink/80">{t.tech.intro}</p>
      <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
        {t.tech.groups.map((g) => (
          <div key={g.name}>
            <dt className="l-eyebrow mb-2.5 text-ink/75">{g.name}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((i) => <li key={i} className="rounded-full px-3.5 py-1.5 text-[0.9375rem] font-medium" style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--line) / .2)' }}>{i}</li>)}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

/* ───────── Fases ───────── */
function StatusPill({ status, label }: { status: Status; label: string }) {
  const Icon = status === 'done' ? Check : CircleDashed
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold', status === 'done' ? 'bg-accent/15 text-ink' : 'text-ink/85')}
      style={status === 'done' ? undefined : { boxShadow: 'inset 0 0 0 1px rgb(var(--line) / .28)' }}>
      <Icon className={clsx('size-3.5', status === 'partial' && 'opacity-80')} aria-hidden />{label}
    </span>
  )
}

function PhaseBody({ phase, t, language }: { phase: Phase; t: LandingText; language: Language }) {
  const pt = t.phases
  if (phase.id === 'prompts') return <PromptLog language={language} />
  return (
    <ul className="mt-3 space-y-2.5">
      {phase.items.map((it) => (
        <li key={it.text} className="l-body flex items-start gap-2.5 text-ink/85">
          {it.status === 'done' ? <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden /> : <CircleDashed className="mt-1 size-4 shrink-0 text-ink/70" aria-hidden />}
          <span><span className="sr-only">{pt.itemLabel[it.status]}: </span>{it.text}{it.status === 'pending' && <span aria-hidden className="l-small ml-2 font-semibold text-ink/70">·&nbsp;{pt.itemLabel.pending}</span>}</span>
        </li>
      ))}
    </ul>
  )
}

function Phases({ t, language }: { t: LandingText; language: Language }) {
  const p = t.phases
  return (
    <Section id="phases" title={p.title}>
      <p className="l-body max-w-[38rem] text-ink/80">{p.intro}</p>
      <ol className="mt-10 max-w-3xl space-y-9">
        {p.items.map((ph, i) => (
          <li key={ph.id}>
            <div className="l-rail relative sm:grid sm:grid-cols-[2.375rem_minmax(0,1fr)] sm:gap-x-4">
              <span aria-hidden className="hidden size-[2.375rem] place-items-center rounded-full bg-accent text-[0.9375rem] font-bold text-on-accent sm:grid">{i + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-[0.875rem] font-bold text-on-accent sm:hidden">{i + 1}</span>
                  <h3 className="l-h3 min-w-0">{ph.title}</h3>
                  <StatusPill status={ph.status} label={p.statusLabel[ph.status]} />
                </div>
                <p className="l-small mt-1 text-ink/75">{ph.summary}</p>
                <PhaseBody phase={ph} t={t} language={language} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Access({ t }: { t: LandingText }) {
  return (
    <Section id="access" title={t.access.title} className="pb-20 sm:pb-28">
      <div className="glass rounded-3xl p-6 sm:p-10">
        <p className="l-lead max-w-[34rem]">{t.access.text}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={APP_URL} className="l-btn-primary">{t.access.cta}<ArrowRight className="size-4" aria-hidden /></a>
          <p className="l-small text-ink/75">{t.access.privacy}</p>
        </div>
      </div>
    </Section>
  )
}
