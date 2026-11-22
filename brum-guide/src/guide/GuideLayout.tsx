import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigationType, type Location } from 'react-router';
import { motion } from 'motion/react';
import { AppShell } from '../components/AppShell';
import { motionTokens, springs } from '../motion/springs';
import { captureFromLink, hasPendingShared } from '../motion/sharedPhoto';
import { useMotionPrefs } from '../motion/useMotionPrefs';

const FOCUS_KEY = 'brum-guide:focus-memory';

/**
 * Clave de cada entrada del historial. Las entradas creadas fuera del router
 * (carga inicial, hash escrito o pegado en la barra) llegan sin estado y con la
 * misma clave "default": se distinguen por la ruta para no restaurar el scroll
 * ni el foco de otra página.
 */
const historyKey = (loc: Pick<Location, 'key' | 'pathname'>) => (loc.key === 'default' ? `path:${loc.pathname}` : loc.key);

/** Enlace que activó cada salida, por entrada del historial. */
function readFocusMemory(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(FOCUS_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return memoryFallback;
  }
}
let memoryFallback: Record<string, string> = {};
function writeFocusMemory(m: Record<string, string>) {
  memoryFallback = m;
  try {
    sessionStorage.setItem(FOCUS_KEY, JSON.stringify(m));
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
}

/**
 * Layout de la guía.
 * - Desplazamiento: <ScrollRestoration> sube al inicio al avanzar (PUSH) y
 *   restaura la posición al volver o avanzar con el historial (POP).
 * - Foco: al avanzar, va al h1 de la vista (¿dónde estoy?); al volver, al enlace
 *   que se activó para salir, de modo que teclado y lector retoman donde estaban.
 * - Transición: muelle crítico (bounce 0). Hacia delante el contenido entra desde
 *   el borde final y hacia atrás desde el inicial (coherencia espacial, §7).
 *   Con movimiento reducido, solo un fundido corto.
 */
export function GuideLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { pick, reduce } = useMotionPrefs();
  const first = useRef(true);
  const entryKey = historyKey(location);

  // Recuerda qué enlace interno se activó en la vista actual.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#/"]');
      if (!a || !document.getElementById('main')?.contains(a)) return;
      const memory = readFocusMemory();
      memory[entryKey] = a.getAttribute('href') ?? '';
      writeFocusMemory(memory);
      // Origen de la transición tarjeta ↔ ficha (se mide antes de que cambie la vista).
      captureFromLink(a);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [entryKey]);

  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    const remembered = readFocusMemory()[entryKey];

    if (navigationType === 'POP' && remembered) {
      const target = [...document.querySelectorAll<HTMLAnchorElement>('#main a[href]')].find(
        (a) => a.getAttribute('href') === remembered,
      );
      if (target) {
        target.focus({ preventScroll: true });
        return;
      }
    }
    if (isFirst) return; // carga inicial: no mover el foco
    document.querySelector<HTMLElement>('#main h1')?.focus({ preventScroll: true });
  }, [entryKey, navigationType]);

  const offset = (navigationType === 'POP' ? -1 : 1) * motionTokens.viewOffsetX;
  // Si una foto va a viajar entre vistas, la página no se desliza: el movimiento
  // lo lleva la foto y el resto entra con el revelado.
  const sharedFlight = hasPendingShared();

  return (
    <AppShell area="guide">
      <ScrollRestoration getKey={historyKey} />
      <motion.div
        key={location.pathname}
        className="view"
        initial={sharedFlight ? { opacity: 1 } : reduce || first.current ? { opacity: 0 } : { opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        transition={pick(springs.move)}
      >
        <Outlet />
      </motion.div>
    </AppShell>
  );
}
