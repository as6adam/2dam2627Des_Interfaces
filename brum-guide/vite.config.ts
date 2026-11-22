import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { buildThemeBootScript } from './src/preferences/bootScript.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Base pública configurable:
 *  - `vite build` → raíz (`/`).
 *  - `vite build --base=/brum-guide/` → GitHub Pages de proyecto (la CLI tiene prioridad).
 *  - `BASE_PATH=/otro-repo/ vite build` → útil en CI.
 * El código de la app no asume la raíz: los enlaces entre HTML son relativos
 * y los recursos del HTML usan %BASE_URL%.
 */
function resolveBase(): string {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw) return '/';
  if (raw === './') return raw;
  return `/${raw.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
}

/** Inserta el arranque de tema antes de cualquier hoja de estilos o módulo. */
function themeBoot(): Plugin {
  return {
    name: 'brum-theme-boot',
    transformIndexHtml: {
      order: 'pre',
      handler: () => [
        { tag: 'script', children: buildThemeBootScript(), injectTo: 'head-prepend' },
      ],
    },
  };
}

/** Sello de versión visible en el pie y usado para comprobar actualizaciones. */
const APP_VERSION = process.env.APP_VERSION ?? new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

export default defineConfig({
  base: resolveBase(),
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [
    themeBoot(),
    react(),
    VitePWA({
      // Service worker propio (src/pwa/sw.ts) con Workbox: rutas de navegación
      // explícitas para index.html y diario.html, sin fallback global.
      strategies: 'injectManifest',
      srcDir: 'src/pwa',
      filename: 'sw.ts',
      // Nueva versión: se avisa y se espera la confirmación del visitante.
      registerType: 'prompt',
      // El registro lo hace src/pwa/PwaUpdater.tsx (virtual:pwa-register/react).
      injectRegister: false,
      manifestFilename: 'manifest.webmanifest',
      // Los iconos ya entran por globPatterns: sin duplicados en la precarga.
      includeManifestIcons: false,
      injectManifest: {
        // Precarga: las dos páginas, offline.html, JS (incluye los textos ES/EN),
        // CSS, iconos y el manifiesto. Las fotos NO: se guardan bajo demanda.
        globPatterns: ['**/*.{html,js,css,svg,png,webmanifest}'],
        globIgnores: ['**/assets/*.{jpg,jpeg,webp,avif}'],
        maximumFileSizeToCacheInBytes: 1024 * 1024,
      },
      manifest: {
        // Todo relativo al manifiesto, que vive en la base: sirve igual en / y en /<repo>/.
        id: './',
        start_url: './',
        scope: './',
        name: 'Brum · Guía de Birmingham',
        short_name: 'Brum',
        description: 'Guía bilingüe (español/inglés) de Birmingham, Inglaterra, y documentación por fases.',
        lang: 'es',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f5f2ee',
        theme_color: '#f5f2ee',
        categories: ['travel', 'education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Documentación y fases', short_name: 'Documentación', url: './diario.html', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: {
        index: `${root}index.html`,
        diario: `${root}diario.html`,
      },
    },
  },
});
