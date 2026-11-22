import { Link } from 'react-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { format, formatDate, pick } from '../i18n';
import {
  agenda,
  beforeYouGo,
  dayRoutes,
  findTravelSource,
  gettingAround,
  glossary,
  glossarySourceId,
  TFWM_PLANNER,
  type TravelTopic,
} from '../content/travel';
import { getPlace, getSector } from '../content/queries';
import type { SourceRef } from '../content/types';
import { Card } from '../components/Card';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExternalLink } from '../components/ExternalLink';
import { Reveal, RevealItem } from '../components/Reveal';
import { ChevronLeftIcon } from '../components/icons';
import { useDocumentTitle } from '../components/useDocumentTitle';
import type { ReactNode } from 'react';

export type PlanSectionId = 'before' | 'around' | 'routes' | 'agenda' | 'brummie' | 'map' | 'numbers';

/** Ruta de cada sección dentro de la guía. */
export const planHref: Record<PlanSectionId, string> = {
  before: '/plan/before',
  around: '/plan/getting-around',
  routes: '/plan/routes',
  agenda: '/plan/calendar',
  brummie: '/plan/brummie',
  map: '/plan/map',
  numbers: '/useful-numbers',
};
const order: PlanSectionId[] = ['before', 'around', 'routes', 'map', 'agenda', 'brummie', 'numbers'];
const accents: Record<PlanSectionId, string> = {
  before: 'sky',
  around: 'canal',
  routes: 'brick',
  map: 'park',
  agenda: 'sun',
  brummie: 'violet',
  numbers: 'slate',
};

/* ------------------------------------------------------------------ Hub */

export function PlanHub() {
  const { t } = usePreferences();
  useDocumentTitle(t.plan.title);
  return (
    <article className="plan">
      <Reveal as="header" group className="page-header">
        <RevealItem>
          <p className="eyebrow">{t.plan.eyebrow}</p>
          <h1 className="title-1" tabIndex={-1}>
            {t.plan.title}
          </h1>
        </RevealItem>
        <RevealItem>
          <p className="lead">{t.plan.lead}</p>
        </RevealItem>
      </Reveal>
      <Reveal as="ul" group className="card-grid" role="list" aria-label={t.plan.hubLabel}>
        {order.map((id) => (
          <RevealItem as="li" key={id} depth>
            <Card to={planHref[id]} accent={accents[id]} title={t.plan.sections[id].title} description={t.plan.sections[id].body} headingLevel="h2" />
          </RevealItem>
        ))}
      </Reveal>
    </article>
  );
}

/* --------------------------------------------------------- Armazón común */

function PlanPage({ section, children, sourceIds }: { section: PlanSectionId; children: ReactNode; sourceIds: string[] }) {
  const { t } = usePreferences();
  const title = t.plan.sections[section].title;
  useDocumentTitle(title);
  const sources = [...new Set(sourceIds)].map(findTravelSource).filter(Boolean) as SourceRef[];
  return (
    <article className="plan" data-accent={accents[section]}>
      <Reveal as="header" group className="page-header">
        <RevealItem>
          <Breadcrumbs
            label={t.sector.breadcrumb}
            items={[
              { label: t.sector.backToGuide, to: '/' },
              { label: t.plan.eyebrow, to: '/plan' },
              { label: title },
            ]}
          />
        </RevealItem>
        <RevealItem>
          <h1 className="title-1" tabIndex={-1}>
            {title}
          </h1>
        </RevealItem>
        <RevealItem>
          <p className="lead">{t.plan.sections[section].body}</p>
        </RevealItem>
      </Reveal>
      <div className="plan__body">{children}</div>
      {sources.length > 0 && <SourceList sources={sources} />}
      <Link className="back-link" to="/plan">
        <ChevronLeftIcon size={18} />
        {t.plan.backToPlan}
      </Link>
    </article>
  );
}

