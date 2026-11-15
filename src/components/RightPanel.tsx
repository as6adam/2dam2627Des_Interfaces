import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react'
import clsx from 'clsx'
import { PHASES, PRESETS, Phase, useAudio, usePomodoro } from '../store'
import { SPRING } from '../lib/motion'
import { useCommon } from '../lib/vocab'
import type { PresetId } from '../lib/i18n'
import { parseAudioSource, type AudioUrlError } from '../lib/audio'
import { setAudioSlot } from '../lib/audioSlot'
import { PanelHeader, PanelShell } from './Panels'

const R = 54
const C = 2 * Math.PI * R

function Pomodoro() {
  const { phase, remaining, running, sessions, start, pause, reset, setPhase } = usePomodoro()
  const t = useCommon().timer
  const total = PHASES[phase].secs
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const status = running ? (phase === 'focus' ? t.focusing : t.onBreak) : remaining === total ? t.ready : t.paused

  return (
    <section className="glass rounded-3xl p-4" aria-label={t.section}>
      <div role="group" aria-label={t.phaseGroup} className="mb-4 flex rounded-xl bg-line/10 p-0.5">
        {(Object.keys(PHASES) as Phase[]).map((p) => (
          <button key={p} onClick={() => setPhase(p)} aria-pressed={phase === p} className="press relative flex-1 rounded-[10px] py-1 text-[11.5px] font-semibold touch:min-h-11">
            {phase === p && <motion.span layoutId="phase-pill" transition={SPRING} className="absolute inset-0 rounded-[10px] bg-glass/90 shadow-sm" />}
            <span className={clsx('relative', phase === p ? 'text-ink' : 'text-sub')}>{t.phases[p]}</span>
          </button>
        ))}
      </div>

      <div className="relative mx-auto size-[168px]">
        <svg viewBox="0 0 128 128" className="size-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" strokeWidth="7" className="stroke-line/10" />
          <motion.circle
            cx="64" cy="64" r={R} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-accent"
            strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - remaining / total) }} transition={{ duration: 0.3, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 6px rgb(var(--accent) / .55))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <p className="text-[38px] font-semibold leading-none tracking-[-0.03em] tabular-nums" aria-live="off">{mm}:{ss}</p>
          <p role="status" className="t-caption mt-1.5 flex items-center justify-center gap-1.5 text-sub">
            <span aria-hidden className={clsx('size-1.5 rounded-full', running ? 'animate-pulse bg-accent' : 'bg-line/30')} /> {status}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button aria-label={t.reset} onClick={reset} className="press grid size-11 place-items-center rounded-full bg-line/10 text-sub hover:text-ink"><RotateCcw className="size-4" aria-hidden /></button>
        <button onClick={running ? pause : start} className="btn-primary flex h-11 min-w-[116px] items-center justify-center gap-2 !rounded-full">
          {running ? <><Pause className="size-4" aria-hidden /> {t.pause}</> : <><Play className="size-4" aria-hidden /> {t.start}</>}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5" role="img" aria-label={t.sessionsDoneLabel(sessions)}>
        {Array.from({ length: 4 }, (_, i) => <span key={i} aria-hidden className={clsx('size-1.5 rounded-full', i < sessions % 4 || (sessions > 0 && sessions % 4 === 0) ? 'bg-accent' : 'bg-line/20')} />)}
        <span className="t-caption ml-1 text-sub" aria-hidden>{t.sessionsDone(sessions)}</span>
      </div>
    </section>
  )
}

