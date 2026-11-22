#!/usr/bin/env node
/**
 * Genera los iconos PNG de la PWA a partir del diseño de public/icons/icon.svg,
 * con el Chrome del sistema (playwright-core), para que el glifo se rasterice igual
 * que en el navegador.
 *
 *   npm run icons
 *
 * - icon-192.png / icon-512.png: purpose "any". Esquinas redondeadas y transparentes.
 * - icon-maskable-512.png: purpose "maskable". A sangre; el glifo queda dentro de la
 *   zona segura (círculo central del 80 %).
 * - apple-touch-icon.png (180): a sangre y sin transparencia; iOS aplica su máscara.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = await readFile(`${root}public/icons/icon.svg`, 'utf8');
// Variante a sangre: mismo dibujo sin radio en el fondo.
const fullBleed = source.replace(/<rect width="512" height="512" rx="\d+"/, '<rect width="512" height="512" rx="0"');
if (fullBleed === source) throw new Error('No se encontró el fondo redondeado en icon.svg');

const targets = [
  { file: 'icon-192.png', size: 192, svg: source, transparent: true },
  { file: 'icon-512.png', size: 512, svg: source, transparent: true },
  { file: 'icon-maskable-512.png', size: 512, svg: fullBleed, transparent: false },
  { file: 'apple-touch-icon.png', size: 180, svg: fullBleed, transparent: false },
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
try {
  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
    await page.setContent(
      `<style>html,body{margin:0;background:${t.transparent ? 'transparent' : '#a33c25'}}svg{width:${t.size}px;height:${t.size}px;display:block}</style>${t.svg}`,
    );
    await page.screenshot({ path: `${root}public/icons/${t.file}`, omitBackground: t.transparent });
    await page.close();
    console.log(`public/icons/${t.file} (${t.size}×${t.size})`);
  }
} finally {
  await browser.close();
}
