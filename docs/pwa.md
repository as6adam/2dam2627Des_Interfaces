# PWA: configuración y pruebas

## Configuración

| Pieza | Valor | Dónde |
|---|---|---|
| Manifiesto | `manifest.webmanifest` en la base. `id`, `start_url` y `scope` = `./` (se resuelven a `/<repo>/`), `display: standalone`, `lang: es`, `theme_color` y `background_color` `#f5f2ee`, acceso directo al diario | `vite.config.ts` |
| Iconos | `icon-192.png` e `icon-512.png` (*any*, esquinas transparentes), `icon-maskable-512.png` (*maskable*, a sangre, glifo en la zona segura del 80 %), `apple-touch-icon.png` 180×180 a sangre. Se generan con `npm run icons` | `public/icons/`, `scripts/render-icons.mjs` |
| iOS | `apple-touch-icon` con `sizes="180x180"`, `apple-mobile-web-app-capable`, `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-mobile-web-app-title: Brum` y `viewport-fit=cover` en las dos páginas | `index.html`, `diario.html` |
| Worker | Workbox con `injectManifest`. Precarga de 15 entradas (unos 706 KB): `index.html`, `diario.html`, `offline.html`, JS (con los textos ES/EN), CSS, iconos y manifiesto | `src/pwa/sw.ts` |
| Navegación | Cada página precargada responde a su propia URL (`/<repo>/` y `/<repo>/index.html` → guía; `/<repo>/diario.html` → diario). No hay fallback global: cualquier otra navegación va a la red y, sin conexión, a `offline.html` | `src/pwa/sw.ts` |
| Fotos | Bajo demanda, solo imágenes locales de `/<repo>/assets/`. CacheFirst en `brum-fotos-v1`: máximo 80 entradas, 30 días y 750 KB por archivo (la variante mayor pesa 556 KB) | `src/pwa/sw.ts` |
| Externos | OpenStreetMap y las webs de las fuentes no se interceptan. Sin conexión se marcan «requiere conexión» | `ExternalLink.tsx` |
| Sin conexión | Banner bajo la barra con lo que sigue funcionando y lo que no. Las fotos no guardadas muestran «Foto no disponible sin conexión» en su caja reservada y se reintentan al volver la red | `OfflineBanner.tsx`, `Photo.tsx` |
| Actualización | `registerType: 'prompt'`. El worker nuevo espera y aparece un aviso bilingüe «Hay una versión nueva» con «Más tarde» y «Actualizar». Solo al confirmar se envía SKIP_WAITING y la página se recarga. Comprobación al cargar y cada hora | `PwaUpdater.tsx` |
| Versión | Sello `APP_VERSION` (en CI, el SHA del commit) visible en el pie | `vite.config.ts`, `AppShell.tsx` |
| Áreas seguras | `env(safe-area-inset-*)` en barra, contenido, pie y avisos. En horizontal, la isla o la muesca quedan a los lados: `--pad-inline-*` = max(margen, inset). En un teléfono en horizontal, la apertura pone texto y foto lado a lado | `tokens.css`, `shell.css`, `content.css` |
| CI/CD | `.github/workflows/ci-pages.yml`: npm ci → tipos y catálogo → build con /brum-guide/ → humo, movimiento y PWA → build con `/<repo>/` → Pages. **No se ha ejecutado**: no hay push | — |

## Pruebas automatizadas (escritorio o emuladas)

**Entorno:** Chrome 158 de escritorio, headless (playwright-core), sobre `vite preview --base=/brum-guide/`
en `http://localhost`. El móvil, el tacto, la falta de conexión (`context.setOffline`) y las áreas
seguras (CDP `Emulation.setSafeAreaInsetsOverride`) están **emulados**. Esto **no** equivale a
Safari ni a un iPhone.

Comando: `npm run test:pwa` · Resultado: **48/48** · 2026-11-22

### Subpath

