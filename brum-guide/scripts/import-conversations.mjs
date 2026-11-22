#!/usr/bin/env node
/**
 * Importa el documento de prompts al contenido del diario.
 *
 *   npm run import:conversations -- "<ruta al .txt>"
 *
 * - Respeta el orden del archivo y la numeración por herramienta
 *   («***Prompt 1 (ChatGPT):», «***Respuesta 1 (Claude):», …).
 * - Escribe un archivo por intervención en src/content/conversations/ y el índice
 *   index.json. El texto se conserva; solo se sustituyen los fragmentos privados
 *   (ruta del usuario) por «[dato privado omitido]». El original no se modifica.
 * - Las parejas sin contenido quedan como borrador (no se publican).
 * - No sobrescribe entradas cuyo estado ya sea "published" y se hayan editado a mano
 *   salvo con --force.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = process.argv.slice(2).find((a) => !a.startsWith('--'));
const force = process.argv.includes('--force');
if (!src) {
  console.error('Uso: npm run import:conversations -- "<ruta al .txt>"');
  process.exit(1);
}
const outDir = `${root}src/content/conversations/`;
await mkdir(outDir, { recursive: true });

const PRIVATE = '[dato privado omitido]';
/** Solo el fragmento personal: la carpeta del usuario de Windows. */
const redact = (text) => {
  let count = 0;
  const out = text.replace(/[A-Za-z]:\\Users\\[^\\/\s"»)]+/g, () => {
    count++;
    return PRIVATE;
  });
  return { text: out, count };
};

const raw = (await readFile(src, 'utf8')).replace(/\r\n/g, '\n').replace(/^﻿/, '');
const heading = /^\*{3}(Prompt|Respuesta) (\d+) \((ChatGPT|Claude)\):\s*$/gm;
const marks = [...raw.matchAll(heading)].map((m) => ({ kind: m[1], n: Number(m[2]), tool: m[3], start: m.index, end: m.index + m[0].length }));
if (!marks.length) throw new Error('No se encontraron encabezados «***Prompt N (Herramienta):»');

/** Texto de una intervención: sin líneas vacías al principio/final y sin «\» de fin de línea (salto de línea de la exportación). */
const clean = (s) => s.replace(/\\\n/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, '');

const header = raw.slice(0, marks[0].start);
const models = [...header.matchAll(/^[-.]\s*(.+)$/gm)].map((m) => m[1].trim());

const pairs = new Map();
marks.forEach((m, i) => {
  const body = clean(raw.slice(m.end, marks[i + 1]?.start ?? raw.length));
  const key = `${m.tool}-${m.n}`;
  if (!pairs.has(key)) pairs.set(key, { tool: m.tool, n: m.n, order: pairs.size + 1 });
  pairs.get(key)[m.kind === 'Prompt' ? 'prompt' : 'response'] = body;
});

const index = [];
let redactions = 0;
for (const p of pairs.values()) {
  const id = `${String(p.order).padStart(2, '0')}-${p.tool.toLowerCase()}-${p.n}`;
  const promptFile = `${id}.prompt.txt`;
  const responseFile = `${id}.response.md`;
  const prompt = redact(p.prompt ?? '');
  const response = redact(p.response ?? '');
  redactions += prompt.count + response.count;
  const hasContent = prompt.text.trim() && response.text.trim();
  const status = hasContent ? 'published' : 'draft';
  const exists = await access(`${outDir}${promptFile}`).then(() => true, () => false);
  if (!exists || force || status === 'published') {
    await writeFile(`${outDir}${promptFile}`, prompt.text + (prompt.text ? '\n' : ''));
    await writeFile(`${outDir}${responseFile}`, response.text + (response.text ? '\n' : ''));
  }
  index.push({
    id,
    order: p.order,
    tool: p.tool === 'Claude' ? 'claude' : 'chatgpt',
    number: p.n,
    status,
    promptFile,
    responseFile,
    redactions: prompt.count + response.count,
  });
}

const meta = {
  $comment:
    'Diario: parejas prompt/respuesta en el orden del documento. Para añadir o completar una entrada, edita sus dos archivos de texto y pon "status": "published". Solo se publican las entradas con estado published y contenido en ambos archivos.',
  source: 'prompts para la documentación.txt',
  declaredModels: models.filter((m) => /\d/.test(m)),
  declaredTools: models.filter((m) => !/\d/.test(m)),
  entries: index,
};
await writeFile(`${outDir}index.json`, JSON.stringify(meta, null, 2) + '\n');

const byTool = index.reduce((acc, e) => ((acc[`${e.tool}/${e.status}`] = (acc[`${e.tool}/${e.status}`] ?? 0) + 1), acc), {});
console.log(`Entradas: ${index.length} ${JSON.stringify(byTool)} · fragmentos privados sustituidos: ${redactions}`);
console.log(`Modelos declarados: ${meta.declaredModels.join(' · ')}`);
