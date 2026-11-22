import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { motionTokens } from '../motion/springs';
import { SharedTitle } from '../components/SharedTitle';
import { Link, useParams } from 'react-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format, formatDate, pick } from '../i18n';
import { getSector, placesInSector, sectorCoverPhotoId } from '../content/queries';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { SharedPhoto } from '../components/SharedPhoto';
import { Reveal, RevealItem } from '../components/Reveal';
import { useDocumentTitle } from '../components/useDocumentTitle';
import type { Sector } from '../content/types';
import { NotFoundPage } from './NotFoundPage';

export function SectorPage() {
  const { sectorId } = useParams();
  const sector = getSector(sectorId);
  if (!sector) return <NotFoundPage />;
  return <SectorView sector={sector} />;
}

function SectorView({ sector }: { sector: Sector }) {
  const { t, lang } = usePreferences();
  const header = useRef<HTMLElement>(null);
  const { reduce } = useMotionPrefs();
  const { scrollYProgress } = useScroll({target:header, offset:['start start', 'end start']});
  const y = useTransform(scrollYProgress, [0, 1], [0, motionTokens.sector.parallaxPx]);
  const name = pick(sector.name, lang);
  const places = placesInSector(sector.id);
  useDocumentTitle(name);

  return (
    <>
      <header ref={header} className="page-header page-header--sector" data-accent={sector.accent}>
        <Reveal group className="page-header__copy">
          <RevealItem>
            <Breadcrumbs label={t.sector.breadcrumb} items={[{ label: t.sector.backToGuide, to: '/' }, { label: name }]} />
          </RevealItem>
          <RevealItem>
            <h1 className="title-1" tabIndex={-1}>
              <SharedTitle id={`sector:${sector.id}`} text={name} />
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="lead">{pick(sector.summary, lang)}</p>
            <p className="section__count">{format(t.home.placesCount, { count: places.length })}</p>
          </RevealItem>
        </Reveal>
        {/* Destino de la tarjeta del sector en portada y origen al volver */}
        <motion.div className="sector-cover-depth" style={{ y: reduce ? 0 : y }}>
        <SharedPhoto
          sharedKey={`sector:${sector.id}`}
          hero
          id={sectorCoverPhotoId(sector)}
          className="page-header__photo"
          sizes="(min-width: 900px) 480px, 100vw"
          ratio={3 / 2}
          priority
          caption
        />
        </motion.div>
      </header>

      {sector.id === 'visitor-logistics-safety' && <Link className="button" to="/useful-numbers">{t.shell.numbers}</Link>}
      <section className="section" aria-labelledby="places-title" data-accent={sector.accent}>
        <h2 id="places-title" className="title-2">
          {t.sector.placesTitle}
        </h2>
        {places.length === 0 ? (
          <p className="empty-state">{t.sector.empty}</p>
        ) : (
          <Reveal as="ul" group className="card-grid" role="list">
            {places.map((place) => (
              <RevealItem as="li" key={place.id} depth>
                <Card
                  to={`/sector/${sector.id}/${place.id}`}
                  accent={sector.accent}
                  photoId={place.photoIds[0]}
                  sharedKey={`place:${place.id}`}
                  title={pick(place.name, lang)}
                  description={place.summary ? pick(place.summary, lang) : undefined}
                  meta={place.verifiedOn ? format(t.place.verifiedOn, { date: formatDate(place.verifiedOn, lang) }) : undefined}
                />
              </RevealItem>
            ))}
          </Reveal>
        )}
      </section>
    </>
  );
}
