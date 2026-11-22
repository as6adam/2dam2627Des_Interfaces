/**
 * Contratos del catálogo. Todo texto visible es bilingüe (LocalizedText) y los
 * identificadores son slugs estables que se usan en las rutas hash.
 *
 * Regla editorial: ningún dato práctico (dirección, servicio, parada, tiempo)
 * entra sin una fuente (`SourceRef`) con fecha de verificación. Lo que falte se
 * deja vacío y la interfaz lo muestra como pendiente.
 */
import type { Lang } from '../preferences/storageKeys';

export type LocalizedText = Record<Lang, string>;

/** Fecha ISO AAAA-MM-DD. */
export type IsoDate = string;

export type SectorId =
  | 'culture-heritage'
  | 'gastronomy-culinary'
  | 'nature-outdoors'
  | 'shopping-retail'
  | 'entertainment-nightlife'
  | 'family-recreation'
  | 'education-literature'
  | 'health-wellness'
  | 'sports-adventure'
  | 'visitor-logistics-safety';

export type SectorAccent =
  | 'brick'
  | 'canal'
  | 'violet'
  | 'sun'
  | 'spice'
  | 'mint'
  | 'park'
  | 'rose'
  | 'sky'
  | 'slate';

export interface Sector {
  id: SectorId;
  name: LocalizedText;
  summary: LocalizedText;
  accent: SectorAccent;
  /** Glifo corto de respaldo (2 letras). */
  glyph: string;
  /** Carpeta de origen en Brum_pics. */
  sourceFolder: string;
  /** Foto de portada del sector (por defecto, la de su primer lugar). */
  coverPhotoId?: PhotoId;
}

/**
 * Procedencia del contenido de una ficha:
 * - `demo`: entrada de demostración (nombre tomado del archivo de foto), sin textos ni datos prácticos.
 * - `verified`: datos prácticos comprobados en las fuentes citadas; textos provisionales.
 * - `author`: textos y datos facilitados por el autor de la guía.
 */
export type Provenance = 'demo' | 'verified' | 'author';

export type PlaceKind = 'venue' | 'area' | 'park' | 'food' | 'service' | 'transport-hub';

export interface SourceRef {
  id: string;
  /** Título legible de la fuente. */
  title: string;
  publisher: string;
  url: string;
  /** Día en que se consultó y contrastó. */
  checkedOn: IsoDate;
}

export interface PostalAddress {
  lines: string[];
  postcode: string;
  sourceId: string;
}

export type TransportMode = 'rail' | 'tram' | 'bus' | 'shuttle' | 'coach' | 'air' | 'cycle';

export interface WalkLeg {
  /** Minutos tal como los publica la fuente (texto, p. ej. "≈ 5" o "< 10"). */
  minutes?: string;
  /** Distancia tal como la publica la fuente, p. ej. "0,3 millas". */
  distance?: LocalizedText;
  note?: LocalizedText;
}

export interface TransportOption {
  id: string;
  mode: TransportMode;
  /** Línea o servicio, p. ej. "Walsall – Birmingham New Street". */
  service?: LocalizedText;
  /** Parada o estación donde bajar. */
  stop: LocalizedText;
  /** Origen habitual cuando la fuente lo indica. */
  origin?: LocalizedText;
  /** Duración publicada por la fuente (sin cálculos propios). */
  ride?: LocalizedText;
  walk?: WalkLeg;
  /** Restricciones de días/horarios, p. ej. "solo días de partido". */
  availability?: LocalizedText;
  notes?: LocalizedText[];
  sourceIds: string[];
}

export interface AccessibilityNote {
  text: LocalizedText;
  sourceIds: string[];
}

export interface MapLink {
  /** Enlace externo (búsqueda por dirección, sin coordenadas inventadas). */
  url: string;
  provider: 'OpenStreetMap';
}

export interface Place {
  id: string;
  sectorId: SectorId;
  name: LocalizedText;
  kind: PlaceKind;
  provenance: Provenance;
  summary?: LocalizedText;
  description?: LocalizedText[];
  address?: PostalAddress;
  transport?: TransportOption[];
  map?: MapLink;
  accessibility?: AccessibilityNote[];
  sources?: SourceRef[];
  /** Fecha de la última verificación de los datos prácticos. */
  verifiedOn?: IsoDate;
  /** Discrepancias detectadas entre fuentes, visibles en la ficha. */
  caveats?: LocalizedText[];
  photoIds: PhotoId[];
  /** «Lo imprescindible»: cosas concretas que ver o hacer, citadas. */
  highlights?: CitedText[];
  /** Datos prácticos publicados por el lugar (horario, precio, reserva…). */
  practical?: PracticalFact[];
  /** Consejos del visitante tomados de la web oficial o de guías reputadas. */
  tips?: CitedText[];
  /** Ubicación para el mapa y «Cerca de aquí», con su procedencia. */
  location?: GeoPoint & { via: 'postcodes.io' | 'openstreetmap' };
}

/** Coordenadas WGS84 (grados decimales). */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Texto bilingüe con las fuentes que lo respaldan. */
export interface CitedText {
  text: LocalizedText;
  sourceIds: string[];
}

export type PracticalKind = 'status' | 'hours' | 'price' | 'booking' | 'duration' | 'contact';

export interface PracticalFact extends CitedText {
  kind: PracticalKind;
}

export interface FeaturedBlock {
  id: string;
  heading: LocalizedText;
  paragraphs: LocalizedText[];
  sourceIds: string[];
}

export interface Featured {
  placeId: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  /** `provisional` hasta recibir los textos del autor. */
  textStatus: 'provisional' | 'author';
  blocks: FeaturedBlock[];
}

export interface Catalog {
  sectors: Sector[];
  places: Place[];
  featured: Featured;
}

/* ---------- Fotografía ---------- */

export type PhotoId = string;

/** Estado del permiso de uso en el sitio. Solo `granted` se copia y publica. */
export type PhotoPermission = 'granted' | 'unconfirmed' | 'denied';

export interface PhotoRights {
  id: PhotoId;
  folder: string;
  file: string;
  width: number;
  height: number;
  /** Dónde se obtuvo (URL o descripción); `null` si se desconoce. */
  source: string | null;
  /** Autor o titular de derechos, si consta. */
  author: string | null;
  /** Licencia o acuerdo, si consta. */
  license: string | null;
  licenseUrl?: string;
  permission: PhotoPermission;
  /** Indicios encontrados en metadatos o marcas de agua. */
  evidence: string[];
  alt: LocalizedText;
  /** Uso previsto en la guía. */
  role: 'home' | 'place' | 'sector';
}

export interface ImageVariant {
  width: number;
  webp: string;
  jpg: string;
}

export interface ImageManifestEntry {
  width: number;
  height: number;
  variants: ImageVariant[];
}
