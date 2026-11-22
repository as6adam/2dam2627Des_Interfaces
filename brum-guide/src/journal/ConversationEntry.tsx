import { useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format } from '../i18n';
import type { Conversation } from '../content/conversations';
import { modelFor } from '../content/conversations';
import { PRESS_SCALE, springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { ChevronRightIcon } from '../components/icons';
import { parseTranscript, renderBlock } from './TranscriptText';

const TOOL_NAME = { chatgpt: 'ChatGPT', claude: 'Claude' } as const;

/** A partir de este tamaño la respuesta se pliega y muestra solo su comienzo. */
const COLLAPSE_CHARS = 1400;
const PREVIEW_CHARS = 600;

/**
 * Una pareja prompt/respuesta.
 * - El prompt va en un bloque de entrada estilo consola: texto íntegro, seleccionable,
 *   monoespaciado del sistema, con sus saltos de línea y ajuste de líneas largas.
 * - La respuesta va debajo con la tipografía de lectura de la guía. Si es larga,
 *   se pliega: el botón (teclado y tacto, aria-expanded) muestra el resto.
 * - Las transcripciones se marcan con lang="es": no se traducen con la interfaz.
 */
export function ConversationEntry({ conversation: c }: { conversation: Conversation }) {
  const { t } = usePreferences();
  const { pick, reduce } = useMotionPrefs();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restId = useId();
  const tool = TOOL_NAME[c.tool];
  const model = modelFor(c.tool);
  const promptLabel = format(t.journal.promptLabel, { n: c.number, tool });
  const responseLabel = format(t.journal.responseLabel, { n: c.number, tool });
  const headingId = `conv-${c.id}-prompt`;
  const responseId = `conv-${c.id}-response`;

  const { preview, rest } = useMemo(() => {
    const blocks = parseTranscript(c.response);
    if (c.response.length <= COLLAPSE_CHARS) return { preview: blocks, rest: [] };
    let chars = 0;
    let cut = 0;
    while (cut < blocks.length && (chars < PREVIEW_CHARS || cut < 1)) {
      const b = blocks[cut]!;
      chars += JSON.stringify(b).length;
      cut++;
    }
    return { preview: blocks.slice(0, cut), rest: blocks.slice(cut) };
  }, [c.response]);
  const collapsible = rest.length > 0;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Al plegar desde abajo, el botón sigue a la vista y conserva el foco.
    if (!next) requestAnimationFrame(() => toggleRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }));
  };

  return (
    <article id={`conv-${c.id}`} className="conv" data-tool={c.tool} aria-labelledby={headingId}>
      <p className="conv__meta">
        <span className="conv__tool">{tool}</span>
        {model && (
          <span>
            {t.journal.modelLabel}: {model}
          </span>
        )}
        {c.redactions > 0 && (
          <span>{format(c.redactions === 1 ? t.journal.redacted : t.journal.redactedPlural, { count: c.redactions })}</span>
        )}
      </p>

      <h3 id={headingId} className="conv__label">
        {promptLabel}
      </h3>
      <pre className="console" lang="es">
        {c.prompt}
      </pre>

      <section className="conv__response" aria-labelledby={responseId}>
        <h4 id={responseId} className="conv__label conv__label--response">
          {responseLabel}
        </h4>
        <div className="transcript" lang="es">
          {preview.map((b, i) => renderBlock(b, `p${i}`))}
          <AnimatePresence initial={false}>
            {collapsible && open && (
              <motion.div
                id={restId}
                key="rest"
                className="transcript__rest"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={pick(springs.reveal)}
              >
                {rest.map((b, i) => renderBlock(b, `r${i}`))}
              </motion.div>
            )}
          </AnimatePresence>
          {collapsible && !open && <div className="transcript__fade" aria-hidden="true" />}
        </div>
        {collapsible && (
          <motion.button
            ref={toggleRef}
            type="button"
            className="conv__toggle"
            aria-expanded={open}
            aria-controls={restId}
            onClick={toggle}
            whileTap={{ scale: PRESS_SCALE }}
            transition={springs.press}
          >
            <ChevronRightIcon size={16} className="conv__toggle-icon" data-open={open} />
            {open ? t.journal.collapse : t.journal.expand}
            <span className="visually-hidden"> · {responseLabel}</span>
          </motion.button>
        )}
      </section>
    </article>
  );
}
