import type { GeoPoint, Place } from './types.ts';
import { places } from './queries.ts';

/** Distancia en línea recta (haversine), en km. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Lugares más cercanos con ubicación propia. Se descartan los que comparten
 * punto (p. ej. la sala de Shakespeare dentro de la biblioteca se muestra
 * igualmente, pero a 0 km) solo si son el mismo lugar.
 */
export function nearbyPlaces(place: Place, limit = 3): Array<{ place: Place; km: number }> {
  const here = place.location;
  if (!here) return [];
  return places
    .filter((p) => p.id !== place.id && p.location)
    .map((p) => ({ place: p, km: distanceKm(here, p.location!) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}
