#!/usr/bin/env node
/**
 * Prueba de humo sobre el build servido con base /2dam2627Des_Interfaces/brum-guide/.
 *
 *   npm run build:pages && npm run test:e2e
 *
 * Usa playwright-core con el Chrome instalado (sin descargar navegadores).
 * Variable opcional: CHROME_PATH para otro ejecutable.
 */
import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { catalog } from '../src/content/catalog.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4179;
const BASE = `http://localhost:${PORT}/2dam2627Des_Interfaces/brum-guide/`;
const shots = `${root}test-results/`;
await mkdir(shots, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const section = (title) => console.log(`\n— ${title}`);

// ---- servidor de vista previa (node directo para poder cerrarlo) ----
const server = spawn(
  process.execPath,
  [`${root}node_modules/vite/bin/vite.js`, 'preview', '--base=/2dam2627Des_Interfaces/brum-guide/', '--port', String(PORT), '--strictPort'],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
);
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('preview no arrancó')), 20000);
  server.stdout.on('data', (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(timer);
      resolve();
    }
  });
  server.on('exit', (code) => reject(new Error(`preview terminó (${code})`)));
});

const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
  headless: true,
});

/** Tema/idioma del <html> cuando aparece <body>: tras el arranque, antes de React. */
const recordFirstPaintState = () => {
  const mo = new MutationObserver(() => {
    if (document.body && !window.__firstPaint) {
      window.__firstPaint = { theme: document.documentElement.dataset.theme, lang: document.documentElement.lang };
      mo.disconnect();
    }
  });
  mo.observe(document, { childList: true, subtree: true });
};

const presetPrefs = ({ lang, theme }) => {
  localStorage.setItem('brum-guide:lang', lang);
  localStorage.setItem('brum-guide:theme', theme);
};

const h1Text = (p) => p.getByRole('heading', { level: 1 }).textContent();
const settle = (p, ms = 450) => p.waitForTimeout(ms);

/** Contraste WCAG de los textos visibles relevantes, componiendo fondos translúcidos. */
const contrastAudit = () => {
  const parse = (c) => {
    let m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    }
    m = c.match(/color\(srgb ([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[ /]+/).filter(Boolean).map(Number);
      return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1];
    }
    return null;
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
  };
  const bgOf = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0) {
        stack.push(c);
        if (c[3] >= 1) break;
      }
    }
    let base = [255, 255, 255, 1];
    const rootBg = parse(getComputedStyle(document.body).backgroundColor);
    if (rootBg) base = rootBg;
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const lum = ([r, g, b]) =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const sel = [
    'h1', 'h2', 'h3', '.lead', '.eyebrow', '.card__title', '.card__description', '.card__meta', '.section__count',
    '.badge', '.breadcrumbs a', '.breadcrumbs [aria-current]', '.cite', '.notice', '.text-link', '.button--primary',
    '.featured__topics li', '.topnav__link', '.transport__mode', '.transport__rows dt', '.transport__rows dd',
    '.fact__label', '.sources__meta', '.photo__caption', '.note', '.bullet-list li', '.promo__cta', '.shell-footer p',
    '.photo__badge',
  ].join(',');
  const fails = [];
  let checked = 0;
  for (const el of document.querySelectorAll(sel)) {
    if (!el.textContent.trim() || el.closest('.visually-hidden')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const st = getComputedStyle(el);
    const fg = parse(st.color);
    if (!fg) continue;
    const bg = el.matches('.photo__badge') ? over(parse(st.backgroundColor), [40, 40, 40, 1]) : bgOf(el);
    const size = parseFloat(st.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(st.fontWeight) >= 700);
    const value = ratio(over(fg, bg), bg);
    checked++;
    if (value < (large ? 3 : 4.5)) fails.push(`${el.className || el.tagName}: ${value.toFixed(2)} «${el.textContent.trim().slice(0, 30)}»`);
  }
  return { checked, fails: [...new Set(fails)] };
};

