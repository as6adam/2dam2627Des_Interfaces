# Referencia de movimiento: página de producto HONOR Magic8 Pro

> Auditoría de referencia para la fase de animaciones de Brum. Se estudian **mecánicas**
> (qué dispara qué, cómo se mueve), no se reutiliza código, imágenes, vídeo ni composición.
> Fecha de observación: 22-11-2026.

- URL: <https://www.honor.com/es/phones/honor-magic8-pro/>
- Método:
  1. `curl` desde la terminal (HTTP 200, `text/html`, 1,24 MB) y lectura del HTML y del
     script de la página.
  2. Página renderizada en el navegador integrado de la app de Claude (Chromium) a
     **1440 × 900** (escritorio) y **390 × 844** (móvil emulado: user agent Android y 5 puntos
     táctiles). Mediciones con `getComputedStyle` y `getBoundingClientRect` tras desplazar
     a posiciones concretas y esperar a que terminase el suavizado.
  3. Rechacé las cookies no esenciales en el banner de consentimiento antes de medir.

Leyenda: **[O]** observado y medido · **[C]** leído en el código de la página, sin medirlo en
pantalla · **[I]** inferencia · **[NV]** no verificado.

---

## 1. Estructura y tecnología

- **[C]** 31 secciones `section.section-*` en un único documento: `kv` (portada), `highlights`,
  `cmf` (colores), `camera`, `zoom`, `night`, `debounce`, `people`, `chase`, `live`, `chip`,
  `game`, `battery`, `screen`, `green`, `eye`, `face`, `drop`, `audio`, `key`, `service`,
  `see`, `google`, `anti-fraud`, `interconnection`, `technology`, `change`, `switch`, `faq` y `note`.
- **[C]** Motores: GSAP + ScrollTrigger (script en línea), Swiper (carruseles), video.js
  (ventanas de vídeo). 21 elementos `<video>` con variantes WEBM/MP4 y detección de
  WEBP/AVIF/WEBM.
- **[O]** 57 instancias de ScrollTrigger en ambas anchuras. **Ninguna usa `pin`**: la fijación
  se hace con CSS `position: sticky`.
- **[O]** La página mide 32 861 px en escritorio. Varias secciones superan la altura de la
  ventana para dar recorrido al scroll: `night` 1892 px, `key` 2025 px, `chip` 1260 px y
  `screen` 1260 px, frente a una ventana de 900 px.
- **[C]** Modo "retrato" = `max-aspect-ratio: 12/10` **y** anchura < 1026 px. Esa variable
  elige puntos de disparo distintos y desactiva algunas animaciones.
- **[C]** No aparece `prefers-reduced-motion` en el HTML (0 coincidencias).
- **[O · fase 3]** En las 25 hojas de estilo (todas legibles) solo hay dos reglas de
  movimiento reducido: `.animated { animation: unset; transition: none }` y la transición de
  un modal. **Ninguna afecta a las secciones del producto**: las transiciones de 0,7 s y las
  líneas de tiempo de GSAP se mantienen aunque el sistema pida movimiento reducido.

## 2. Elementos que permanecen fijos

| Elemento | Escritorio 1440 | Móvil 390 | Notas |
|---|---|---|---|
| Cabecera global | sticky/fixed, 65 px | fixed, 50 px | **[O]** Al bajar desaparece y queda solo la subnavegación. **[O · fase 3]** Tras bajar con la rueda y subir 300 px (3 pasos de rueda reales), **no vuelve**: arriba sigue solo la subnavegación, que recibe la clase `fixed`. |
| Subnavegación de producto + botón "Comprar" | sticky, 52 px | sticky, 52 px | **[O]** Siempre visible; los contenedores sticky internos se anclan a `top: 52px` |
| Contenedores `.sticky-container` | 6 (`cmf`, `chase`, `chip`, `screen`, `green`, `key`), 810–848 px | 5, 792 px | **[O]** Fijos mientras su sección tiene recorrido, por ejemplo en `chip`: `top` = 443 → 65 → 52 → −153 px |
| Barra lateral flotante (compra/chat/subir) | fixed, abajo a la derecha | fixed | **[O]** |
| Barra de oferta `energy-kv` | — | sticky, 48 px | **[O]** Solo en móvil |

