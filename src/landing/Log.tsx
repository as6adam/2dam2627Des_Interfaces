import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronRight, Copy } from 'lucide-react'
import clsx from 'clsx'
import type { Language } from '../lib/preferences'
import {
  BLOCK_IDS, MANIFEST, blockAnchor, blockFromHash, hasTranscript, loadBlock, promptText, sectionOf,
  type BlockId, type LogBlockData, type LogParagraph, type LogSection, type ManifestBlock, type PhaseNumber, type SectionKind,
} from './log/index'
import { copyText } from './log/clipboard'
import { LOG_META, LOG_TEXT, fill, type LogText } from './log/text'

/**
 * Registro de prompts y respuestas. El texto original va en español, tal como consta en el documento, y se pinta SIEMPRE como
 * texto (nodos de React, nunca HTML). Solo el índice y los metadatos viajan con la landing; cada iteración se descarga al abrirla.
 */

const PHASES: readonly PhaseNumber[] = [1, 2, 3, 4]
const manifestOf = (id: BlockId): ManifestBlock => MANIFEST.blocks.find((b) => b.id === id)!
const shortCode = (id: BlockId, t: LogText) => (id === 'analysis' ? t.code.analysis : id.toUpperCase())
const longCode = (id: BlockId, t: LogText) => (id === 'analysis' ? t.code.analysis : `TEMPORA-WEB-${id.toUpperCase()}`)
const pages = (a: readonly [number, number]) => `${a[0]}–${a[1]}`

/* ───────── Carga diferida de una iteración ───────── */
function useBlockData(id: BlockId) {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; data?: LogBlockData }>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let live = true
    setState({ status: 'loading' })
    loadBlock(id).then((data) => { if (live) setState({ status: 'ready', data }) }, () => { if (live) setState({ status: 'error' }) })
    return () => { live = false }
  }, [id, attempt])
  return { ...state, retry: () => setAttempt((n) => n + 1) }
}

/* ───────── Texto ───────── */
/** Tabla transcrita: columnas alineadas con espacios, así que no se ajusta; se desplaza dentro de su propio bloque. Es enfocable solo si desborda. */
function ScrollPre({ text, label }: { text: string; label: string }) {
  const ref = useRef<HTMLPreElement>(null)
  const [scrolls, setScrolls] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrolls(el.scrollWidth > el.clientWidth + 1)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text])
  return <pre ref={ref} lang="es" className="l-pre" {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}>{text}</pre>
}

function Para({ p, t, language }: { p: LogParagraph; t: LogText; language: Language }) {
  if (p.k === 'note') {
    return <p className="l-note l-small"><span className="font-semibold">{t.editorial}: </span><span lang="es">{p.t}</span></p>
  }
  void language
  return p.k === 'table' ? <ScrollPre text={p.t} label={t.tableLabel} /> : <p lang="es" className="l-text">{p.t}</p>
}

function CopyPrompt({ text, name, t }: { text: string; name: string; t: LogText }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const onClick = async () => {
    const ok = await copyText(text)
    setState(ok ? 'ok' : 'fail')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 6000)
  }
  const Icon = state === 'ok' ? Check : Copy
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button type="button" onClick={onClick} aria-label={fill(t.copy.label, { name })} className="l-btn-ghost !min-h-11 !px-4 !py-2">
        <Icon className="size-4" aria-hidden />{t.copy.button}
      </button>
      {/* Región viva siempre presente: el lector de pantalla anuncia el resultado (copiado o fallo). */}
      <span role="status" aria-live="polite" className="l-small text-ink/85">{state === 'ok' ? t.copy.ok : state === 'fail' ? t.copy.fail : ''}</span>
    </div>
  )
}

function SectionView({ section, kind, t, language, action }: { section: LogSection | undefined; kind: SectionKind; t: LogText; language: Language; action?: ReactNode }) {
  if (!section) return null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h5 className="l-eyebrow text-ink/80">{t.subTitles[kind]}</h5>
        {action}
      </div>
      {kind === 'progress' && <p className="l-note l-small">{t.progressNote}</p>}
      {section.paragraphs.map((p, i) => <Para key={i} p={p} t={t} language={language} />)}
    </div>
  )
}