function SourceList({ sources }: { sources: SourceRef[] }) {
  const { t, lang } = usePreferences();
  return (
    <Reveal as="section" className="place__section" aria-labelledby="plan-sources-title">
      <h2 id="plan-sources-title" className="title-3">
        {t.plan.sourcesTitle}
      </h2>
      <ol className="sources">
        {sources.map((s) => (
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
  );
}

const citeTitles = (ids: string[]) => ids.map((id) => findTravelSource(id)?.publisher ?? id).join(' · ');

function Topics({ topics }: { topics: TravelTopic[] }) {
  const { t, lang } = usePreferences();
  return (
    <Reveal as="ul" group className="topics" role="list">
      {topics.map((topic) => (
        <RevealItem as="li" key={topic.id} className="topic">
          <h2 className="title-3">{pick(topic.title, lang)}</h2>
          <ul className="bullet-list">
            {topic.items.map((item, i) => (
              <li key={i}>
                {pick(item.text, lang)} <span className="cite">{format(t.place.sourceRef, { list: citeTitles(item.sourceIds) })}</span>
              </li>
            ))}
          </ul>
        </RevealItem>
      ))}
    </Reveal>
  );
}

const topicSources = (topics: TravelTopic[]) => topics.flatMap((x) => x.items.flatMap((i) => i.sourceIds));

/* ------------------------------------------------------------- Secciones */

export function BeforeYouGo() {
  const { t } = usePreferences();
  return (
    <PlanPage section="before" sourceIds={topicSources(beforeYouGo)}>
      <Topics topics={beforeYouGo} />
      <p className="note">
        <Link className="text-link" to="/useful-numbers">
          {t.plan.sections.numbers.title}
        </Link>
      </p>
    </PlanPage>
  );
}

export function GettingAround() {
  const { t } = usePreferences();
  return (
    <PlanPage section="around" sourceIds={topicSources(gettingAround)}>
      <Topics topics={gettingAround} />
      <p>
        <ExternalLink className="button button--primary" href={TFWM_PLANNER}>
          {t.plan.plannerCta}
        </ExternalLink>
      </p>
    </PlanPage>
  );
}

export function DayRoutes() {
  const { t, lang } = usePreferences();
  return (
    <PlanPage section="routes" sourceIds={[]}>
      <div className="routes">
        {dayRoutes.map((route) => (
          <Reveal as="section" key={route.id} className="route" aria-labelledby={`route-${route.id}`}>
            <header className="route__header">
              <h2 id={`route-${route.id}`} className="title-2">
                {pick(route.title, lang)}
              </h2>
              <p className="route__mood">{pick(route.mood, lang)}</p>
              <p className="section__count">{format(t.plan.routeStops, { count: route.steps.length })}</p>
            </header>
            <ol className="route__steps">
              {route.steps.map(({ leg, stop }, i) => {
                const place = getPlace(stop.placeId);
                const sector = place && getSector(place.sectorId);
                if (!place || !sector) return null;
                const legSource = getPlace(leg.sourcePlaceId);
                return (
                  <li key={i} className="route__step" data-accent={sector.accent}>
                    <p className="route__leg">
                      <span className="route__mode">{leg.mode === 'walk' ? t.plan.walkLeg : t.place.modes[leg.mode]}</span>
                      {pick(leg.text, lang)}
                      {legSource && (
                        <span className="cite">
                          {' '}
                          {format(t.place.sourceRef, { list: pick(legSource.name, lang) })}
                        </span>
                      )}
                    </p>
                    <Link className="route__stop" to={`/sector/${sector.id}/${place.id}`}>
                      <span className="route__index" aria-hidden="true" />
                      <span className="route__name">{pick(place.name, lang)}</span>
                      <span className="route__note">{pick(stop.note, lang)}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        ))}
      </div>
      <p>
        <ExternalLink className="button" href={TFWM_PLANNER}>
          {t.plan.plannerCta}
        </ExternalLink>
      </p>
    </PlanPage>
  );
}

export function YearAgenda() {
  const { t, lang } = usePreferences();
  const months = t.plan.months;
  const byMonth = months.map((_, m) => agenda.filter((a) => a.months.includes(m + 1)));
  return (
    <PlanPage section="agenda" sourceIds={agenda.flatMap((a) => a.sourceIds)}>
      <p className="note">{t.plan.agendaNote}</p>
      <Reveal as="ol" group className="agenda" role="list">
        {byMonth.map((items, m) =>
          items.length ? (
            <RevealItem as="li" key={m} className="agenda__month">
              <h2 className="agenda__label">{months[m]}</h2>
              <ul className="agenda__items" role="list">
                {items.map((a) => {
                  const place = a.placeId ? getPlace(a.placeId) : undefined;
                  return (
                    <li key={a.id} className="agenda__item">
                      <h3 className="title-3">{pick(a.title, lang)}</h3>
                      <p>{pick(a.text, lang)}</p>
                      <p className="cite">{format(t.place.sourceRef, { list: citeTitles(a.sourceIds) })}</p>
                      {place && (
                        <Link className="text-link" to={`/sector/${place.sectorId}/${place.id}`}>
                          {pick(place.name, lang)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </RevealItem>
          ) : null,
        )}
      </Reveal>
    </PlanPage>
  );
}

export function SpeakBrummie() {
  const { t, lang } = usePreferences();
  return (
    <PlanPage section="brummie" sourceIds={[glossarySourceId]}>
      <p className="note">{t.plan.glossaryLead}</p>
      <Reveal as="ul" group className="glossary" role="list">
        {glossary.map((g) => (
          <RevealItem as="li" key={g.term} className="glossary__term" depth>
            <p className="glossary__word" lang="en-GB">
              {g.term}
            </p>
            {g.say && (
              <p className="glossary__say">
                {t.plan.say}: <span lang="en-GB">{g.say}</span>
              </p>
            )}
            <p className="glossary__meaning">{pick(g.meaning, lang)}</p>
            {g.example && (
              <p className="glossary__example">
                {t.plan.example}: <q lang="en-GB">{g.example}</q>
              </p>
            )}
          </RevealItem>
        ))}
      </Reveal>
    </PlanPage>
  );
}
