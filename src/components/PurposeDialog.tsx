import { useEffect, useState } from 'react'
import { Check, GraduationCap, Target } from 'lucide-react'
import clsx from 'clsx'
import { useApp, useUI } from '../store'
import { useHydrated } from '../lib/hooks'
import { PURPOSES, type Purpose } from '../lib/preferences'
import { useCommon, usePurposeInfo } from '../lib/vocab'
import { Modal } from './ui'

const ICONS = { academic: GraduationCap, productivity: Target } as const

function PurposeForm({ onboarding, current, onConfirm, onCancel }: { onboarding: boolean; current: Purpose | null; onConfirm: (p: Purpose) => void; onCancel: () => void }) {
  // Sin preselección en el primer uso (current = null); al cambiar, se parte de la elección actual.
  const [selected, setSelected] = useState<Purpose | null>(current)
  const t = useCommon().purposeDialog // reactivo: cambia de idioma sin remontar el formulario ni perder `selected`
  const info = usePurposeInfo()
  const unchanged = !onboarding && selected === current
  const canSubmit = selected !== null && !unchanged

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (selected && canSubmit) onConfirm(selected) }}>
      <h3 id="purpose-title" className="t-title">{onboarding ? t.titleFirst : t.titleChange}</h3>
      <p id="purpose-desc" className="t-body mt-1 text-sub">
        {t.intro}
      </p>

      <fieldset className="mt-4 border-0 p-0" aria-describedby="purpose-desc">
        <legend className="sr-only">{t.legend}</legend>
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
          {PURPOSES.map((p) => {
            const Icon = ICONS[p]
            const on = selected === p
            return (
              <label key={p} className="relative block cursor-pointer">
                <input
                  type="radio" name="purpose" value={p} checked={on} onChange={() => setSelected(p)}
                  data-autofocus={current === p ? '' : undefined} className="peer sr-only"
                />
                <span className={clsx(
                  'press flex h-full flex-col gap-2 rounded-2xl p-4 transition-colors',
                  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
                  on ? 'bg-accent/10 ring-2 ring-accent' : 'bg-line/5 ring-1 ring-line/10 hover:bg-line/10',
                )}>
                  <Icon className={clsx('size-5', on ? 'text-accent' : 'text-sub')} aria-hidden />
                  <span className="text-[14px] font-semibold tracking-tight">{info[p].name}</span>
                  <span className="t-body text-sub">{info[p].description}</span>
                  <span className="t-caption mt-auto flex min-h-[1.1rem] items-center gap-1 font-semibold">
                    {on ? <span className="flex items-center gap-1 text-accent"><Check className="size-3.5" aria-hidden /> {t.selected}</span>
                      : current === p ? <span className="text-sub">{t.current}</span> : null}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <p className="t-caption mt-3 min-h-[1rem] text-sub" aria-live="polite">{selected === null ? t.choose : ''}</p>
      <div className="mt-3 flex justify-end gap-2">
        {!onboarding && <button type="button" onClick={onCancel} className="btn-ghost">{t.cancel}</button>}
        <button type="submit" disabled={!canSubmit} className="btn-primary disabled:pointer-events-none disabled:opacity-40">
          {onboarding ? t.continue : t.save}
        </button>
      </div>
    </form>
  )
}

/**
 * Selector de propósito. Dos orígenes, un solo diálogo:
 *  · primer uso → derivado (hidratado && purpose === null); no se puede descartar.
 *  · cambio posterior → useUI.purposeChange (navegación o Ajustes); Cancelar conserva lo anterior.
 */
export function PurposeDialog() {
  const hydrated = useHydrated()
  const purpose = useApp((s) => s.purpose)
  const change = useUI((s) => s.purposeChange)
  const open = hydrated && (purpose === null || change)

  useEffect(() => { if (open) useUI.setState({ purposeVisible: true }) }, [open])

  const cancel = () => useUI.setState({ purposeChange: false })
  const confirm = (p: Purpose) => {
    useApp.getState().setPurpose(p) // solo cambia la preferencia: items, Pomodoro y audio no se tocan
    useUI.setState({ purposeChange: false })
  }

  return (
    <Modal open={open} onClose={cancel} labelledBy="purpose-title" width="max-w-lg" dismissible={purpose !== null}
      onExitComplete={() => useUI.setState({ purposeVisible: false })}>
      <PurposeForm onboarding={purpose === null} current={purpose} onConfirm={confirm} onCancel={cancel} />
    </Modal>
  )
}