## 3. Secciones que responden al scroll

### A. Línea de tiempo "scrubbed" (progreso del scroll = progreso de la animación)

- **[C]** `scrub: 0.7`, de modo que la animación sigue al scroll con 0,7 s de suavizado.
- **[O] `night`** (de `top 50%` a `+=160%`): el bloque de texto pasa de `translateY(108px)` y
  opacidad 0,5 a `0` y 1. Las fotos suben con desfase: `img1` desde 115 px y `img3` desde
  72 px, pasando por 39 px y llegando a 0. La profundidad sale de **velocidades distintas
  por capa** (paralaje). No hay transformaciones 3D.
- **[O] `debounce`**: el mismo patrón en `+=100%`. El texto pasa de 108 px y opacidad 0,5 a
  0 y 1. **Ojo:** en una visita normal el texto queda a opacidad 0,5 hasta que la sección
  llega a la mitad de la ventana.
- **[O] `key`**: una imagen (una mano) gira entre 0° y −3° ligado al scroll
  (`matrix(0.9986, -0.0523…)` = −3°).
- **[O · fase 3]** Escala: un barrido completo cada 450 px no encontró escalas ligadas al scroll.
  Solo hay escalas estáticas de maquetación (`kv` 0,45; `chase` 0,8; `battery` 0,5;
  `drop` 0,6), con un único valor en todo el recorrido.
- **[O · fase 3]** La escala aparece en el **umbral** de `zoom` (mecánica B): el marco de la
  foto pasa de `translateY(17,08vw) scale(1.5)` a `translateY(0) scale(1)` con una
  transición CSS de 0,7 s al recibir `is-active`. Los botones anterior/siguiente amplían la
  imagen interior a ×1,5 (`is-zoom-2`) y ×2 (`is-zoom-3`).

### B. Umbral que activa una clase (y CSS hace el resto)

- **[C]** `ScrollTrigger` con `start` = `end` (un punto). `onEnter` añade `is-active` y
  `onEnterBack` lo quita al volver hacia arriba, así que el efecto **se revierte**.
- **[O]** `camera`, `zoom`, `green`, `chip` y `screen` recibieron `is-active` tras desplazarse.
  En `chip`, con el contenedor ya fijo, los bloques de datos pasan de opacidad 0,69 a 1 y se
  desplazan unos 47 px en vertical.
- **[O]** Transición CSS de **0,7 s** en `copy-wrapper` y `data-wrapper` de `screen`.
- **[C]** Los puntos de disparo dependen de la orientación: `top 40%` en horizontal y `top 60%`
  en retrato. En retrato, el contenido se activa cuando aparece más abajo en la pantalla.

### C. Reproducción de vídeo al entrar

- **[C]** `onEnter` → `video.play()` y `currentTime = 0` en `highlights`, `live` y `service`.
  En los carruseles, `slideChange` reproduce el vídeo activo y pausa el resto.
- **[NV]** Sigue sin verificar la reproducción automática en modo de bajo consumo o con datos
  limitados: hace falta un dispositivo real y la guía no usa vídeo.

## 4. Qué dispara las secciones interactivas

| Sección | Disparador | Efecto |
|---|---|---|
| `cmf` | **[C]** Clic en botones de color (`data-color`) | Cambia la clase `is-color-*` y con ella las imágenes del producto |
| `highlights`, `chase`, `live`, `service` | **[C]** Botones anterior/siguiente y deslizamiento (Swiper) | Cambio de diapositiva y vídeo. El deslizamiento táctil solo se usa para la analítica (`touchMoving`) |
| `chase` | **[C]** Botones de pestaña | `slideTo(n)` y desplazamiento a la sección |
| `see`, `google`, `anti-fraud` | **[C]** Botón de reproducir | Ventana de vídeo con trampa de foco y bloqueo del fondo |
| `faq` | **[C]** Clic | Acordeón (`is-active`) |

