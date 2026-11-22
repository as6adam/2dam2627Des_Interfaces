# Decisiones de interfaz (fase 1)

Fuentes: la skill `apple-design` (que traduce a la web las charlas de diseño de la WWDC) y las
Human Interface Guidelines de Apple. Cada decisión indica de qué apartado de la skill sale.

| Decisión | Origen | Dónde |
|---|---|---|
| Muelles críticamente amortiguados por defecto (`bounce: 0`), con rebote reservado a gestos con impulso. Presets `move` 0,4 s, `popover` 0,3 s, `press` 0,15 s y `sheet` (amortiguamiento 0,8) | §4 *Behavior over animation*, tabla de valores de Apple | `src/motion/springs.ts` |
| Respuesta al **pulsar**, no al soltar: `whileTap` a escala 0,97 en tarjetas y `:active` en botones | §1 *Response*, §10 | `Card.tsx`, `shell.css` |
| Animaciones interrumpibles: Motion parte del valor en pantalla. La píldora del selector de tema (`layoutId`) se puede invertir a mitad de recorrido | §3 *Interruptibility* | `ThemeSwitch.tsx` |
| El menú de idioma **nace de su botón** (`transform-origin: top right`) y sale por el mismo camino por el que entra | §7 *Spatial consistency* | `LanguageMenu.tsx`, `shell.css` |
| Barra superior como **material translúcido** (`backdrop-filter`) con el contenido pasando por debajo, y efecto de borde al hacer scroll en lugar de un divisor fijo | §12 *Materials* | `TopNav.tsx`, `shell.css` |
| El menú es **opaco**: un material claro translúcido sobre el ladrillo de la portada perdía legibilidad (lo comprobé en la captura a 390 px) | §12 "Never stack a light translucent surface…" | `shell.css` |
| Movimiento reducido: `MotionConfig reducedMotion="user"`, más fundidos de 0,2 s en lugar de desplazamientos. Transparencia reducida → material sólido. Más contraste → separadores marcados | §14 | `AppShell.tsx`, `useMotionPrefs.ts`, `tokens.css` |
| Cambio de tema con una transición de color de 280 ms (se suprime con movimiento reducido) para evitar saltos bruscos de brillo | §14 | `PreferencesProvider.tsx`, `base.css` |
| Tipografía del sistema. Tamaño, interlineado y tracking van juntos: los titulares grandes con tracking negativo (−0,028 em), el texto con 0 y las notas con +0,006 em. Espaciado en `rem` | §15 *Typography* | `tokens.css`, `base.css` |
| Objetivos táctiles de al menos **44 × 44 px** en barra, tarjetas, migas y enlaces de vuelta (verificado por el test a 390 y 1440 px) | HIG · *Layout*, §10 | `tokens.css` (`--hit`) |
| Foco visible solo con teclado (`:focus-visible`). Tras navegar, el foco pasa al `h1` de la vista, que responde a "¿dónde estoy?". Enlace para saltar al contenido | §16 *Wayfinding* | `GuideLayout.tsx`, `AppShell.tsx` |
| Migas de pan y enlace "Volver a…" en sector y ficha, y un 404 con salida a la portada: el usuario nunca queda atrapado | §16 *Wayfinding* | `Breadcrumbs.tsx`, `NotFoundPage.tsx` |
| Etiquetas concretas ("Guía", "Diario", "Explora por sectores") en lugar de un "Inicio" genérico | §16 "Direct, specific labels" | `i18n/*.ts` |
| Restricción: en esta fase no hay animaciones de scroll, solo la entrada de vista (muelle de 0,4 s, 12 px). Las secuencias de scroll esperan a su fase con la referencia documentada | §16 *Purpose*, §17 | `GuideLayout.tsx`, `docs/motion-reference.md` |

## Fase 2