/* ───────── Apartados de una iteración ───────── */
function Apartado({ title, hint, open, onToggle, children }: { title: string; hint?: string; open: boolean; onToggle: (o: boolean) => void; children: ReactNode }) {
  return (
    <details open={open} onToggle={(e) => onToggle(e.currentTarget.open)} className="l-sub">
      <summary>
        <ChevronRight className="l-chev size-4" aria-hidden />
        <span className="min-w-0"><span className="font-semibold">{title}</span>{hint && <span className="l-small block text-ink/75">{hint}</span>}</span>
      </summary>
      {open && <div className="space-y-6 px-4 pb-4 pt-1 sm:pl-10">{children}</div>}
    </details>
  )
}

type ApartadoId = 'objective' | 'gpt' | 'claudePrompt' | 'claudeResponse'

export function BlockBody({ id, t, language }: { id: BlockId; t: LogText; language: Language }) {
  const m = manifestOf(id)
  const meta = LOG_META[language]
  const { status, data, retry } = useBlockData(id)
  const [open, setOpen] = useState<Record<ApartadoId, boolean>>({ objective: true, gpt: false, claudePrompt: false, claudeResponse: false })
  const toggle = (k: ApartadoId) => (o: boolean) => setOpen((s) => (s[k] === o ? s : { ...s, [k]: o }))
  const name = longCode(id, t)
  const translated = language !== 'es' && meta.blocks[id].objective
  const pg = fill(m.claudePages ? t.pages.withClaude : t.pages.withoutClaude, { g: pages(m.gptPages), c: m.claudePages ? pages(m.claudePages) : '' })

  const gate = (render: (d: LogBlockData) => ReactNode) => {
    if (status === 'error') return <p role="alert" className="l-small">{t.error} <button type="button" onClick={retry} className="l-link font-semibold">{t.retry}</button></p>
    if (status !== 'ready' || !data) return <p role="status" className="l-small text-ink/75">{t.loading}</p>
    return render(data)
  }
  const prompt = (d: LogBlockData) => sectionOf(d, 'claudePrompt')
  const response = (d: LogBlockData) => sectionOf(d, 'claudeResponse')

  return (
    <div className="space-y-1 px-2 pb-3 sm:px-3">
      <Apartado title={t.apartados.objective} open={open.objective} onToggle={toggle('objective')}>
        <p className="l-small text-ink/80">{fill(t.phase, { n: m.phase })} · {meta.phases[m.phase]}</p>
        <p className="l-note l-body"><span className="l-small font-semibold">{translated ? t.editorialTranslated : t.editorial}: </span>
          <span lang={translated ? language : 'es'}>{translated ? meta.blocks[id].objective : m.objective}</span></p>
        <p className="l-small text-ink/80"><span className="font-semibold">{t.pages.label}:</span> {pg}</p>
        {m.gptRefs.map((r) => <p key={r} className="l-note l-small"><span className="font-semibold">{t.editorial}: </span><span lang="es">{r}</span></p>)}
        <p className="l-small"><a href={`#${blockAnchor(id)}`} className="l-link">{t.permalink}</a></p>
      </Apartado>

      <Apartado title={t.apartados.gpt} open={open.gpt} onToggle={toggle('gpt')}>
        {gate((d) => (<>
          <SectionView section={sectionOf(d, 'userPrompt')} kind="userPrompt" t={t} language={language} />
          <SectionView section={sectionOf(d, 'progress')} kind="progress" t={t} language={language} />
          <SectionView section={sectionOf(d, 'gptResponse')} kind="gptResponse" t={t} language={language} />
        </>))}
      </Apartado>

      <Apartado title={t.apartados.claudePrompt} open={open.claudePrompt} onToggle={toggle('claudePrompt')}>
        {gate((d) => {
          const s = prompt(d)
          return (<>
            {!hasTranscript(s) && <p className="l-small font-semibold">{t.absent.claudePrompt}</p>}
            <SectionView section={s} kind="claudePrompt" t={t} language={language}
              action={hasTranscript(s) ? <CopyPrompt text={promptText(s)} name={name} t={t} /> : undefined} />
            <SectionView section={sectionOf(d, 'gptContinuation')} kind="gptContinuation" t={t} language={language} />
          </>)
        })}
      </Apartado>

      <Apartado title={t.apartados.claudeResponse} hint={t.apartadoHint.claudeResponse} open={open.claudeResponse} onToggle={toggle('claudeResponse')}>
        {gate((d) => {
          const s = response(d)
          return (<>
            {!hasTranscript(s) && <p className="l-small font-semibold">{t.absent.claudeResponse}</p>}
            {hasTranscript(s) && <p className="l-note l-small">{t.testsNote}</p>}
            <SectionView section={s} kind="claudeResponse" t={t} language={language} />
          </>)
        })}
      </Apartado>
    </div>
  )
}

