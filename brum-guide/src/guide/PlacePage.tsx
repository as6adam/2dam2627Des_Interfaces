import { SharedTitle } from '../components/SharedTitle';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format, formatDate, pick } from '../i18n';
import { featured, findSource, getPlace, getSector } from '../content/queries';
import type { Place, Sector, TransportOption } from '../content/types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SharedPhoto } from '../components/SharedPhoto';
import { Reveal, RevealItem } from '../components/Reveal';
import { SectionIndex, type IndexItem } from '../components/SectionIndex';
import { ChevronLeftIcon } from '../components/icons';
import { ExternalLink } from '../components/ExternalLink';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';

export function PlacePage() {
  const { sectorId, placeId } = useParams();
  const sector = getSector(sectorId);
  const place = getPlace(placeId);
  // La ficha solo existe bajo su propio sector.
  if (!sector || !place || place.sectorId !== sector.id) return <NotFoundPage />;
  return <PlaceView sector={sector} place={place} />;
}

function PlaceView({ sector, place }: { sector: Sector; place: Place }) {
  const { t, lang } = usePreferences();
  const name = pick(place.name, lang);
  const sectorName = pick(sector.name, lang);
  const feature = featured.placeId === place.id ? featured : undefined;
  const hasGettingThere = !!(place.address || place.transport?.length || place.map);
  useDocumentTitle(name);

  /** Títulos de las fuentes citadas por un dato, para mostrarlos junto a él. */
  const cite = (ids: string[]) =>
    format(t.place.sourceRef, {
      list: ids.map((id) => findSource(place, id)?.title ?? id).join(' · '),
    });

  const indexItems = useMemo<IndexItem[]>(() => {
    const items: IndexItem[] = feature
      ? feature.blocks.map((b) => ({ id: `sec-${b.id}`, label: pick(b.heading, lang) }))
      : [{ id: 'sec-overview', label: t.place.overview }];
    if (hasGettingThere) items.push({ id: 'sec-getting-there', label: t.place.gettingThere });
    if (place.accessibility?.length) items.push({ id: 'sec-access', label: t.place.accessibility });
    if (place.sources?.length) items.push({ id: 'sec-sources', label: t.place.sources });
    return items;
  }, [feature, hasGettingThere, place, lang, t]);

  return (
    <article className="place" data-accent={sector.accent}>
      <Reveal as="header" group className="page-header">
        <RevealItem>
          <Breadcrumbs
            label={t.sector.breadcrumb}
            items={[
              { label: t.sector.backToGuide, to: '/' },
              { label: sectorName, to: `/sector/${sector.id}` },
              { label: name },
            ]}
          />
        </RevealItem>
        <RevealItem>
          <p className="eyebrow">
            {t.place.sectorLabel} · {sectorName}
          </p>
          <h1 className="title-1" tabIndex={-1}>
            <SharedTitle id={`place:${place.id}`} text={name} />
          </h1>
        </RevealItem>
        <RevealItem className="page-header__meta">
          {place.summary && <p className="lead">{pick(place.summary, lang)}</p>}
        </RevealItem>
      </Reveal>

      {/* Destino de la tarjeta y origen de la transición de vuelta */}
      <SharedPhoto
        sharedKey={`place:${place.id}`}
        hero
        id={place.photoIds[0]}
        className="place__photo"
        sizes="(min-width: 1100px) 1040px, 100vw"
        priority
        caption
      />

      <div className="place__body">
        <SectionIndex label={t.place.indexLabel} items={indexItems} />

        <div className="place__content">
          {feature ? (
            <>

              {feature.blocks.map((block) => (
                <Reveal as="section" key={block.id} id={`sec-${block.id}`} className="prose" aria-labelledby={`block-${block.id}`}>
                  <h2 id={`block-${block.id}`} className="title-2">
                    {pick(block.heading, lang)}
                  </h2>
                  {block.paragraphs.map((p, i) => (
                    <p key={i}>{pick(p, lang)}</p>
                  ))}
                  <p className="cite">{cite(block.sourceIds)}</p>
                </Reveal>
              ))}
            </>
          ) : (
            <Reveal as="section" id="sec-overview" className="place__section prose" aria-labelledby="overview-title">
              <h2 id="overview-title" className="title-2">
                {t.place.overview}
              </h2>
              {place.description?.map((p, i) => <p key={i}>{pick(p, lang)}</p>)}
            </Reveal>
          )}

          {hasGettingThere && (
            <section id="sec-getting-there" className="place__section" aria-labelledby="getting-there-title">
              <Reveal>
                <h2 id="getting-there-title" className="title-2">
                  {t.place.gettingThere}
                </h2>
              </Reveal>

              <Reveal group className="facts">
                {place.address && (
                  <RevealItem className="fact">
                    <h3 className="fact__label">{t.place.address}</h3>
                    <address className="fact__value">
                      {place.address.lines.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                      <span>{place.address.postcode}</span>
                    </address>
                    <p className="cite">{cite([place.address.sourceId])}</p>
                  </RevealItem>
                )}
                {place.map && (
                  <RevealItem className="fact">
                    <h3 className="fact__label">{t.place.map}</h3>
                    <ExternalLink href={place.map.url}>{t.place.mapLink}</ExternalLink>
                  </RevealItem>
                )}
              </Reveal>

              {place.transport?.length ? (
                <>
                  <h3 className="title-3">{t.place.transport}</h3>
                  <Reveal as="ul" group className="transport-list" role="list">
                    {place.transport.map((option) => (
                      <RevealItem as="li" key={option.id}>
                        <TransportCard option={option} cite={cite} />
                      </RevealItem>
                    ))}
                  </Reveal>
                </>
              ) : null}
            </section>
          )}

          {place.accessibility?.length ? (
            <Reveal as="section" id="sec-access" className="place__section" aria-labelledby="access-title">
              <h2 id="access-title" className="title-2">
                {t.place.accessibility}
              </h2>
              <ul className="bullet-list">
                {place.accessibility.map((a, i) => (
                  <li key={i}>
                    {pick(a.text, lang)} <span className="cite">{cite(a.sourceIds)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {place.caveats?.length ? (
            <Reveal as="section" className="place__section" aria-labelledby="caveats-title">
              <h2 id="caveats-title" className="title-3">
                {t.place.caveats}
              </h2>
              <ul className="bullet-list bullet-list--muted">
                {place.caveats.map((c, i) => (
                  <li key={i}>{pick(c, lang)}</li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {place.sources?.length ? (
            <Reveal as="section" id="sec-sources" className="place__section" aria-labelledby="sources-title">
              <h2 id="sources-title" className="title-3">
                {t.place.sources}
              </h2>
              {place.verifiedOn && (
                <p className="note">{format(t.place.verifiedOn, { date: formatDate(place.verifiedOn, lang) })}</p>
              )}
              <ol className="sources">
                {place.sources.map((s) => (
                  <li key={s.id}>
                    <ExternalLink href={s.url} lang="en">
                      {s.title}
                    </ExternalLink>
                    <span className="sources__meta">
                      {s.publisher} · {format(t.place.checkedOn, { date: formatDate(s.checkedOn, lang) })}
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          ) : null}

          <Link className="back-link" to={`/sector/${sector.id}`}>
            <ChevronLeftIcon size={18} />
            {format(t.place.backToSector, { sector: sectorName })}
          </Link>
        </div>
      </div>
    </article>
  );
}

function TransportCard({ option, cite }: { option: TransportOption; cite: (ids: string[]) => string }) {
  const { t, lang } = usePreferences();
  const rows: Array<[string, string]> = [];
  if (option.service) rows.push([t.place.service, pick(option.service, lang)]);
  if (option.origin) rows.push([t.place.origin, pick(option.origin, lang)]);
  if (option.ride) rows.push([t.place.ride, pick(option.ride, lang)]);
  if (option.walk) {
    const parts = [
      option.walk.minutes ? format(t.place.walkMinutes, { minutes: option.walk.minutes }) : '',
      option.walk.distance ? pick(option.walk.distance, lang) : '',
    ].filter(Boolean);
    const walkText = [parts.join(' · '), option.walk.note ? pick(option.walk.note, lang) : ''].filter(Boolean).join('. ');
    rows.push([t.place.walk, walkText]);
  }
  if (option.availability) rows.push([t.place.availability, pick(option.availability, lang)]);

  return (
    <article className="transport" data-mode={option.mode}>
      <header className="transport__header">
        <span className="transport__mode">{t.place.modes[option.mode]}</span>
        <h4 className="transport__stop">
          <span className="visually-hidden">{t.place.stop}: </span>
          {pick(option.stop, lang)}
        </h4>
      </header>
      <dl className="transport__rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {option.notes?.map((n, i) => (
        <p key={i} className="transport__note">
          {pick(n, lang)}
        </p>
      ))}
      <p className="cite">{cite(option.sourceIds)}</p>
    </article>
  );
}
