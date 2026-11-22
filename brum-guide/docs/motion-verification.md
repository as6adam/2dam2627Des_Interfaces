# Verificación de movimiento (fase 3)

Fecha: 2026-11-22 · Navegador: **Chrome 158.0.8127.36** (instalado en el sistema, headless, mediante playwright-core).
Build servido con `vite preview --base=/brum-guide/`. Comandos: `npm run build:pages && npm run test:motion`
(55/55 superadas) y `npm run test:e2e` (76/76 superadas).

## Entornos

| Entorno | Configuración |
|---|---|
| Chrome 1440 · ratón | 1440 × 900, DPR 1, puntero de ratón |
| Chrome 1440 · teclado | 1440 × 900, solo teclado (Tab, Enter, flechas) |
| Chrome 390 · móvil táctil emulado | 390 × 844, `isMobile`, `hasTouch`, DPR 3. Gestos con eventos CDP `Input.dispatchTouchEvent` (touchStart/Move/End) |
| Chrome 1440 / 390 · reduced-motion | Igual que los anteriores con `prefers-reduced-motion: reduce` emulado |

**Qué no cubre esta verificación:** dispositivos físicos (iPhone, Android), Safari y Firefox,
pantallas de 120 Hz, inercia real de trackpad y lectores de pantalla. El tacto está emulado:
Chrome recibe eventos táctiles reales de su canal de entrada, pero no hay un dedo físico ni
el motor de desplazamiento de iOS.

## Resultados por entorno

### Chrome 1440 · ratón

| Comprobación | Resultado | Medida |
|---|---|---|
| Apertura con recorrido propio (escenario de 190 vh) | ✔ | 1710px |
| Marco: se abre de 0,86 a 1 con el scroll | ✔ | 0.86 → 0.924 → 0.987 → 1 → 1 |
| Imagen: se asienta de 1,18 a 1 (profundidad inversa) | ✔ | 1.18 → 1.127 → 1.074 → 1.021 → 1 |
| Capa frontal: aparece y sube por encima del fondo | ✔ | opacidad 0 → 0.32 → 1 → 1 → 1 |
| Texto: opacidad 1 en todo el recorrido | ✔ | 0 → -12 → -24 → -36 → -48 px |
| Sticky localizado: el escenario se mantiene fijo durante el recorrido | ✔ | 72, 72, 72 |
| Solo cambian estilos inline (sin re-render de React por frame) | ✔ | {"style":382,"other":0} |
| Botón «Explorar los sectores» por teclado: desplaza y enfoca | ✔ | {"focus":"sectors-title","top":68} |
| Sección lejana oculta hasta entrar en vista, pero presente en el árbol accesible | ✔ | {"scale":1,"tx":0,"ty":28,"opacity":0,"top":4199,"display":"grid","position":"static"} |
| Al entrar en vista: opacidad 1 y sin desplazamiento | ✔ | {"scale":1,"tx":0,"ty":0,"opacity":1,"top":256,"display":"grid","position":"static"} |
| Opciones de transporte con entrada escalonada | ✔ | 0.29 ≥ 0.07 ≥ 0.00 |
| No se revierte al volver arriba (once) | ✔ |  |
| Ida: la foto de la ficha arranca sobre la tarjeta | ✔ | inicio x=161 w=361 vs tarjeta x=161 w=361 |
| Ida: termina en su sitio sin transform residual | ✔ | vuelo de 1447 ms |
| Ida: muelle sin rebote (anchura monótona) | ✔ |  |
| Ida: el foco va al h1 de la ficha | ✔ |  |
| Vuelta (atrás): la foto regresa a la tarjeta por el mismo camino | ✔ | inicio w=1040 (ficha 1040) → fin w=361 (tarjeta 361) |
| Vuelta: el foco vuelve a la tarjeta | ✔ |  |
| Hash escrito en la barra: la ficha nueva empieza arriba con el foco en el h1 | ✔ | {"y":0,"focus":"H1"} |

### Chrome 390 · móvil táctil emulado

