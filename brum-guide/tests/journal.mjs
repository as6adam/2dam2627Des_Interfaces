#!/usr/bin/env node
/**
 * Prueba del diario académico sobre el build servido con base /2dam2627Des_Interfaces/brum-guide/.
 *
 *   npm run build:pages && npm run test:journal
 *
 * Chrome del sistema (headless, playwright-core) a 390 px (móvil emulado) y 1440 px,
 * en tema claro y oscuro. No es una prueba en iPhone.
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4186;
const BASE = `http://localhost:${PORT}/2dam2627Des_Interfaces/brum-guide/`;
const DIARY = `${BASE}diario.html`;
const out = `${root}test-results/journal/`;
await mkdir(out, { recursive: true });

const results = [];
const check = (group, name, ok, detail = '') => {
  results.push({ group, name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} [${group}] ${name}${detail ? ` — ${detail}` : ''}`);
};

// Datos fuente
const convDir = `${root}src/content/conversations/`;
const meta = JSON.parse(await readFile(`${convDir}index.json`, 'utf8'));
const published = [];
for (const e of meta.entries) {
  const prompt = (await readFile(convDir + e.promptFile, 'utf8')).replace(/\r\n/g, '\n').trimEnd();
  const response = (await readFile(convDir + e.responseFile, 'utf8')).replace(/\r\n/g, '\n').trimEnd();
  if (e.status === 'published' && prompt && response) published.push({ ...e, prompt, response });
}
const TOOL = { chatgpt: 'ChatGPT', claude: 'Claude' };
const expectedLabels = published.map((e) => `Prompt ${e.number} · ${TOOL[e.tool]}`);
const longest = [...published].sort((a, b) => b.response.length + b.prompt.length - (a.response.length + a.prompt.length))[0];

const server = spawn(
  process.execPath,
  [`${root}node_modules/vite/bin/vite.js`, 'preview', '--base=/2dam2627Des_Interfaces/brum-guide/', '--port', String(PORT), '--strictPort'],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => String(d).includes(String(PORT)) && (clearTimeout(timer), resolve()));
  server.on('exit', (c) => reject(new Error(`preview terminó (${c})`)));
});
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
  headless: true,
});

const prefs = ({ lang, theme }) => {
  localStorage.setItem('brum-guide:lang', lang);
  localStorage.setItem('brum-guide:theme', theme);
};
const dismissToast = async (p) => {
  const b = p.locator('.pwa-toast').getByRole('button');
  if (await b.count()) {
    await b.first().click().catch(() => {});
    await p.locator('.pwa-toast').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
  }
};

try {
  /* ============ 1. Contenido y enlaces ============ */
  let g = 'Contenido';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE);
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Documentación y fases' }).click();
  await page.waitForURL(DIARY);
  check(g, 'index.html → diario.html', (await page.getByRole('heading', { level: 1 }).textContent()) === 'Documentación y fases');
  await page.getByRole('link', { name: 'Volver a la guía' }).click();
  await page.waitForURL(BASE);
  check(g, 'diario.html → index.html', (await page.getByRole('heading', { level: 1 }).textContent()) === 'Una ciudad de canales, ladrillo y música.');
  await page.goto(DIARY);
  await dismissToast(page);

  const labels = await page.locator('.conv__label:not(.conv__label--response)').allTextContents();
  check(g, `Entradas en el orden del documento (${published.length})`, labels.join('|') === expectedLabels.join('|'), labels.join(' · '));
  const byTool = published.reduce((a, e) => ((a[e.tool] = (a[e.tool] ?? 0) + 1), a), {});
  check(g, 'Parejas por herramienta', byTool.chatgpt === 1 && byTool.claude === 6, JSON.stringify(byTool));
  check(g, 'La entrada 6 de Claude aparece en la página y el índice', labels.includes('Prompt 6 · Claude') && (await page.locator('.conv-index a').count()) === published.length);
  const intro = await page.locator('main').innerText();
  check(g, 'Introducción: qué ofrece, para quién, reparto y modelos declarados', ['Qué ofrece la guía', 'Para quién se diseñó', 'Cómo se repartió el trabajo', 'Estudiante', 'ChatGPT', 'Claude Code', 'GPT-6.2 Astra (High)', 'Opus 5.5 (High)'].every((s) => intro.includes(s)));

  // Integridad de los prompts: texto íntegro y saltos de línea
  const promptTexts = await page.locator('pre.console').allTextContents();
  const mism = published.filter((e, i) => promptTexts[i] !== e.prompt).map((e) => e.id);
  check(g, 'Prompts íntegros (texto y saltos de línea idénticos a los datos)', mism.length === 0, mism.join(', ') || `${promptTexts.length} prompts`);
  // Respuestas: todas desplegadas, contienen el principio y el final del texto
  for (const t of await page.locator('.conv__toggle').all()) if ((await t.getAttribute('aria-expanded')) === 'false') await t.click();
  await page.waitForTimeout(600);
  const respOk = [];
  for (const [i, e] of published.entries()) {
    const text = (await page.locator('.conv').nth(i).locator('.transcript').innerText()).replace(/\s+/g, ' ');
    const plain = (s) => s.replace(/\*\*|`|\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, '').replace(/\s+/g, ' ').trim();
    const lines = e.response.split('\n').filter((l) => l.trim().length > 20);
    const first = plain(lines[0]).slice(0, 60);
    const last = plain(lines.at(-1)).slice(-60);
    respOk.push(text.includes(first) && text.includes(last) ? null : e.id);
  }
  check(g, 'Respuestas completas al desplegar (principio y final presentes)', respOk.every((x) => !x), respOk.filter(Boolean).join(', '));
  const html = await page.content();
  check(g, 'Sin rutas personales; fragmento sustituido por «[dato privado omitido]»', !/Vorb|C:\\\\Users\\\\/i.test(html) && html.includes('[dato privado omitido]'));
  check(g, 'Texto seguro: sin HTML inyectado desde las transcripciones', (await page.locator('.transcript script, .console *').count()) === 0);

  /* ============ 2. Idioma: interfaz traducida, citas originales ============ */
  g = 'Idioma';
  await page.getByRole('button', { name: /Idioma/ }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  const en = await page.locator('main').innerText();
  check(g, 'La interfaz se traduce al inglés', ['Documentation and phases', 'What the guide offers', 'How the work was shared', 'Response 1 · ChatGPT', 'Collapse the response'].every((s) => en.includes(s)));
  const promptsEn = await page.locator('pre.console').allTextContents();
  check(g, 'Las citas se conservan en su idioma original', promptsEn.join('') === promptTexts.join('') && (await page.locator('.transcript[lang="es"]').count()) === published.length && (await page.locator('pre.console[lang="es"]').count()) === published.length);
  await page.getByRole('button', { name: /Language/ }).click();
  await page.getByRole('menuitemradio', { name: 'Español' }).click();
  check('Global', 'Sin errores de JavaScript', errors.length === 0, errors.join(' | '));
  await ctx.close();

  /* ============ 3. Entrada más larga: móvil y escritorio, claro y oscuro ============ */
  g = 'Entrada más larga';
  const idx = published.indexOf(longest);
  for (const theme of ['light', 'dark']) {
    for (const [label, opts] of [
      ['390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }],
      ['1440', { viewport: { width: 1440, height: 900 } }],
    ]) {
      const c = await browser.newContext(opts);
      await c.addInitScript(prefs, { lang: 'es', theme });
      const p = await c.newPage();
      await p.goto(`${DIARY}#conv-${longest.id}`);
      await p.getByRole('heading', { level: 1 }).waitFor();
      await dismissToast(p);
      const entry = p.locator(`#conv-${longest.id}`);
      const toggle = entry.locator('.conv__toggle');
      // Teclado: Tab hasta el botón y Enter
      await toggle.focus();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(700);
      const expanded = await toggle.getAttribute('aria-expanded');
      const m = await p.evaluate((id) => {
        const el = document.getElementById(`conv-${id}`);
        const pre = el.querySelector('pre.console');
        const cs = getComputedStyle(pre);
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        return {
          docOverflow: document.documentElement.scrollWidth - innerWidth,
          preOverflow: pre.scrollWidth - pre.clientWidth,
          wideChildren: [...el.querySelectorAll('*')].filter((n) => n.getBoundingClientRect().right > innerWidth + 1 && !n.closest('.transcript__table-wrap')).length,
          bg: cs.backgroundColor,
          fg: cs.color,
          border: cs.borderTopColor,
          bodyBg,
          radius: cs.borderTopLeftRadius,
          pad: cs.paddingLeft,
          ws: cs.whiteSpace,
          font: cs.fontFamily,
          userSelect: cs.userSelect,
        };
      }, longest.id);
      const env = `${label} · ${theme === 'light' ? 'claro' : 'oscuro'}`;
      check(g, `${env}: se despliega con teclado (Enter)`, expanded === 'true');
      check(g, `${env}: sin desbordamiento horizontal y líneas ajustadas`, m.docOverflow <= 0 && m.preOverflow <= 0 && m.wideChildren === 0, JSON.stringify({ doc: m.docOverflow, pre: m.preOverflow, wide: m.wideChildren }));
      const padOk = label === '390' ? m.pad === '16px' : m.pad === '24px';
      check(
        g,
        `${env}: bloque de consola #202124 / #F1F3F5, radio 12 px, relleno ${label === '390' ? 16 : 24} px, monoespaciado, pre-wrap y seleccionable`,
        m.bg === 'rgb(32, 33, 36)' && m.fg === 'rgb(241, 243, 245)' && m.radius === '12px' && padOk && m.ws === 'pre-wrap' && /monospace/.test(m.font) && m.userSelect !== 'none',
        `${m.bg} ${m.fg} ${m.radius} ${m.pad}`,
      );
      check(g, `${env}: borde distinguible del fondo de la página`, m.border !== m.bodyBg && m.border !== m.bg, `${m.border} sobre ${m.bodyBg}`);
      // Espacio: pliega con la barra espaciadora
      await toggle.focus();
      await p.keyboard.press('Space');
      await p.waitForTimeout(700);
      check(g, `${env}: se pliega con la barra espaciadora y conserva el foco`, (await toggle.getAttribute('aria-expanded')) === 'false' && (await toggle.evaluate((b) => b === document.activeElement)));
      await toggle.click();
      await p.waitForTimeout(700);
      await entry.screenshot({ path: `${out}longest-${label}-${theme}.png` });
      await c.close();
    }
  }
  void idx;

  /* ============ 4. Diario sin conexión ============ */
  g = 'Sin conexión';
  const oc = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const op = await oc.newPage();
  await op.goto(DIARY);
  await op.getByRole('heading', { level: 1 }).waitFor();
  const sw = await op.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    for (let i = 0; i < 50 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 100));
    return { scope: reg.scope, controlled: !!navigator.serviceWorker.controller };
  });
  check(g, 'Worker activo y controlando el diario tras la primera carga', sw.controlled && sw.scope === BASE, JSON.stringify(sw));
  await oc.setOffline(true);
  await op.reload();
  const offH1 = await op.getByRole('heading', { level: 1 }).textContent();
  const offCount = await op.locator('article.conv').count();
  check(g, 'diario.html abre sin conexión con todas sus entradas', offH1 === 'Documentación y fases' && offCount === published.length, `${offH1} · ${offCount} entradas`);
  await op.screenshot({ path: `${out}offline-diary.png` });
  await oc.close();
} finally {
  await browser.close();
  server.kill();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas · entrada más larga: ${longest.id}`);
await writeFile(`${out}results.json`, JSON.stringify({ date: new Date().toISOString(), longest: longest.id, results }, null, 2));
process.exit(failed.length ? 1 : 0);
