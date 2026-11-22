# Brum · Guía bilingüe de Birmingham

Guía turística de Birmingham (Inglaterra) en español e inglés, con un diario de desarrollo
como entrega académica. Está hecha con React, TypeScript y Vite, y se sirve como dos HTML
estáticos.

- `index.html` → la guía: portada, sectores, fichas de lugar y 404, con navegación por hash.
- `diario.html` → Documentación y fases.

## Requisitos

- Node **≥ 22.22** (lo exige React Router 8; Vite 8 pide ≥ 22.12). Probado con Node 22.23.5
  y npm 10.9.
- Las pruebas usan el **Chrome instalado** en el equipo mediante `playwright-core`, sin
  descargar navegadores. Para usar otro ejecutable: `CHROME_PATH=/ruta/al/chrome`.

## Comandos

```powershell
npm install                 # instala las dependencias exactas de package-lock.json
npm run dev                 # servidor de desarrollo (http://localhost:5173/ y /diario.html)
npm run typecheck           # tsc -b + validación del catálogo y del registro de fotos
npm run check:catalog       # solo la validación del catálogo
npm run images              # variantes responsivas de las fotos autorizadas (lee ../Brum_pics)
npm run report:photos       # regenera docs/photo-rights.md
npm run build               # build en dist/ con base "/"
npm run build:pages         # build con base de prueba /brum-guide/
npm run preview:pages       # sirve dist/ en http://localhost:4173/brum-guide/
npm run test:e2e            # prueba de humo sobre dist/ (requiere build:pages antes)
npm run test:motion         # interacciones de movimiento: 1440/390, teclado, tacto emulado, movimiento reducido
npm run test:pwa            # PWA bajo /brum-guide/: manifiesto, worker, sin conexión, actualización (rehace dist/)
npm run icons               # regenera los iconos PNG desde public/icons/icon.svg
npm run test:journal        # diario: orden, integridad de textos, consola, plegado, idioma, sin conexión
npm run import:conversations -- "<ruta al .txt>"   # importa el documento de prompts al diario
npm run inventory:photos -- "../Brum_pics"   # inventario de fotos, solo lectura
```

### Base pública

- Raíz del dominio: `npm run build`.
- GitHub Pages de proyecto: `vite build --base=/<repo>/`, o `BASE_PATH=/<repo>/ npm run build`
  (así lo hace el workflow).
- La app no asume la raíz: los enlaces entre la guía y el diario son relativos (`./diario.html`,
  `./`) y los recursos del HTML usan `%BASE_URL%`. El test comprueba que ningún enlace
  empieza por `/` y que todas las peticiones quedan bajo la base.

## Rutas de la guía

| Hash | Vista |
|---|---|
| `#/` | Portada |
| `#/sector/:sectorId` | Sector (p. ej. `#/sector/culture-heritage`) |
| `#/sector/:sectorId/:placeId` | Ficha (p. ej. `#/sector/culture-heritage/aston-hall`) |
| cualquier otro, o sector/lugar inexistente | Página no encontrada |

## Preferencias

- Idioma (`es` | `en`) y tema (`light` | `dark`) en `localStorage` con las claves
  `brum-guide:lang` y `brum-guide:theme`. Con el almacenamiento vacío: **español y claro**.
- Un script en línea, generado desde `src/preferences/bootScript.ts` e insertado por Vite en
  ambos HTML, aplica `lang`, `data-theme` y `color-scheme` **antes del primer pintado**.
- Si `localStorage` falla (modo privado, bloqueo), los controles siguen funcionando en memoria
  durante la sesión.

## Estructura

```
index.html, diario.html        entradas reales de Vite (rolldownOptions.input)
public/icons/                  icon.svg, apple-touch-icon.png
public/offline.html            respuesta sin conexión (se usará en la fase PWA)
src/entries/                   arranque de guía y diario
src/guide/                     router hash, layout, portada, sector, ficha, 404
src/journal/                   página del diario y vista de entrada
src/components/                AppShell, TopNav, LanguageMenu, ThemeSwitch, Card, Breadcrumbs
src/content/                   catalog.ts (catálogo único), types.ts, queries.ts, media.ts, journal.ts,
                               photo-rights.json (derechos + alt), image-manifest.json, photo-inventory.json
src/assets/placeholders/       recurso local provisional para fotos sin autorización
src/assets/images/             variantes generadas (solo fotos autorizadas)
src/i18n/                      diccionarios es/en, format() y formatDate()
src/preferences/               claves, almacenamiento tolerante, provider, script de arranque
src/motion/                    muelles (estilo Apple) y preferencias de movimiento
src/pwa/                       marcador de la fase PWA
src/styles/                    tokens (incluye áreas seguras), base, shell, contenido
scripts/                       inventario de fotos y render del apple-touch-icon
docs/                          motion-reference, design-decisions, photo-inventory
tests/smoke.mjs                prueba de humo (Playwright + Chrome del sistema)
.github/workflows/             verificación, build y despliegue en Pages
```

## Estado

- **Fase 1**: cimientos, AppShell, i18n, tema, rutas y contratos.
- **Fase 2**: catálogo tipado con 10 sectores y 40 lugares. Villa Park está verificado con
  fuentes oficiales y el resto son entradas de demostración. Portada con fotos de
  Welcome_to_brum y destacado de Aston Villa. Registro de derechos y textos alternativos
  ES/EN para las 48 fotos, autorizadas por el autor para uso académico no comercial y
  publicadas como variantes responsivas (`src/assets/images/`). Restauración de foco y
  desplazamiento en el historial.

- **Fase 3**: apertura fotográfica ligada al scroll, revelado progresivo, índice de la ficha y
  transición tarjeta ↔ ficha con Motion. Parámetros de muelle centralizados en
  `src/motion/springs.ts`. Verificación en [docs/motion-verification.md](docs/motion-verification.md).

El contenido pendiente y cómo sustituirlo están en [docs/content-guide.md](docs/content-guide.md).
El estado de cada foto, en [docs/photo-rights.md](docs/photo-rights.md).

- **Fase 4**: PWA instalable con manifiesto bajo la base, iconos propios, worker Workbox con
  precarga de las dos páginas, fotos bajo demanda con límites, estado sin conexión, aviso de
  nueva versión y workflow de Pages. Detalle y protocolo de prueba en iPhone en
  [docs/pwa.md](docs/pwa.md). **La prueba física en iPhone no se ha hecho.**

- **Fase 5**: diario académico con las conversaciones del documento de prompts (1 pareja
  de ChatGPT y 6 de Claude). Cómo añadir
  entradas: [docs/content-guide.md](docs/content-guide.md#4-diario-añadir-o-completar-una-pareja-promptrespuesta).

[Guía de Birmingham](https://as6adam.github.io/brum-guide/) · [Documentación y fases](https://as6adam.github.io/brum-guide/diario.html) · [Repositorio de publicación](https://github.com/as6adam/brum-guide).