| Comprobación | Resultado | Medida |
|---|---|---|
| Sin escenario fijo ni capa frontal (sin paralaje) | ✔ | {"pos":"static","inset":"no montada"} |
| Solo un leve asentamiento de la imagen (1,08 → 1) | ✔ | 1.08 → 1.033 |
| Sección lejana oculta hasta entrar en vista, pero presente en el árbol accesible | ✔ | {"scale":1,"tx":0,"ty":28,"opacity":0,"top":5137,"display":"grid","position":"static"} |
| Al entrar en vista: opacidad 1 y sin desplazamiento | ✔ | {"scale":1,"tx":0,"ty":0,"opacity":1,"top":150,"display":"grid","position":"static"} |
| Opciones de transporte con entrada escalonada | ✔ | 0.32 ≥ 0.08 ≥ 0.00 |
| No se revierte al volver arriba (once) | ✔ |  |
| Respuesta de pulsación al tocar (antes de soltar) | ✔ | escala 0.970 |
| Ida: la foto de la ficha arranca sobre la tarjeta | ✔ | inicio x=22 w=345 vs tarjeta x=22 w=345 |
| Ida: termina en su sitio sin transform residual | ✔ | vuelo de 1259 ms |
| Ida: muelle sin rebote (anchura monótona) | ✔ |  |
| Ida: el foco va al h1 de la ficha | ✔ |  |
| Vuelta (atrás): la foto regresa a la tarjeta por el mismo camino | ✔ | inicio w=358 (ficha 358) → fin w=356 (tarjeta 356) |
| Vuelta: el foco vuelve a la tarjeta | ✔ |  |
| Deslizar la tira con el dedo (scroll nativo con scroll-snap) | ✔ | 0 → 234 |
| Botón visible «Foto anterior» como alternativa al gesto | ✔ | 234 → 0 |
| Flechas del teclado sobre la tira enfocada | ✔ | 0 → 234 |
| Índice de la ficha operable por toque | ✔ | 40px |

### Chrome 1440 · teclado

| Comprobación | Resultado | Medida |
|---|---|---|
| Índice: Enter lleva a la sección y enfoca su título | ✔ | {"focus":"Fuentes","top":256,"current":"Fuentes","sticky":"sticky"} |
| Índice: marca la sección actual y es sticky solo en la ficha | ✔ |  |
| Las cuatro tarjetas del sector se alcanzan con Tab | ✔ |  |
| Enter en una tarjeta abre la ficha con el foco en el h1 | ✔ |  |

### Chrome 1440 · reduced-motion

| Comprobación | Resultado | Medida |
|---|---|---|
| Apertura estática: sin recorrido extra, sin escala ni sticky | ✔ | {"h":804,"frame":1,"image":1,"pos":"relative"} |
| Sin paralaje al desplazar | ✔ |  |
| Sin vuelo de foto entre tarjeta y ficha | ✔ | none |  |
| Entrada de vista sin desplazamiento lateral (solo fundido) | ✔ | 0px máx. |
| Foco correcto en la ficha (h1) | ✔ |  |
| Revelado sin desplazamiento (solo opacidad) | ✔ | {"scale":1,"tx":0,"ty":0,"opacity":0,"top":1064,"display":"grid","position":"static"} |
| Acceso directo a una ficha | ✔ |  |
| Hash escrito en la barra: la ficha nueva empieza arriba con el foco en el h1 | ✔ | {"y":0,"focus":"H1"} |

### Chrome 390 · reduced-motion

| Comprobación | Resultado | Medida |
|---|---|---|
| Apertura estática: sin recorrido extra, sin escala ni sticky | ✔ | {"h":764,"frame":1,"image":1,"pos":"static"} |
| Sin paralaje al desplazar | ✔ |  |
| Sin vuelo de foto entre tarjeta y ficha | ✔ | none |  |
| Entrada de vista sin desplazamiento lateral (solo fundido) | ✔ | 0px máx. |
| Foco correcto en la ficha (h1) | ✔ |  |
| Revelado sin desplazamiento (solo opacidad) | ✔ | {"scale":1,"tx":0,"ty":0,"opacity":1,"top":773,"display":"grid","position":"static"} |
| Acceso directo a una ficha | ✔ |  |

## Mediciones complementarias

- **Duración de la transición tarjeta → ficha** (1440, muestreo por tiempo): 50 % a 170 ms,
  90 % a 364 ms, 98 % a 527 ms y 99,5 % a 679 ms. Sin rebote: la anchura crece de forma
  monótona. El Chrome headless renderiza a unos 159 fps.
- **Primer pintado de la transición:** la posición de origen se fija en el
  `requestAnimationFrame` posterior al *commit* de React y a `ScrollRestoration`, antes de
  pintar. Una lectura tomada entre el *commit* y ese frame ve la foto en su sitio final, pero
  esa lectura no llega a pintarse.
- **Pulsación táctil:** con `touchStart` y sin soltar, la tarjeta baja a escala 0,970 en
  menos de 180 ms. El vuelo sale de ese tamaño pulsado, que es el que el usuario ve.

## Fallo encontrado y corregido durante la verificación

Al escribir o pegar un hash en la barra de la misma pestaña, la entrada nueva llega sin
`history.state` y el router le asigna la clave `default`, la misma que a la carga inicial.
`ScrollRestoration` restauraba entonces el desplazamiento de otra página (679 px) y la memoria
de foco tenía la misma colisión. Ahora esas entradas se identifican por su ruta
(`historyKey` en `GuideLayout.tsx`) y hay una prueba de regresión en la sección 8 de
`tests/motion.mjs`.