try {
  // ================= 1. Primera visita y preferencias =================
  section('Primera visita y preferencias');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(recordFirstPaintState);
  const page = await ctx.newPage();
  const failed = [];
  const outsideBase = [];
  const consoleErrors = [];
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.host === `localhost:${PORT}` && !u.pathname.startsWith('/2dam2627Des_Interfaces/brum-guide/')) outsideBase.push(u.pathname);
  });
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto(BASE);
  await page.getByRole('heading', { level: 1 }).waitFor();
  let state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    theme: document.documentElement.dataset.theme,
    first: window.__firstPaint,
    title: document.title,
  }));
  check('Primera visita en español y claro desde el primer pintado', state.first?.lang === 'es' && state.first?.theme === 'light' && state.lang === 'es');
  check('Título traducido (es)', state.title === 'Guía de Birmingham · Brum', state.title);
  check('Portada con diez tarjetas de sector', (await page.locator('.card-grid .card').count()) === 10);

  const globe = page.getByRole('button', { name: /Idioma: Español/ });
  await globe.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menu').waitFor();
  const items = page.getByRole('menuitemradio');
  check('Menú de idioma por teclado: Español y English, activo marcado',
    (await items.allTextContents()).join('|') === 'Español|English' && (await items.nth(0).getAttribute('aria-checked')) === 'true');
  await page.keyboard.press('Escape');
  await page.getByRole('menu').waitFor({ state: 'detached' });
  check('Escape cierra y devuelve el foco al globo', await globe.evaluate((el) => el === document.activeElement));
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menu').waitFor();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('menu').waitFor({ state: 'detached' });
  check('Inglés actualiza <html lang> y textos', (await page.evaluate(() => document.documentElement.lang)) === 'en' && (await h1Text(page)) === 'A city of canals, brick and music.');
  await page.getByRole('radio', { name: 'Dark' }).click();
  check('Oscuro aplicado y guardado', (await page.evaluate(() => document.documentElement.dataset.theme + '/' + localStorage.getItem('brum-guide:theme'))) === 'dark/dark');
  await page.reload();
  await page.getByRole('heading', { level: 1 }).waitFor();
  state = await page.evaluate(() => window.__firstPaint);
  check('Inglés y oscuro sobreviven a la recarga', state?.lang === 'en' && state?.theme === 'dark', JSON.stringify(state));
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Documentation and phases' }).click();
  await page.waitForURL(/diario\.html$/);
  await page.getByRole('heading', { level: 1 }).waitFor();
  state = await page.evaluate(() => ({ first: window.__firstPaint, h1: document.querySelector('h1')?.textContent }));
  check('Guía → diario conserva inglés y oscuro', state.first?.lang === 'en' && state.first?.theme === 'dark' && state.h1 === 'Documentation and phases');
  check('Diario incluye las conversaciones (Prompt 1 · ChatGPT)', (await page.getByRole('heading', { name: 'Prompt 1 · ChatGPT', exact: true }).count()) === 1);
  await page.getByRole('link', { name: 'Back to the guide' }).click();
  await page.waitForURL(/\/brum-guide\/(#\/?)?$/);
  check('Diario → guía', (await page.evaluate(() => location.pathname)) === '/2dam2627Des_Interfaces/brum-guide/');

  // ================= 2. Diez sectores en ES y EN =================
  section('Diez sectores');
  for (const lang of ['es', 'en']) {
    const sctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await sctx.addInitScript(presetPrefs, { lang, theme: 'light' });
    const sp = await sctx.newPage();
    const wrong = [];
    for (const sector of catalog.sectors) {
      await sp.goto(`${BASE}#/sector/${sector.id}`);
      const h1 = await h1Text(sp);
      const cards = await sp.locator('.card-grid .card').count();
      const expected = catalog.places.filter((p) => p.sectorId === sector.id).length;
      if (h1 !== sector.name[lang] || cards !== expected) wrong.push(`${sector.id}: «${h1}» ${cards}/${expected}`);
    }
    check(`10 sectores con nombre ${lang.toUpperCase()} y sus lugares`, wrong.length === 0, wrong.join('; '));
    await sp.goto(BASE);
    const names = await sp.locator('.card-grid .card__title').allTextContents();
    check(`Portada lista los sectores en orden (${lang})`, names.join('|') === catalog.sectors.map((s) => s.name[lang]).join('|'));
    await sctx.close();
  }

  // ================= 3. Villa Park =================
  section('Villa Park');
  const vctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const vp = await vctx.newPage();
  await vp.goto(BASE);
  const featuredLink = vp.getByRole('link', { name: 'Ver la ficha de Villa Park' });
  check('Destacado de Aston Villa en portada', (await vp.getByRole('heading', { name: 'Aston Villa en Villa Park' }).count()) === 1);
  await featuredLink.click();
  await vp.waitForURL(/#\/sector\/sports-adventure\/villa-park$/);
  const villaH1 = await vp.getByRole('heading', { level: 1, name: 'Villa Park' }).waitFor({ timeout: 5000 }).then(() => true, () => false);
  check('El destacado enlaza a la ficha de Villa Park', villaH1, await h1Text(vp));
  const body = await vp.locator('main').innerText();
  const expectEs = ['El club', 'El estadio', 'La visita', 'B6 6HE', 'Estación de Witton', 'Estación de Aston', '9 min desde New Street',
    'Lanzadera', 'Accesibilidad', 'Fuentes', 'Datos prácticos verificados el 22 de noviembre de 2026'];
  const missingEs = expectEs.filter((s) => !body.includes(s));
  check('Ficha: contexto, dirección, transporte, accesibilidad, fuentes y fecha (es)', missingEs.length === 0, missingEs.join(', '));
  const sourceLinks = vp.locator('.sources a');
  check('Cinco fuentes oficiales enlazadas en pestaña nueva', (await sourceLinks.count()) === 5 &&
    (await sourceLinks.evaluateAll((as) => as.every((a) => a.target === '_blank' && a.rel.includes('noopener') && a.href.startsWith('https://www.avfc.co.uk/')))));
  check('Mapa enlazado (OpenStreetMap)', (await vp.getByRole('link', { name: /Abrir en OpenStreetMap/ }).getAttribute('href'))?.startsWith('https://www.openstreetmap.org/'));
  await vp.getByRole('button', { name: /Idioma/ }).click();
  await vp.getByRole('menuitemradio', { name: 'English' }).click();
  const bodyEn = await vp.locator('main').innerText();
  const expectEn = ['The club', 'The stadium', 'Visiting', 'Witton station', '9 min from New Street', 'Practical details verified on 22 November 2026'];
  const missingEn = expectEn.filter((s) => !bodyEn.includes(s));
  check('Ficha de Villa Park traducida (en)', missingEn.length === 0, missingEn.join(', '));
  await vp.screenshot({ path: `${shots}villa-park-1440-en.png`, fullPage: true });

  // Ficha de demostración
  await vp.goto(`${BASE}#/sector/culture-heritage/aston-hall`);
  await vp.getByRole('heading', { level: 1 }).waitFor();
  const demoText = await vp.locator('main').innerText();
  check('Aston Hall muestra su dirección documentada', demoText.includes('Trinity Road') && demoText.includes('B6 6JD') && !demoText.includes('Demo entry'));
  await vctx.close();

  // ================= 4. Enlaces directos =================
  section('Enlaces directos');
  const routes = [
    ['#/', 'Una ciudad de canales, ladrillo y música.'],
    ['#/sector/gastronomy-culinary', 'Gastronomía y cocina'],
    ['#/sector/sports-adventure/villa-park', 'Villa Park'],
    ['#/sector/visitor-logistics-safety/birmingham-new-street-station', 'Estación de Birmingham New Street'],
    ['#/no-existe', 'No encontramos esta página'],
    ['#/sector/inventado', 'No encontramos esta página'],
    ['#/sector/nature-outdoors/villa-park', 'No encontramos esta página'],
  ];
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const [hash, expected] of routes) {
    const p = await dctx.newPage();
    await p.goto(BASE + hash);
    const h1 = await h1Text(p);
    check(`Ruta directa ${hash}`, h1 === expected, h1 ?? '');
    await p.close();
  }
  await dctx.close();

  // ================= 5. Atrás/adelante: desplazamiento y foco =================
  section('Historial: desplazamiento y foco');
  const nctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const np = await nctx.newPage();
  await np.goto(BASE);
  await np.getByRole('heading', { level: 1 }).waitFor();
  const sportsCard = np.locator('a.card[href="#/sector/sports-adventure"]');
  await sportsCard.scrollIntoViewIfNeeded();
  await np.mouse.wheel(0, 120);
  await settle(np);
  const homeScroll = await np.evaluate(() => Math.round(scrollY));
  await sportsCard.focus();
  await np.keyboard.press('Enter');
  await np.waitForURL(/#\/sector\/sports-adventure$/);
  await settle(np);
  let nav = await np.evaluate(() => ({ y: Math.round(scrollY), focus: document.activeElement?.tagName }));
  check('Avanzar: vuelve arriba y enfoca el h1', nav.y === 0 && nav.focus === 'H1', JSON.stringify(nav));
  await np.mouse.wheel(0, 300);
  await settle(np);
  const sectorScroll = await np.evaluate(() => Math.round(scrollY));
  await np.locator('a.card[href="#/sector/sports-adventure/villa-park"]').click();
  await np.waitForURL(/villa-park$/);
  await settle(np);
  await np.goBack();
  await np.waitForURL(/#\/sector\/sports-adventure$/);
  await settle(np, 700);
  nav = await np.evaluate(() => ({ y: Math.round(scrollY), href: document.activeElement?.getAttribute('href') }));
  check('Atrás: restaura el desplazamiento del sector', Math.abs(nav.y - sectorScroll) <= 4, `${nav.y} vs ${sectorScroll}`);
  check('Atrás: el foco vuelve a la tarjeta de Villa Park', nav.href === '#/sector/sports-adventure/villa-park', String(nav.href));
  await np.goBack();
  await np.waitForURL(/\/brum-guide\/#\/$|\/brum-guide\/$/);
  await settle(np, 700);
  nav = await np.evaluate(() => ({ y: Math.round(scrollY), href: document.activeElement?.getAttribute('href') }));
  check('Atrás a portada: restaura el desplazamiento', Math.abs(nav.y - homeScroll) <= 4, `${nav.y} vs ${homeScroll}`);
  check('Atrás a portada: el foco vuelve a la tarjeta del sector', nav.href === '#/sector/sports-adventure', String(nav.href));
  await np.goForward();
  await np.waitForURL(/#\/sector\/sports-adventure$/);
  await settle(np, 700);
  nav = await np.evaluate(() => ({ y: Math.round(scrollY), href: document.activeElement?.getAttribute('href') }));
  check('Adelante: restaura desplazamiento y foco del sector', Math.abs(nav.y - sectorScroll) <= 4 && nav.href === '#/sector/sports-adventure/villa-park', JSON.stringify(nav));
  await np.goForward();
  await np.waitForURL(/villa-park$/);
  check('Adelante: vuelve a la ficha', (await h1Text(np)) === 'Villa Park');
  await nctx.close();

  // ================= 6. Imágenes: espacio reservado y carga diferida =================
  section('Imágenes');
  const ictx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ictx.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const ip = await ictx.newPage();
  await ip.goto(BASE);
  await ip.getByRole('heading', { level: 1 }).waitFor();
  const imgs = await ip.evaluate(() =>
    [...document.querySelectorAll('main img')].map((img) => ({
      w: img.getAttribute('width'),
      h: img.getAttribute('height'),
      loading: img.getAttribute('loading'),
      hero: !!img.closest('.opening__image'),
      opening: !!img.closest('.opening'),
      frameH: img.closest('.photo__frame').getBoundingClientRect().height,
      ratio: getComputedStyle(img.closest('.photo__frame')).aspectRatio,
      responsive: !!img.getAttribute('srcset') && !!img.closest('picture')?.querySelector('source[type="image/webp"]'),
      placeholder: !!img.closest('.photo--pending'),
    })),
  );
  check('Fotos reales responsivas (srcset + WebP), sin recursos provisionales', imgs.every((i) => i.responsive && !i.placeholder), `${imgs.filter((i) => i.responsive).length}/${imgs.length}`);
  check('Todas las imágenes declaran width y height', imgs.length > 0 && imgs.every((i) => i.w && i.h), `${imgs.length} imágenes`);
  check('Espacio reservado: aspect-ratio en marcos o altura fija del escenario de apertura', imgs.every((i) => (i.ratio && i.ratio !== 'auto') || (i.opening && i.frameH > 0)));
  check('Primera vista inmediata, resto diferido', imgs.filter((i) => i.hero).every((i) => i.loading === 'eager') && imgs.filter((i) => !i.hero).every((i) => i.loading === 'lazy'));
  for (let y = 0; y < 6000; y += 700) {
    await ip.evaluate((v) => scrollTo(0, v), y);
    await ip.waitForTimeout(120);
  }
  await settle(ip, 600);
  const cls = await ip.evaluate(() => window.__cls);
  check('Sin saltos de layout al cargar y desplazar (CLS < 0,05)', cls < 0.05, cls.toFixed(4));
  const broken = await ip.evaluate(() =>
    [...document.querySelectorAll('main img')].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc),
  );
  check('Ninguna imagen rota tras cargar la página completa', broken.length === 0, broken.join(', '));
  // Las fotos de las fichas de cada sector también se resuelven
  const sectorPage = await ictx.newPage();
  const missingPhotos = [];
  for (const sector of catalog.sectors) {
    await sectorPage.goto(`${BASE}#/sector/${sector.id}`);
    await sectorPage.getByRole('heading', { level: 1 }).waitFor();
    const n = await sectorPage.locator('.card-grid .card picture img').count();
    const expected = catalog.places.filter((p) => p.sectorId === sector.id).length;
    if (n !== expected) missingPhotos.push(`${sector.id} ${n}/${expected}`);
  }
  check('Cada lugar de los 10 sectores muestra su foto', missingPhotos.length === 0, missingPhotos.join('; '));
  await ictx.close();
  const distAssets = await readdir(`${root}dist/assets`);
  const rasters = distAssets.filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  const rights = JSON.parse(await readFile(`${root}src/content/photo-rights.json`, 'utf8')).photos;
  const granted = new Set(rights.filter((p) => p.permission === 'granted').map((p) => p.id));
  const notGranted = rasters.filter((f) => !granted.has(f.replace(/-\d+-[\w-]+\.\w+$/, '').replace(/-\d+\.\w+$/, '')));
  check('El build solo contiene variantes de fotos autorizadas', rasters.length > 0 && notGranted.length === 0, `${rasters.length} archivos ${notGranted.slice(0, 3).join(', ')}`);

  // ================= 7. Legibilidad en ambos temas =================
  section('Contraste (WCAG AA)');
  for (const theme of ['light', 'dark']) {
    const cctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await cctx.addInitScript(presetPrefs, { lang: 'es', theme });
    const cp = await cctx.newPage();
    for (const [name, hash] of [['portada', '#/'], ['sector', '#/sector/family-recreation'], ['Villa Park', '#/sector/sports-adventure/villa-park'], ['demo', '#/sector/health-wellness/santai-spa']]) {
      await cp.goto(BASE + hash);
      await cp.getByRole('heading', { level: 1 }).waitFor();
      await settle(cp, 600);
      const audit = await cp.evaluate(contrastAudit);
      check(`${theme} · ${name}: contraste ≥ 4,5:1 (3:1 en grande)`, audit.fails.length === 0, `${audit.checked} textos ${audit.fails.join(' | ')}`);
    }
    await cp.goto(`${BASE}#/sector/sports-adventure/villa-park`);
    await settle(cp, 600);
    await cp.screenshot({ path: `${shots}villa-park-1440-${theme}.png`, fullPage: true });
    await cctx.close();
  }

  // ================= 8. Almacenamiento bloqueado =================
  section('Almacenamiento bloqueado');
  const blocked = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await blocked.addInitScript(() => {
    const boom = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    Object.defineProperty(window, 'localStorage', { get: boom, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { get: boom, configurable: true });
  });
  const bp = await blocked.newPage();
  const bErrors = [];
  bp.on('pageerror', (e) => bErrors.push(String(e)));
  await bp.goto(BASE);
  await bp.getByRole('heading', { level: 1 }).waitFor();
  await bp.getByRole('button', { name: /Idioma/ }).click();
  await bp.getByRole('menuitemradio', { name: 'English' }).click();
  await bp.getByRole('radio', { name: 'Dark' }).click();
  await bp.locator('a.card').first().click();
  await bp.goBack();
  state = await bp.evaluate(() => document.documentElement.lang + '/' + document.documentElement.dataset.theme);
  check('Controles y navegación operativos sin almacenamiento', state === 'en/dark' && bErrors.length === 0, state + bErrors.join('|'));
  await blocked.close();

  // ================= 9. Anchuras 390 y 1440 =================
  section('Anchuras');
  for (const width of [390, 1440]) {
    const mobile = width === 390;
    const wctx = await browser.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 3 : 1, hasTouch: mobile, isMobile: mobile });
    for (const [name, url] of [['guide', BASE], ['sector', `${BASE}#/sector/sports-adventure`], ['villa', `${BASE}#/sector/sports-adventure/villa-park`], ['demo', `${BASE}#/sector/gastronomy-culinary/purnells`], ['journal', `${BASE}diario.html`]]) {
      const wp = await wctx.newPage();
      await wp.goto(url);
      await wp.getByRole('heading', { level: 1 }).waitFor();
      await settle(wp, 600);
      const m = await wp.evaluate(() => {
        const small = [...document.querySelectorAll('.topnav a, .topnav button, .card, .back-link, .breadcrumbs a, .text-link, .button')]
          .filter((el) => !el.closest('[role="menu"]'))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { el: (el.className || el.textContent).toString().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
          })
          .filter((r) => r.w > 0 && (r.w < 44 || r.h < 44));
        return { overflow: document.documentElement.scrollWidth - window.innerWidth, small };
      });
      check(`${width}px ${name}: sin desbordamiento horizontal`, m.overflow <= 0, `exceso ${m.overflow}px`);
      check(`${width}px ${name}: objetivos táctiles ≥ 44 px`, m.small.length === 0, JSON.stringify(m.small));
      await wp.screenshot({ path: `${shots}${name}-${width}.png`, fullPage: true });
      await wp.close();
    }
    await wctx.close();
  }

  section('Global');
  check('Todas las peticiones quedan bajo /2dam2627Des_Interfaces/brum-guide/', outsideBase.length === 0, outsideBase.join(', '));
  check('Sin respuestas 4xx/5xx', failed.length === 0, failed.join(', '));
  check('Sin errores de consola', consoleErrors.length === 0, consoleErrors.join(' | '));
  await ctx.close();
} finally {
  await browser.close();
  server.kill();
}

const failedChecks = results.filter((r) => !r.ok);
console.log(`\n${results.length - failedChecks.length}/${results.length} comprobaciones superadas`);
process.exit(failedChecks.length ? 1 : 0);
