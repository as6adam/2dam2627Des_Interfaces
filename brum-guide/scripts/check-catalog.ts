/**
 * Validación del catálogo y del registro de fotos (Node ≥ 22.18, tipos eliminados de forma nativa).
 *
 *   npm run check:catalog
 */
import { readFileSync } from 'node:fs';
import { catalog } from '../src/content/catalog.ts';
import type { PhotoRights } from '../src/content/types.ts';

const rights = JSON.parse(
  readFileSync(new URL('../src/content/photo-rights.json', import.meta.url), 'utf8'),
) as { photos: PhotoRights[] };

const errors: string[] = [];
const warn: string[] = [];
const photoIds = new Set(rights.photos.map((p) => p.id));
const sectorIds = new Set(catalog.sectors.map((s) => s.id));
const iso = /^\d{4}-\d{2}-\d{2}$/;

if (catalog.sectors.length !== 10) errors.push(`Se esperaban 10 sectores, hay ${catalog.sectors.length}`);

const seen = new Set<string>();
for (const p of catalog.places) {
  if (seen.has(p.id)) errors.push(`id de lugar duplicado: ${p.id}`);
  seen.add(p.id);
  if (!sectorIds.has(p.sectorId)) errors.push(`${p.id}: sector inexistente ${p.sectorId}`);
  for (const ph of p.photoIds) if (!photoIds.has(ph)) errors.push(`${p.id}: foto inexistente ${ph}`);
  if (!p.name.es || !p.name.en) errors.push(`${p.id}: falta nombre ES/EN`);

  const srcIds = new Set((p.sources ?? []).map((s) => s.id));
  const needSource = (ids: string[], what: string) => {
    if (!ids.length) errors.push(`${p.id}: ${what} sin fuente`);
    for (const id of ids) if (!srcIds.has(id)) errors.push(`${p.id}: ${what} cita fuente desconocida ${id}`);
  };
  if (p.address) needSource([p.address.sourceId], 'dirección');
  for (const t of p.transport ?? []) needSource(t.sourceIds, `transporte ${t.id}`);
  for (const a of p.accessibility ?? []) needSource(a.sourceIds, 'accesibilidad');
  for (const s of p.sources ?? []) if (!iso.test(s.checkedOn)) errors.push(`${p.id}: fecha de verificación inválida en ${s.id}`);

  if (p.provenance === 'demo') {
    if (p.address || p.transport?.length || p.accessibility?.length || p.summary) {
      errors.push(`${p.id}: una entrada de demostración no puede llevar datos prácticos ni textos`);
    }
  } else {
    if (!p.sources?.length) errors.push(`${p.id}: ficha ${p.provenance} sin fuentes`);
    if (!p.verifiedOn || !iso.test(p.verifiedOn)) errors.push(`${p.id}: falta fecha de verificación`);
  }
}

for (const s of catalog.sectors) {
  if (!catalog.places.some((p) => p.sectorId === s.id)) warn.push(`sector sin lugares: ${s.id}`);
  if (s.coverPhotoId && !photoIds.has(s.coverPhotoId)) errors.push(`${s.id}: portada inexistente`);
}

const f = catalog.featured;
const fp = catalog.places.find((p) => p.id === f.placeId);
if (!fp) errors.push(`destacado apunta a un lugar inexistente: ${f.placeId}`);
for (const b of f.blocks) for (const id of b.sourceIds) {
  if (!fp?.sources?.some((s) => s.id === id)) errors.push(`destacado ${b.id}: fuente ${id} no registrada en la ficha`);
}

for (const ph of rights.photos) {
  if (!ph.alt?.es || !ph.alt?.en) errors.push(`foto ${ph.id}: falta texto alternativo ES/EN`);
  if (ph.permission === 'granted' && (!ph.source || !ph.license)) {
    errors.push(`foto ${ph.id}: autorizada sin fuente o licencia registradas`);
  }
}

const counts = catalog.places.reduce<Record<string, number>>((acc, p) => {
  acc[p.provenance] = (acc[p.provenance] ?? 0) + 1;
  return acc;
}, {});
const perm = rights.photos.reduce<Record<string, number>>((acc, p) => {
  acc[p.permission] = (acc[p.permission] ?? 0) + 1;
  return acc;
}, {});

console.log(`Sectores: ${catalog.sectors.length} · Lugares: ${catalog.places.length} ${JSON.stringify(counts)}`);
console.log(`Fotos: ${rights.photos.length} ${JSON.stringify(perm)}`);
for (const w of warn) console.warn(`aviso: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
console.log('Catálogo válido.');
