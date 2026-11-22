#!/usr/bin/env node
/**
 * Inventario de solo lectura de la carpeta de fotos original.
 *
 *   npm run inventory:photos -- "C:\Users\Vorb\Desktop\Brum_pics"
 *
 * Solo lee: lista carpetas y archivos, su tamaño y las dimensiones de la
 * cabecera (JPEG SOF / PNG IHDR). No copia, no transforma ni importa fotos.
 * Escribe src/content/photo-inventory.json y docs/photo-inventory.md.
 */
import { open, readdir, stat, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = process.argv[2] ?? process.env.BRUM_PICS ?? join(projectRoot, '..', 'Brum_pics');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function readHead(file, bytes = 256 * 1024) {
  const fh = await open(file, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}

function dimensions(buf) {
  // PNG: firma + IHDR
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: 'png' };
  }
  // JPEG: recorrer segmentos hasta un SOFn
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSOF) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7), format: 'jpeg' };
      }
      i += 2 + len;
    }
    return { width: null, height: null, format: 'jpeg' };
  }
  return { width: null, height: null, format: 'unknown' };
}

const folders = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort((a, b) => a.localeCompare(b));

const inventory = [];
for (const folder of folders) {
  const files = (await readdir(join(sourceRoot, folder), { withFileTypes: true }))
    .filter((f) => f.isFile() && IMAGE_EXT.has(extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b));
  const photos = [];
  for (const file of files) {
    const full = join(sourceRoot, folder, file);
    const { size } = await stat(full);
    const dim = dimensions(await readHead(full));
    photos.push({
      id: `${slug(folder)}--${slug(basename(file, extname(file)))}`,
      file,
      bytes: size,
      width: dim.width,
      height: dim.height,
      format: dim.format,
    });
  }
  inventory.push({ folder, folderSlug: slug(folder), count: photos.length, photos });
}

const totalPhotos = inventory.reduce((n, f) => n + f.count, 0);
const totalBytes = inventory.reduce((n, f) => n + f.photos.reduce((m, p) => m + p.bytes, 0), 0);

await writeFile(
  join(projectRoot, 'src', 'content', 'photo-inventory.json'),
  JSON.stringify({ folders: inventory }, null, 2) + '\n',
);

const mb = (b) => (b / 1024 / 1024).toFixed(2);
let md = `# Inventario de fotos (solo lectura)\n\n`;
md += `Origen inspeccionado: \`${sourceRoot}\` — ${folders.length} carpetas, ${totalPhotos} fotos, ${mb(totalBytes)} MB.\n\n`;
md += `Generado por \`npm run inventory:photos\`. No se ha modificado, copiado ni importado ninguna foto; `;
md += `las copias optimizadas se crearán en \`src/assets/images/\` en la fase de catálogo.\n\n`;
for (const f of inventory) {
  md += `## ${f.folder} (${f.count})\n\n| Archivo | Dimensiones | Tamaño | Formato | id |\n|---|---|---|---|---|\n`;
  for (const p of f.photos) {
    const dims = p.width ? `${p.width}×${p.height}` : 'n/d';
    md += `| ${p.file} | ${dims} | ${mb(p.bytes)} MB | ${p.format} | \`${p.id}\` |\n`;
  }
  md += '\n';
}
await writeFile(join(projectRoot, 'docs', 'photo-inventory.md'), md);

console.log(`Inventario: ${folders.length} carpetas, ${totalPhotos} fotos, ${mb(totalBytes)} MB`);
for (const f of inventory) console.log(`  ${f.folder.padEnd(30)} ${f.count}`);
