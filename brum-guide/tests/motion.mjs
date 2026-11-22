#!/usr/bin/env node
/**
 * Verificación de las interacciones de la fase 3 sobre el build (/2dam2627Des_Interfaces/brum-guide/).
 *
 *   npm run build:pages && npm run test:motion
 *
 * Entornos: Chrome del sistema (headless) vía playwright-core, a 1440×900 (ratón)
 * y 390×844 (móvil emulado: isMobile + hasTouch + DPR 3), con y sin
 * prefers-reduced-motion. El tacto se emula con eventos CDP Input.dispatchTouchEvent.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4181;
const BASE = `http://localhost:${PORT}/2dam2627Des_Interfaces/brum-guide/`;
const shots = `${root}test-results/motion/`;
await mkdir(shots, { recursive: true });

const results = [];
const check = (env, name, ok, detail = '') => {
  results.push({ env, name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} [${env}] ${name}${detail ? ` — ${detail}` : ''}`);
};

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
const chromeVersion = browser.version();

const DESKTOP = { viewport: { width: 1440, height: 900 } };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const wait = (p, ms) => p.waitForTimeout(ms);

/** Escala, desplazamiento y opacidad calculados de un elemento. */
const readTransform = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const st = getComputedStyle(el);
  let sx = 1;
  let ty = 0;
  let tx = 0;
  if (st.transform && st.transform !== 'none') {
    const m = new DOMMatrixReadOnly(st.transform);
    sx = Math.hypot(m.a, m.b);
    tx = m.e;
    ty = m.f;
  }
  const r = el.getBoundingClientRect();
  return { scale: +sx.toFixed(3), tx: Math.round(tx), ty: Math.round(ty), opacity: +(+st.opacity).toFixed(2), top: Math.round(r.top), display: st.display, position: st.position };
};

async function gotoReady(page, url) {
  await page.goto(url);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await wait(page, 500);
  // Primera visita: el aviso «Lista para usarse sin conexión» puede tapar el borde inferior.
  const dismiss = page.locator('.pwa-toast').getByRole('button');
  if (await dismiss.count()) {
    await dismiss.first().click().catch(() => {});
    await page.locator('.pwa-toast').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
  }
}

