import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SPRING } from '../lib/motion'
import { useToasts, type Toast } from '../lib/toasts'
import { useCommon } from '../lib/vocab'

const AUTO_DISMISS_MS = 8000

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToasts((s) => s.dismiss)
  const t = useCommon().toast
  const [paused, setPaused] = useState(false)
  // Se cierra solo, pero no mientras se lee con el puntero encima o con el foco dentro.
  useEffect(() => {
    if (paused) return
    const id = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [paused, toast.id, dismiss])

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={SPRING}
      onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-snug">{toast.title}</p>
        <p className="t-caption mt-0.5 text-sub">{toast.body}</p>
      </div>
      <button aria-label={t.close} onClick={() => dismiss(toast.id)} className="press -mr-1 grid size-7 shrink-0 place-items-center rounded-full text-sub hover:bg-line/10">
        <X className="size-4" aria-hidden />
      </button>
    </motion.div>
  )
}

/** Avisos no bloqueantes: región «polite» siempre montada (los lectores de pantalla anuncian los nuevos), fuera del contenedor inerte. */
export function Toasts() {
  const toasts = useToasts((s) => s.toasts)
  const t = useCommon().toast
  return (
    <div role="region" aria-label={t.region} aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] mx-auto flex w-[min(92vw,24rem)] flex-col gap-2">
      <AnimatePresence initial={false}>{toasts.map((x) => <ToastItem key={x.id} toast={x} />)}</AnimatePresence>
    </div>
  )
}