| Decisión | Origen | Dónde |
|---|---|---|
| Al avanzar, la vista entra desde el borde final (x +24 px); al volver, desde el inicial (x −24 px). Muelle crítico `move` (amortiguamiento 1,0, respuesta 0,4 s). Con movimiento reducido, solo un fundido de 0,2 s | §7 *Spatial consistency*, §4, §14 | `GuideLayout.tsx` |
| Al volver atrás se restauran el desplazamiento (`ScrollRestoration`) y el foco en el enlace que se activó. Al avanzar, el foco va al `h1` | §16 *Wayfinding* ("¿dónde estoy?"), HIG · Accesibilidad | `GuideLayout.tsx` |
| Tarjetas con la foto arriba y el título como etiqueta. La foto es decorativa (`alt=""`) porque el título ya nombra el destino, y la pulsación responde en pointer-down | §1, HIG · *Images* | `Card.tsx` |
| Las insignias de estado (Demostración, Datos verificados, Texto provisional) combinan texto y forma (punto, borde discontinuo), nunca solo color | HIG · *Color* (no depender solo del color) | `Badge.tsx`, `content.css` |
| La procedencia es visible: cada dato práctico muestra su fuente, la ficha lleva la fecha de verificación y los datos que faltan aparecen como pendientes, no como huecos silenciosos | §16 *Responsibility* | `PlacePage.tsx` |
| Imágenes con proporción reservada (`aspect-ratio` + `width`/`height`). Solo la primera vista carga con prioridad y el resto en diferido (CLS medido: 0) | §16 *Craft* | `Photo.tsx` |
| Tira de bienvenida con `scroll-snap` nativo: conserva el impulso y el rebote del sistema en lugar de un carrusel propio | §6 *Momentum*, *Familiarity* | `content.css` (`.strip`) |
| Transporte presentado como lista de opciones escaneables (modo → parada → línea → origen → trayecto → a pie), en el orden en que se decide un trayecto | §16 *Grouping & mapping* | `PlacePage.tsx` |

## Fase 3

| Decisión | Origen | Dónde |
|---|---|---|
| Todos los muelles, distancias y ritmos viven en `src/motion/springs.ts` (`springs`, `scrollSmoothing`, `motionTokens`). Ningún componente define los suyos | §4 *Behavior over animation*, *Craft* | `springs.ts` |
| La apertura sigue el scroll nativo 1:1 con un filtro mínimo (`visualDuration` 0,12 s) en lugar del `scrub` de 0,7 s de la referencia: la imagen no se queda atrás del dedo ni de la rueda | §1 *Response*, §2 *Direct manipulation* | `PhotoOpening.tsx` |
| Profundidad sin 3D: el marco se abre (0,86 → 1) mientras la imagen se asienta (1,18 → 1), y una capa frontal se mueve más deprisa que el fondo. Solo `transform` y `opacity` | §11 *Frame-level smoothness*, §12 *Depth* | `PhotoOpening.tsx` |
| El texto de la apertura va sobre un material (blur + fondo al 88 %) y nunca baja de opacidad 1. Con transparencia reducida, el fondo es sólido | §12 *Vibrancy*, §14 | `content.css` (`.opening__copy`) |
| `sticky` solo donde aporta: escenario de apertura (escritorio) e índice de la ficha (escritorio). En móvil, ninguno: más altura útil y sin paralaje | §16 *Flexibility*, lección de la referencia | `content.css` |
| Revelado de una sola vez, sin revertir al subir, con 28 px y escalonado de 70 ms: confirma la llegada sin distraer de la lectura | §4 (crítico por defecto), §16 *Purpose* | `Reveal.tsx` |
| La foto viaja de la tarjeta a la ficha y vuelve por el mismo camino con el botón atrás. La vista no se desliza mientras viaja: hay un único movimiento protagonista | §7 *Spatial consistency*, §8 | `sharedPhoto.ts`, `GuideLayout.tsx` |
| El vuelo sale de la tarjeta tal como se ve, pulsada a escala 0,97, sin salto al soltar | §3 *Interruptibility* (partir del valor presente) | `sharedPhoto.ts` |
| Cada gesto auxiliar tiene un equivalente: el scroll de la apertura, el botón «Explorar los sectores»; el deslizamiento de la tira, los botones anterior/siguiente y las flechas; el desplazamiento por la ficha, el índice, que lleva el foco al título | §10, HIG · Accesibilidad | `PhotoOpening.tsx`, `PhotoStrip.tsx`, `SectionIndex.tsx` |
| Movimiento reducido: sin recorrido extra, sin escalas ni paralaje, sin vuelo de foto ni deslizamiento lateral. Los revelados quedan en un fundido de 0,2 s. El acceso directo y el foco no cambian | §14 | `useMotionPrefs.ts` y componentes |
| Nada depende del hover: toda acción tiene un objetivo táctil de 44 px o más y respuesta al pulsar | §1, §10 | `content.css`, `shell.css` |

