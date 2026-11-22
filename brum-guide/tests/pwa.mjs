#!/usr/bin/env node
/**
 * Prueba PWA bajo subpath (/2dam2627Des_Interfaces/brum-guide/), en el Chrome del sistema (headless).
 *
 *   npm run test:pwa
 *
 * Hace dos builds propios (versión A y B) para probar la actualización. Al terminar,
 * dist/ queda con la versión B y base /2dam2627Des_Interfaces/brum-guide/.
 *
 * ESTO NO ES UNA PRUEBA EN iPHONE: es Chrome de escritorio, con móvil y áreas
 * seguras emulados. La prueba física está en docs/pwa.md.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4185;
const ORIGIN = `http://localhost:${PORT}`;
const BASE = `${ORIGIN}/2dam2627Des_Interfaces/brum-guide/`;
const out = `${root}test-results/pwa/`;
await mkdir(out, { recursive: true });
const results = [];
const check = (group, name, ok, detail = '') => {
  results.push({ group, name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} [${group}] ${name}${detail ? ` — ${detail}` : ''}`);
};

function build(version) {
  const r = spawnSync(process.execPath, [`${root}node_modules/vite/bin/vite.js`, 'build', '--base=/2dam2627Des_Interfaces/brum-guide/', '--logLevel', 'error'], {
    cwd: root,
    env: { ...process.env, APP_VERSION: version },
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`build ${version} falló:\n${r.stderr}`);
}

const VERSION_A = `pwa-test-a-${Date.now()}`;
const VERSION_B = `pwa-test-b-${Date.now()}`;
build(VERSION_A);

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

const pngSize = (buf) => (buf.readUInt32BE(0) === 0x89504e47 ? { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) } : null);
const h1 = (p) => p.getByRole('heading', { level: 1 }).textContent();
const swReady = (p) =>
  p.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    for (let i = 0; i < 50 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 100));
    return { scope: reg.scope, script: reg.active?.scriptURL, state: reg.active?.state, controlled: !!navigator.serviceWorker.controller };
  });

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  /* ============ 1. Manifiesto, iconos y worker bajo /2dam2627Des_Interfaces/brum-guide/ ============ */
  let g = 'Subpath';
  await page.goto(BASE);
  await page.getByRole('heading', { level: 1 }).waitFor();
  for (const htmlPath of ['', 'diario.html']) {
    const html = await (await page.request.get(BASE + htmlPath)).text();
    const manifestHref = html.match(/<link rel="manifest" href="([^"]+)"/)?.[1];
    const appleHref = html.match(/<link rel="apple-touch-icon"[^>]*href="([^"]+)"/)?.[1];
    const manifestURL = manifestHref && new URL(manifestHref, BASE + htmlPath).href;
    const appleURL = appleHref && new URL(appleHref, BASE + htmlPath).href;
    check(g, `${htmlPath || 'index.html'} enlaza manifiesto y apple-touch-icon bajo la base`, manifestURL === `${BASE}manifest.webmanifest` && appleURL === `${BASE}icons/apple-touch-icon.png`, `${manifestURL} · ${appleURL}`);
    const meta = ['apple-mobile-web-app-capable', 'apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-title', 'mobile-web-app-capable'].every((n) => html.includes(`name="${n}"`));
    check(g, `${htmlPath || 'index.html'}: metadatos de pantalla de inicio iOS y viewport-fit=cover`, meta && html.includes('viewport-fit=cover'));
  }
  const manifestRes = await page.request.get(`${BASE}manifest.webmanifest`);
  const manifest = await manifestRes.json();
  const mURL = `${BASE}manifest.webmanifest`;
  const resolved = (u) => new URL(u, mURL).href;
  check(g, 'Manifiesto servido (200, application/manifest+json)', manifestRes.status() === 200 && /manifest\+json/.test(manifestRes.headers()['content-type']), manifestRes.headers()['content-type']);
  check(g, 'id, start_url y scope estables dentro de la base', resolved(manifest.id) === BASE && resolved(manifest.start_url) === BASE && resolved(manifest.scope) === BASE, `${manifest.id} · ${manifest.start_url} · ${manifest.scope} → ${BASE}`);
  check(g, 'display standalone, nombre y colores', manifest.display === 'standalone' && manifest.name && manifest.short_name === 'Brum' && /^#/.test(manifest.theme_color) && /^#/.test(manifest.background_color), `${manifest.name} · ${manifest.theme_color}/${manifest.background_color}`);
  const icons = [];
  for (const icon of manifest.icons) {
    const res = await page.request.get(resolved(icon.src));
    const dim = pngSize(Buffer.from(await res.body()));
    icons.push({ ...icon, status: res.status(), dim, url: resolved(icon.src) });
  }
  const iconOk = (size, purpose) => icons.some((i) => i.sizes === `${size}x${size}` && i.purpose === purpose && i.status === 200 && i.dim?.w === size && i.dim?.h === size && i.url.startsWith(BASE));
  check(g, 'Iconos PNG 192 y 512 (any) bajo la base', iconOk(192, 'any') && iconOk(512, 'any'), icons.map((i) => `${i.sizes}/${i.purpose}:${i.status}`).join(' '));
  check(g, 'Icono maskable 512', iconOk(512, 'maskable'));
  const apple = await page.request.get(`${BASE}icons/apple-touch-icon.png`);
  const appleDim = pngSize(Buffer.from(await apple.body()));
  check(g, 'apple-touch-icon 180×180', apple.status() === 200 && appleDim?.w === 180 && appleDim?.h === 180, JSON.stringify(appleDim));
  const swRes = await page.request.get(`${BASE}sw.js`);
  check(g, 'sw.js servido bajo la base', swRes.status() === 200 && /javascript/.test(swRes.headers()['content-type']));
  const journalRes = await page.request.get(`${BASE}diario.html`);
  check(g, 'diario.html servido bajo la base', journalRes.status() === 200);

  /* ============ 2. Worker activo y precarga ============ */
  g = 'Worker';
  const sw = await swReady(page);
  check(g, 'Worker activo con ámbito /2dam2627Des_Interfaces/brum-guide/ y controlando la página', sw.scope === BASE && sw.script === `${BASE}sw.js` && sw.state === 'activated' && sw.controlled, JSON.stringify(sw));
  await page.getByText('Lista para usarse sin conexión').waitFor({ timeout: 8000 }).catch(() => {});
  check(g, 'Aviso «Lista para usarse sin conexión» tras la primera instalación', (await page.getByText('Lista para usarse sin conexión').count()) === 1);
  const precache = await page.evaluate(async () => {
    const names = await caches.keys();
    const name = names.find((n) => n.includes('precache'));
    const keys = name ? (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname) : [];
    return { names, keys };
  });
  const has = (path) => precache.keys.includes(`/2dam2627Des_Interfaces/brum-guide/${path}`);
  check(g, 'Precarga: index.html, diario.html y offline.html', has('index.html') && has('diario.html') && has('offline.html'), `${precache.keys.length} entradas`);
  const jsCount = precache.keys.filter((k) => k.endsWith('.js')).length;
  const bundle = await page.evaluate(async () => {
    const name = (await caches.keys()).find((n) => n.includes('precache'));
    const cache = await caches.open(name);
    let es = false;
    let en = false;
    for (const req of await cache.keys()) {
      if (!new URL(req.url).pathname.endsWith('.js')) continue;
      const txt = await (await cache.match(req)).text();
      if (txt.includes('Explora por sectores')) es = true;
      if (txt.includes('Explore by sector')) en = true;
    }
    return { es, en };
  });
  check(g, 'Precarga: JS y CSS esenciales con los textos ES y EN', jsCount >= 3 && precache.keys.some((k) => k.endsWith('.css')) && bundle.es && bundle.en, `${jsCount} JS · es=${bundle.es} en=${bundle.en}`);
  check(g, 'Precarga: ninguna foto (se guardan bajo demanda)', !precache.keys.some((k) => /\.(jpe?g|webp)$/.test(k)));

  /* ============ 3. Navegación en línea: entradas, hash y enlaces ============ */
  g = 'En línea';
  await page.goto(`${BASE}#/sector/sports-adventure/villa-park`);
  check(g, 'Ficha por hash (entrada directa)', (await h1(page)) === 'Villa Park');
  await page.locator('#sec-sources').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.goto(`${BASE}diario.html`);
  check(g, 'Entrada directa al diario', (await h1(page)) === 'Documentación y fases');
  await page.getByRole('link', { name: 'Volver a la guía' }).click();
  await page.waitForURL(`${BASE}`);
  check(g, 'Enlace diario → guía', (await h1(page)) === 'Una ciudad de canales, ladrillo y música.');
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Documentación y fases' }).click();
  await page.waitForURL(`${BASE}diario.html`);
  check(g, 'Enlace guía → diario', (await h1(page)) === 'Documentación y fases');

  // Fotos bajo demanda: portada completa
  await page.goto(BASE);
  for (let y = 0; y < 9000; y += 600) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
  const photoCache = await page.evaluate(async () => {
    const c = await caches.open('brum-fotos-v1:/2dam2627Des_Interfaces/brum-guide/');
    const entries = [];
    for (const req of await c.keys()) {
      const res = await c.match(req);
      entries.push({ path: new URL(req.url).pathname, bytes: (await res.blob()).size });
    }
    return entries;
  });
  check(g, 'Fotos vistas guardadas bajo demanda en brum-fotos-v1', photoCache.length > 0 && photoCache.every((e) => e.path.startsWith('/2dam2627Des_Interfaces/brum-guide/assets/')), `${photoCache.length} fotos`);
  check(g, 'Ninguna foto guardada supera 750 KB', photoCache.every((e) => e.bytes <= 750 * 1024), `máx ${Math.max(...photoCache.map((e) => e.bytes))} B`);
  // Límite de cantidad: forzar más de 80 imágenes distintas
  const urls = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('source[type="image/webp"], img[srcset]')].flatMap((el) => el.getAttribute('srcset').split(',').map((s) => s.trim().split(' ')[0])))],
  );
  // Recorre los sectores para descubrir más URLs de variantes
  const allUrls = new Set(urls);
  for (const sec of ['culture-heritage', 'gastronomy-culinary', 'nature-outdoors', 'shopping-retail', 'entertainment-nightlife', 'family-recreation', 'education-literature', 'health-wellness', 'visitor-logistics-safety']) {
    await page.goto(`${BASE}#/sector/${sec}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    for (const u of await page.evaluate(() => [...document.querySelectorAll('source[type="image/webp"], img[srcset]')].flatMap((el) => el.getAttribute('srcset').split(',').map((s) => s.trim().split(' ')[0])))) allUrls.add(u);
  }
  await page.evaluate(async (list) => {
    for (const u of list) {
      await new Promise((r) => {
        const img = new Image();
        img.onload = img.onerror = r;
        img.src = u;
      });
    }
    await new Promise((r) => setTimeout(r, 1500));
  }, [...allUrls]);
  const count = await page.evaluate(async () => (await (await caches.open('brum-fotos-v1:/2dam2627Des_Interfaces/brum-guide/')).keys()).length);
  check(g, 'Límite de cantidad: la caché de fotos no pasa de 80 entradas', allUrls.size > 80 && count <= 80, `${allUrls.size} pedidas → ${count} guardadas`);

  /* ============ 4. Sin conexión tras la primera carga ============ */
  g = 'Sin conexión';
  await page.goto(`${BASE}#/sector/sports-adventure/villa-park`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.waitForTimeout(800);
  await ctx.setOffline(true);
  await page.reload();
  check(g, 'Recarga sin conexión de una ficha por hash', (await h1(page)) === 'Villa Park');
  await page.getByText('Sin conexión.').first().waitFor({ timeout: 4000 }).catch(() => {});
  check(g, 'Estado claro: banner «Sin conexión» con lo que sigue funcionando', (await page.locator('.offline-banner').count()) === 1 && /fotos que no hayas abierto/.test(await page.locator('.offline-banner').innerText()));
  const heroLoaded = await page.locator('[data-shared-hero] img').evaluate(async (img) => {
    if (!img.complete) await new Promise((r) => (img.onload = img.onerror = r));
    return img.naturalWidth > 0;
  });
  check(g, 'Foto ya vista disponible sin conexión', heroLoaded);
  check(g, 'Enlaces externos marcados «requiere conexión»', (await page.locator('.external-link__note').count()) >= 1, `${await page.locator('.external-link__note').count()} enlaces`);
  await page.screenshot({ path: `${out}offline-villa-park.png` });

  // Fotos nunca vistas: estado «no disponible sin conexión»
  await page.evaluate(() => caches.delete('brum-fotos-v1:/2dam2627Des_Interfaces/brum-guide/'));
  await page.goto(`${BASE}#/sector/nature-outdoors`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.locator('.card-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const unavailable = await page.locator('.photo--unavailable').count();
  const badge = unavailable ? await page.locator('.photo--unavailable .photo__badge').first().innerText() : '';
  check(g, 'Foto no guardada: estado «Foto no disponible sin conexión» en su caja reservada', unavailable > 0 && badge === 'Foto no disponible sin conexión', `${unavailable} fotos · «${badge}»`);
  await page.screenshot({ path: `${out}offline-sector.png` });

  await page.goto(`${BASE}diario.html`);
  check(g, 'diario.html sin conexión es el diario (no la guía)', (await h1(page)) === 'Documentación y fases' && (await page.title()).includes('Documentación y fases'));
  await page.goto(`${BASE}no-existe.html`);
  const offlinePage = await page.locator('h1').textContent();
  check(g, 'Navegación desconocida sin conexión → offline.html (sin fallback a index.html)', offlinePage === 'Sin conexión', offlinePage ?? '');
  const p2 = await ctx.newPage();
  await p2.goto(`${BASE}#/sector/gastronomy-culinary/purnells`);
  check(g, 'Entrada directa por hash en pestaña nueva sin conexión', (await h1(p2)) === 'Plates by Purnell’s');
  // Fase 6: las secciones de planificación y el mapa funcionan sin conexión (todo va en el bundle).
  for (const [hash, title] of [['#/plan', 'Antes de salir a la calle'], ['#/plan/before', 'Antes de viajar'], ['#/plan/getting-around', 'Moverse por la ciudad'], ['#/plan/routes', 'Rutas de un día'], ['#/plan/calendar', 'Agenda anual'], ['#/plan/brummie', 'Habla brummie']]) {
    await p2.goto(`${BASE}${hash}`);
    check(g, `Sin conexión: ${title}`, (await h1(p2)) === title);
  }
  await p2.goto(`${BASE}#/plan/map?focus=aston-hall`);
  await p2.getByRole('heading', { level: 1 }).waitFor();
  const pins = await p2.locator('.map__pin').count();
  check(g, 'Sin conexión: mapa SVG propio con sus puntos (sin teselas externas)', pins >= 39 && (await p2.locator('.map__pin[data-focus]').count()) >= 1, `${pins} puntos`);
  await p2.getByRole('button', { name: /Idioma/ }).click();
  await p2.getByRole('menuitemradio', { name: 'English' }).click();
  check(g, 'Cambio a inglés sin conexión (textos precargados)', (await p2.locator('.offline-banner').innerText()).startsWith('Offline.'));
  await p2.getByRole('radio', { name: 'Dark' }).click();
  check(g, 'Cambio de tema sin conexión', (await p2.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  await p2.close();
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem('brum-guide:lang', 'es');
    localStorage.setItem('brum-guide:theme', 'light');
  });
  await ctx.setOffline(false);
  await page.reload();
  await page.waitForTimeout(800);
  check(g, 'Al volver la conexión desaparece el banner', (await page.locator('.offline-banner').count()) === 0);

  /* ============ 5. Actualización de versión ============ */
  g = 'Actualización';
  const versionOf = (p) => p.locator('[data-app-version]').getAttribute('data-app-version');
  check(g, 'Versión A en uso', (await versionOf(page)) === VERSION_A, VERSION_A);
  build(VERSION_B);
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  const prompt = page.getByText('Hay una versión nueva de la guía');
  await prompt.waitFor({ timeout: 15000 }).catch(() => {});
  check(g, 'Aviso bilingüe de nueva versión', (await prompt.count()) === 1);
  const waiting = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting);
  check(g, 'El worker nuevo espera; la página sigue en la versión A', waiting && (await versionOf(page)) === VERSION_A);
  await page.screenshot({ path: `${out}update-prompt.png` });
  await page.getByRole('button', { name: 'Más tarde' }).click();
  const closed = await prompt.waitFor({ state: 'detached', timeout: 3000 }).then(() => true, () => false);
  const laterState = { closed, count: await prompt.count(), version: await versionOf(page), toasts: await page.locator('.pwa-toast').count() };
  check(g, '«Más tarde» cierra el aviso sin recargar ni actualizar', closed && laterState.version === VERSION_A, JSON.stringify(laterState));
  await page.reload();
  await prompt.waitFor({ timeout: 15000 }).catch(() => {});
  check(g, 'Al reabrir, el aviso vuelve a ofrecer la versión pendiente', (await prompt.count()) === 1 && (await versionOf(page)) === VERSION_A);
  // Inglés: el aviso también se traduce
  await page.getByRole('button', { name: /Idioma/ }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  check(g, 'Aviso traducido al inglés', (await page.getByText('A new version of the guide is available').count()) === 1);
  await Promise.all([page.waitForEvent('load', { timeout: 15000 }), page.getByRole('button', { name: 'Update' }).click()]);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.waitForTimeout(800);
  check(g, 'Tras confirmar: recarga con la versión B y sin aviso', (await versionOf(page)) === VERSION_B && (await page.getByText('A new version of the guide is available').count()) === 0, String(await versionOf(page)));
  const ctrl = await swReady(page);
  check(g, 'El worker nuevo controla la página', ctrl.controlled && ctrl.state === 'activated');
  await page.evaluate(() => localStorage.setItem('brum-guide:lang', 'es'));

  check('Global', 'Sin errores de JavaScript', consoleErrors.length === 0, consoleErrors.join(' | '));
  await ctx.close();

  /* ============ 6. Áreas seguras emuladas (vertical y horizontal) ============ */
  g = 'Áreas seguras (emuladas)';
  const insetsFor = [
    ['vertical 390×844', { width: 390, height: 844 }, { top: 59, bottom: 34, left: 0, right: 0 }],
    ['horizontal 844×390', { width: 844, height: 390 }, { top: 0, bottom: 21, left: 59, right: 59 }],
  ];
  for (const [label, viewport, insets] of insetsFor) {
    const c = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    const p = await c.newPage();
    const cdp = await c.newCDPSession(p);
    let supported = true;
    try {
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets });
    } catch {
      supported = false;
    }
    if (!supported) {
      check(g, `${label}: emulación de safe-area no disponible en este Chrome`, true, 'no verificado');
      await c.close();
      continue;
    }
    await p.goto(BASE);
    await p.getByRole('heading', { level: 1 }).waitFor();
    await p.waitForTimeout(500);
    const m = await p.evaluate(() => {
      const nav = document.querySelector('.topnav');
      const inner = document.querySelector('.topnav__inner');
      const brand = document.querySelector('.topnav__brand').getBoundingClientRect();
      const controls = document.querySelector('.topnav__controls').getBoundingClientRect();
      const main = document.querySelector('.shell-main');
      const footer = document.querySelector('.shell-footer');
      const h1 = document.querySelector('h1').getBoundingClientRect();
      return {
        navPadTop: parseFloat(getComputedStyle(nav).paddingTop),
        brandLeft: Math.round(brand.left),
        controlsRight: Math.round(innerWidth - controls.right),
        innerPadL: parseFloat(getComputedStyle(inner).paddingLeft),
        mainPadL: parseFloat(getComputedStyle(main).paddingLeft),
        mainPadR: parseFloat(getComputedStyle(main).paddingRight),
        footerPadB: parseFloat(getComputedStyle(footer).paddingBottom),
        h1Left: Math.round(h1.left),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const okTop = m.navPadTop >= insets.top;
    const okSides = m.brandLeft >= insets.left && m.controlsRight >= insets.right && m.mainPadL >= insets.left && m.mainPadR >= insets.right && m.h1Left >= insets.left;
    const okBottom = m.footerPadB >= insets.bottom;
    check(g, `${label}: barra bajo la barra de estado, contenido fuera de la isla y del indicador de inicio`, okTop && okSides && okBottom && m.overflow <= 0, JSON.stringify(m));
    // El aviso de la PWA respeta el borde inferior
    await p.evaluate(() => {
      const r = document.querySelector('.pwa-toast-region');
      r.dataset.probe = '1';
    });
    const toastBottom = await p.evaluate(() => innerHeight - document.querySelector('.pwa-toast-region').getBoundingClientRect().bottom);
    check(g, `${label}: región de avisos por encima del indicador de inicio`, toastBottom >= insets.bottom + 16 - 1, `${Math.round(toastBottom)} px`);
    await p.screenshot({ path: `${out}safe-area-${viewport.width}x${viewport.height}.png` });
    await c.close();
  }
} finally {
  await browser.close();
  server.kill();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas (Chrome ${browser.version?.() ?? ''} escritorio, emulación)`);
await writeFile(`${out}results.json`, JSON.stringify({ date: new Date().toISOString(), environment: 'Chrome de escritorio headless (playwright-core); móvil y áreas seguras emulados', results }, null, 2));
process.exit(failed.length ? 1 : 0);
