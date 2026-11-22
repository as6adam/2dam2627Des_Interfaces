#!/usr/bin/env node
/**
 * Genera variantes responsivas SOLO de las fotos con `permission: "granted"`
 * en src/content/photo-rights.json. Los originales se leen y nunca se modifican.
 *
 *   npm run images                                   # usa ../Brum_pics
 *   npm run images -- --src "C:\ruta\Brum_pics"
 *   npm run images -- --dry-run --out <carpeta>      # prueba en otra carpeta, incluye no autorizadas
 *
 * Salida: src/assets/images/<id>-<ancho>.{webp,jpg} y src/content/image-manifest.json
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes('--dry-run');
const srcRoot = opt('--src') ?? process.env.BRUM_PICS ?? join(root, '..', '..', 'Brum_pics');
const outDir = opt('--out') ?? join(root, 'src', 'assets', 'images');
const manifestPath = dryRun ? join(outDir, 'image-manifest.json') : join(root, 'src', 'content', 'image-manifest.json');

if (dryRun && !opt('--out')) {
  console.error('--dry-run requiere --out para no escribir en el proyecto');
  process.exit(1);
}

const WIDTHS = [480, 960, 1600];
const { photos } = JSON.parse(await readFile(join(root, 'src', 'content', 'photo-rights.json'), 'utf8'));
const selected = photos.filter((p) => p.permission === 'granted' || (dryRun && p.permission === 'unconfirmed'));

await mkdir(outDir, { recursive: true });
const manifest = {};
const written = new Set();

for (const photo of selected) {
  const input = join(srcRoot, photo.folder, photo.file);
  // Portada a sangre: hasta 2400 px (pantallas 2×). Fichas y tarjetas: hasta 1600 px.
  const maxWidth = photo.role === 'home' ? 2400 : 1600;
  const widths = WIDTHS.filter((w) => w < Math.min(photo.width, maxWidth));
  widths.push(Math.min(photo.width, maxWidth));
  const variants = [];
  for (const w of [...new Set(widths)].sort((a, b) => a - b)) {
    const base = `${photo.id}-${w}`;
    // sharp elimina EXIF/IPTC por defecto: la autoría queda en photo-rights.json.
    const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    await pipeline.clone().webp({ quality: 76 }).toFile(join(outDir, `${base}.webp`));
    await pipeline.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(join(outDir, `${base}.jpg`));
    written.add(`${base}.webp`).add(`${base}.jpg`);
    variants.push({ width: w, webp: `${base}.webp`, jpg: `${base}.jpg` });
  }
  manifest[photo.id] = { width: photo.width, height: photo.height, variants };
  console.log(`✔ ${photo.id} → ${variants.map((v) => v.width).join(', ')} px`);
}

// Limpia variantes de fotos que han dejado de estar autorizadas.
if (!dryRun) {
  for (const f of await readdir(outDir)) {
    if (/\.(webp|jpg)$/.test(f) && !written.has(f)) {
      await rm(join(outDir, f));
      console.log(`✘ retirada ${f}`);
    }
  }
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${selected.length} foto(s) procesada(s) de ${photos.length}. Manifiesto: ${manifestPath}`);