## 5. Diferencias en pantallas táctiles y móviles (390 px)

- **[O]** El paralaje de `night` y `debounce` **no se crea** en retrato (`transform: none`
  medido en 390 px). El código lo envuelve en `if (!isPortrait)`.
- **[O]** Solo quedan 2 líneas de tiempo "scrubbed" (la rotación de `key`). El resto son
  disparadores por umbral.
- **[O]** `highlights` pasa de 750 px de alto (carrusel) a **4195 px** (pila vertical).
  **[C]** En retrato, cada vídeo se reproduce al entrar en `top 60%`.
- **[O]** La cabecera global pasa a `fixed` con 50 px y aparece una barra sticky extra de
  48 px. **[I]** En una pantalla de 844 px eso deja en torno a 690 px útiles, aún menos con
  la barra de oferta visible.
- **[O · fase 3]** A 390 px con 5 puntos táctiles hay **13 carruseles Swiper inicializados**
  (`allowTouchMove: true`, `speed: 500`, `threshold: 0`, `resistanceRatio: 0.85`,
  1 diapositiva por vista). El de `highlights` **no** se inicializa: queda como pila vertical.
- **[O · fase 3, parcial]** Gestos táctiles emulados con CDP (`Input.dispatchTouchEvent`,
  Chrome 158 headless, 390 × 844, DPR 3): de 4 deslizamientos, solo 1 (un arrastre corto del
  10 %) avanzó un carrusel. Los botones «siguiente» avanzaron en 2 de 2 casos. El arrastre de
  ratón del navegador integrado no mueve los carruseles: en modo táctil Swiper solo escucha
  eventos *touch*.
- **[NV]** Sigue sin verificar en un iPhone o Android físico ni en Safari para iOS.

## 6. Adaptaciones propuestas para Brum

Se usa **Motion for React** (`useScroll`, `useTransform`, `useSpring`, `whileInView`). No se
añade GSAP ni otro motor. Todos los efectos consultan `useMotionPrefs().reduce` y, con
movimiento reducido, se convierten en fundidos breves o en estados estáticos. La composición
es propia: una portada vertical de canal → plaza → sectores, y el ladrillo y el agua como
motivo gráfico.

