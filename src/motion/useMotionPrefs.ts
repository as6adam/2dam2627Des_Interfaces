import { useEffect, useState } from 'react';
import { useReducedMotion, type Transition } from 'motion/react';
import { reducedFade } from './springs';

/**
 * Preferencias de movimiento:
 * - `reduce`: prefers-reduced-motion. Sin paralaje, escalas ni desplazamientos amplios.
 * - `pick`: devuelve el muelle o, con movimiento reducido, un fundido corto.
 */
export function useMotionPrefs() {
  const reduce = useReducedMotion() ?? false;
  return {
    reduce,
    pick: (spring: Transition): Transition => (reduce ? reducedFade : spring),
  };
}

/** Consulta de medios reactiva (solo cambia al cruzar el umbral, no en cada frame). */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Escritorio con puntero fino o ventana ancha: habilita el escenario fijo. */
export const WIDE_QUERY = '(min-width: 900px)';