| Comprobación | Resultado | Medida |
|---|---|---|
| index.html enlaza manifiesto y apple-touch-icon bajo la base | ✔ | http://localhost:4185/brum-guide/manifest.webmanifest · http://localhost:4185/brum-guide/icons/apple-touch-icon.png |
| index.html: metadatos de pantalla de inicio iOS y viewport-fit=cover | ✔ |  |
| diario.html enlaza manifiesto y apple-touch-icon bajo la base | ✔ | http://localhost:4185/brum-guide/manifest.webmanifest · http://localhost:4185/brum-guide/icons/apple-touch-icon.png |
| diario.html: metadatos de pantalla de inicio iOS y viewport-fit=cover | ✔ |  |
| Manifiesto servido (200, application/manifest+json) | ✔ | application/manifest+json |
| id, start_url y scope estables dentro de la base | ✔ | ./ · ./ · ./ → http://localhost:4185/brum-guide/ |
| display standalone, nombre y colores | ✔ | Brum · Guía de Birmingham · #f5f2ee/#f5f2ee |
| Iconos PNG 192 y 512 (any) bajo la base | ✔ | 192x192/any:200 512x512/any:200 512x512/maskable:200 |
| Icono maskable 512 | ✔ |  |
| apple-touch-icon 180×180 | ✔ | {"w":180,"h":180} |
| sw.js servido bajo la base | ✔ |  |
| diario.html servido bajo la base | ✔ |  |

### Worker

| Comprobación | Resultado | Medida |
|---|---|---|
| Worker activo con ámbito /brum-guide/ y controlando la página | ✔ | {"scope":"http://localhost:4185/brum-guide/","script":"http://localhost:4185/brum-guide/sw.js","state":"activated","controlled":true} |
| Aviso «Lista para usarse sin conexión» tras la primera instalación | ✔ |  |
| Precarga: index.html, diario.html y offline.html | ✔ | 14 entradas |
| Precarga: JS y CSS esenciales con los textos ES y EN | ✔ | 4 JS · es=true en=true |
| Precarga: ninguna foto (se guardan bajo demanda) | ✔ |  |

### En línea

| Comprobación | Resultado | Medida |
|---|---|---|
| Ficha por hash (entrada directa) | ✔ |  |
| Entrada directa al diario | ✔ |  |
| Enlace diario → guía | ✔ |  |
| Enlace guía → diario | ✔ |  |
| Fotos vistas guardadas bajo demanda en brum-fotos-v1 | ✔ | 18 fotos |
| Ninguna foto guardada supera 750 KB | ✔ | máx 408934 B |
| Límite de cantidad: la caché de fotos no pasa de 80 entradas | ✔ | 240 pedidas → 80 guardadas |

### Sin conexión

| Comprobación | Resultado | Medida |
|---|---|---|
| Recarga sin conexión de una ficha por hash | ✔ |  |
| Estado claro: banner «Sin conexión» con lo que sigue funcionando | ✔ |  |
| Foto ya vista disponible sin conexión | ✔ |  |
| Enlaces externos marcados «requiere conexión» | ✔ | 6 enlaces |
| Foto no guardada: estado «Foto no disponible sin conexión» en su caja reservada | ✔ | 5 fotos · «Foto no disponible sin conexión» |
| diario.html sin conexión es el diario (no la guía) | ✔ |  |
| Navegación desconocida sin conexión → offline.html (sin fallback a index.html) | ✔ | Sin conexión |
| Entrada directa por hash en pestaña nueva sin conexión | ✔ |  |
| Cambio a inglés sin conexión (textos precargados) | ✔ |  |
| Cambio de tema sin conexión | ✔ |  |
| Al volver la conexión desaparece el banner | ✔ |  |

### Actualización

| Comprobación | Resultado | Medida |
|---|---|---|
| Versión A en uso | ✔ | pwa-test-a-1795362717690 |
| Aviso bilingüe de nueva versión | ✔ |  |
| El worker nuevo espera; la página sigue en la versión A | ✔ |  |
| «Más tarde» cierra el aviso sin recargar ni actualizar | ✔ | {"closed":true,"count":0,"version":"pwa-test-a-1795362717690","toasts":0} |
| Al reabrir, el aviso vuelve a ofrecer la versión pendiente | ✔ |  |
| Aviso traducido al inglés | ✔ |  |
| Tras confirmar: recarga con la versión B y sin aviso | ✔ | pwa-test-b-1795362717690 |
| El worker nuevo controla la página | ✔ |  |

### Global

| Comprobación | Resultado | Medida |
|---|---|---|
| Sin errores de JavaScript | ✔ |  |

### Áreas seguras (emuladas)

