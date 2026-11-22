import type { ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { motionTokens, reducedFade, springs } from '../motion/springs';
import { useMediaQuery, useMotionPrefs, WIDE_QUERY } from '../motion/useMotionPrefs';

/**
 * Revelado progresivo de secciones editoriales.
 *
 * Principio observado en la referencia (umbral → la sección se activa y sus
 * piezas suben y aparecen), adaptado:
 * - Se dispara una sola vez (`once`) y no se revierte al subir.
 * - Amplitud contenida (28 px) y muelle crítico, en lugar de una transición
 *   CSS de 0,7 s. El grupo escalona a sus hijos.
 * - Con movimiento reducido no hay desplazamiento, solo un fundido breve.
 * - El contenido está en el DOM desde el principio: teclado, lector de pantalla
 *   y búsqueda lo alcanzan siempre.
 */
const variants = (rise: number, reduce: boolean, scale = 1): Variants => ({
  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: rise, scale },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: reduce ? reducedFade : springs.reveal,
  },
});

type Tag = 'div' | 'section' | 'article' | 'ul' | 'ol' | 'li' | 'header' | 'aside';

interface RevealProps {
  as?: Tag;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Escalona a los hijos <RevealItem>. */
  group?: boolean;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  role?: string;
  'data-accent'?: string;
}

export function Reveal({ as = 'div', children, group = false, ...rest }: RevealProps) {
  const { reduce } = useMotionPrefs();
  const wide = useMediaQuery(WIDE_QUERY);
  const Component = motion[as];
  const { risePx, stagger, amountDesktop, amountMobile } = motionTokens.reveal;
  const v: Variants = group
    ? { hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : stagger } } }
    : variants(risePx, reduce);
  return (
    <Component
      {...rest}
      variants={v}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: wide ? amountDesktop : amountMobile }}
    >
      {children}
    </Component>
  );
}

/** Hijo de un <Reveal group>: hereda el disparo y respeta el escalonado. */
export function RevealItem({ as = 'div', children, depth = false, ...rest }: Omit<RevealProps, 'group'> & { depth?: boolean }) {
  const { reduce } = useMotionPrefs();
  const Component = motion[as];
  const { risePx, cardScaleFrom } = motionTokens.reveal;
  return (
    <Component {...rest} variants={variants(risePx, reduce, depth ? cardScaleFrom : 1)}>
      {children}
    </Component>
  );
}
