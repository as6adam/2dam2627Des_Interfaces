import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { pick } from '../i18n';
import { places, sectors } from '../content/queries';
import type { Place } from '../content/types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Reveal, RevealItem } from '../components/Reveal';
import { ChevronLeftIcon } from '../components/icons';
import { useDocumentTitle } from '../components/useDocumentTitle';

interface Bounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/** Recuadro del centro (anillo interior aproximado). */
const CENTRE: Bounds = { north: 52.4925, south: 52.4705, west: -1.9195, east: -1.879 };
const KM_PER_DEG_LAT = 111.32;

/** Proyección equirrectangular con corrección de latitud: suficiente a escala de ciudad. */
function projector(b: Bounds, width: number) {
  const midLat = ((b.north + b.south) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat);
  const spanX = (b.east - b.west) * kx;
  const spanY = b.north - b.south;
  const height = (width * spanY) / spanX;
  const kmPerUnit = (spanX * KM_PER_DEG_LAT) / width;
  return {
    height,
    kmPerUnit,
    xy: (lat: number, lng: number) => ({ x: ((lng - b.west) * kx * width) / spanX, y: ((b.north - lat) * height) / spanY }),
  };
}

function regionBounds(list: Place[]): Bounds {
  const lats = list.map((p) => p.location!.lat);
  const lngs = list.map((p) => p.location!.lng);
  const padLat = 0.02;
  const padLng = 0.03;
  return {
    north: Math.max(...lats) + padLat,
    south: Math.min(...lats) - padLat,
    west: Math.min(...lngs) - padLng,
    east: Math.max(...lngs) + padLng,
  };
}

const inside = (b: Bounds, p: Place) =>
  !!p.location && p.location.lat <= b.north && p.location.lat >= b.south && p.location.lng >= b.west && p.location.lng <= b.east;

function niceScale(kmPerUnit: number, width: number) {
  const target = (width * kmPerUnit) / 4;
  const steps = [0.25, 0.5, 1, 2, 5, 10];
  const km = steps.reduce<number>((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), 0.25);
  return { km, units: km / kmPerUnit };
}

function MapPanel({ title, bounds, list, focus, id }: { title: string; bounds: Bounds; list: Place[]; focus?: string; id: string }) {
  const { lang } = usePreferences();
  const W = 1000;
  const { height, xy, kmPerUnit } = projector(bounds, W);
  const scale = niceScale(kmPerUnit, W);
  const kmLabel = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(scale.km);
  const centreBox = id === 'region' ? { a: xy(CENTRE.north, CENTRE.west), b: xy(CENTRE.south, CENTRE.east) } : null;
  // Punto enfocado al final para que quede por encima.
  const ordered = [...list].sort((a, b) => Number(a.id === focus) - Number(b.id === focus));

  return (
    <figure className="map" aria-labelledby={`map-${id}-title`}>
      <figcaption id={`map-${id}-title`} className="title-3">
        {title}
      </figcaption>
      <svg className="map__svg" viewBox={`0 0 ${W} ${Math.round(height)}`} role="group" aria-label={title}>
        <defs>
          <pattern id={`grid-${id}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0H0V100" className="map__grid" />
          </pattern>
        </defs>
        <rect width={W} height={height} className="map__ground" />
        <rect width={W} height={height} fill={`url(#grid-${id})`} />
        {centreBox && (
          <rect
            className="map__centre"
            x={centreBox.a.x}
            y={centreBox.a.y}
            width={centreBox.b.x - centreBox.a.x}
            height={centreBox.b.y - centreBox.a.y}
            rx="8"
          />
        )}
        {ordered.map((p) => {
          const s = sectors.find((x) => x.id === p.sectorId)!;
          const { x, y } = xy(p.location!.lat, p.location!.lng);
          const on = p.id === focus;
          const name = pick(p.name, lang);
          return (
            <Link key={p.id} to={`/sector/${s.id}/${p.id}`} className="map__pin" data-accent={s.accent} data-focus={on || undefined} aria-label={name}>
              <title>{name}</title>
              {on && <circle cx={x} cy={y} r="38" className="map__halo" />}
              <circle cx={x} cy={y} r={on ? 18 : 13} className="map__dot" />
              {/* Etiqueta visible al enfocar o pasar el puntero; el lugar enfocado la muestra siempre. */}
              <text x={x > 700 ? x - 16 : x + 16} y={y + 6} textAnchor={x > 700 ? 'end' : 'start'} className="map__label" aria-hidden="true">
                {name}
              </text>
            </Link>
          );
        })}
        <g className="map__scale" transform={`translate(24 ${height - 28})`}>
          <path d={`M0 0H${scale.units}`} />
          <path d={`M0 -6V6M${scale.units} -6V6`} />
          <text x={scale.units + 10} y="5">
            {kmLabel} km
          </text>
        </g>
        <g className="map__north" transform={`translate(${W - 40} 44)`} aria-hidden="true">
          <path d="M0 -22L9 6L0 0L-9 6Z" />
          <text y="26" textAnchor="middle">
            N
          </text>
        </g>
      </svg>
    </figure>
  );
}

export function MapPage() {
  const { t, lang } = usePreferences();
  const [params] = useSearchParams();
  const focus = params.get('focus') ?? undefined;
  const title = t.plan.sections.map.title;
  useDocumentTitle(title);

  const located = useMemo(() => places.filter((p) => p.location), []);
  const region = useMemo(() => regionBounds(located), [located]);
  const central = located.filter((p) => inside(CENTRE, p));
  const focused = focus ? places.find((p) => p.id === focus) : undefined;

  return (
    <article className="plan" data-accent="park">
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
            {focused ? `${title} · ${pick(focused.name, lang)}` : title}
          </h1>
        </RevealItem>
        <RevealItem>
          <p className="lead">{t.plan.mapLead}</p>
        </RevealItem>
      </Reveal>

      <div className="maps">
        <MapPanel id="centre" title={t.plan.mapCentre} bounds={CENTRE} list={central} focus={focus} />
        <MapPanel id="region" title={t.plan.mapRegion} bounds={region} list={located} focus={focus} />
      </div>
      <p className="note">{t.plan.mapAttribution}</p>

      <section className="place__section" aria-labelledby="map-list-title">
        <h2 id="map-list-title" className="title-2">
          {t.plan.mapList}
        </h2>
        <ul className="map-list" role="list">
          {sectors.map((s) => (
            <li key={s.id} data-accent={s.accent}>
              <h3 className="map-list__sector">{pick(s.name, lang)}</h3>
              <ul role="list">
                {places
                  .filter((p) => p.sectorId === s.id)
                  .map((p) => (
                    <li key={p.id}>
                      <Link className="text-link" to={`/sector/${s.id}/${p.id}`} aria-current={p.id === focus ? 'location' : undefined}>
                        {pick(p.name, lang)}
                      </Link>
                      {!p.location && <span className="note"> · {t.plan.mapNoLocation}</span>}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <Link className="back-link" to="/plan">
        <ChevronLeftIcon size={18} />
        {t.plan.backToPlan}
      </Link>
    </article>
  );
}