## Fase 4

| Decisión | Origen | Dónde |
|---|---|---|
| La barra superior se extiende bajo la barra de estado (`black-translucent` + `viewport-fit=cover`) y compensa con `safe-area-inset-top`. En horizontal, el contenido se separa de la isla con `max(margen, inset)` | HIG · *Layout* (áreas seguras), §12 *Materials* | `index.html`, `tokens.css`, `shell.css` |
| El aviso de nueva versión no roba el foco ni bloquea la lectura. Ofrece dos salidas claras («Más tarde», «Actualizar») y solo actualiza al confirmar | §16 *Agency* (el visitante decide), *Feedback* | `PwaUpdater.tsx` |
| Los avisos entran y salen por el mismo borde inferior con un muelle crítico. Con movimiento reducido, solo un fundido | §7, §14 | `PwaUpdater.tsx` |
| El aviso informativo («lista sin conexión») se retira a los 8 s, salvo que tenga el foco o el puntero encima: en la primera visita tapaba la parte inferior de una tarjeta y se quedaba con el toque | §16 *Purpose*, hallazgo de la prueba táctil | `PwaUpdater.tsx` |
| Sin conexión se explica qué funciona y qué no, en lugar de un error genérico. Cada foto no guardada lo dice en su propia caja, con el tamaño reservado | §16 *Feedback* (estado), *Responsibility* | `OfflineBanner.tsx`, `Photo.tsx`, `ExternalLink.tsx` |
| Los estados usan texto además de color (punto con borde, etiqueta «requiere conexión») | HIG · *Color* | `shell.css` |
| Botones de los avisos de 44 px o más, también en horizontal, donde la barra se reduce a 48 px | HIG · *Layout*, §10 | `shell.css` |

## Fase 6

- **Método**: scrollcraft como método de diseño, no como motor. Ni `scrollcraft.js` ni otra
  librería: todo el movimiento sigue en Motion y todos los ritmos en `src/motion/springs.ts`
  (`motionTokens.lock`, `pan`, `wipe`, `openingMobile`).
- **Gramática**: capítulos editoriales. Ocho actos y una familia de dispositivo distinta en cada
  uno: apertura en capas (parallax), cifras (contador), sectores (pan lateral fijado en
  escritorio, carrusel nativo en móvil), pausa (tira manual, silencio intencionado), esclusa
  (pin + scrub, el pico), Villa Park (barrido con clip-path), rutas (cascada) y cierre útil.
- **Pico y movimiento firma**: la esclusa. El agua (clip-path sobre la foto del canal) sube con
  el scroll, el barco flota con ella, la regla marca el nivel y las compuertas se abren a la
  foto nocturna. Es el acto con más recorrido (320 vh escritorio, 220 vh móvil), comprobado
  en `tests/motion.mjs`.
- **Profundidad del hero**: no hay recortes con transparencia en Brum_pics; la profundidad se
  compone con fotos separadas (marco, imagen, capa frontal, escena). En móvil hay una
  composición propia: la capa frontal sobresale de la foto y sube algo más deprisa.
- **Conflicto de reglas**: «Explorar los sectores» era una pista de scroll. Ahora es navegación
  real: diez enlaces de sector en el hero, alcanzables por teclado.
- **Navegación**: la barra suma «Planifica» y en móvil acorta «Documentación y fases» a
  «Diario» (el nombre completo sigue en `aria-label`). El pie enlaza Planifica, Mapa y Teléfonos.
- **Movimiento reducido**: cada acto se queda en su estado final (esclusa llena y abierta,
  sectores en rejilla, Villa Park visible), sin recorridos extra.
