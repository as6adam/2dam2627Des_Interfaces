import { catalog } from './catalog.ts';
import type { Place, Sector, SectorId, SourceRef } from './types.ts';

export const sectors: Sector[] = catalog.sectors;
export const places: Place[] = catalog.places;
export const featured = catalog.featured;

const sectorById = new Map<string, Sector>(sectors.map((s) => [s.id, s]));
const placeById = new Map<string, Place>(places.map((p) => [p.id, p]));

export const getSector = (id: string | undefined): Sector | undefined => (id ? sectorById.get(id) : undefined);
export const getPlace = (id: string | undefined): Place | undefined => (id ? placeById.get(id) : undefined);

export const placesInSector = (sectorId: SectorId): Place[] => places.filter((p) => p.sectorId === sectorId);

export function sectorCoverPhotoId(sector: Sector): string | undefined {
  return sector.coverPhotoId ?? placesInSector(sector.id)[0]?.photoIds[0];
}

export function findSource(place: Place, id: string): SourceRef | undefined {
  return place.sources?.find((s) => s.id === id);
}

/** Datos prácticos que faltan en una ficha (para la lista de pendientes). */
export function missingFields(place: Place): Array<'summary' | 'address' | 'transport' | 'map' | 'accessibility' | 'sources'> {
  const missing: ReturnType<typeof missingFields> = [];
  if (!place.summary) missing.push('summary');
  if (!place.address) missing.push('address');
  if (!place.transport?.length) missing.push('transport');
  if (!place.map) missing.push('map');
  if (!place.accessibility?.length) missing.push('accessibility');
  if (!place.sources?.length) missing.push('sources');
  return missing;
}
