#!/usr/bin/env node
/** Escribe docs/photo-rights.md a partir de src/content/photo-rights.json.  npm run report:photos */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { photos } = JSON.parse(await readFile(`${root}src/content/photo-rights.json`, 'utf8'));
const esc = (s) => String(s ?? '—').replace(/\|/g, '\\|');
const count = (k) => photos.filter((p) => p.permission === k).length;

let md = `# Registro de derechos de las fotos\n\n`;
md += `Generado desde \`src/content/photo-rights.json\` con \`npm run report:photos\`.\n\n`;
md += `| Estado | Fotos |\n|---|---|\n| granted (se publica) | ${count('granted')} |\n| unconfirmed (recurso provisional) | ${count('unconfirmed')} |\n| denied | ${count('denied')} |\n\n`;
md += `Solo las fotos \`granted\` con fuente y licencia registradas se copian al sitio (\`npm run images\`). `;
md += `Los originales de Brum_pics no se modifican nunca.\n\n`;

for (const folder of [...new Set(photos.map((p) => p.folder))]) {
  md += `## ${folder}\n\n| Archivo | Permiso | Autor | Fuente | Licencia | Indicios | Alt ES | Alt EN |\n|---|---|---|---|---|---|---|---|\n`;
  for (const p of photos.filter((x) => x.folder === folder)) {
    md += `| ${esc(p.file)} | ${p.permission} | ${esc(p.author)} | ${esc(p.source)} | ${esc(p.license)} | ${esc(p.evidence.join(' '))} | ${esc(p.alt.es)} | ${esc(p.alt.en)} |\n`;
  }
  md += '\n';
}
await writeFile(`${root}docs/photo-rights.md`, md);
console.log('docs/photo-rights.md');
