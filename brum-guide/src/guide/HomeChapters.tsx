import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format, pick } from '../i18n';
import { placesInSector, sectorCoverPhotoId, sectors } from '../content/queries';
import { dayRoutes } from '../content/travel';
import { Card } from '../components/Card';
import { Reveal, RevealItem } from '../components/Reveal';
import { BookIcon, ChevronRightIcon } from '../components/icons';
import { motionTokens, scrollSmoothing } from '../motion/springs';
import { useMediaQuery, useMotionPrefs, WIDE_QUERY } from '../motion/useMotionPrefs';
import { planHref, type PlanSectionId } from './PlanPages';

/* ------------------------------------------------------------------ */
/* Acto 3 · Sectores: paso lateral fijado (escritorio), carrusel nativo (móvil) */
/* ------------------------------------------------------------------ */

export function SectorPan() {
  const { reduce } = useMotionPrefs();
  const wide = useMediaQuery(WIDE_QUERY);
  const mode = reduce ? 'grid' : wide ? 'pan' : 'swipe';
  return <SectorPanInner key={mode} mode={mode} />;
}

function SectorPanInner({ mode }: { mode: 'grid' | 'pan' | 'swipe' }) {
  const { t, lang } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);

  // Distancia lateral = lo que la fila sobresale de la vista. Se mide, no se supone.
  useLayoutEffect(() => {
    if (mode !== 'pan') return;
    const measure = () => {
      const v = viewport.current;
      const tr = track.current;
      if (!v || !tr) return;
      const cs = getComputedStyle(v);
      const inner = v.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setDistance(Math.max(0, tr.scrollWidth - inner + motionTokens.pan.tailPx));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, [mode]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, scrollSmoothing);
  const x = useTransform(p, [0, 1], [0, -distance]);

  return (
    <section
      ref={ref}
      className={`sectors sectors--${mode}`}
      data-sc-act="sectors"
      aria-labelledby="sectors-title"
      style={mode === 'pan' && distance ? { height: `calc(100svh + ${Math.round(distance * motionTokens.pan.scrollPerPx)}px)` } : undefined}
    >
      <div className="sectors__stage">
        <div className="section__header">
          <h2 id="sectors-title" className="title-2" tabIndex={-1}>
            {t.home.sectorsTitle}
          </h2>
          <p className="section__count">{format(t.home.sectorsCount, { count: sectors.length })}</p>
        </div>
        <div className="sectors__viewport" ref={viewport}>
          <motion.ul
            ref={track}
            className="card-grid sectors__track"
            role="list"
            style={mode === 'pan' ? { x } : undefined}
          >
            {sectors.map((sector) => (
              <li key={sector.id}>
                <Card
                  to={`/sector/${sector.id}`}
                  accent={sector.accent}
                  photoId={sectorCoverPhotoId(sector)}
                  sharedKey={`sector:${sector.id}`}
                  title={pick(sector.name, lang)}
                  description={pick(sector.summary, lang)}
                  meta={format(t.home.placesCount, { count: placesInSector(sector.id).length })}
                  sizes="(min-width: 900px) 340px, 78vw"
                />
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Acto 6 · Villa Park: barrido lateral al entrar en vista              */
/* ------------------------------------------------------------------ */

export function useWipe() {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const p = useSpring(scrollYProgress, scrollSmoothing);
  const right = useTransform(p, [0, 1], [motionTokens.wipe.fromPct, 0], { clamp: true });
  const clipPath = useTransform(right, (r) => `inset(0% ${r}% 0% 0% round var(--radius-xl))`);
  return { ref, style: reduce ? undefined : { clipPath } };
}

/* ------------------------------------------------------------------ */
/* Acto 7 · Rutas de un día (cascada)                                  */
/* ------------------------------------------------------------------ */

export function RoutesTeaser() {
  const { t, lang } = usePreferences();
  return (
    <section data-sc-act="routes" className="section routes-teaser" aria-labelledby="routes-teaser-title">
      <div className="section__header">
        <h2 id="routes-teaser-title" className="title-2">
          {t.plan.sections.routes.title}
        </h2>
        <Link className="text-link" to={planHref.routes}>
          {t.home.routesAll}
          <ChevronRightIcon size={16} />
        </Link>
      </div>
      <Reveal as="ol" group className="routes-teaser__list" role="list">
        {dayRoutes.map((route, i) => (
          <RevealItem as="li" key={route.id}>
            <Link className="routes-teaser__item" to={planHref.routes}>
              <span className="routes-teaser__n" aria-hidden="true">
                {i + 1}
              </span>
              <span className="routes-teaser__title">{pick(route.title, lang)}</span>
              <span className="routes-teaser__mood">{pick(route.mood, lang)}</span>
              <span className="routes-teaser__first">{pick(route.steps[0]!.leg.text, lang)}</span>
            </Link>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Acto 8 · Cierre: planifica tu visita                                */
/* ------------------------------------------------------------------ */

const closeLinks: PlanSectionId[] = ['before', 'around', 'map', 'numbers'];

export function PlanClose() {
  const { t } = usePreferences();
  return (
    <section data-sc-act="close" className="section plan-close" aria-labelledby="plan-close-title">
      <h2 id="plan-close-title" className="title-1">
        {t.home.closeTitle}
      </h2>
      <p className="lead">{t.home.closeLead}</p>
      <ul className="plan-close__grid" role="list">
        {closeLinks.map((id) => (
          <li key={id}>
            <Link className="plan-close__link" to={planHref[id]}>
              <span className="plan-close__title">{t.plan.sections[id].title}</span>
              <span className="plan-close__body">{t.plan.sections[id].body}</span>
              <ChevronRightIcon size={18} />
            </Link>
          </li>
        ))}
      </ul>
      <a className="promo material-solid" href="./diario.html">
        <BookIcon size={28} className="promo__icon" />
        <span className="promo__text">
          <span className="title-3">{t.home.journalTitle}</span>
          <span className="promo__body">{t.home.journalBody}</span>
        </span>
        <span className="promo__cta">
          {t.home.journalCta}
          <ChevronRightIcon size={16} />
        </span>
      </a>
    </section>
  );
}
