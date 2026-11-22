/**
 * Catálogo único de la guía: sectores, lugares y destacado.
 *
 * - Las entradas `provenance: 'demo'` son de DEMOSTRACIÓN: solo tienen el nombre
 *   (tomado del archivo de foto) y el sector. No llevan textos ni datos prácticos.
 *   Sustitúyelas siguiendo docs/content-guide.md.
 * - Villa Park (`provenance: 'verified'`) usa solo datos comprobados en las fuentes
 *   oficiales citadas, con fecha. Sus textos de contexto son provisionales hasta
 *   recibir los del autor.
 */
import type { Catalog, Place, Sector, SourceRef } from './types.ts';

/* ------------------------------------------------------------------ */
/* Sectores (orden de la portada)                                      */
/* ------------------------------------------------------------------ */

const sectors: Sector[] = [
  {
    id: 'culture-heritage',
    accent: 'brick',
    glyph: 'Cu',
    sourceFolder: 'Culture_&_Heritage',
    name: { es: 'Cultura y patrimonio', en: 'Culture and Heritage' },
    summary: {
      es: 'Museos, casas históricas y los barrios artesanos que forjaron la ciudad.',
      en: 'Museums, historic houses and the craft quarters that forged the city.',
    },
  },
  {
    id: 'gastronomy-culinary',
    accent: 'spice',
    glyph: 'Ga',
    sourceFolder: 'Gastronomy_&_Culinary',
    name: { es: 'Gastronomía y cocina', en: 'Gastronomy and Culinary' },
    summary: {
      es: 'Del balti a la comida callejera y la alta cocina.',
      en: 'From balti to street food and fine dining.',
    },
  },
  {
    id: 'nature-outdoors',
    accent: 'park',
    glyph: 'Na',
    sourceFolder: 'Nature_&_Outdoors',
    name: { es: 'Naturaleza y aire libre', en: 'Nature and Outdoors' },
    summary: {
      es: 'Parques, colinas, lagos y jardines para salir del asfalto.',
      en: 'Parks, hills, lakes and gardens to step off the pavement.',
    },
  },
  {
    id: 'shopping-retail',
    accent: 'canal',
    glyph: 'Co',
    sourceFolder: 'Shopping_&_Retail',
    name: { es: 'Compras y comercio', en: 'Shopping and Retail' },
    summary: {
      es: 'Galerías victorianas y grandes centros comerciales.',
      en: 'Victorian arcades and large shopping centres.',
    },
  },
  {
    id: 'entertainment-nightlife',
    accent: 'rose',
    glyph: 'Oc',
    sourceFolder: 'Entertainment_&_Nightlife',
    name: { es: 'Ocio y vida nocturna', en: 'Entertainment and Nightlife' },
    summary: {
      es: 'Teatros, salas de conciertos y noches con música en directo.',
      en: 'Theatres, concert halls and nights of live music.',
    },
  },
  {
    id: 'family-recreation',
    accent: 'sun',
    glyph: 'Fa',
    sourceFolder: 'Family_&_Recreation',
    name: { es: 'Familia y recreo', en: 'Family and Recreation' },
    summary: {
      es: 'Planes para todas las edades, de la ciencia al chocolate.',
      en: 'Plans for all ages, from science to chocolate.',
    },
  },
  {
    id: 'education-literature',
    accent: 'violet',
    glyph: 'Ed',
    sourceFolder: 'Education_&_Literature',
    name: { es: 'Educación y literatura', en: 'Education and Literature' },
    summary: {
      es: 'Bibliotecas, universidades y rincones para lectores.',
      en: 'Libraries, universities and corners for readers.',
    },
  },
  {
    id: 'health-wellness',
    accent: 'mint',
    glyph: 'Sa',
    sourceFolder: 'Health_&_Wellness',
    name: { es: 'Salud y bienestar', en: 'Health and Wellness' },
    summary: {
      es: 'Piscinas, spas y espacios para cuidarse.',
      en: 'Pools, spas and places to look after yourself.',
    },
  },
  {
    id: 'sports-adventure',
    accent: 'sky',
    glyph: 'De',
    sourceFolder: 'Sports_&_Adventure',
    name: { es: 'Deporte y aventura', en: 'Sports and Adventure' },
    summary: {
      es: 'Estadios con historia y actividades para ponerse en marcha.',
      en: 'Storied stadiums and activities to get moving.',
    },
    coverPhotoId: 'sports-and-adventure--villa-park',
  },
  {
    id: 'visitor-logistics-safety',
    accent: 'slate',
    glyph: 'Lo',
    sourceFolder: 'Visitor_Logistics_&_Safety',
    name: { es: 'Logística y seguridad del visitante', en: 'Visitor Logistics and Safety' },
    summary: {
      es: 'Llegadas, estaciones, transporte y orientación en el centro.',
      en: 'Arrivals, stations, transport and finding your way.',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Villa Park: datos verificados                                       */
/* ------------------------------------------------------------------ */

const CHECKED = '2026-11-22';

const villaSources: SourceRef[] = [
  {
    id: 'avfc-travel',
    title: 'Travel & Parking',
    publisher: 'Aston Villa Football Club',
    url: 'https://www.avfc.co.uk/villa-park/travel-parking',
    checkedOn: CHECKED,
  },
  {
    id: 'avfc-access-travel',
    title: 'Disability & Accessibility · Travel & Transport',
    publisher: 'Aston Villa Football Club',
    url: 'https://www.avfc.co.uk/club/disability-accessibility/travel-transport/',
    checkedOn: CHECKED,
  },
  {
    id: 'avfc-first-time',
    title: 'First Time at Villa Park',
    publisher: 'Aston Villa Football Club',
    url: 'https://www.avfc.co.uk/villa-park/first-time',
    checkedOn: CHECKED,
  },
  {
    id: 'avfc-125',
    title: 'Celebrating 125 years of Villa Park',
    publisher: 'Aston Villa Football Club',
    url: 'https://www.avfc.co.uk/news/2022/april/12/125-years-of-villa-park--/',
    checkedOn: CHECKED,
  },
  {
    id: 'avfc-about',
    title: 'About Us',
    publisher: 'Aston Villa Football Club',
    url: 'https://www.avfc.co.uk/careers/about-us',
    checkedOn: CHECKED,
  },
];

const villaPark: Place = {
  id: 'villa-park',
  sectorId: 'sports-adventure',
  kind: 'venue',
  provenance: 'verified',
  verifiedOn: CHECKED,
  name: { es: 'Villa Park', en: 'Villa Park' },
  summary: {
    es: 'Estadio del Aston Villa desde 1897, a unas 2,2 millas del centro de Birmingham según el club.',
    en: 'Aston Villa’s home since 1897, about 2.2 miles from Birmingham city centre according to the club.',
  },
  address: {
    lines: ['Aston Villa Football Club', 'Villa Park', 'Birmingham'],
    postcode: 'B6 6HE',
    sourceId: 'avfc-access-travel',
  },
  map: {
    provider: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/search?query=Villa%20Park%2C%20Birmingham%20B6%206HE',
  },
  transport: [
    {
      id: 'rail-witton',
      mode: 'rail',
      stop: { es: 'Estación de Witton', en: 'Witton station' },
      service: { es: 'Línea Walsall – Birmingham New Street', en: 'Walsall – Birmingham New Street line' },
      origin: { es: 'Birmingham New Street', en: 'Birmingham New Street' },
      ride: { es: '9 min desde New Street; 15 min desde Walsall', en: '9 min from New Street; 15 min from Walsall' },
      walk: {
        minutes: '≈ 5',
        distance: { es: '0,3 millas', en: '0.3 miles' },
        note: {
          es: 'Otro apartado de la misma página del club indica «menos de 10 minutos».',
          en: 'Another section of the same club page says “less than 10 minutes”.',
        },
      },
      sourceIds: ['avfc-travel', 'avfc-access-travel'],
    },
    {
      id: 'rail-aston',
      mode: 'rail',
      stop: { es: 'Estación de Aston', en: 'Aston station' },
      service: {
        es: 'Línea Lichfield Trent Valley – Longbridge / Redditch, vía Birmingham New Street',
        en: 'Lichfield Trent Valley – Longbridge / Redditch line, via Birmingham New Street',
      },
      origin: { es: 'Birmingham New Street', en: 'Birmingham New Street' },
      ride: { es: '5–10 min desde New Street', en: '5–10 min from New Street' },
      walk: {
        minutes: '≈ 15',
        distance: { es: '0,7 millas', en: '0.7 miles' },
      },
      sourceIds: ['avfc-travel', 'avfc-access-travel'],
    },
    {
      id: 'shuttle-av82',
      mode: 'shuttle',
      service: { es: 'Lanzadera AV82 (Stagecoach)', en: 'AV82 shuttle (Stagecoach)' },
      stop: { es: 'Villa Park (vuelta desde Grosvenor Road)', en: 'Villa Park (return from Grosvenor Road)' },
      origin: {
        es: 'Exterior de Birmingham New Street, en Dudley Street',
        en: 'Outside Birmingham New Street, on Dudley Street',
      },
      availability: {
        es: 'Solo partidos en casa del equipo masculino: desde tres horas antes del inicio y hasta dos horas después del final.',
        en: 'Men’s home matches only: from three hours before kick-off until up to two hours after the final whistle.',
      },
      notes: [
        {
          es: 'Autobuses de piso bajo, accesibles en silla de ruedas. Las tarifas se publican en la página del club.',
          en: 'Low-floor buses, wheelchair accessible. Fares are published on the club page.',
        },
      ],
      sourceIds: ['avfc-travel'],
    },
    {
      id: 'bus-witton-square',
      mode: 'bus',
      service: { es: 'Líneas 7, 11A y 11C', en: 'Routes 7, 11A and 11C' },
      stop: { es: 'Witton Square', en: 'Witton Square' },
      sourceIds: ['avfc-travel'],
    },
    {
      id: 'bus-aston-station',
      mode: 'bus',
      service: { es: 'Líneas 65 y 67', en: 'Routes 65 and 67' },
      stop: { es: 'Estación de Aston', en: 'Aston railway station' },
      walk: {
        note: {
          es: 'El club las sitúa «a distancia a pie»; no publica el tiempo.',
          en: 'The club describes them as “within walking distance”; no time is published.',
        },
      },
      sourceIds: ['avfc-travel'],
    },
    {
      id: 'air-bhx',
      mode: 'air',
      stop: { es: 'Estaciones de Aston o Witton', en: 'Aston or Witton stations' },
      origin: { es: 'Aeropuerto de Birmingham', en: 'Birmingham Airport' },
      service: {
        es: 'Tren a Birmingham New Street y enlace hacia Aston o Witton',
        en: 'Train to Birmingham New Street, then change for Aston or Witton',
      },
      sourceIds: ['avfc-travel', 'avfc-access-travel'],
    },
  ],
  accessibility: [
    {
      text: {
        es: 'Aparcamiento para personas con discapacidad: se reserva con 48 horas de antelación a través del responsable de accesibilidad del club (accessibility@avfc.co.uk).',
        en: 'Disabled parking must be booked 48 hours ahead through the club’s Disability Access Officer (accessibility@avfc.co.uk).',
      },
      sourceIds: ['avfc-travel'],
    },
    {
      text: {
        es: 'En días de partido hay una zona de exclusión de tráfico. Se puede dejar a personas en los aparcamientos de la North Stand o de la Holte End antes de que entre en vigor; el club recomienda hacerlo dos horas antes del inicio.',
        en: 'A traffic exclusion zone operates on match days. Drop-offs at the North Stand or Holte End car parks are possible before it starts; the club recommends two hours before kick-off.',
      },
      sourceIds: ['avfc-access-travel'],
    },
    {
      text: {
        es: 'La lanzadera AV82 usa autobuses de piso bajo accesibles en silla de ruedas.',
        en: 'The AV82 shuttle uses low-floor, wheelchair-accessible buses.',
      },
      sourceIds: ['avfc-travel'],
    },
    {
      text: {
        es: 'El club remite a National Rail y Network West Midlands para la accesibilidad de las estaciones de Aston y Witton.',
        en: 'The club refers to National Rail and Network West Midlands for accessibility at Aston and Witton stations.',
      },
      sourceIds: ['avfc-access-travel'],
    },
  ],
  caveats: [
    {
      es: 'Las fuentes del club no coinciden en el inicio de la zona de exclusión de tráfico: «dos horas antes» (Travel & Parking) frente a «90 minutos antes» (guía de accesibilidad).',
      en: 'The club’s pages disagree on when the traffic exclusion zone starts: “two hours before” (Travel & Parking) versus “90 minutes before” (accessibility guide).',
    },
    {
      es: 'La información de transporte vale para partidos de fútbol; el club publica indicaciones distintas para los conciertos.',
      en: 'Transport information applies to football matches; the club publishes separate guidance for concerts.',
    },
  ],
  sources: villaSources,
  photoIds: ['sports-and-adventure--villa-park'],
};

/* ------------------------------------------------------------------ */
/* Entradas de demostración (sustituir por el listado del autor)       */
/* ------------------------------------------------------------------ */

type DemoSeed = [id: string, es: string, en: string, kind: Place['kind'], photoId: string];

const demo = (sectorId: Place['sectorId'], seeds: DemoSeed[]): Place[] =>
  seeds.map(([id, es, en, kind, photoId]) => ({
    id,
    sectorId,
    name: { es, en },
    kind,
    provenance: 'demo',
    photoIds: [photoId],
  }));

const demoPlaces: Place[] = [
  ...demo('culture-heritage', [
    ['aston-hall', 'Aston Hall', 'Aston Hall', 'venue', 'culture-and-heritage--aston-hall'],
    ['birmingham-back-to-backs', 'Birmingham Back to Backs', 'Birmingham Back to Backs', 'venue', 'culture-and-heritage--birmingham-back-to-backs'],
    ['birmingham-museum-and-art-gallery', 'Birmingham Museum and Art Gallery', 'Birmingham Museum and Art Gallery', 'venue', 'culture-and-heritage--birmingham-museum-and-art-gallery'],
    ['jewellery-quarter', 'Jewellery Quarter', 'Jewellery Quarter', 'area', 'culture-and-heritage--jewellery-quarter'],
  ]),
  ...demo('gastronomy-culinary', [
    ['birmingham-balti', 'Balti de Birmingham', 'Birmingham Balti', 'food', 'gastronomy-and-culinary--birmingham-balti'],
    ['digbeth-dining-club', 'Digbeth Dining Club', 'Digbeth Dining Club', 'food', 'gastronomy-and-culinary--digbeth-dining-club'],
    ['original-patty-men', 'Original Patty Men', 'Original Patty Men', 'food', 'gastronomy-and-culinary--original-patty-men'],
    ['purnells', 'Purnell’s', 'Purnell’s', 'food', 'gastronomy-and-culinary--purnells'],
  ]),
  ...demo('nature-outdoors', [
    ['birmingham-botanical-gardens', 'Birmingham Botanical Gardens', 'Birmingham Botanical Gardens', 'park', 'nature-and-outdoors--birmingham-botanical-gardens'],
    ['cannon-hill-park', 'Cannon Hill Park', 'Cannon Hill Park', 'park', 'nature-and-outdoors--cannon-hill-park'],
    ['lickey-hills', 'Lickey Hills', 'Lickey Hills', 'park', 'nature-and-outdoors--lickey-hills'],
    ['sutton-park', 'Sutton Park', 'Sutton Park', 'park', 'nature-and-outdoors--sutton-park'],
  ]),
  ...demo('shopping-retail', [
    ['bullring-and-selfridges', 'Bullring y Selfridges', 'Bullring and Selfridges', 'venue', 'shopping-and-retail--bullring-and-selfridges'],
    ['grand-central', 'Grand Central', 'Grand Central', 'venue', 'shopping-and-retail--grand-central'],
    ['great-western-arcade', 'Great Western Arcade', 'Great Western Arcade', 'venue', 'shopping-and-retail--great-western-arcade'],
    ['mailbox', 'The Mailbox', 'The Mailbox', 'venue', 'shopping-and-retail--mailbox'],
  ]),
  ...demo('entertainment-nightlife', [
    ['birmingham-hippodrome', 'Birmingham Hippodrome', 'Birmingham Hippodrome', 'venue', 'entertainment-and-nightlife--birmingham-hippodrome'],
    ['o2-academy-birmingham', 'O2 Academy Birmingham', 'O2 Academy Birmingham', 'venue', 'entertainment-and-nightlife--o2-academy-birmingham'],
    ['symphony-hall', 'Symphony Hall', 'Symphony Hall', 'venue', 'entertainment-and-nightlife--symphony-hall'],
    ['the-night-owl', 'The Night Owl', 'The Night Owl', 'venue', 'entertainment-and-nightlife--the-night-owl'],
  ]),
  ...demo('family-recreation', [
    ['cadbury-world', 'Cadbury World', 'Cadbury World', 'venue', 'family-and-recreation--cadbury-world'],
    ['legoland-discovery-centre', 'LEGOLAND Discovery Centre', 'LEGOLAND Discovery Centre', 'venue', 'family-and-recreation--legoland-discovery-centre'],
    ['national-sea-life-centre', 'National SEA LIFE Centre', 'National SEA LIFE Centre', 'venue', 'family-and-recreation--national-sea-life-centre'],
    ['thinktank-science-museum', 'Thinktank Science Museum', 'Thinktank Science Museum', 'venue', 'family-and-recreation--thinktank-science-museum'],
  ]),
  ...demo('education-literature', [
    ['birmingham-city-university', 'Birmingham City University', 'Birmingham City University', 'venue', 'education-and-literature--birmingham-city-university'],
    ['library-of-birmingham', 'Biblioteca de Birmingham', 'Library of Birmingham', 'venue', 'education-and-literature--library-of-birmingham-book-rotunda'],
    ['shakespeare-memorial-room', 'Shakespeare Memorial Room', 'Shakespeare Memorial Room', 'venue', 'education-and-literature--shakespeare-memorial-room'],
    ['university-of-birmingham', 'Universidad de Birmingham', 'University of Birmingham', 'venue', 'education-and-literature--university-of-birmingham'],
  ]),
  ...demo('health-wellness', [
    ['bannatyne-spa', 'Bannatyne Spa', 'Bannatyne Spa', 'venue', 'health-and-wellness--bannatyne-spa'],
    ['harborne-pool-and-fitness-centre', 'Harborne Pool and Fitness Centre', 'Harborne Pool and Fitness Centre', 'venue', 'health-and-wellness--harborne-pool-and-fitness-centre'],
    ['moseley-road-baths', 'Moseley Road Baths', 'Moseley Road Baths', 'venue', 'health-and-wellness--moseley-road-baths'],
    ['santai-spa', 'Santai Spa', 'Santai Spa', 'venue', 'health-and-wellness--santai-spa'],
  ]),
  ...demo('sports-adventure', [
    ['ackers-adventure', 'Ackers Adventure', 'Ackers Adventure', 'venue', 'sports-and-adventure--ackers-adventure'],
    ['alexander-stadium', 'Alexander Stadium', 'Alexander Stadium', 'venue', 'sports-and-adventure--alexander-stadium'],
    ['edgbaston-cricket-ground', 'Edgbaston Cricket Ground', 'Edgbaston Cricket Ground', 'venue', 'sports-and-adventure--edgbaston-cricket-ground'],
  ]),
  ...demo('visitor-logistics-safety', [
    ['birmingham-airport', 'Aeropuerto de Birmingham', 'Birmingham Airport', 'transport-hub', 'visitor-logistics-and-safety--birmingham-airport'],
    ['birmingham-new-street-station', 'Estación de Birmingham New Street', 'Birmingham New Street Station', 'transport-hub', 'visitor-logistics-and-safety--birmingham-new-street-station'],
    ['city-centre-wayfinding', 'Señalización del centro', 'City Centre Wayfinding', 'service', 'visitor-logistics-and-safety--city-centre-wayfinding'],
    ['west-midlands-metro', 'West Midlands Metro', 'West Midlands Metro', 'transport-hub', 'visitor-logistics-and-safety--west-midlands-metro'],
  ]),
];

/* ------------------------------------------------------------------ */
/* Destacado: Aston Villa y Villa Park                                 */
/* ------------------------------------------------------------------ */

export const catalog: Catalog = {
  sectors,
  places: [...demoPlaces.slice(0, 32), villaPark, ...demoPlaces.slice(32)],
  featured: {
    placeId: 'villa-park',
    textStatus: 'provisional',
    eyebrow: { es: 'Destacado', en: 'Featured' },
    title: { es: 'Aston Villa en Villa Park', en: 'Aston Villa at Villa Park' },
    intro: {
      es: 'Un club fundador de la Football League y un estadio con más de un siglo de historia, a un trayecto corto en tren desde New Street.',
      en: 'A founding club of the Football League and a stadium with more than a century of history, a short train ride from New Street.',
    },
    blocks: [
      {
        id: 'club',
        heading: { es: 'El club', en: 'The club' },
        paragraphs: [
          {
            es: 'El Aston Villa nació en 1874, cuando miembros de un club de críquet decidieron jugar al fútbol. Su directivo William McGregor impulsó la creación de la Football League en 1888, de la que el club es miembro fundador.',
            en: 'Aston Villa began in 1874, when members of a cricket club chose to play football. Club director William McGregor led the creation of the Football League in 1888, of which Villa are founder members.',
          },
          {
            es: 'Es uno de los seis clubes ingleses que han ganado la Copa de Europa, que levantó en 1982.',
            en: 'It is one of six English clubs to have won the European Cup, which it lifted in 1982.',
          },
        ],
        sourceIds: ['avfc-about'],
      },
      {
        id: 'stadium',
        heading: { es: 'El estadio', en: 'The stadium' },
        paragraphs: [
          {
            es: 'Villa Park es la casa del club desde el 17 de abril de 1897. El terreno formaba parte de los antiguos Aston Lower Grounds, un parque de atracciones y jardines del siglo XIX.',
            en: 'Villa Park has been the club’s home since 17 April 1897. The site was part of the former Aston Lower Grounds, a 19th-century amusement park and gardens.',
          },
          {
            es: 'Conserva cuatro gradas independientes con carácter propio. La más conocida es la Holte End, de dos pisos y con capacidad para más de 13 000 espectadores. El estadio ha acogido partidos de un Mundial y de una Eurocopa y más semifinales de la FA Cup que ningún otro recinto.',
            en: 'It keeps four separate stands, each with its own character. The best known is the two-tier Holte End, holding more than 13,000 supporters. The ground has staged World Cup and European Championship matches and more FA Cup semi-finals than any other venue.',
          },
        ],
        sourceIds: ['avfc-125', 'avfc-travel'],
      },
      {
        id: 'visitor',
        heading: { es: 'La visita', en: 'Visiting' },
        paragraphs: [
          {
            es: 'En día de partido, los tornos suelen abrir 90 minutos antes del inicio y el calentamiento empieza unos 45 minutos antes. El estadio no admite efectivo y no permite bolsas mayores que un A4.',
            en: 'On match days the turnstiles usually open 90 minutes before kick-off and the warm-up starts about 45 minutes before. The stadium is cashless and bags larger than A4 are not allowed.',
          },
          {
            es: 'La tienda Villa Village está en el aparcamiento de la North Stand. El club recomienda usar el transporte público, porque hay cortes de tráfico y zonas de aparcamiento solo para residentes.',
            en: 'The Villa Village store is in the North Stand car park. The club recommends public transport, as there are road closures and residents-only parking zones.',
          },
        ],
        sourceIds: ['avfc-first-time', 'avfc-travel'],
      },
    ],
  },
};