try {
  /* ================= 1. Apertura · escritorio ================= */
  {
    const env = 'Chrome 1440 · ratón';
    const ctx = await browser.newContext(DESKTOP);
    const p = await ctx.newPage();
    await gotoReady(p, BASE);
    const runway = await p.evaluate(() => {
      const s = document.querySelector('.opening');
      return { h: s.offsetHeight, top: s.getBoundingClientRect().top + scrollY, vh: innerHeight };
    });
    check(env, 'Apertura con recorrido propio (escenario de 190 vh)', Math.abs(runway.h - 1.9 * runway.vh) < 4, `${runway.h}px`);

    // Mutaciones del DOM durante el scroll: solo `style` (MotionValues), sin re-render de React.
    await p.evaluate(() => {
      window.__mut = { style: 0, other: 0 };
      new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === 'attributes' && m.attributeName === 'style') window.__mut.style++;
          else window.__mut.other++;
        }
      }).observe(document.querySelector('.opening'), { subtree: true, attributes: true, childList: true, characterData: true });
    });

    const samples = [];
    const scrollable = runway.h - runway.vh;
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      await p.evaluate((y) => scrollTo(0, y), Math.round(runway.top + f * scrollable));
      await wait(p, 450);
      samples.push({
        f,
        frame: await p.evaluate(readTransform, '.opening__frame'),
        image: await p.evaluate(readTransform, '.opening__image'),
        scene: await p.evaluate(readTransform, '.opening__scene'),
        inset: await p.evaluate(readTransform, '.opening__inset'),
        copy: await p.evaluate(readTransform, '.opening__copy'),
        stage: await p.evaluate(readTransform, '.opening__stage'),
      });
      if (f === 0 || f === 0.5) await p.screenshot({ path: `${shots}opening-1440-${f * 100}.png` });
    }
    check(env, 'La segunda escena entra ligada al scroll', samples[0].scene.opacity === 0 && samples.at(-1).scene.opacity > .99);
    const frames = samples.map((s) => s.frame.scale);
    const images = samples.map((s) => s.image.scale);
    const insets = samples.map((s) => s.inset.opacity);
    const nondecreasing = (a) => a.every((v, i) => i === 0 || v >= a[i - 1] - 0.002);
    const nonincreasing = (a) => a.every((v, i) => i === 0 || v <= a[i - 1] + 0.002);
    check(env, 'Marco: se abre de 0,86 a 1 con el scroll', frames[0] <= 0.87 && frames.at(-1) >= 0.999 && nondecreasing(frames), frames.join(' → '));
    check(env, 'Imagen: se asienta de 1,18 a 1 (profundidad inversa)', images[0] >= 1.17 && images.at(-1) <= 1.001 && nonincreasing(images), images.join(' → '));
    check(env, 'Capa frontal: aparece y sube por encima del fondo', insets[0] === 0 && insets.at(-1) === 1 && samples[1].inset.ty > samples.at(-1).inset.ty, `opacidad ${insets.join(' → ')}`);
    check(env, 'Texto: opacidad 1 en todo el recorrido', samples.every((s) => s.copy.opacity === 1), samples.map((s) => s.copy.ty).join(' → ') + ' px');
    const stageTops = samples.slice(1, 4).map((s) => s.stage.top);
    check(env, 'Sticky localizado: el escenario se mantiene fijo durante el recorrido', stageTops.every((t) => Math.abs(t - stageTops[0]) <= 1) && samples[0].stage.position === 'sticky', stageTops.join(', '));
    const mut = await p.evaluate(() => window.__mut);
    check(env, 'Solo cambian estilos inline (sin re-render de React por frame)', mut.other === 0 && mut.style > 0, JSON.stringify(mut));

    // La antigua pista «Explorar los sectores» es ahora navegación real: enlaces por teclado.
    await p.evaluate(() => scrollTo(0, 0));
    await wait(p, 300);
    const nav = p.getByRole('navigation', { name: 'Explorar los sectores' });
    check(env, 'Hero: «Explorar los sectores» es navegación con 10 enlaces', (await nav.getByRole('link').count()) === 10);
    await nav.getByRole('link', { name: 'Cultura y patrimonio' }).focus();
    await p.keyboard.press('Enter');
    await p.waitForURL(/culture-heritage$/);
    await wait(p, 700);
    const navFocus = await p.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.textContent);
    check(env, 'Enlace de sector por teclado: navega y enfoca el h1', navFocus.startsWith('H1'), navFocus);
    await p.goBack();
    await p.waitForSelector('.opening');
    await p.locator('.fact-number').first().scrollIntoViewIfNeeded();
    await p.waitForSelector('.fact-number[data-counter-ready="true"]');
    check(env, 'El contador conserva la cifra para lectores de pantalla', (await p.locator('.fact-number .visually-hidden').first().textContent()).replace(/\D/g, '') === '1176960');
    await ctx.close();
  }

  /* ================= 2. Apertura · móvil ================= */
  {
    const env = 'Chrome 390 · móvil táctil emulado';
    const ctx = await browser.newContext(MOBILE);
    const p = await ctx.newPage();
    await gotoReady(p, BASE);
    const a = {
      stage: await p.evaluate(readTransform, '.opening__stage'),
      inset: await p.evaluate(readTransform, '.opening__inset'),
      frame: await p.evaluate(readTransform, '.opening__frame'),
      image: await p.evaluate(readTransform, '.opening__image'),
      sectionH: await p.evaluate(() => document.querySelector('.opening').offsetHeight),
    };
    check(env, 'Composición móvil propia: sin escenario fijo, capa frontal visible y marco sin escala', a.stage.position !== 'sticky' && a.inset?.display === 'block' && a.frame.scale === 1, JSON.stringify({ pos: a.stage.position, inset: a.inset?.display ?? 'no montada' }));
    await p.evaluate(() => scrollTo(0, document.querySelector('.opening').offsetHeight * 0.6));
    await wait(p, 450);
    const b = await p.evaluate(readTransform, '.opening__image');
    check(env, 'Solo un leve asentamiento de la imagen (1,08 → 1)', a.image.scale >= 1.07 && a.image.scale <= 1.081 && b.scale < a.image.scale, `${a.image.scale} → ${b.scale}`);
    await p.screenshot({ path: `${shots}opening-390.png` });
    await ctx.close();
  }

  /* ================= 3. Revelado progresivo ================= */
  for (const [env, opts] of [['Chrome 1440 · ratón', DESKTOP], ['Chrome 390 · móvil táctil emulado', MOBILE]]) {
    const ctx = await browser.newContext(opts);
    const p = await ctx.newPage();
    await gotoReady(p, `${BASE}#/sector/sports-adventure/villa-park`);
    const before = await p.evaluate(readTransform, '#sec-sources');
    const inTree = await p.getByRole('heading', { name: 'Fuentes', exact: true }).count();
    check(env, 'Sección lejana oculta hasta entrar en vista, pero presente en el árbol accesible', before.opacity === 0 && before.ty > 0 && inTree === 1, JSON.stringify(before));
    await p.locator('#sec-sources').scrollIntoViewIfNeeded();
    await wait(p, 900);
    const after = await p.evaluate(readTransform, '#sec-sources');
    check(env, 'Al entrar en vista: opacidad 1 y sin desplazamiento', after.opacity === 1 && after.ty === 0, JSON.stringify(after));
    // Escalonado en las opciones de transporte
    await p.evaluate(() => scrollTo(0, 0));
    await wait(p, 200);
    await p.locator('#sec-getting-there').scrollIntoViewIfNeeded();
    const stagger = await p.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 120));
      return [...document.querySelectorAll('.transport-list > li')].slice(0, 3).map((li) => +getComputedStyle(li).opacity);
    });
    check(env, 'Opciones de transporte con entrada escalonada', stagger.length === 3 && stagger[0] >= stagger[2], stagger.map((v) => v.toFixed(2)).join(' ≥ '));
    // No se revierte al subir
    await p.evaluate(() => scrollTo(0, 0));
    await wait(p, 500);
    const stay = await p.evaluate(readTransform, '#sec-sources');
    check(env, 'No se revierte al volver arriba (once)', stay.opacity === 1);
    await ctx.close();
  }

  /* ================= 4. Transición tarjeta ↔ ficha ================= */
  for (const [env, opts, touch] of [['Chrome 1440 · ratón', DESKTOP, false], ['Chrome 390 · móvil táctil emulado', MOBILE, true]]) {
    const ctx = await browser.newContext(opts);
    const p = await ctx.newPage();
    const cdp = touch ? await ctx.newCDPSession(p) : null;
    await gotoReady(p, `${BASE}#/sector/sports-adventure`);
    const card = p.locator('a.card[href="#/sector/sports-adventure/villa-park"]');
    await card.scrollIntoViewIfNeeded();
    await wait(p, 600);
    let cardRect = await card.locator('[data-shared-key]').evaluate((el) => el.getBoundingClientRect().toJSON());

    // Registro del rectángulo de la foto de destino, por tiempo y tras las callbacks rAF de la app
    await p.evaluate(({ v, sel }) => {
      window[v] = [];
      const t0 = performance.now();
      const loop = () => {
        setTimeout(() => {
          const el = document.querySelector(sel);
          if (el) {
            const r = el.getBoundingClientRect();
            window[v].push({ t: performance.now() - t0, x: r.left, y: r.top, w: r.width, titleFlying: !!document.querySelector("h1 .shared-title")?.style.transform, flying: !!el.style.transform });
          }
        }, 0);
        if (performance.now() - t0 < 1500) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }, { v: '__track', sel: '[data-shared-hero][data-shared-key="place:villa-park"]' });

    if (touch) {
      const box = await card.boundingBox();
      const pt = { x: box.x + box.width / 2, y: box.y + box.height * 0.75 };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
      await wait(p, 180);
      const pressed = await card.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
      check(env, 'Respuesta de pulsación al tocar (antes de soltar)', pressed < 0.995, `escala ${pressed.toFixed(3)}`);
      // El vuelo debe salir de donde el usuario ve la foto: la tarjeta pulsada.
      cardRect = await card.locator('[data-shared-key]').evaluate((el) => el.getBoundingClientRect().toJSON());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await card.click();
    }
    await p.waitForURL(/villa-park$/);
    await wait(p, 1700);
    const track = (await p.evaluate(() => window.__track));
    const flight = track.filter((s) => s.flying);
    check(env, 'El título de la tarjeta viaja al h1', track.some(sample => sample.titleFlying));
    const first = flight[0];
    const last = track.at(-1);
    const startsAtCard = first && Math.abs(first.x - cardRect.x) < 8 && Math.abs(first.w - cardRect.width) < 8;
    check(env, 'Ida: la foto de la ficha arranca sobre la tarjeta', !!startsAtCard, first ? `inicio x=${first.x.toFixed(0)} w=${first.w.toFixed(0)} vs tarjeta x=${cardRect.x.toFixed(0)} w=${cardRect.width.toFixed(0)}` : 'sin muestras');
    const final = await p.locator('[data-shared-hero]').evaluate((el) => ({ w: el.getBoundingClientRect().width, t: getComputedStyle(el).transform }));
    check(env, 'Ida: termina en su sitio sin transform residual', Math.abs(last.w - final.w) < 1 && (final.t === 'none' || final.t === 'matrix(1, 0, 0, 1, 0, 0)'), `vuelo de ${Math.round((flight.at(-1)?.t ?? 0) - (first?.t ?? 0))} ms`);
    const dir = Math.sign(final.w - (first?.w ?? final.w));
    const monotonic = flight.every((s, i) => i === 0 || dir * (s.w - flight[i - 1].w) >= -1);
    check(env, 'Ida: muelle sin rebote (anchura monótona)', monotonic);
    check(env, 'Ida: el foco va al h1 de la ficha', (await p.evaluate(() => document.activeElement?.tagName)) === 'H1');
    if (!touch) await p.screenshot({ path: `${shots}shared-arrived-1440.png` });

    // Vuelta con el botón atrás del navegador
    const heroRect = await p.locator('[data-shared-hero]').evaluate((el) => el.getBoundingClientRect().toJSON());
    await p.evaluate(({ v, sel }) => {
      window[v] = [];
      const t0 = performance.now();
      const loop = () => {
        setTimeout(() => {
          const el = document.querySelector(sel);
          if (el) {
            const r = el.getBoundingClientRect();
            window[v].push({ t: performance.now() - t0, x: r.left, y: r.top, w: r.width, flying: !!el.style.transform });
          }
        }, 0);
        if (performance.now() - t0 < 1500) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }, { v: '__back', sel: 'a.card [data-shared-key="place:villa-park"]' });
    await p.goBack();
    await p.waitForURL(/sports-adventure$/);
    await wait(p, 1700);
    const back = (await p.evaluate(() => window.__back)).filter((s) => s.flying || true);
    const backFlight = back.filter((s) => s.flying);
    const cardNow = await p.locator('a.card[href="#/sector/sports-adventure/villa-park"] [data-shared-key]').evaluate((el) => el.getBoundingClientRect().toJSON());
    const visibleHero = heroRect.top < (opts.viewport.height) && heroRect.bottom > 0;
    check(
      env,
      'Vuelta (atrás): la foto regresa a la tarjeta por el mismo camino',
      visibleHero ? backFlight.length > 0 && Math.abs(backFlight[0].w - heroRect.width) < 10 && Math.abs(back.at(-1).w - cardNow.width) < 1 : true,
      `inicio w=${backFlight[0]?.w.toFixed(0)} (ficha ${heroRect.width.toFixed(0)}) → fin w=${back.at(-1)?.w.toFixed(0)} (tarjeta ${cardNow.width.toFixed(0)})`,
    );
    check(env, 'Vuelta: el foco vuelve a la tarjeta', (await p.evaluate(() => document.activeElement?.getAttribute('href'))) === '#/sector/sports-adventure/villa-park');
    await ctx.close();
  }

  /* ================= 5. Teclado ================= */
  {
    const env = 'Chrome 1440 · teclado';
    const ctx = await browser.newContext(DESKTOP);
    const p = await ctx.newPage();
    await gotoReady(p, `${BASE}#/sector/sports-adventure/villa-park`);
    const indexBtn = p.getByRole('navigation', { name: 'En esta ficha' }).getByRole('button', { name: 'Fuentes' });
    await indexBtn.focus();
    await p.keyboard.press('Enter');
    await wait(p, 1200);
    const r = await p.evaluate(() => ({
      focus: document.activeElement?.textContent,
      top: Math.round(document.getElementById('sec-sources').getBoundingClientRect().top),
      current: document.querySelector('.section-index [aria-current="location"]')?.textContent,
      sticky: getComputedStyle(document.querySelector('.section-index')).position,
    }));
    check(env, 'Índice: Enter lleva a la sección y enfoca su título', r.focus === 'Fuentes' && r.top < 400, JSON.stringify(r));
    check(env, 'Índice: marca la sección actual y es sticky solo en la ficha', r.current === 'Fuentes' && r.sticky === 'sticky');
    // Recorrido por tabulador: toda tarjeta alcanzable sin hover
    await gotoReady(p, `${BASE}#/sector/culture-heritage`);
    let reached = 0;
    for (let i = 0; i < 30 && reached < 4; i++) {
      await p.keyboard.press('Tab');
      if (await p.evaluate(() => document.activeElement?.classList.contains('card'))) reached++;
    }
    check(env, 'Las cuatro tarjetas del sector se alcanzan con Tab', reached === 4);
    await p.keyboard.press('Enter');
    await p.getByRole('heading', { level: 1 }).waitFor();
    await wait(p, 700);
    check(env, 'Enter en una tarjeta abre la ficha con el foco en el h1', (await p.evaluate(() => document.activeElement?.tagName)) === 'H1');
    await ctx.close();
  }

  /* ================= 6. Tacto: tira de fotos ================= */
  {
    const env = 'Chrome 390 · móvil táctil emulado';
    const ctx = await browser.newContext(MOBILE);
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await gotoReady(p, BASE);
    const strip = p.locator('.strip');
    await strip.scrollIntoViewIfNeeded();
    await wait(p, 300);
    const box = await strip.boundingBox();
    const y = box.y + box.height / 2;
    const s0 = await strip.evaluate((el) => el.scrollLeft);
    const x0 = Math.round(box.x + box.width * 0.85);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: Math.round(y) }] });
    for (let i = 1; i <= 15; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 16, y: Math.round(y) }] });
      await wait(p, 16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(p, 900);
    const s1 = await strip.evaluate((el) => el.scrollLeft);
    check(env, 'Deslizar la tira con el dedo (scroll nativo con scroll-snap)', s1 > s0, `${s0} → ${s1}`);
    // Equivalentes visibles: «Foto anterior» (desde la posición tras el gesto)
    await p.getByRole('button', { name: 'Foto anterior' }).tap();
    await wait(p, 900);
    const s2 = await strip.evaluate((el) => el.scrollLeft);
    check(env, 'Botón visible «Foto anterior» como alternativa al gesto', s2 < s1, `${s1} → ${s2}`);
    await strip.focus();
    await p.keyboard.press('ArrowRight');
    await wait(p, 600);
    const s3 = await strip.evaluate((el) => el.scrollLeft);
    check(env, 'Flechas del teclado sobre la tira enfocada', s3 > s2, `${s2} → ${s3}`);
    // Índice de la ficha por toque
    await gotoReady(p, `${BASE}#/sector/sports-adventure/villa-park`);
    await p.getByRole('navigation', { name: 'En esta ficha' }).getByRole('button', { name: 'Accesibilidad' }).tap();
    await wait(p, 1200);
    const at = await p.evaluate(() => Math.round(document.getElementById('sec-access').getBoundingClientRect().top));
    check(env, 'Índice de la ficha operable por toque', at < 400, `${at}px`);
    await ctx.close();
  }

  /* ================= 7. Movimiento reducido ================= */
  for (const [env, opts] of [['Chrome 1440 · reduced-motion', DESKTOP], ['Chrome 390 · reduced-motion', MOBILE]]) {
    const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await gotoReady(p, BASE);
    const o = await p.evaluate(() => ({ h: document.querySelector('.opening').offsetHeight, vh: innerHeight }));
    const frame = await p.evaluate(readTransform, '.opening__frame');
    const image = await p.evaluate(readTransform, '.opening__image');
    const stage = await p.evaluate(readTransform, '.opening__stage');
    check(env, 'Apertura estática: sin recorrido extra, sin escala ni sticky', o.h <= o.vh && frame.scale === 1 && image.scale === 1 && stage.position !== 'sticky', JSON.stringify({ h: o.h, frame: frame.scale, image: image.scale, pos: stage.position }));
    await p.evaluate(() => scrollTo(0, 400));
    await wait(p, 300);
    const image2 = await p.evaluate(readTransform, '.opening__image');
    check(env, 'Sin paralaje al desplazar', image2.scale === 1 && image2.ty === 0);

    await gotoReady(p, `${BASE}#/sector/sports-adventure`);
    await p.evaluate(() => {
      window.__rmx = [];
      const loop = () => {
        const v = document.querySelector('.view');
        if (v) window.__rmx.push(new DOMMatrixReadOnly(getComputedStyle(v).transform).e);
        if (window.__rmx.length < 30) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
    const card = p.locator('a.card[href="#/sector/sports-adventure/villa-park"]');
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await p.waitForURL(/villa-park$/);
    const heroT = await p.evaluate(() => {
      const el = document.querySelector('[data-shared-hero]');
      return [getComputedStyle(el).transform, el.style.transform];
    });
    await wait(p, 600);
    const rmx = await p.evaluate(() => window.__rmx);
    check(env, 'Sin vuelo de foto entre tarjeta y ficha', !heroT[1] && (heroT[0] === 'none' || heroT[0] === 'matrix(1, 0, 0, 1, 0, 0)'), heroT.join(' | '));
    check(env, 'Entrada de vista sin desplazamiento lateral (solo fundido)', rmx.every((x) => x === 0), `${Math.max(...rmx.map(Math.abs))}px máx.`);
    check(env, 'Foco correcto en la ficha (h1)', (await p.evaluate(() => document.activeElement?.tagName)) === 'H1');
    const sec = await p.evaluate(readTransform, '#sec-club');
    check(env, 'Revelado sin desplazamiento (solo opacidad)', sec.ty === 0, JSON.stringify(sec));
    // Acceso directo
    await gotoReady(p, `${BASE}#/sector/gastronomy-culinary/purnells`);
    check(env, 'Acceso directo a una ficha', (await p.getByRole('heading', { level: 1 }).textContent()) === 'Plates by Purnell’s');
    await p.screenshot({ path: `${shots}reduced-${opts.viewport.width}.png` });
    await ctx.close();
  }

  /* ================= 7b. Fase 6: esclusa (pico) y sectores en paso lateral ================= */
  for (const [env, opts] of [['Chrome 1440 · ratón', DESKTOP], ['Chrome 390 · móvil táctil emulado', MOBILE]]) {
    const ctx = await browser.newContext(opts);
    const p = await ctx.newPage();
    await gotoReady(p, BASE);
    const geo = await p.evaluate(() => {
      const l = document.querySelector('.lock');
      const s = document.querySelector('.sectors');
      const acts = [...document.querySelectorAll('[data-sc-act]')].map((a) => ({ id: a.dataset.scAct, h: a.offsetHeight }));
      return { lockTop: l.offsetTop, lockH: l.offsetHeight, vh: innerHeight, secTop: s.offsetTop, secH: s.offsetHeight, secMode: s.className, acts };
    });
    const tallest = geo.acts.reduce((a, b) => (b.h > a.h ? b : a));
    check(env, 'Pico: la esclusa es el acto con más recorrido', tallest.id === 'lock', geo.acts.map((a) => `${a.id}:${a.h}`).join(' '));
    const sample = async (f) => {
      await p.evaluate(([top, h, vh, f]) => scrollTo(0, top + (h - vh) * f), [geo.lockTop, geo.lockH, geo.vh, f]);
      await wait(p, 450);
      return p.evaluate(() => ({
        clip: getComputedStyle(document.querySelector('.lock__water')).clipPath,
        gate: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.lock__gate--left')).transform).e,
        night: +getComputedStyle(document.querySelector('.lock__night')).opacity,
        stage: Math.round(document.querySelector('.lock__stage').getBoundingClientRect().top),
        beats: [...document.querySelectorAll('.lock__beat')].map((b) => +(+getComputedStyle(b).opacity).toFixed(2)),
      }));
    };
    const s0 = await sample(0.02);
    const s1 = await sample(0.4);
    const s2 = await sample(0.98);
    const insetTop = (c) => parseFloat((c.match(/inset\(([\d.]+)%/) ?? [])[1] ?? 'NaN');
    check(env, 'Esclusa: el agua sube con el scroll (clip-path)', insetTop(s0.clip) > 95 && insetTop(s1.clip) < insetTop(s0.clip) && insetTop(s2.clip) < 1, [s0.clip, s1.clip, s2.clip].join(' → '));
    check(env, 'Esclusa: las compuertas se abren y aparece la noche', s0.gate === 0 && s2.gate < 0 && s0.night === 0 && s2.night === 1, `${s0.gate} → ${s2.gate} · ${s0.night} → ${s2.night}`);
    check(env, 'Esclusa: escenario fijo durante el recorrido', Math.abs(s1.stage - s2.stage) <= 1, `${s1.stage}, ${s2.stage}`);
    check(env, 'Esclusa: nunca hay dos frases a la vez', [s0, s1, s2].every((s) => s.beats.filter((o) => o > 0.05).length <= 1) && s2.beats.at(-1) === 1, [s0, s1, s2].map((s) => s.beats.join('/')).join(' · '));

    if (opts === DESKTOP) {
      check(env, 'Sectores: paso lateral fijado en escritorio', geo.secMode.includes('sectors--pan') && geo.secH > geo.vh, `${geo.secMode} · ${geo.secH}px`);
      const tx = async (f) => {
        await p.evaluate(([top, h, vh, f]) => scrollTo(0, top + (h - vh) * f), [geo.secTop, geo.secH, geo.vh, f]);
        await wait(p, 450);
        return p.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.sectors__track')).transform).e);
      };
      const x0 = await tx(0);
      const x1 = await tx(1);
      const lastCard = await p.evaluate(() => {
        const r = document.querySelector('.sectors__track > li:last-child').getBoundingClientRect();
        return { right: Math.round(r.right), vw: innerWidth };
      });
      check(env, 'Sectores: la fila avanza de lado y la última tarjeta queda a la vista', x0 === 0 && x1 < -200 && lastCard.right <= lastCard.vw, `${x0} → ${Math.round(x1)} · ${JSON.stringify(lastCard)}`);
    } else {
      const swipe = await p.evaluate(() => {
        const tr = document.querySelector('.sectors__track');
        return { mode: document.querySelector('.sectors').className, overflow: getComputedStyle(tr).overflowX, snap: getComputedStyle(tr).scrollSnapType };
      });
      check(env, 'Sectores: carrusel nativo con scroll-snap en móvil', swipe.mode.includes('sectors--swipe') && swipe.overflow === 'auto' && swipe.snap.startsWith('x'), JSON.stringify(swipe));
    }
    const hscroll = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(env, 'Sin scroll horizontal de página', hscroll <= 0, `${hscroll}px`);
    await ctx.close();
  }
  {
    const env = 'Chrome 1440 · reduced-motion';
    const ctx = await browser.newContext({ ...DESKTOP, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await gotoReady(p, BASE);
    const r = await p.evaluate(() => ({
      lock: document.querySelector('.lock').className,
      h: document.querySelector('.lock').offsetHeight,
      vh: innerHeight,
      night: +getComputedStyle(document.querySelector('.lock__night')).opacity,
      sectors: document.querySelector('.sectors').className,
    }));
    check(env, 'Esclusa estática: llena, abierta y sin recorrido extra', r.lock.includes('lock--static') && r.h <= r.vh && r.night === 1, JSON.stringify(r));
    check(env, 'Sectores en rejilla, sin paso lateral', r.sectors.includes('sectors--grid'));
    await ctx.close();
  }
  /* ================= 8. Enlace escrito en la barra (misma pestaña) ================= */
  for (const [env, extra] of [['Chrome 1440 · ratón', {}], ['Chrome 1440 · reduced-motion', { reducedMotion: 'reduce' }]]) {
    const ctx = await browser.newContext({ ...DESKTOP, ...extra });
    const p = await ctx.newPage();
    await gotoReady(p, `${BASE}#/sector/sports-adventure/villa-park`);
    await p.evaluate(() => scrollTo(0, 900));
    await wait(p, 300);
    await p.goto(`${BASE}#/sector/gastronomy-culinary/purnells`);
    await p.getByRole('heading', { level: 1, name: 'Purnell’s' }).waitFor();
    await wait(p, 500);
    const r = await p.evaluate(() => ({ y: Math.round(scrollY), focus: document.activeElement?.tagName }));
    check(env, 'Hash escrito en la barra: la ficha nueva empieza arriba con el foco en el h1', r.y === 0 && r.focus === 'H1', JSON.stringify(r));
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}

const failed = results.filter((r) => !r.ok);
console.log(`\nChrome ${chromeVersion} · ${results.length - failed.length}/${results.length} comprobaciones superadas`);
await writeFile(`${shots}results.json`, JSON.stringify({ chrome: chromeVersion, date: new Date().toISOString(), results }, null, 2));
process.exit(failed.length ? 1 : 0);