| Mecánica comprobada | Adaptación en Brum | Dónde |
|---|---|---|
| **A. Paralaje "scrubbed" por capas** (texto 108→0 px, fotos con desfase) | Apertura **"Del canal a la plaza"**: foto de `Welcome_to_brum` (canal) a sangre y titular que sube unos 24 px y gana opacidad con el scroll. `useScroll` + `useTransform`, suavizado con `useSpring` (sin rebote) en lugar de `scrub: 0.7`. **Sin paralaje en retrato**, igual que HONOR (rendimiento y mareo). | Portada |
| **A (lección).** Texto a opacidad 0,5 hasta media pantalla | Al revés que en HONOR: el texto **nunca** queda por debajo de opacidad 1 en reposo. El movimiento solo afecta a la posición y a capas decorativas. | Portada |
| **B. Contenedor sticky con estados por umbral** | **Ficha con columna de foto fija** (≥ 1024 px): la foto queda sticky bajo la barra y, al entrar cada bloque ("Descripción", "Cómo visitarlo", "Fotografías"), cambia la imagen o el pie con un fundido. En móvil no hay sticky: las fotos van en línea. | Fichas |
| **B (lección).** `onEnterBack` revierte el estado | Las entradas de tarjetas son **de una sola vez** (`whileInView`, `once: true`, desfase de 40 ms, muelle `bounce: 0`). No se ocultan al subir, para evitar parpadeos. | Tarjetas de sector y lugar |
| **Puntos de disparo según orientación** (40 % / 60 %) | El umbral de entrada en `whileInView` usa `amount` 0,25 en escritorio y 0,1 en móvil, para que en pantallas pequeñas el contenido aparezca antes. | Tarjetas |
| **D. Botones de color que cambian la imagen** (CMF) | **Selector Día/Noche** (control segmentado, como el de tema) que alterna las parejas de fotos `Victoria-Square` / `Victoria-Square-de-noche` con un fundido. El control nace del contenido al que afecta. | Portada |
| **D. Carrusel con botones + deslizamiento** | **Galería de la ficha** con `scroll-snap` nativo (impulso del sistema) y botones anterior/siguiente para teclado y ratón. Si hace falta un arrastre propio: proyección de impulso con `0.998` y muelle con velocidad heredada (skill apple-design §5–6). | Fichas |
| **Subnavegación sticky con acción principal** | **Barra de sector** sticky bajo la barra superior en sector y ficha, con chips de los diez sectores en desplazamiento horizontal. Se fija con `position: sticky`, sin JavaScript. | Sector y ficha |
| **Cabecera que se oculta al bajar** | Se descarta ocultarla. En su lugar, el borde de scroll ya implementado y, como mucho, una compactación de altura. La HIG pide que la navegación sea predecible y siempre alcanzable. | Barra superior |
| **C. Vídeo al entrar** | **Descartado.** No hay vídeo propio, y el coste de datos y la reproducción automática chocan con una guía que se usará en la calle. | — |
| **Rotación decorativa ligada al scroll** (−3°) | **Descartado** por decorativo (HIG: propósito). | — |

## 7. Pendiente de verificar antes de la fase de animaciones

- Gestos táctiles reales (dispositivo iOS o Android físico) en la referencia y en Brum.
- Transiciones CSS completas de `is-active` (hojas externas de HONOR).
- Rendimiento de `backdrop-filter` + paralaje en móviles de gama media (objetivo: 60 fps,
  animando solo `transform` y `opacity`).

## 8. Reverificación (fase 3, 22-11-2026)

Entornos: navegador integrado de la app de Claude (Chromium; 1440 × 900 y 390 × 844 con 5
puntos táctiles) para la rueda del ratón y la lectura de hojas de estilo. Chrome 158 headless
(playwright-core) con eventos táctiles CDP para los gestos. Los cambios se han integrado
arriba con la marca **[O · fase 3]**. Lo que sigue **[NV]**: reproducción automática de vídeo
en bajo consumo y gestos en un dispositivo físico o en Safari para iOS.

### Implementación en Brum

| Mecánica de referencia | Interacción en Brum | Estado |
|---|---|---|
| Umbral `zoom` (marco desde scale 1,5) + paralaje por capas de `night` | **Apertura fotográfica** de la portada: marco 0,86 → 1, imagen 1,18 → 1 y capa frontal que sube, ligado al scroll en un escenario sticky localizado (190 vh). Móvil sin paralaje. | Implementada · `PhotoOpening.tsx` |
| Umbral con `is-active` y transiciones de 0,7 s | **Revelado progresivo** de bloques editoriales: una sola vez, 28 px, muelle crítico de 0,55 s y escalonado de 70 ms | Implementada · `Reveal.tsx` |
| Subnavegación sticky con anclas | **Índice de la ficha**: sticky solo dentro de la ficha en escritorio; fila de botones en móvil | Implementada · `SectionIndex.tsx` |
| Carrusel con botones + deslizamiento | **Tira de bienvenida**: scroll-snap nativo, botones visibles y flechas del teclado | Implementada · `PhotoStrip.tsx` |
| (propia, sin equivalente en la referencia) | **Transición tarjeta ↔ ficha**: la foto viaja con un muelle crítico y vuelve por el mismo camino al ir atrás | Implementada · `sharedPhoto.ts` |

El detalle de cada comprobación y su entorno está en [motion-verification.md](motion-verification.md).
