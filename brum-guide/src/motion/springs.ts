import type { Transition } from 'motion/react';

/**
 * Parámetros de movimiento centralizados. Ningún componente define muelles,
 * distancias ni ritmos propios: todos importan de aquí.
 *
 * Muelles expresados como los parámetros de Apple (skill apple-design §4):
 * damping ratio → `bounce = 1 - damping`; response → `visualDuration` (s).
 * Regla: amortiguamiento crítico (bounce 0) por defecto. El rebote solo
 * aparece cuando el propio gesto aporta impulso.
 */
export const springs = {
  /** Reposicionar o entrar contenido. damping 1,0 · response 0,4 */
  move: { type: 'spring', bounce: 0, visualDuration: 0.4 },
  /** Menús y popovers anclados a su disparador. damping 1,0 · response 0,3 */
  popover: { type: 'spring', bounce: 0, visualDuration: 0.3 },
  /** Respuesta de pulsación (pointer-down). damping 1,0 · response 0,15 */
  press: { type: 'spring', bounce: 0, visualDuration: 0.15 },
  /** Revelado de bloques editoriales al entrar en vista. damping 1,0 · response 0,55 */
  reveal: { type: 'spring', bounce: 0, visualDuration: 0.55 },
  /** Foto que viaja de la tarjeta a la ficha (y vuelve). damping 1,0 · response 0,45 */
  shared: { type: 'spring', bounce: 0, visualDuration: 0.45 },
  /** Hoja o cajón tras un gesto con impulso. damping 0,8 · response 0,3 */
  sheet: { type: 'spring', bounce: 0.2, visualDuration: 0.3 },
} as const satisfies Record<string, Transition>;

/**
 * Suavizado de valores ligados al scroll (equivalente del `scrub: 0.7` de la
 * referencia). Es mucho más corto para mantener la sensación 1:1 del scroll
 * nativo: solo filtra los saltos de la rueda del ratón.
 */
export const scrollSmoothing = { bounce: 0, visualDuration: 0.12 } as const;

/** Sustituto no vestibular para movimiento reducido: fundido corto. */
export const reducedFade: Transition = { duration: 0.2, ease: 'easeOut' };

/** Escala al pulsar: respuesta inmediata en pointer-down, nunca al soltar. */
export const PRESS_SCALE = 0.97;

/** Amplitudes y ritmos de las tres interacciones de la fase 3. */
export const motionTokens = {
  /** Entrada de vista: desplazamiento lateral según la dirección del historial. */
  viewOffsetX: 24,
  opening: {
    /** Altura de recorrido del escenario fijo (× alto de ventana) en escritorio. */
    runwayVh: 150,
    /** El marco de la foto crece desde esta escala (apertura). */
    frameScaleFrom: 0.86,
    /** La imagen se asienta desde este zoom (profundidad inversa al marco). */
    imageScaleFrom: 1.24,
    /** Capa frontal: sube desde este porcentaje de su altura. */
    insetRiseFromPct: 70,
    /** El texto sube como mucho estos px; nunca baja de opacidad 1 en reposo. */
    copyRisePx: 72,
    /** En móvil: solo un leve asentamiento de la imagen, sin paralaje. */
    mobileImageScaleFrom: 1.08,
  },
  reveal: {
    /** Desplazamiento vertical de entrada (px). */
    risePx: 28,
    /** Retardo entre hijos de un mismo grupo (s). */
    stagger: 0.09,
    /** Fracción visible necesaria para disparar el revelado. */
    amountDesktop: 0.25,
    amountMobile: 0.1,
    /** Tarjetas: entran desde esta escala (profundidad) además de subir. */
    cardScaleFrom: 0.94,
  },
  sector: {
    /** Paralaje de la foto de cabecera mientras la cabecera sale de vista (px). */
    parallaxPx: 48,
  },
  /** Fase 6 · movimiento firma: la esclusa. Progreso 0→1 del escenario fijo. */
  lock: {
    /** Recorrido del escenario (× alto de ventana): es el mayor de la portada. */
    runwayVhWide: 240,
    runwayVhNarrow: 220,
    /** Tramo en que sube el agua. */
    fillFrom: 0.08,
    fillTo: 0.62,
    /** El barco flota un poco por encima de la lámina (% del alto de la cámara). */
    boatSinkPct: 9,
    /** Tramo en que se abren las compuertas. */
    gatesFrom: 0.62,
    gatesTo: 0.84,
    /** La foto nocturna se acerca de esta escala a 1 al abrirse la esclusa. */
    nightScaleFrom: 1.14,
  },
  /** Fase 6 · sectores en paso lateral (escritorio). */
  pan: {
    /** Margen final para que la última tarjeta respire (px). */
    tailPx: 48,
    /** Scroll vertical por cada px de avance lateral: la fila va más deprisa que la página. */
    scrollPerPx: 0.4,
  },
  /** Fase 6 · barrido de Villa Park: recorte inicial por la derecha (%). */
  wipe: {
    fromPct: 62,
  },
  /** Fase 6 · apertura en móvil: la capa frontal sube estos px al salir. */
  openingMobile: {
    insetRisePx: 40,
  },
} as const;
