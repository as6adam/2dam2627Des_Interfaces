import { Link } from 'react-router';
import { motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format, pick } from '../i18n';
import { featured, getPlace, placesInSector, sectorCoverPhotoId, sectors } from '../content/queries';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { SharedPhoto } from '../components/SharedPhoto';
import { Reveal, RevealItem } from '../components/Reveal';
import { BookIcon, ChevronRightIcon } from '../components/icons';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { PRESS_SCALE, springs } from '../motion/springs';
import { PhotoOpening } from './PhotoOpening';
import { PhotoStrip } from './PhotoStrip';

const MotionLink = motion.create(Link);

export function HomePage() {
  const { t, lang } = usePreferences();
  useDocumentTitle(t.meta.guideTitle);
  const featuredPlace = getPlace(featured.placeId);
  const featuredHref = featuredPlace ? `/sector/${featuredPlace.sectorId}/${featuredPlace.id}` : '/';

  return (
    <>
      <PhotoOpening />

      <PhotoStrip />

      {featuredPlace && (
        <Reveal as="section" group className="featured" aria-labelledby="featured-title" data-accent="sky">
          <RevealItem>
            {/* Misma clave que la ficha: la foto viaja al abrir el destacado */}
            <SharedPhoto
              sharedKey={`place:${featuredPlace.id}`}
              id={featuredPlace.photoIds[0]}
              className="featured__photo"
              sizes="(min-width: 900px) 540px, 100vw"
              ratio={16 / 10}
              decorative
            />
          </RevealItem>
          <RevealItem className="featured__body">
            <div className="featured__badges">
              <Badge tone="featured">{pick(featured.eyebrow, lang)}</Badge>
              {featured.textStatus === 'provisional' && <Badge tone="provisional">{t.badge.provisional}</Badge>}
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
      )}

      <section className="section" aria-labelledby="sectors-title">
        <div className="section__header">
          <h2 id="sectors-title" className="title-2" tabIndex={-1}>
            {t.home.sectorsTitle}
          </h2>
          <p className="section__count">{format(t.home.sectorsCount, { count: sectors.length })}</p>
        </div>
        <Reveal as="ul" group className="card-grid" role="list">
          {sectors.map((sector) => (
            <RevealItem as="li" key={sector.id}>
              <Card
                to={`/sector/${sector.id}`}
                accent={sector.accent}
                photoId={sectorCoverPhotoId(sector)}
                sharedKey={`sector:${sector.id}`}
                title={pick(sector.name, lang)}
                description={pick(sector.summary, lang)}
                meta={format(t.home.placesCount, { count: placesInSector(sector.id).length })}
              />
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <Reveal as="section" className="section" aria-labelledby="journal-promo-title">
        <a className="promo material-solid" href="./diario.html">
          <BookIcon size={28} className="promo__icon" />
          <span className="promo__text">
            <span id="journal-promo-title" className="title-3">
              {t.home.journalTitle}
            </span>
            <span className="promo__body">{t.home.journalBody}</span>
          </span>
          <span className="promo__cta">
            {t.home.journalCta}
            <ChevronRightIcon size={16} />
          </span>
        </a>
      </Reveal>
    </>
  );
}
