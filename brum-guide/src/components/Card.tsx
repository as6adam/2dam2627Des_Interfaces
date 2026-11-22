import { SharedTitle } from './SharedTitle';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { PRESS_SCALE, springs } from '../motion/springs';
import { ChevronRightIcon } from './icons';
import { SharedPhoto } from './SharedPhoto';
import { Badge, type BadgeTone } from './Badge';

const MotionLink = motion.create(Link);

interface CardProps {
  to: string;
  title: string;
  description?: string;
  meta?: string;
  photoId?: string;
  /** Clave de la transición tarjeta ↔ destino (p. ej. `place:villa-park`). */
  sharedKey?: string;
  accent?: string;
  badge?: { label: string; tone: BadgeTone };
  headingLevel?: 'h2' | 'h3';
  /** `sizes` de la foto según la rejilla en la que vive la tarjeta. */
  sizes?: string;
}

/**
 * Tarjeta navegable. Toda la superficie es objetivo táctil; la respuesta llega
 * en pointer-down (whileTap) con un muelle crítico corto e interrumpible.
 * La foto es decorativa porque el título ya nombra el destino.
 */
export function Card({
  to,
  title,
  description,
  meta,
  photoId,
  sharedKey,
  accent,
  badge,
  headingLevel = 'h3',
  sizes = '(min-width: 1120px) 360px, (min-width: 700px) 45vw, 92vw',
}: CardProps) {
  const Heading = headingLevel;
  return (
    <MotionLink
      to={to}
      className="card card--tile"
      data-accent={accent}
      whileTap={{ scale: PRESS_SCALE }}
      transition={springs.press}
    >
      {photoId && (
        <SharedPhoto
          sharedKey={sharedKey ?? `photo:${photoId}`}
          id={photoId}
          sizes={sizes}
          ratio={3 / 2}
          className="card__photo"
          decorative
        />
      )}
      <div className="card__body">
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
        <Heading className="card__title">{sharedKey ? <SharedTitle id={sharedKey} text={title} /> : title}</Heading>
        {description && <p className="card__description">{description}</p>}
        {meta && <p className="card__meta">{meta}</p>}
      </div>
      <ChevronRightIcon className="card__chevron" size={18} />
    </MotionLink>
  );
}