function AudioPlayer() {
  const { preset, url, playing, volume, status, problem, selectPreset, setCustom, toggle, retry, toggleMute, setVolume } = useAudio()
  const [draft, setDraft] = useState('')
  const [urlError, setUrlError] = useState<AudioUrlError | null>(null) // código tipado: el texto se resuelve al renderizar (idioma vigente)
  const parsed = parseAudioSource(url)
  // Reproductor de YouTube VISIBLE (≥200×200, sin nada encima) solo mientras se usa una fuente de YouTube ya iniciada por el usuario.
  const showPlayer = parsed.ok && parsed.kind === 'youtube' && (status === 'loading' || status === 'ready')
  const t = useCommon().audio
  const tabs = [...PRESETS.map((p) => ({ id: p.id as string, label: t.presets[p.id as PresetId] })), { id: 'custom', label: t.custom }]
  const VolIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2
  const label = problem ? t.problems[problem] : status === 'loading' ? t.loading : playing ? t.playing : t.paused

  return (
    <section className="glass rounded-3xl p-4" aria-label={t.section}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold tracking-tight">{t.heading}</h3>
        {playing && !problem && status !== 'loading' && (
          <span className="flex h-3.5 items-end gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => <motion.span key={i} className="w-0.5 rounded-full bg-accent" animate={{ height: ['30%', '100%', '45%'] }} transition={{ duration: 0.9, repeat: Infinity, repeatType: 'mirror', delay: i * 0.15 }} />)}
          </span>
        )}
      </div>
      {/* El reproductor de YouTube se muestra completo: sin superposiciones ni recortes por debajo del mínimo (200×200). */}
      <div ref={setAudioSlot} role="group" aria-label={t.youtubePlayer} hidden={!showPlayer} className="mb-3 h-[200px] overflow-hidden rounded-xl bg-black [&_iframe]:block [&_iframe]:h-[200px] [&_iframe]:w-full" />
      <div role="group" aria-label={t.sourceGroup} className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-line/10 p-0.5">
        {tabs.map((tab) => (
          <button key={tab.id} aria-pressed={preset === tab.id} onClick={() => (tab.id === 'custom' ? useAudio.setState({ preset: 'custom' }) : selectPreset(tab.id))} className="press relative rounded-[10px] py-1.5 text-[11.5px] font-semibold touch:min-h-11">
            {preset === tab.id && <motion.span layoutId="audio-pill" transition={SPRING} className="absolute inset-0 rounded-[10px] bg-glass/90 shadow-sm" />}
            <span className={clsx('relative', preset === tab.id ? 'text-ink' : 'text-sub')}>{tab.label}</span>
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <form className="mb-3" noValidate onSubmit={(e) => {
          e.preventDefault()
          const p = parseAudioSource(draft)
          if (!p.ok) return setUrlError(p.reason)
          if (setCustom(draft)) { setDraft(''); setUrlError(null) }
        }}>
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Link2 aria-hidden className="absolute left-2.5 top-2.5 size-3.5 text-sub" />
              <input value={draft} onChange={(e) => { setDraft(e.target.value); setUrlError(null) }} placeholder={t.urlPlaceholder} className="field !pl-8 touch:min-h-11 touch:text-[16px]" aria-label={t.urlLabel}
                aria-invalid={urlError !== null} aria-describedby={urlError ? 'audio-url-error' : 'audio-url-help'} />
            </div>
            <button className="btn-primary !px-3 touch:min-h-11">{t.load}</button>
          </div>
          {urlError
            ? <p id="audio-url-error" role="alert" className="t-caption mt-1.5 text-red-500">{t.urlErrors[urlError]}</p>
            : <p id="audio-url-help" className="t-caption mt-1.5 text-sub">{t.urlHelp}</p>}
        </form>
      )}

      <div className="flex items-center gap-3">
        <button aria-label={playing ? t.pause : t.play} onClick={toggle} className="press grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-lg shadow-accent/30">
          {playing ? <Pause className="size-5" aria-hidden /> : <Play className="ml-0.5 size-5" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p role="status" className={clsx('t-caption', problem ? 'text-red-500' : 'text-sub')}>{label}</p>
          {problem && <button onClick={retry} aria-label={t.retryLabel} className="press t-caption mt-1 min-h-8 rounded-md bg-line/10 px-3 py-1 font-semibold text-ink touch:min-h-11">{t.retry}</button>}
          <p className="truncate text-[12px] font-medium">{preset === 'custom' ? url : t.presets[preset as PresetId]}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <button aria-label={volume === 0 ? t.unmute : t.mute} onClick={toggleMute} className="press grid size-9 place-items-center text-sub hover:text-ink touch:size-11"><VolIcon className="size-4" aria-hidden /></button>
        <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(+e.target.value)} aria-label={t.volume} className="h-6 flex-1 cursor-pointer touch:h-11" />
        <span className="t-caption w-7 text-right tabular-nums text-sub">{volume}</span>
      </div>
    </section>
  )
}

/**
 * Pomodoro + audio. UNA sola instancia, siempre montada: fija en escritorio y panel lateral plegable en el resto.
 * El contenedor del reproductor de YouTube vive aquí, así que abrir/cerrar el panel no destruye el iframe ni interrumpe el sonido.
 */
export function RightPanel() {
  const t = useCommon()
  return (
    <PanelShell panel="focus" side="right" label={t.layout.focusTitle} dockedClass="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto">
      <PanelHeader panel="focus" title={t.layout.focusTitle} />
      <Pomodoro />
      <AudioPlayer />
    </PanelShell>
  )
}
