/// <reference lib="webworker" />
/**
 * Service worker de Brum (Workbox, estrategia injectManifest).
 *
 * - Precarga: index.html, diario.html, offline.html, JS (con los textos ES/EN), CSS,
 *   iconos y manifiesto. Cada página HTML se sirve desde SU propia entrada de la
 *   precarga: no hay un fallback global a index.html, así que diario.html sigue
 *   siendo una página independiente también sin conexión.
 * - Otras navegaciones dentro del ámbito: red y, sin conexión, offline.html.
 * - Fotos: solo imágenes locales de /assets, guardadas bajo demanda (CacheFirst)
 *   con límites de tamaño por archivo, número de entradas y antigüedad.
 * - Servicios externos (OpenStreetMap, webs de las fuentes): no se interceptan.
 * - Actualización: el worker nuevo espera hasta que el visitante confirma.
 */
import { clientsClaim, type WorkboxPlugin } from 'workbox-core';
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry | string> };

/** Límites de la caché de fotos. */
const PHOTO_CACHE = {
  name: 'brum-fotos-v1',
  maxEntries: 80,
  maxAgeSeconds: 30 * 24 * 60 * 60,
  maxBytesPerFile: 750 * 1024,
} as const;

const scopeURL = new URL(self.registration.scope);
const offlineURL = new URL('offline.html', scopeURL).href;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST, {
  // "/<repo>/" → "/<repo>/index.html". diario.html coincide por su propia URL.
  directoryIndex: 'index.html',
  cleanURLs: false,
});

// Navegaciones no precargadas (p. ej. una ruta mal escrita): red; sin conexión, offline.html.
registerRoute(new NavigationRoute(new NetworkOnly()));

/** Rechaza respuestas mayores que el límite por archivo. */
const sizeLimit: WorkboxPlugin = {
  cacheWillUpdate: async ({ response }) => {
    if (!response) return null;
    const declared = Number(response.headers.get('content-length'));
    const size = declared || (await response.clone().blob()).size;
    return size > PHOTO_CACHE.maxBytesPerFile ? null : response;
  },
};

registerRoute(
  ({ request, url, sameOrigin }) =>
    sameOrigin &&
    request.destination === 'image' &&
    url.pathname.startsWith(`${scopeURL.pathname}assets/`) &&
    /\.(webp|jpe?g|png|avif)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: PHOTO_CACHE.name,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      sizeLimit,
      new ExpirationPlugin({
        maxEntries: PHOTO_CACHE.maxEntries,
        maxAgeSeconds: PHOTO_CACHE.maxAgeSeconds,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    return (await matchPrecache(offlineURL)) ?? Response.error();
  }
  return Response.error();
});

// La actualización espera la confirmación del visitante (PwaUpdater → SKIP_WAITING).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

// La primera instalación controla de inmediato la página abierta (permite recargar
// sin conexión justo después de la primera visita).
clientsClaim();
