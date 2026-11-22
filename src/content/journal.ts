import type { JournalEntry } from './types';

/** Entradas del diario, de la más reciente a la más antigua. */
export const journal: JournalEntry[] = [
  {
    id: 'fase-4-pwa',
    date: '2026-11-22',
    phase: 4,
    tags: ['PWA', 'Workbox', 'Sin conexión', 'iOS'],
    title: {
      es: 'Fase 4 · Una guía que funciona sin conexión',
      en: 'Phase 4 · A guide that works offline',
    },
    summary: {
      es: 'La guía se puede instalar en la pantalla de inicio y sigue funcionando sin cobertura, con avisos claros de lo que necesita red.',
      en: 'The guide can be installed on the home screen and keeps working without signal, with clear notices about what needs a connection.',
    },
    body: [
      {
        es: 'En la primera visita, el dispositivo guarda las dos páginas, la guía y este diario, con todos sus textos en español e inglés. Las fotos se guardan a medida que se ven, con un límite de cantidad, tamaño y antigüedad para no ocupar más espacio del necesario.',
        en: 'On the first visit, the device saves both pages, the guide and this journal, with all their Spanish and English text. Photos are saved as they are viewed, within limits on number, size and age so they take no more space than needed.',
      },
      {
        es: 'Sin conexión, un aviso explica qué sigue disponible. Las fotos no guardadas lo indican en su propio espacio, y el mapa y las fuentes externas avisan de que necesitan red. Cuando hay una versión nueva, la guía lo comunica y solo se actualiza cuando el visitante lo confirma.',
        en: 'Offline, a notice explains what is still available. Unsaved photos say so in their own space, and the map and external sources warn that they need a connection. When a new version is ready, the guide says so and only updates when the visitor confirms.',
      },
      {
        es: 'Las pruebas automáticas se hicieron en un navegador de escritorio que imita un móvil. La prueba en un iPhone real queda descrita paso a paso y pendiente de realizar.',
        en: 'Automated tests ran in a desktop browser imitating a phone. The test on a real iPhone is described step by step and is still to be carried out.',
      },
    ],
  },
  {
    id: 'fase-3-movimiento',
    date: '2026-11-22',
    phase: 3,
    tags: ['Motion', 'Scroll', 'Accesibilidad', 'HIG'],
    title: {
      es: 'Fase 3 · Movimiento con propósito',
      en: 'Phase 3 · Motion with purpose',
    },
    summary: {
      es: 'Tres interacciones propias, inspiradas en mecánicas observadas y medidas en una página de producto, y adaptadas al ritmo de una guía.',
      en: 'Three interactions of our own, inspired by mechanics observed and measured on a product page, adapted to the pace of a guide.',
    },
    body: [
      {
        es: 'La portada se abre como una ventana: al desplazarse, el marco de la foto de Victoria Square crece mientras la imagen se asienta, y una segunda foto, la Biblioteca vista desde el canal, sube en primer plano. Todo sigue al scroll nativo y solo se animan transformaciones y opacidad.',
        en: 'The home page opens like a window: as you scroll, the frame around the Victoria Square photo grows while the image settles, and a second photo, the Library seen from the canal, rises in the foreground. Everything follows native scrolling and only transforms and opacity are animated.',
      },
      {
        es: 'Las secciones de cada ficha aparecen una sola vez al llegar a ellas, con un movimiento corto. Al abrir un lugar, su foto viaja desde la tarjeta hasta la cabecera de la ficha, y al volver atrás regresa por el mismo camino.',
        en: 'Each section of a place page appears once as you reach it, with a short movement. Opening a place makes its photo travel from the card to the page header, and going back returns it along the same path.',
      },
      {
        es: 'Cada gesto tiene alternativa: botones visibles, teclado y un índice que lleva el foco a cada sección. Si el sistema pide reducir el movimiento, desaparecen el paralaje, las escalas y los desplazamientos, y quedan solo fundidos breves.',
        en: 'Every gesture has an alternative: visible buttons, the keyboard and an index that moves focus to each section. If the system asks for reduced motion, parallax, scaling and sliding disappear, leaving only brief fades.',
      },
    ],
  },
  {
    id: 'fase-2-catalogo',
    date: '2026-11-22',
    phase: 2,
    tags: ['Catálogo', 'Fuentes', 'Imágenes', 'Accesibilidad'],
    title: {
      es: 'Fase 2 · Catálogo, fichas y Villa Park',
      en: 'Phase 2 · Catalogue, place pages and Villa Park',
    },
    summary: {
      es: 'Un único catálogo tipado para los diez sectores, fichas con datos prácticos citados y un registro de derechos para cada fotografía.',
      en: 'A single typed catalogue for the ten sectors, place pages with cited practical details and a rights register for every photograph.',
    },
    body: [
      {
        es: 'La guía se organiza ahora en diez sectores, de Cultura y patrimonio a Logística y seguridad del visitante. Cada ficha puede recoger dirección, opciones de transporte con parada u origen, tramo a pie, mapa, accesibilidad, fuentes y fecha de verificación.',
        en: 'The guide is now organised into ten sectors, from Culture and Heritage to Visitor Logistics and Safety. Each place page can hold an address, transport options with stop or origin, a walking leg, a map, accessibility notes, sources and a verification date.',
      },
      {
        es: 'La regla es no inventar nada: cada dato práctico enlaza con la fuente que lo respalda. Villa Park es la primera ficha verificada, con información tomada de las páginas oficiales del Aston Villa. El resto son entradas de demostración, marcadas como tales, a la espera del listado y los textos definitivos.',
        en: 'The rule is to invent nothing: every practical detail points to the source behind it. Villa Park is the first verified page, using information from Aston Villa’s official pages. The rest are demo entries, labelled as such, until the final list and texts arrive.',
      },
      {
        es: 'Cada foto tiene un registro con su origen, su autor cuando consta, el permiso y un texto alternativo en español e inglés. Las 48 están autorizadas para este proyecto académico no comercial. Se publican como variantes responsivas en WebP y JPG, sin metadatos, con su espacio reservado para que la página no salte al cargar.',
        en: 'Every photo has a record with its origin, its author where known, its permission and alt text in Spanish and English. All 48 are authorised for this non-commercial academic project. They are published as responsive WebP and JPG variants, stripped of metadata, with their space reserved so the page does not jump as it loads.',
      },
      {
        es: 'La navegación recuerda dónde estabas: al volver atrás se recuperan la posición de desplazamiento y el enlace que tenía el foco, y las vistas entran desde el lado coherente con la dirección del recorrido.',
        en: 'Navigation remembers where you were: going back restores the scroll position and the link that had focus, and views enter from the side that matches the direction of travel.',
      },
    ],
  },
  {
    id: 'fase-1-cimientos',
    date: '2026-11-22',
    phase: 1,
    tags: ['React', 'Vite', 'i18n', 'HIG'],
    title: {
      es: 'Fase 1 · Cimientos de la guía',
      en: 'Phase 1 · Laying the foundations',
    },
    summary: {
      es: 'Qué es esta web, cómo está organizada y qué decisiones se tomaron antes de añadir contenido.',
      en: 'What this site is, how it is organised and which decisions came before any content.',
    },
    body: [
      {
        es: 'Brum es una guía turística bilingüe de Birmingham, Inglaterra. Tiene dos puertas de entrada: la guía, organizada en diez sectores temáticos con fichas de lugares, y este diario, que documenta el proceso como entrega académica.',
        en: 'Brum is a bilingual travel guide to Birmingham, England. It has two front doors: the guide, organised into ten themed sectors with place pages, and this journal, which documents the process as an academic submission.',
      },
      {
        es: 'En esta fase se montó el esqueleto: dos páginas HTML reales generadas con Vite, navegación por hash para que funcione en GitHub Pages sin configuración de servidor, preferencias de idioma y tema que se aplican antes del primer pintado y una barra superior común.',
        en: 'This phase built the skeleton: two real HTML pages generated by Vite, hash navigation so it works on GitHub Pages without server configuration, language and theme preferences applied before first paint, and a shared top bar.',
      },
      {
        es: 'El diseño parte de las Human Interface Guidelines de Apple: jerarquía clara, áreas táctiles de al menos 44 px, foco visible, respuesta al pulsar y no al soltar, y movimiento con muelles críticamente amortiguados que se desactiva cuando el sistema pide movimiento reducido.',
        en: "The design starts from Apple's Human Interface Guidelines: clear hierarchy, touch targets of at least 44 px, visible focus, feedback on press rather than release, and critically damped spring motion that steps back when the system asks for reduced motion.",
      },
      {
        es: 'Las 48 fotografías originales, repartidas en once carpetas, se inventariaron en modo lectura. Todavía no forman parte de la web: se optimizarán y describirán con texto alternativo en la fase de catálogo.',
        en: 'The 48 original photographs, spread across eleven folders, were inventoried read-only. They are not part of the site yet: they will be optimised and given alt text in the catalogue phase.',
      },
    ],
  },
];
