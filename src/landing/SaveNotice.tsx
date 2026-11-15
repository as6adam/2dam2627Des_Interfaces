import { TriangleAlert, X } from 'lucide-react'

/**
 * Aviso discreto y accesible. El contenedor `role="status"` (región polite) está SIEMPRE en el DOM y solo cambia su
 * contenido: así los lectores de pantalla anuncian el aviso al aparecer. No roba el foco y se puede cerrar con el teclado.
 * Icono + texto (no depende solo del color). No importa el store ni nada de la aplicación.
 */
export function SaveNotice({ visible, text, dismissLabel, onDismiss }: { visible: boolean; text: string; dismissLabel: string; onDismiss: () => void }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      {visible && (
        <div className="l-notice pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-2xl py-2.5 pl-4 pr-2">
          <TriangleAlert className="mt-2.5 size-4 shrink-0" aria-hidden />
          <p className="l-small min-w-0 flex-1 py-2.5 text-ink">{text}</p>
          <button type="button" aria-label={dismissLabel} title={dismissLabel} onClick={onDismiss} className="l-ctrl shrink-0">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
