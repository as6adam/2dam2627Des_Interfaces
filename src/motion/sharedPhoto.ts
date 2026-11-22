import { useLayoutEffect, type RefObject } from 'react';
import { animate } from 'motion/react';
import { springs } from './springs';

/**
 * Transición tarjeta ↔ ficha (foto compartida).
 *
 * Al salir de una vista se mide la foto de origen (`capture`). Al montar la vista
 * nueva, la foto de destino arranca con un transform que la superpone exactamente
 * a la de origen y vuelve a su sitio con un muelle crítico (`springs.shared`).
 * Solo se anima `transform`. Ningún estado de React cambia durante el vuelo.
 *
 * La medición de destino se hace en un requestAnimationFrame, después de que
 * <ScrollRestoration> haya fijado el desplazamiento y antes del primer pintado,
 * así que no hay destello en la posición final.
 */
interface Pending {
  key: string;
  rect: DOMRect;
  at: number;
}

let pending: Pending | null = null;
const MAX_AGE_MS = 1200;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const inViewport = (r: DOMRect) => r.bottom > 0 && r.top < window.innerHeight && r.width > 0;

/** Registra la foto de origen de una navegación. */
export function captureShared(el: Element | null | undefined) {
  if (!el || reducedMotion()) return;
  const key = el.getAttribute('data-shared-key');
  const rect = el.getBoundingClientRect();
  if (!key || !inViewport(rect)) return;
  pending = { key, rect, at: performance.now() };
}

/**
 * Mide el origen de una navegación iniciada desde `anchor`:
 * 1. la foto dentro del enlace (tarjetas);
 * 2. la foto indicada por `data-shared-from` (p. ej. el botón del destacado);
 * 3. si no, la foto principal de la página (vuelta a la vista anterior).
 */
export function captureFromLink(anchor: Element) {
  const inner = anchor.querySelector('[data-shared-key]');
  if (inner) return captureShared(inner);
  const from = anchor.getAttribute('data-shared-from');
  if (from) return captureShared(document.querySelector(`[data-shared-key="${CSS.escape(from)}"]`));
  capturePageHero();
}

/** Desde la vista actual: la foto principal de la página (ficha o sector). */
export function capturePageHero() {
  captureShared(document.querySelector('#main [data-shared-hero]'));
}

/** ¿Hay un vuelo pendiente? La entrada de vista lo usa para no deslizar la página. */
export function hasPendingShared(): boolean {
  return !!pending && performance.now() - pending.at < MAX_AGE_MS;
}

function take(key: string): Pending | null {
  if (!pending || pending.key !== key || performance.now() - pending.at > MAX_AGE_MS) return null;
  const p = pending;
  pending = null;
  return p;
}

/** Destino de la transición: anima `ref` desde la foto registrada con la misma clave. */
export function useSharedArrival(ref: RefObject<HTMLElement | null>, key: string) {
  useLayoutEffect(() => {
    const from = take(key);
    const el = ref.current;
    if (!from || !el) return;
    let controls: ReturnType<typeof animate> | undefined;
    let started = false;
    // El transform inicial se fija dentro del mismo rAF, antes del primer pintado.
    const raf = requestAnimationFrame(() => {
      started = true;
      const to = el.getBoundingClientRect();
      if (!inViewport(to)) return;
      const s = from.rect.width / to.width;
      const dx = from.rect.left - to.left;
      const dy = from.rect.top + from.rect.height / 2 - (to.top + (to.height * s) / 2);
      el.style.transformOrigin = '0 0';
      el.style.transform = `translateX(${dx}px) translateY(${dy}px) scale(${s})`;
      el.style.zIndex = '4';
      el.style.position = 'relative';
      controls = animate(el, { x: [dx, 0], y: [dy, 0], scale: [s, 1] }, springs.shared);
      controls.finished.then(() => {
        el.style.zIndex = '';
        el.style.transform = '';
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      controls?.stop();
      // StrictMode (desarrollo) desmonta y vuelve a montar: devuelve el vuelo sin usar.
      if (!started) pending = from;
    };
  }, [key, ref]);
}

// El botón «atrás» del navegador también es una salida: se mide la foto principal
// antes de que el router (que escucha popstate después) cambie la vista.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', capturePageHero);
}
