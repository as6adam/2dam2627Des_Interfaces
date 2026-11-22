import type { Place } from '../types.ts';

/**
 * Coordenadas para el mapa sin conexión y «Cerca de aquí».
 * - `postcodes.io`: centroide del código postal publicado por el lugar (api.postcodes.io, ONS).
 * - `openstreetmap`: punto de OpenStreetMap (Nominatim) cuando no hay código postal publicado.
 * Consultado el 2026-11-22. Digbeth Dining Club no tiene sede fija y se omite.
 */
type Loc = NonNullable<Place['location']>;
const pc = (lat: number, lng: number): Loc => ({ lat, lng, via: 'postcodes.io' });
const osm = (lat: number, lng: number): Loc => ({ lat, lng, via: 'openstreetmap' });

export const locations: Record<string, Loc> = {
  'aston-hall': pc(52.50646, -1.88459),
  'birmingham-back-to-backs': osm(52.47414, -1.89781),
  'birmingham-museum-and-art-gallery': pc(52.48059, -1.90318),
  'jewellery-quarter': pc(52.4904, -1.912175),
  'birmingham-balti': pc(52.45743, -1.87671),
  'original-patty-men': pc(52.47866, -1.8903),
  purnells: pc(52.481958, -1.900883),
  'birmingham-botanical-gardens': pc(52.46726, -1.93165),
  'cannon-hill-park': pc(52.45083, -1.89992),
  'lickey-hills': pc(52.37689, -2.00622),
  'sutton-park': pc(52.56507, -1.82909),
  'bullring-and-selfridges': osm(52.47786, -1.89219),
  'grand-central': osm(52.47785, -1.8981),
  'great-western-arcade': pc(52.4819, -1.89714),
  mailbox: pc(52.47681, -1.90372),
  'birmingham-hippodrome': pc(52.4743, -1.89862),
  'o2-academy-birmingham': pc(52.473507, -1.900195),
  'symphony-hall': pc(52.47888, -1.91078),
  'the-night-owl': pc(52.47518, -1.88185),
  'cadbury-world': osm(52.42976, -1.93143),
  'legoland-discovery-centre': pc(52.47994, -1.91491),
  'national-sea-life-centre': pc(52.47818, -1.91201),
  'thinktank-science-museum': pc(52.48281, -1.88595),
  'birmingham-city-university': pc(52.48387, -1.88356),
  'library-of-birmingham': pc(52.4801, -1.90753),
  'shakespeare-memorial-room': pc(52.4801, -1.90753),
  'university-of-birmingham': pc(52.45328, -1.92789),
  'bannatyne-spa': pc(52.47809, -1.91453),
  'harborne-pool-and-fitness-centre': pc(52.45829, -1.9593),
  'moseley-road-baths': pc(52.45893, -1.8855),
  'santai-spa': pc(52.4477, -1.71751),
  'ackers-adventure': pc(52.4597, -1.86028),
  'alexander-stadium': pc(52.53083, -1.90614),
  'edgbaston-cricket-ground': pc(52.45538, -1.90384),
  'villa-park': pc(52.5085, -1.88494),
  'birmingham-airport': osm(52.45418, -1.74387),
  'birmingham-new-street-station': pc(52.477677, -1.898007),
  'city-centre-wayfinding': osm(52.4812, -1.90014),
  'west-midlands-metro': osm(52.47867, -1.90834),
};