/* ───────── Registro completo ───────── */
export function PromptLog({ language }: { language: Language }) {
  const t = LOG_TEXT[language]
  const meta = LOG_META[language]
  const [open, setOpen] = useState<ReadonlySet<BlockId>>(() => new Set())
  const setBlockOpen = useCallback((id: BlockId, value: boolean) => {
    setOpen((prev) => {
      if (prev.has(id) === value) return prev
      const next = new Set(prev)
      if (value) next.add(id); else next.delete(id)
      return next
    })
  }, [])

  // Anclas: #log-001 abre esa iteración, la lleva a la vista y pasa el foco a su resumen (carga inicial, enlaces del índice, historial).
  const reveal = useCallback((id: BlockId, focus: boolean) => {
    setBlockOpen(id, true)
    requestAnimationFrame(() => {
      const el = document.getElementById(blockAnchor(id))
      if (!el) return
      el.scrollIntoView({ block: 'start' })
      if (focus) el.querySelector('summary')?.focus({ preventScroll: true })
    })
  }, [setBlockOpen])
  useEffect(() => {
    const first = blockFromHash(window.location.hash)
    if (first) reveal(first, false)
    const onHash = () => { const id = blockFromHash(window.location.hash); if (id) reveal(id, true) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [reveal])

  return (
    <div className="mt-3 space-y-8">
      <div className="space-y-2 l-body text-ink/85">
        <p>{t.intro}</p>
        <p className="l-small text-ink/80">{t.originalLanguage}</p>
        <p className="l-small text-ink/80">{t.proposalsNote}</p>
      </div>

      <details className="l-sub l-log">
        <summary>
          <ChevronRight className="l-chev size-4" aria-hidden />
          <span className="min-w-0"><span className="font-semibold">{t.trace.title}</span><span className="l-small block text-ink/75">{t.trace.hint}</span></span>
        </summary>
        <div className="space-y-3 px-4 pb-4 pt-1 sm:pl-10">
          {MANIFEST.traceNotes.map((n, i) => <p key={i} lang="es" className="l-note l-small">{n}</p>)}
        </div>
      </details>

      <nav aria-label={t.index.label} className="rounded-2xl p-4 sm:p-5" style={{ boxShadow: 'inset 0 0 0 1px rgb(var(--line) / .2)' }}>
        <p className="l-eyebrow mb-3 text-ink/80">{t.index.title}</p>
        <ol className="space-y-4">
          {PHASES.map((n) => (
            <li key={n}>
              <p className="l-small font-semibold">{fill(t.phase, { n })} · {meta.phases[n]}</p>
              <ul className="mt-1">
                {BLOCK_IDS.filter((id) => manifestOf(id).phase === n).map((id) => (
                  <li key={id}>
                    <a href={`#${blockAnchor(id)}`} onClick={() => reveal(id, true)} className="l-link l-small inline-flex min-h-11 items-center">
                      <span className="mr-2 font-semibold">{shortCode(id, t)}</span>{meta.blocks[id].title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {PHASES.map((n) => (
          <section key={n} aria-labelledby={`log-phase-${n}`}>
            <h4 id={`log-phase-${n}`} className="l-h3 mb-3">{fill(t.phase, { n })} · {meta.phases[n]}</h4>
            <ol className="space-y-3">
              {BLOCK_IDS.filter((id) => manifestOf(id).phase === n).map((id) => {
                const m = manifestOf(id)
                const isOpen = open.has(id)
                return (
                  <li key={id}>
                    <details id={blockAnchor(id)} open={isOpen} onToggle={(e) => setBlockOpen(id, e.currentTarget.open)} className="l-log">
                      <summary>
                        <ChevronRight className="l-chev size-4" aria-hidden />
                        <span className="min-w-0">
                          <span className="l-eyebrow block text-ink/75">{longCode(id, t)}</span>
                          <span className={clsx('l-body block font-semibold')}>{meta.blocks[id].title}</span>
                          <span className="l-small block text-ink/75">{t.pages.label}: {fill(m.claudePages ? t.pages.withClaude : t.pages.withoutClaude, { g: pages(m.gptPages), c: m.claudePages ? pages(m.claudePages) : '' })}</span>
                        </span>
                      </summary>
                      {isOpen && <BlockBody id={id} t={t} language={language} />}
                    </details>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