| Comprobación | Resultado | Medida |
|---|---|---|
| vertical 390×844: barra bajo la barra de estado, contenido fuera de la isla y del indicador de inicio | ✔ | {"navPadTop":59,"brandLeft":16,"controlsRight":16,"innerPadL":16,"mainPadL":16,"mainPadR":16,"footerPadB":58,"h1Left":16,"overflow":0} |
| vertical 390×844: región de avisos por encima del indicador de inicio | ✔ | 50 px |
| horizontal 844×390: barra bajo la barra de estado, contenido fuera de la isla y del indicador de inicio | ✔ | {"navPadTop":0,"brandLeft":59,"controlsRight":59,"innerPadL":59,"mainPadL":59,"mainPadR":59,"footerPadB":45,"h1Left":59,"overflow":0} |
| horizontal 844×390: región de avisos por encima del indicador de inicio | ✔ | 37 px |

## Prueba física en iPhone (Safari)

> **Estado: NO REALIZADA.** No tengo acceso a un iPhone. Ninguna fila de esta tabla se ha
> marcado como pasada. Rellénala al hacer la prueba.

### Requisitos previos

- Safari en iOS solo registra el service worker en un **contexto seguro (HTTPS)**. Una IP local
  por `http://` no sirve. Hay dos opciones:
  1. Desplegar en GitHub Pages (requiere tu autorización para hacer push).
  2. Servir el build localmente por HTTPS con un certificado de confianza instalado en el iPhone.
- Antes de empezar, borra los datos del sitio en Ajustes → Safari → Avanzado → Datos de sitios web,
  para partir de una instalación limpia.

### Pasos

| # | Paso | Resultado esperado | Resultado (iPhone, iOS, fecha) |
|---|---|---|---|
| 1 | Abrir `https://<usuario>.github.io/<repo>/` en Safari y esperar a que cargue | Portada en español y tema claro. Al poco, aviso «Lista para usarse sin conexión» | ☐ pendiente |
| 2 | Compartir → «Añadir a pantalla de inicio» | Nombre propuesto «Brum». Previsualización con el icono de ladrillo y canal, sin bordes blancos | ☐ pendiente |
| 3 | Abrir desde el icono | Sin barras de Safari (standalone). La barra superior queda bajo la barra de estado, que se ve legible sobre el fondo claro | ☐ pendiente |
| 4 | Girar a horizontal en la portada, una ficha y el diario | Nada queda bajo la isla o la muesca. Sin scroll horizontal. Apertura con texto y foto lado a lado | ☐ pendiente |
| 5 | Volver a vertical | La maquetación se recompone. El indicador de inicio no tapa el pie ni los avisos | ☐ pendiente |
| 6 | Globo → English; selector → Oscuro | Textos en inglés y tema oscuro al momento | ☐ pendiente |
| 7 | Cerrar la app desde el selector de apps y reabrirla | Conserva inglés y oscuro desde el primer pintado, sin destello claro | ☐ pendiente |
| 8 | Abrir Villa Park y desplazarse hasta las fuentes (para guardar sus fotos) | Fotos visibles | ☐ pendiente |
| 9 | Activar el modo avión y reabrir la app | Abre sin conexión. Banner «Offline» o «Sin conexión». La ficha de Villa Park y sus fotos ya vistas están disponibles | ☐ pendiente |
| 10 | En modo avión, ir al Diario | Se abre el diario (no la portada) | ☐ pendiente |
| 11 | En modo avión, abrir un sector no visitado | Fotos con «Foto no disponible sin conexión». Mapa y fuentes marcados «requiere conexión» | ☐ pendiente |
| 12 | Desactivar el modo avión | Desaparece el banner y las fotos se cargan | ☐ pendiente |
| 13 | Tras un despliegue nuevo, reabrir la app | Aviso «Hay una versión nueva». Con «Actualizar», la versión del pie cambia | ☐ pendiente |
| 14 | Con «Reducir movimiento» activado (Ajustes → Accesibilidad → Movimiento) | Sin paralaje ni vuelo de fotos. Solo fundidos | ☐ pendiente |

### Cómo registrar el resultado

Para cada paso, anota el modelo de iPhone, la versión de iOS, la fecha, ✔ o ✘ y, si falla, una
captura. Las diferencias conocidas entre Safari y Chrome que conviene vigilar son el aspecto
de la barra de estado con `black-translucent`, el momento en que iOS activa el worker nuevo
(puede requerir cerrar del todo la app) y el borrado de datos de sitios web que aplica WebKit.
