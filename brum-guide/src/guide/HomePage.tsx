import type { RefObject } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { pick } from '../i18n';
import { featured, getPlace } from '../content/queries';
import { Badge } from '../components/Badge';
import { SharedPhoto } from '../components/SharedPhoto';
import { Reveal, RevealItem } from '../components/Reveal';
import { ChevronRightIcon } from '../components/icons';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { PRESS_SCALE, springs } from '../motion/springs';
import { AboutBirmingham } from './AboutBirmingham';
import { CanalLock } from './CanalLock';
import { PlanClose, RoutesTeaser, SectorPan, useWipe } from './HomeChapters';
import { PhotoOpening } from './PhotoOpening';
import { PhotoStrip } from './PhotoStrip';

const MotionLink = motion.create(Link);

/**
 * Portada por capítulos (gramática «chaptered editorial», ver scrollcraft/builds/brum/BRIEF.md):
 * 1 apertura en capas (parallax) · 2 cifras (count) · 3 sectores (pan) · 4 pausa (tira manual) ·
 * 5 esclusa, el pico (pin + scrub) · 6 Villa Park (reveal) · 7 rutas (flow) · 8 cierre útil.
 */
export function HomePage() {
  const { t } = usePreferences();
  useDocumentTitle(t.meta.guideTitle);

  return (
    <>
      <PhotoOpening />
      <AboutBirmingham />
      <SectorPan />
      <PhotoStrip />
      <CanalLock />
      <FeaturedVilla />
      <RoutesTeaser />
      <PlanClose />
    </>
  );
}

function FeaturedVilla() {
  const { t, lang } = usePreferences();
  const wipe = useWipe();
  const featuredPlace = getPlace(featured.placeId);
  if (!featuredPlace) return null;
  const featuredHref = `/sector/${featuredPlace.sectorId}/${featuredPlace.id}`;
  return (
    <Reveal as="section" group className="featured" data-sc-act="villa" aria-labelledby="featured-title" data-accent="sky">
      <RevealItem>
        <motion.div ref={wipe.ref as RefObject<HTMLDivElement>} className="featured__wipe" style={wipe.style}>
          {/* Misma clave que la ficha: la foto viaja al abrir el destacado */}
          <SharedPhoto
            sharedKey={`place:${featuredPlace.id}`}
            id={featuredPlace.photoIds[0]}
            className="featured__photo"
            sizes="(min-width: 900px) 540px, 100vw"
            ratio={16 / 10}
            decorative
          />
        </motion.div>
      </RevealItem>
      <RevealItem className="featured__body">
        <div className="featured__badges">
          <Badge tone="featured">{pick(featured.eyebrow, lang)}</Badge>
        </div>
        <h2 id="featured-title" className="title-1">
          {pick(featured.title, lang)}
        </h2>
        <p className="lead">{pick(featured.intro, lang)}</p>
        <ul className="featured__topics" role="list">
          {featured.blocks.map((b) => (
            <li key={b.id}>{pick(b.heading, lang)}</li>
          ))}
        </ul>
        <MotionLink
          to={featuredHref}
          data-shared-from={`place:${featuredPlace.id}`}
          className="button button--primary"
          whileTap={{ scale: PRESS_SCALE }}
          transition={springs.press}
        >
          {t.home.featuredCta}
          <ChevronRightIcon size={16} />
        </MotionLink>
      </RevealItem>
    </Reveal>
  );
}
