import type { Place } from '../types.ts';
import { cultureFood } from './culture-food.ts';
import { learnMove } from './learn-move.ts';
import type { PlaceDetail } from './helpers.ts';
import { locations } from './locations.ts';
import { natureShopping } from './nature-shopping.ts';
import { nightsFamily } from './nights-family.ts';

export const details: Record<string, PlaceDetail> = { ...cultureFood, ...natureShopping, ...nightsFamily, ...learnMove };

const sameLeg = (a: NonNullable<Place['transport']>[number], b: NonNullable<Place['transport']>[number]) =>
  a.mode === b.mode && a.stop.en.toLowerCase() === b.stop.en.toLowerCase();

/**
 * Fusiona la ampliación editorial con la ficha base.
 * Reemplaza: nombre, resumen, descripción, dirección, mapa, imprescindibles, datos prácticos y consejos.
 * Añade: transporte (la ampliación sustituye a una opción base con el mismo modo y parada),
 * accesibilidad, avisos y fuentes (sin repetir id).
 */
const normUrl = (u: string) => u.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');

export function enrich(place: Place): Place {
  const d = details[place.id];
  const location = place.location ?? locations[place.id];
  if (!d) return location ? { ...place, location } : place;

  // Una misma página citada dos veces (ficha base y ampliación) se queda con el id nuevo.
  const newByUrl = new Map((d.sources ?? []).map((s) => [normUrl(s.url), s.id]));
  const remap = new Map<string, string>();
  for (const s of place.sources ?? []) {
    const to = newByUrl.get(normUrl(s.url));
    if (to) remap.set(s.id, to);
  }
  const ids = (list: string[]) => [...new Set(list.map((id) => remap.get(id) ?? id))];
  const baseSources = (place.sources ?? []).filter((s) => !remap.has(s.id));
  const baseIds = new Set(baseSources.map((s) => s.id));
  const baseTransport = (place.transport ?? []).map((o) => ({ ...o, sourceIds: ids(o.sourceIds) }));
  const baseAccess = (place.accessibility ?? []).map((a) => ({ ...a, sourceIds: ids(a.sourceIds) }));
  const baseAddress = place.address && { ...place.address, sourceId: remap.get(place.address.sourceId) ?? place.address.sourceId };

  const transport = d.transport
    ? [...baseTransport.filter((base) => !d.transport!.some((n) => sameLeg(base, n))), ...d.transport]
    : baseTransport;
  return {
    ...place,
    name: d.name ?? place.name,
    summary: d.summary ?? place.summary,
    description: d.description ?? place.description,
    address: d.address ?? baseAddress,
    map: d.map ?? place.map,
    highlights: d.highlights ?? place.highlights,
    practical: d.practical ?? place.practical,
    tips: d.tips ?? place.tips,
    transport,
    accessibility: [...baseAccess, ...(d.accessibility ?? [])],
    caveats: [...(place.caveats ?? []), ...(d.caveats ?? [])],
    sources: [...baseSources, ...(d.sources ?? []).filter((s) => !baseIds.has(s.id))],
    location,
  };
}
