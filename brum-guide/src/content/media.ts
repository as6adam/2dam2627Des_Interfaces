import rightsJson from './photo-rights.json';
import manifestJson from './image-manifest.json';
import type { ImageManifestEntry, PhotoId, PhotoRights } from './types';

/**
 * Une el registro de derechos (photo-rights.json) con las variantes generadas por
 * `npm run images` (image-manifest.json). Solo las fotos `granted` tienen variantes;
 * el resto se muestra con el recurso provisional local.
 */
const rights = (rightsJson as { photos: PhotoRights[] }).photos;
const manifest = manifestJson as Record<string, ImageManifestEntry>;

const variantUrls = import.meta.glob<string>('../assets/images/*.{webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const urlFor = (file: string) => variantUrls[`../assets/images/${file}`];

export interface ResolvedImage {
  width: number;
  height: number;
  srcSetWebp: string;
  srcSetJpg: string;
  fallback: string;
}

export interface ResolvedPhoto {
  rights: PhotoRights;
  /** Presente solo si la foto está autorizada y sus variantes existen. */
  image?: ResolvedImage;
}

const rightsById = new Map<PhotoId, PhotoRights>(rights.map((r) => [r.id, r]));

function resolveImage(id: PhotoId): ResolvedImage | undefined {
  const entry = manifest[id];
  if (!entry || rightsById.get(id)?.permission !== 'granted') return undefined;
  const variants = entry.variants.filter((v) => urlFor(v.webp) && urlFor(v.jpg));
  const largest = variants[variants.length - 1];
  if (!largest) return undefined;
  return {
    width: entry.width,
    height: entry.height,
    srcSetWebp: variants.map((v) => `${urlFor(v.webp)} ${v.width}w`).join(', '),
    srcSetJpg: variants.map((v) => `${urlFor(v.jpg)} ${v.width}w`).join(', '),
    fallback: urlFor(largest.jpg)!,
  };
}

const cache = new Map<PhotoId, ResolvedPhoto | undefined>();

export function getPhoto(id: PhotoId | undefined): ResolvedPhoto | undefined {
  if (!id) return undefined;
  if (!cache.has(id)) {
    const r = rightsById.get(id);
    cache.set(id, r ? { rights: r, image: resolveImage(id) } : undefined);
  }
  return cache.get(id);
}

export const allPhotoRights = rights;

/** Fotos de Welcome_to_brum elegidas para la portada (orden de aparición). */
export const HOME_HERO_PHOTO = 'welcome-to-brum--birmingham-victoria-square';
/** Capa frontal de la apertura (vertical, sube por encima del fondo). */
export const HOME_INSET_PHOTO = 'welcome-to-brum--birmingham-biblioteca-desde-el-canal';
export const HOME_STRIP_PHOTOS = [
  'welcome-to-brum--birmingham-canal',
  'welcome-to-brum--birmingham-panoramica-nocturna',
  'welcome-to-brum--birmingham-centenary-square-desde-el-aire',
  'welcome-to-brum--birmingham-arquitectura',
];
