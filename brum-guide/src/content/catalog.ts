/** Catálogo bilingüe con información práctica atribuida a sus fuentes. */
import type { Catalog, Place, Sector, SourceRef } from './types.ts';
import { enrich } from './details/index.ts';

/* ------------------------------------------------------------------ */
/* Sectores (orden de la portada)                                      */
/* ------------------------------------------------------------------ */

const sectors: Sector[] = [
  {
    id: 'culture-heritage',
    accent: 'brick',
    glyph: 'Cu',
    sourceFolder: 'Culture_&_Heritage',
    coverPhotoId: 'culture-heritage-cover',
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
    coverPhotoId: 'gastronomy-culinary-cover',
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
    coverPhotoId: 'nature-outdoors-cover',
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
    coverPhotoId: 'shopping-retail-cover',
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
    coverPhotoId: 'entertainment-nightlife-cover',
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
    coverPhotoId: 'family-recreation-cover',
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
    coverPhotoId: 'education-literature-cover',
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
    coverPhotoId: 'health-wellness-cover',
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
    coverPhotoId: 'sports-adventure-cover',
    name: { es: 'Deporte y aventura', en: 'Sports and Adventure' },
    summary: {
      es: 'Estadios con historia y actividades para ponerse en marcha.',
      en: 'Storied stadiums and activities to get moving.',
    },
  },
  {
    id: 'visitor-logistics-safety',
    accent: 'slate',
    glyph: 'Lo',
    sourceFolder: 'Visitor_Logistics_&_Safety',
    coverPhotoId: 'visitor_logistics-safety-cover',
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
const places: Place[] = [
  {
    "id": "aston-hall",
    "sectorId": "culture-heritage",
    "name": {
      "es": "Aston Hall",
      "en": "Aston Hall"
    },
    "kind": "venue",
    "photoIds": [
      "culture-and-heritage--aston-hall"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una mansión jacobina en Aston.",
      "en": "A Jacobean mansion in Aston."
    },
    "description": [
      {
        "es": "Recorre con la mirada la gran escalera de roble y la larga galería. La residencia que Thomas Holte hizo construir en el siglo XVII cuenta una historia muy distinta a la del estadio vecino.",
        "en": "Look for the oak staircase and the Long Gallery. Thomas Holte’s seventeenth-century house tells a very different story from the stadium next door."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Aston Hall | Birmingham Museums",
        "publisher": "birminghammuseums.org.uk",
        "url": "https://www.birminghammuseums.org.uk/aston-hall",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "How to get here | Aston Hall | Birmingham Museums",
        "publisher": "birminghammuseums.org.uk",
        "url": "https://www.birminghammuseums.org.uk/aston-hall/visit/how-to-get-here",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Trinity Road, Aston"
      ],
      "postcode": "B6 6JD",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Trinity%20Road%2C%20Aston%2C%20B6%206JD%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "birmingham-back-to-backs",
    "sectorId": "culture-heritage",
    "name": {
      "es": "Birmingham Back to Backs",
      "en": "Birmingham Back to Backs"
    },
    "kind": "venue",
    "photoIds": [
      "culture-and-heritage--birmingham-back-to-backs"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Casas obreras que comparten patio y paredes.",
      "en": "Working households once shared these walls and this courtyard."
    },
    "description": [
      {
        "es": "La visita guiada comienza cerca del Hippodrome. Dentro del patio se entiende mejor cómo se organizaba la vida doméstica en un espacio tan estrecho.",
        "en": "The guided visit begins near the Hippodrome. Once inside the court, the narrow footprint makes it easier to picture how families organised daily life."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Book your visit to Birmingham Back to Backs | National Trust",
        "publisher": "nationaltrust.org.uk",
        "url": "https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/birmingham-back-to-backs/booking-your-visit-to-birmingham-back-to-backs",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Birmingham Back to Backs | West Midlands | National Trust",
        "publisher": "nationaltrust.org.uk",
        "url": "https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/birmingham-back-to-backs",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Birmingham%20Back%20to%20Backs%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "birmingham-museum-and-art-gallery",
    "sectorId": "culture-heritage",
    "name": {
      "es": "Birmingham Museum and Art Gallery",
      "en": "Birmingham Museum and Art Gallery"
    },
    "kind": "venue",
    "photoIds": [
      "culture-and-heritage--birmingham-museum-and-art-gallery"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El museo de Chamberlain Square une arte y ciudad.",
      "en": "A city museum with its front door on Chamberlain Square."
    },
    "description": [
      {
        "es": "Acércate por la plaza para apreciar la relación entre el museo y el Council House. Dentro, elige una galería para recorrerla con calma antes de volver a salir al centro.",
        "en": "Approach across the square to see how the museum fits alongside the Council House. Choose a gallery to linger in before heading back into the city."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "How to get here | Birmingham Museum & Art Gallery | Birmingham Museums",
        "publisher": "birminghammuseums.org.uk",
        "url": "https://www.birminghammuseums.org.uk/birmingham-museum-and-art-gallery/visit/how-to-get-here",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Chamberlain Square"
      ],
      "postcode": "B3 3DH",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Chamberlain%20Square%2C%20B3%203DH%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Town Hall",
          "en": "Town Hall"
        },
        "service": {
          "es": "West Midlands Metro, Line 1",
          "en": "West Midlands Metro, Line 1"
        },
        "origin": {
          "es": "Grand Central",
          "en": "Grand Central"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "jewellery-quarter",
    "sectorId": "culture-heritage",
    "name": {
      "es": "Jewellery Quarter",
      "en": "Jewellery Quarter"
    },
    "kind": "area",
    "photoIds": [
      "culture-and-heritage--jewellery-quarter"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un barrio para seguir el oficio de la joyería.",
      "en": "Follow the jewellery trade through a working neighbourhood."
    },
    "description": [
      {
        "es": "Vyse Street es un buen punto de partida. Alterna los escaparates con las calles de talleres para ver cómo se reúnen la fabricación y la venta en el mismo barrio.",
        "en": "Start on Vyse Street. Turn away from the shop windows into the workshop streets to see how closely making and selling sit together here."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Oﬃcial V ISITO R GUIDE The Jewellery Quarter BIRM",
        "publisher": "jewelleryquarter.net",
        "url": "https://jewelleryquarter.net/wp-content/uploads/2023/08/JQBID-VisitorLeaflet-2019-Online_compressed.pdf",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Jewellery%20Quarter%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Jewellery Quarter",
          "en": "Jewellery Quarter"
        },
        "origin": {
          "es": "Birmingham Snow Hill",
          "en": "Birmingham Snow Hill"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "birmingham-balti",
    "sectorId": "gastronomy-culinary",
    "name": {
      "es": "Balti de Birmingham",
      "en": "Birmingham Balti"
    },
    "kind": "food",
    "photoIds": [
      "gastronomy-and-culinary--birmingham-balti"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El balti se conoce mejor en la mesa de Sparkbrook.",
      "en": "Taste a Birmingham balti in Sparkbrook."
    },
    "description": [
      {
        "es": "La parada propuesta es Shababs, en Ladypool Road. Pide un balti para conocer el plato que ha dado nombre al triángulo gastronómico de este barrio.",
        "en": "The suggested stop is Shababs on Ladypool Road. Order a balti to explore the dish that gave this neighbourhood’s Balti Triangle its name."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Contact Us – Shababs Balti Restaurant",
        "publisher": "shababs.co.uk",
        "url": "https://www.shababs.co.uk/contact-us/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "163–165 Ladypool Road, Sparkbrook"
      ],
      "postcode": "B12 8LQ",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=163%E2%80%93165%20Ladypool%20Road%2C%20Sparkbrook%2C%20B12%208LQ%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "digbeth-dining-club",
    "sectorId": "gastronomy-culinary",
    "name": {
      "es": "Digbeth Dining Club",
      "en": "Digbeth Dining Club"
    },
    "kind": "food",
    "photoIds": [
      "gastronomy-and-culinary--digbeth-dining-club"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Comida callejera con sede y cartel según la fecha.",
      "en": "Street food with a changing line-up and locations."
    },
    "description": [
      {
        "es": "Herbert’s Yard, en Longbridge, es una de las sedes que anuncia Digbeth Dining Club. Comprueba el lugar de tu sesión en su agenda antes de ponerte en camino.",
        "en": "Herbert’s Yard in Longbridge is one of the venues on Digbeth Dining Club’s calendar. Check the listing for your chosen session before setting out."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Sip and Paint- November | Street Food Events On At The Digbeth Dining Club",
        "publisher": "digbethdiningclub.com",
        "url": "https://digbethdiningclub.com/event/sip-and-paint-herberts-yard-2-2",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Herbert’s Yard, 59 Austin Way, Rednal"
      ],
      "postcode": "B31 2TW",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Herbert%E2%80%99s%20Yard%2C%2059%20Austin%20Way%2C%20Rednal%2C%20B31%202TW%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "original-patty-men",
    "sectorId": "gastronomy-culinary",
    "name": {
      "es": "Original Patty Men",
      "en": "Original Patty Men"
    },
    "kind": "food",
    "photoIds": [
      "gastronomy-and-culinary--original-patty-men"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Hamburguesas en Shaws Passage, en Digbeth.",
      "en": "Burgers on Shaws Passage in Digbeth."
    },
    "description": [
      {
        "es": "Esta ficha corresponde al local de Digbeth. Si hay espera, el restaurante indica que puedes acercarte a Kilder, el bar de al lado.",
        "en": "This entry covers the Digbeth restaurant. If there is a wait, the team suggests heading next door to its bar, Kilder."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Original Patty Men",
        "publisher": "originalpattymen.co.uk",
        "url": "https://www.originalpattymen.co.uk/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "9 Shaws Passage, Digbeth"
      ],
      "postcode": "B5 5JG",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=9%20Shaws%20Passage%2C%20Digbeth%2C%20B5%205JG%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "purnells",
    "sectorId": "gastronomy-culinary",
    "name": {
      "es": "Purnell’s",
      "en": "Purnell’s"
    },
    "kind": "food",
    "photoIds": [
      "gastronomy-and-culinary--purnells"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una página de la historia gastronómica de Birmingham.",
      "en": "A chapter in Birmingham’s restaurant history."
    },
    "description": [
      {
        "es": "El antiguo restaurante de Glynn Purnell ayudó a situar la cocina del distrito de Colmore en el mapa Michelin. Esta parada recuerda aquella mesa y su legado culinario.",
        "en": "Glynn Purnell’s former flagship helped put Colmore’s dining rooms on the Michelin map. This entry looks back at that restaurant and its place in the city’s food story."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Yummy Brummie Glynn Purnell opens new tapas bar in Birmingham",
        "publisher": "visitbirmingham.com",
        "url": "https://visitbirmingham.com/blog/post/yummy-brummie-glynn-purnell-opens-new-tapas-bar-in-birmingham/",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Glynn Purnell and Phil Innes announce new Birmingham restaurant: Trillium",
        "publisher": "visitbirmingham.com",
        "url": "https://visitbirmingham.com/press-media/post/glynn-purnell-and-phil-innes-announce-new-birmingham-restaurant-trillium/",
        "checkedOn": "2026-11-22"
      }
    ]
  },
  {
    "id": "birmingham-botanical-gardens",
    "sectorId": "nature-outdoors",
    "name": {
      "es": "Birmingham Botanical Gardens",
      "en": "Birmingham Botanical Gardens"
    },
    "kind": "park",
    "photoIds": [
      "nature-and-outdoors--birmingham-botanical-gardens"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un paseo entre invernaderos y jardines en Edgbaston.",
      "en": "Glasshouses and garden walks in Edgbaston."
    },
    "description": [
      {
        "es": "Combina un tramo al aire libre con los invernaderos para apreciar cómo cambia la vegetación. La guía de acceso explica qué recorridos admiten silla de ruedas.",
        "en": "Pair an outdoor walk with the glasshouses to see how the planting changes. The access guide describes routes suitable for wheelchair users."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Visitor Information | Birmingham Botanical Gardens",
        "publisher": "birminghambotanicalgardens.org.uk",
        "url": "https://birminghambotanicalgardens.org.uk/plan-your-visit/visitor-information/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Westbourne Road, Edgbaston"
      ],
      "postcode": "B15 3TR",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Westbourne%20Road%2C%20Edgbaston%2C%20B15%203TR%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Edgbaston Village",
          "en": "Edgbaston Village"
        },
        "walk": {
          "minutes": "8"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Se puede reservar silla de ruedas con antelación.",
          "en": "Wheelchairs can be reserved in advance."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "cannon-hill-park",
    "sectorId": "nature-outdoors",
    "name": {
      "es": "Cannon Hill Park",
      "en": "Cannon Hill Park"
    },
    "kind": "park",
    "photoIds": [
      "nature-and-outdoors--cannon-hill-park"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un parque de barrio con varias puertas de entrada.",
      "en": "A neighbourhood park with a choice of entrances."
    },
    "description": [
      {
        "es": "Russell Road, Edgbaston Road y Pershore Road dan acceso al parque. Escoge la puerta antes de salir, sobre todo si vas a quedar con alguien.",
        "en": "Russell Road, Edgbaston Road and Pershore Road all lead into the park. Agree on a gate before you leave, especially if meeting friends."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Cannon Hill Park",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/directory_record/9091/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Russell Road, Moseley"
      ],
      "postcode": "B13 8RD",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Russell%20Road%2C%20Moseley%2C%20B13%208RD%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "bus",
        "mode": "bus",
        "stop": {
          "es": "Edgbaston Road",
          "en": "Edgbaston Road"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "lickey-hills",
    "sectorId": "nature-outdoors",
    "name": {
      "es": "Lickey Hills",
      "en": "Lickey Hills"
    },
    "kind": "park",
    "photoIds": [
      "nature-and-outdoors--lickey-hills"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Senderos por las colinas al suroeste de Birmingham.",
      "en": "Walking trails in the hills southwest of Birmingham."
    },
    "description": [
      {
        "es": "Warren Lane lleva al centro de visitantes. Llegar en tren convierte la subida desde Barnt Green por Fiery Hill Road en la primera parte de la excursión.",
        "en": "Warren Lane leads to the visitor centre. Arriving by train makes the uphill approach from Barnt Green along Fiery Hill Road the first part of the outing."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Lickey Hills Country Park",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/directory_record/9128/lickey_hills_country_park",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Warren Lane, Rednal"
      ],
      "postcode": "B45 8ER",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Warren%20Lane%2C%20Rednal%2C%20B45%208ER%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Barnt Green",
          "en": "Barnt Green"
        },
        "walk": {
          "minutes": "25"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "sutton-park",
    "sectorId": "nature-outdoors",
    "name": {
      "es": "Sutton Park",
      "en": "Sutton Park"
    },
    "kind": "park",
    "photoIds": [
      "nature-and-outdoors--sutton-park"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un gran espacio abierto en Sutton Coldfield.",
      "en": "Open country in Sutton Coldfield."
    },
    "description": [
      {
        "es": "Consulta el plano de las entradas antes de elegir el paseo. El ayuntamiento distingue el centro de visitantes, Banner’s Gate y Wyndley como puntos con aseos.",
        "en": "Check the gate map before choosing a walk. The council lists toilets at the visitor centre, Banner’s Gate and Wyndley, which makes these useful points for planning a route."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Sutton Park",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/info/20089/parks/405/sutton_park/5",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Park Road, Sutton Coldfield"
      ],
      "postcode": "B73 6BT",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Park%20Road%2C%20Sutton%20Coldfield%2C%20B73%206BT%2C%20Birmingham%2C%20UK"
    },
    "accessibility": [
      {
        "text": {
          "es": "El ayuntamiento enlaza una guía de acceso del parque y del centro de visitantes.",
          "en": "The council links to an access guide for the park and visitor centre."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "bullring-and-selfridges",
    "sectorId": "shopping-retail",
    "name": {
      "es": "Bullring y Selfridges",
      "en": "Bullring and Selfridges"
    },
    "kind": "venue",
    "photoIds": [
      "shopping-and-retail--bullring-and-selfridges"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Grandes almacenes con una fachada inconfundible.",
      "en": "A department store with a distinctive curved exterior."
    },
    "description": [
      {
        "es": "Desde fuera se aprecia la silueta de Selfridges. Dentro, la visita cambia de escala entre moda, belleza y restauración.",
        "en": "Take in the outline of Selfridges from outside. Inside, the scale changes again as you move between fashion, beauty and places to eat."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Birmingham | Selfridges",
        "publisher": "selfridges.com",
        "url": "https://www.selfridges.com/GB/en/stores/birmingham/",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Bullring%20and%20Selfridges%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "grand-central",
    "sectorId": "shopping-retail",
    "name": {
      "es": "Grand Central",
      "en": "Grand Central"
    },
    "kind": "venue",
    "photoIds": [
      "shopping-and-retail--grand-central"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Tiendas junto al vestíbulo de New Street.",
      "en": "Shops above the New Street concourse."
    },
    "description": [
      {
        "es": "Las escaleras mecánicas de la estación llevan a Grand Central. Es una parada cómoda para hacer una compra o comer entre dos trenes.",
        "en": "Escalators lead up from the station into Grand Central. It makes a convenient place for a meal or a shopping stop between trains."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Accessibility at Bullring & Grand Central: Parking & Support",
        "publisher": "bullring.co.uk",
        "url": "https://www.bullring.co.uk/accessibility",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Grand%20Central%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "great-western-arcade",
    "sectorId": "shopping-retail",
    "name": {
      "es": "Great Western Arcade",
      "en": "Great Western Arcade"
    },
    "kind": "venue",
    "photoIds": [
      "shopping-and-retail--great-western-arcade"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una galería comercial entre dos calles del centro.",
      "en": "A shopping passage linking two city streets."
    },
    "description": [
      {
        "es": "Entra por Colmore Row y sal por Temple Row. El recorrido por los comercios independientes funciona también como un pequeño atajo cubierto.",
        "en": "Enter from Colmore Row and leave by Temple Row. Browsing the independent shops doubles as a short covered route through the business district."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Visit Us - Great Western Arcade",
        "publisher": "greatwesternarcade.co.uk",
        "url": "https://greatwesternarcade.co.uk/visit-us",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Colmore Row"
      ],
      "postcode": "B2 5HU",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Colmore%20Row%2C%20B2%205HU%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "mailbox",
    "sectorId": "shopping-retail",
    "name": {
      "es": "The Mailbox",
      "en": "The Mailbox"
    },
    "kind": "venue",
    "photoIds": [
      "shopping-and-retail--mailbox"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Compras y restaurantes junto al canal.",
      "en": "Shops and restaurants by the canal."
    },
    "description": [
      {
        "es": "Puedes llegar desde New Street y continuar a pie hacia el agua. La transición entre el interior comercial y el paseo del canal es parte del interés de la visita.",
        "en": "Walk over from New Street and continue towards the water. Moving from the shopping interior to the canal path is part of the appeal."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "The perfect address",
        "publisher": "mailboxlife.com",
        "url": "https://mailboxlife.com/wp-content/uploads/2025/10/Mailbox_FirstClass_Brochure.pdf",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Plan Your Visit - Mailboxlife",
        "publisher": "mailboxlife.com",
        "url": "https://mailboxlife.com/visitors/plan-your-visit/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Royal Mail Street"
      ],
      "postcode": "B1 1RD",
      "sourceId": "official-2"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Royal%20Mail%20Street%2C%20B1%201RD%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "walk": {
          "minutes": "3"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Desde las plazas adaptadas hay recorridos sin escalones hacia tiendas y restaurantes.",
          "en": "Step-free routes link accessible parking bays to shops and restaurants."
        },
        "sourceIds": [
          "official-2"
        ]
      }
    ]
  },
  {
    "id": "birmingham-hippodrome",
    "sectorId": "entertainment-nightlife",
    "name": {
      "es": "Birmingham Hippodrome",
      "en": "Birmingham Hippodrome"
    },
    "kind": "venue",
    "photoIds": [
      "entertainment-and-nightlife--birmingham-hippodrome"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un escenario en el corazón de Southside.",
      "en": "A theatre at the heart of Southside."
    },
    "description": [
      {
        "es": "La entrada principal está en Hurst Street. Para el Patrick Studio, consulta también el acceso de Thorp Street antes de elegir por dónde acercarte.",
        "en": "The main entrance is on Hurst Street. For the Patrick Studio, check the Thorp Street approach before choosing your route."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting Here – Birmingham Hippodrome",
        "publisher": "birminghamhippodrome.com",
        "url": "https://www.birminghamhippodrome.com/plan-your-visit/essential-info/getting-here/",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Accessible Facilities – Birmingham Hippodrome",
        "publisher": "birminghamhippodrome.com",
        "url": "https://www.birminghamhippodrome.com/plan-your-visit/access/accessible-facilities/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Hurst Street, Southside"
      ],
      "postcode": "B5 4TB",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Hurst%20Street%2C%20Southside%2C%20B5%204TB%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Los ascensores dan acceso a las plantas 1 a 4.",
          "en": "Lifts serve levels 1 to 4."
        },
        "sourceIds": [
          "official-2"
        ]
      }
    ]
  },
  {
    "id": "o2-academy-birmingham",
    "sectorId": "entertainment-nightlife",
    "name": {
      "es": "O2 Academy Birmingham",
      "en": "O2 Academy Birmingham"
    },
    "kind": "venue",
    "photoIds": [
      "entertainment-and-nightlife--o2-academy-birmingham"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Música en directo cerca de New Street.",
      "en": "Live music within reach of New Street."
    },
    "description": [
      {
        "es": "Comprueba en la entrada qué sala acoge tu concierto. La información de accesibilidad del operador describe por separado las plataformas y los accesos de cada sala.",
        "en": "Check your ticket for the room hosting your show. The operator’s access guide describes the viewing areas and approaches for each room separately."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting here | O2 Academy Birmingham",
        "publisher": "academymusicgroup.com",
        "url": "https://www.academymusicgroup.com/o2academybirmingham/getting-here",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Accessibility | O2 Academy Birmingham",
        "publisher": "academymusicgroup.com",
        "url": "https://www.academymusicgroup.com/o2academybirmingham/accessibility",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=O2%20Academy%20Birmingham%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Un ascensor comunica con la zona de visión elevada de la sala principal.",
          "en": "A lift serves the raised viewing area in the main room."
        },
        "sourceIds": [
          "official-2"
        ]
      }
    ]
  },
  {
    "id": "symphony-hall",
    "sectorId": "entertainment-nightlife",
    "name": {
      "es": "Symphony Hall",
      "en": "Symphony Hall"
    },
    "kind": "venue",
    "photoIds": [
      "entertainment-and-nightlife--symphony-hall"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "La sala de conciertos de Centenary Square.",
      "en": "The concert hall on Centenary Square."
    },
    "description": [
      {
        "es": "La parada Library te deja junto a la fachada de la plaza. Para escoger localidad, consulta los planos de acceso del auditorio antes de reservar.",
        "en": "The Library tram stop brings you to the square-side entrance. Check the hall’s access information when choosing seats."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting Here: Symphony Hall | B:Music",
        "publisher": "bmusic.co.uk",
        "url": "https://bmusic.co.uk/your-visit/symphony-hall/getting-here",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Accessibility Information: Symphony Hall | B:Music",
        "publisher": "bmusic.co.uk",
        "url": "https://bmusic.co.uk/accessibility-information-symphony-hall",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "8 Centenary Square"
      ],
      "postcode": "B1 2EA",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=8%20Centenary%20Square%2C%20B1%202EA%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Library",
          "en": "Library"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "La entrada de Centenary Square permite llegar sin escalones al nivel 3.",
          "en": "The entrance on Centenary Square provides level access to level 3."
        },
        "sourceIds": [
          "official-2"
        ]
      }
    ]
  },
  {
    "id": "the-night-owl",
    "sectorId": "entertainment-nightlife",
    "name": {
      "es": "The Night Owl",
      "en": "The Night Owl"
    },
    "kind": "venue",
    "photoIds": [
      "entertainment-and-nightlife--the-night-owl"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Música y baile en Lower Trinity Street.",
      "en": "Music and dancing on Lower Trinity Street."
    },
    "description": [
      {
        "es": "Para llegar a la sala de Digbeth, el tramo desde las estaciones del centro es más largo que desde las paradas de autobús de la calle principal. Elige el regreso antes del concierto.",
        "en": "The walk to this Digbeth venue is longer from the city stations than from the high-street bus stops. Plan the return leg before the gig."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting Here - The Night Owl Birmingham",
        "publisher": "thenightowl.club",
        "url": "https://thenightowl.club/getting-here/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "17–18 Lower Trinity Street, Digbeth"
      ],
      "postcode": "B9 4AG",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=17%E2%80%9318%20Lower%20Trinity%20Street%2C%20Digbeth%2C%20B9%204AG%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham Moor Street",
          "en": "Birmingham Moor Street"
        },
        "walk": {
          "minutes": "≤ 15"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "cadbury-world",
    "sectorId": "family-recreation",
    "name": {
      "es": "Cadbury World",
      "en": "Cadbury World"
    },
    "kind": "venue",
    "photoIds": [
      "family-and-recreation--cadbury-world"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una visita familiar dedicada al chocolate en Bournville.",
      "en": "A family chocolate attraction in Bournville."
    },
    "description": [
      {
        "es": "Desde la estación, las señales de Cadbury World conducen a través del recinto. El paseo permite situar la atracción dentro del barrio de Cadbury.",
        "en": "From the station, Cadbury World signs lead through the grounds. The walk puts the attraction in the context of the surrounding Cadbury neighbourhood."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Cadbury World: Directions",
        "publisher": "cadburyworld.co.uk",
        "url": "https://cadburyworld.co.uk/plan-your-visit/before-you-visit/directions/",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Cadbury%20World%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Bournville",
          "en": "Bournville"
        },
        "service": {
          "es": "Cross-City Line",
          "en": "Cross-City Line"
        },
        "origin": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "walk": {
          "minutes": "15"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "La estación de Bournville admite sillas de ruedas.",
          "en": "Bournville station has wheelchair access."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "legoland-discovery-centre",
    "sectorId": "family-recreation",
    "name": {
      "es": "LEGOLAND Discovery Centre",
      "en": "LEGOLAND Discovery Centre"
    },
    "kind": "venue",
    "photoIds": [
      "family-and-recreation--legoland-discovery-centre"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una parada de construcción y juego junto al Arena.",
      "en": "A building-and-play stop beside the Arena."
    },
    "description": [
      {
        "es": "Si combinas dos visitas familiares el mismo día, sitúa primero el Arena en el mapa. La entrada indicada por el centro queda en King Edwards Road.",
        "en": "If you are combining family attractions, find the Arena on the map first. The centre gives its entrance address on King Edwards Road."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Directions & Parking | LEGOLAND® Discovery Centre Birmingham",
        "publisher": "cms.birmingham.legolanddiscoverycentre.com",
        "url": "https://cms.birmingham.legolanddiscoverycentre.com/birmingham/plan-your-visit/before-you-visit/directions-parking/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Arena, King Edwards Road"
      ],
      "postcode": "B1 2AA",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Arena%2C%20King%20Edwards%20Road%2C%20B1%202AA%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Brindleyplace",
          "en": "Brindleyplace"
        },
        "walk": {
          "minutes": "4"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "national-sea-life-centre",
    "sectorId": "family-recreation",
    "name": {
      "es": "National SEA LIFE Centre",
      "en": "National SEA LIFE Centre"
    },
    "kind": "venue",
    "photoIds": [
      "family-and-recreation--national-sea-life-centre"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un acuario junto al agua de Brindleyplace.",
      "en": "An aquarium on the waterside at Brindleyplace."
    },
    "description": [
      {
        "es": "Desde el tranvía, continúa a pie hasta The Water’s Edge. La llegada por el canal enlaza el recorrido exterior con la visita al acuario.",
        "en": "Continue on foot from the tram to The Water’s Edge. The canal approach connects an outdoor walk with a visit to the aquarium."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Travel and Directions | SEA LIFE Birmingham Aquarium",
        "publisher": "visitsealife.com",
        "url": "https://www.visitsealife.com/birmingham/plan-your-visit/before-you-visit/directions-parking/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "The Water’s Edge, Brindleyplace"
      ],
      "postcode": "B1 2HL",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=The%20Water%E2%80%99s%20Edge%2C%20Brindleyplace%2C%20B1%202HL%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Brindleyplace",
          "en": "Brindleyplace"
        },
        "walk": {
          "minutes": "2"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "thinktank-science-museum",
    "sectorId": "family-recreation",
    "name": {
      "es": "Thinktank Science Museum",
      "en": "Thinktank Science Museum"
    },
    "kind": "venue",
    "photoIds": [
      "family-and-recreation--thinktank-science-museum"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El museo de ciencia en Millennium Point.",
      "en": "The science museum inside Millennium Point."
    },
    "description": [
      {
        "es": "Desde Moor Street, la ruta del museo atraviesa el parque y pasa junto al Science Garden. Busca la entrada en la planta baja de Millennium Point.",
        "en": "From Moor Street, the museum’s route crosses the park and passes the Science Garden. Look for the entrance on level zero of Millennium Point."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "How to get here | Thinktank | Birmingham Museums",
        "publisher": "birminghammuseums.org.uk",
        "url": "https://www.birminghammuseums.org.uk/thinktank/visit/how-to-get-here",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Millennium Point"
      ],
      "postcode": "B4 7XG",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Millennium%20Point%2C%20B4%207XG%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham Moor Street",
          "en": "Birmingham Moor Street"
        },
        "walk": {
          "minutes": "10"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "La entrada principal del museo está en el nivel 0 de Millennium Point.",
          "en": "The main museum entrance is on level 0 of Millennium Point."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "birmingham-city-university",
    "sectorId": "education-literature",
    "name": {
      "es": "Birmingham City University",
      "en": "Birmingham City University"
    },
    "kind": "venue",
    "photoIds": [
      "education-and-literature--birmingham-city-university"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El campus urbano visto desde el edificio Curzon.",
      "en": "Explore the city campus from the Curzon building."
    },
    "description": [
      {
        "es": "En Cardigan Street coinciden varias sedes de la universidad. Usa el nombre del edificio en tu itinerario para distinguir Curzon de Parkside y Joseph Priestley.",
        "en": "Several university buildings share Cardigan Street. Use the building name in your itinerary to distinguish Curzon from Parkside and Joseph Priestley."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "City Centre Campus - Map and Directions | Birmingham City University",
        "publisher": "bcu.ac.uk",
        "url": "https://www.bcu.ac.uk/about-us/maps-and-campuses/city-centre-campus/map-and-directions/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Curzon Building, 4 Cardigan Street"
      ],
      "postcode": "B4 7BD",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Curzon%20Building%2C%204%20Cardigan%20Street%2C%20B4%207BD%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "library-of-birmingham",
    "sectorId": "education-literature",
    "name": {
      "es": "Biblioteca de Birmingham",
      "en": "Library of Birmingham"
    },
    "kind": "venue",
    "photoIds": [
      "education-and-literature--library-of-birmingham-book-rotunda"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una biblioteca pública que da a Centenary Square.",
      "en": "A public library overlooking Centenary Square."
    },
    "description": [
      {
        "es": "El acceso desde la plaza ayuda a situar la biblioteca entre los espacios cívicos del centro. Desde allí puedes continuar hasta la sala dedicada a Shakespeare.",
        "en": "The square-side approach places the library among the civic buildings of the centre. Once inside, continue to the room dedicated to Shakespeare."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting to the Library of Birmingham",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/info/50132/visiting_the_library_of_birmingham/1408/getting_to_the_library_of_birmingham",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Library of Birmingham",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/directory_record/3613/library_of_birmingham",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Centenary Square, Broad Street"
      ],
      "postcode": "B1 2ND",
      "sourceId": "official-2"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Centenary%20Square%2C%20Broad%20Street%2C%20B1%202ND%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "walk": {
          "minutes": "10–15"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "shakespeare-memorial-room",
    "sectorId": "education-literature",
    "name": {
      "es": "Shakespeare Memorial Room",
      "en": "Shakespeare Memorial Room"
    },
    "kind": "venue",
    "photoIds": [
      "education-and-literature--shakespeare-memorial-room"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una sala histórica en lo alto de la biblioteca.",
      "en": "A historic room high inside the library."
    },
    "description": [
      {
        "es": "La ruta hasta la novena planta forma parte de la visita. La sala se alcanza por ascensor o escaleras, dentro del mismo edificio de Centenary Square.",
        "en": "The route up to the ninth floor is part of the visit. A lift or stairs lead to the room within the Centenary Square library building."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Holding an exhibition at the Library of Birmingham",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/info/20087/libraries/2664/holding_an_exhibition_at_the_library_of_birmingham/4",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Getting to the Library of Birmingham",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/info/50132/visiting_the_library_of_birmingham/1408/getting_to_the_library_of_birmingham",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Shakespeare%20Memorial%20Room%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "walk": {
          "minutes": "10–15"
        },
        "sourceIds": [
          "official-2"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Se llega a la sala por ascensor o por escalera.",
          "en": "The room can be reached by lift or stairs."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "university-of-birmingham",
    "sectorId": "education-literature",
    "name": {
      "es": "Universidad de Birmingham",
      "en": "University of Birmingham"
    },
    "kind": "venue",
    "photoIds": [
      "education-and-literature--university-of-birmingham"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un campus con su propia estación de tren.",
      "en": "A university campus with its own railway station."
    },
    "description": [
      {
        "es": "La línea Cross-City conecta el centro con Edgbaston. Desde University, recorre a pie el último tramo hasta el centro del campus.",
        "en": "The Cross-City line connects the city centre to Edgbaston. From University station, finish the journey on foot to the middle of campus."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Getting to campus - University of Birmingham",
        "publisher": "birmingham.ac.uk",
        "url": "https://www.birmingham.ac.uk/contact/directions",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Edgbaston Campus"
      ],
      "postcode": "B15 2TT",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Edgbaston%20Campus%2C%20B15%202TT%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "University",
          "en": "University"
        },
        "service": {
          "es": "Cross-City Line",
          "en": "Cross-City Line"
        },
        "origin": {
          "es": "Birmingham New Street",
          "en": "Birmingham New Street"
        },
        "walk": {
          "minutes": "5"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "bannatyne-spa",
    "sectorId": "health-wellness",
    "name": {
      "es": "Bannatyne Spa",
      "en": "Bannatyne Spa"
    },
    "kind": "venue",
    "photoIds": [
      "health-and-wellness--bannatyne-spa"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una pausa de bienestar en Brindleyplace.",
      "en": "A health-club stop in Brindleyplace."
    },
    "description": [
      {
        "es": "El club y spa está en Brunswick Arcade. Consulta con el centro las condiciones de acceso a la zona de piscina para la modalidad de visita que prefieras.",
        "en": "The health club and spa is in Brunswick Arcade. Check poolside access with the club for the kind of visit you have in mind."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Get in Touch with Birmingham (Brindleyplace) at Birmingham - Brindleyplace Bannatyne Health Club",
        "publisher": "bannatyne.co.uk",
        "url": "https://www.bannatyne.co.uk/health-club/birmingham-brindleyplace/contact-us",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "3 Brunswick Arcade, Brindleyplace"
      ],
      "postcode": "B1 2JF",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=3%20Brunswick%20Arcade%2C%20Brindleyplace%2C%20B1%202JF%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "harborne-pool-and-fitness-centre",
    "sectorId": "health-wellness",
    "name": {
      "es": "Harborne Pool and Fitness Centre",
      "en": "Harborne Pool and Fitness Centre"
    },
    "kind": "venue",
    "photoIds": [
      "health-and-wellness--harborne-pool-and-fitness-centre"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Piscina y actividad física en Harborne.",
      "en": "Swimming and exercise in Harborne."
    },
    "description": [
      {
        "es": "El centro combina natación, gimnasio y clases. Consulta la programación de la actividad que te interesa antes de desplazarte a Lordswood Road.",
        "en": "The centre combines swimming, gym sessions and classes. Check the timetable for your activity before travelling to Lordswood Road."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Harborne Pool and Fitness Centre | Harborne",
        "publisher": "placesleisure.org",
        "url": "https://www.placesleisure.org/centres/harborne-pool-and-fitness-centre/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Lordswood Road, Harborne"
      ],
      "postcode": "B17 9QS",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Lordswood%20Road%2C%20Harborne%2C%20B17%209QS%2C%20Birmingham%2C%20UK"
    },
    "accessibility": [
      {
        "text": {
          "es": "El centro dispone de rampas y equipamiento accesible para sillas de ruedas.",
          "en": "The centre provides ramps and wheelchair-accessible equipment."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "moseley-road-baths",
    "sectorId": "health-wellness",
    "name": {
      "es": "Moseley Road Baths",
      "en": "Moseley Road Baths"
    },
    "kind": "venue",
    "photoIds": [
      "health-and-wellness--moseley-road-baths"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Los baños de Balsall Heath, en restauración.",
      "en": "The Balsall Heath baths, under restoration."
    },
    "description": [
      {
        "es": "El operador informa de que la piscina permanece cerrada por obras. Incluye el edificio como parada patrimonial y consulta sus noticias antes de planear un baño.",
        "en": "The operator reports that the pool is closed for refurbishment. Treat the building as a heritage stop and check its updates before planning a swim."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Contact us – Moseley Road Baths",
        "publisher": "moseleyroadbaths.org.uk",
        "url": "https://moseleyroadbaths.org.uk/contact-us/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "497 Moseley Road, Balsall Heath"
      ],
      "postcode": "B12 9BX",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=497%20Moseley%20Road%2C%20Balsall%20Heath%2C%20B12%209BX%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "santai-spa",
    "sectorId": "health-wellness",
    "name": {
      "es": "Santai Spa",
      "en": "Santai Spa"
    },
    "kind": "venue",
    "photoIds": [
      "health-and-wellness--santai-spa"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una parada de spa en Resorts World Birmingham.",
      "en": "A spa stop at Resorts World Birmingham."
    },
    "description": [
      {
        "es": "Sitúa la visita en Pendigo Way, en el complejo de Resorts World. Consulta directamente las experiencias y condiciones de la sesión elegida.",
        "en": "Plan for Pendigo Way at the Resorts World complex. Check the experience and entry conditions for your chosen session directly with the spa."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "The Spa | Santai Spa",
        "publisher": "resortsworldbirmingham.onejourney.travel",
        "url": "https://resortsworldbirmingham.onejourney.travel/spa",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Pendigo Way, Resorts World Birmingham"
      ],
      "postcode": "B40 1PU",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Pendigo%20Way%2C%20Resorts%20World%20Birmingham%2C%20B40%201PU%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "ackers-adventure",
    "sectorId": "sports-adventure",
    "name": {
      "es": "Ackers Adventure",
      "en": "Ackers Adventure"
    },
    "kind": "venue",
    "photoIds": [
      "sports-and-adventure--ackers-adventure"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Aventura al aire libre en Small Heath.",
      "en": "Outdoor adventure in Small Heath."
    },
    "description": [
      {
        "es": "La pista de esquí y el área residencial tienen puntos de llegada diferentes. Para la actividad reservada, comprueba cuál aparece en las indicaciones de Ackers.",
        "en": "The ski centre and the residential centre have different arrival points. Match your booked activity to the directions published by Ackers."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Contact - Ackers Adventure",
        "publisher": "ackers-adventure.co.uk",
        "url": "https://ackers-adventure.co.uk/contact/",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Golden Hillock Road"
      ],
      "postcode": "B11 2PY",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Golden%20Hillock%20Road%2C%20B11%202PY%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Small Heath",
          "en": "Small Heath"
        },
        "origin": {
          "es": "Birmingham Moor Street",
          "en": "Birmingham Moor Street"
        },
        "walk": {
          "minutes": "15"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "alexander-stadium",
    "sectorId": "sports-adventure",
    "name": {
      "es": "Alexander Stadium",
      "en": "Alexander Stadium"
    },
    "kind": "venue",
    "photoIds": [
      "sports-and-adventure--alexander-stadium"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Una parada para conocer el atletismo de Perry Barr.",
      "en": "An athletics stop in Perry Barr."
    },
    "description": [
      {
        "es": "En el complejo de Walsall Road conviven el estadio y otros espacios de entrenamiento. Identifica el recinto de tu actividad antes de salir.",
        "en": "The Walsall Road complex includes the stadium and other training facilities. Check which part of the site hosts your event."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Alexander Stadium",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/alexanderstadium",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Walsall Road, Perry Barr"
      ],
      "postcode": "B42 2LR",
      "sourceId": "official"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Walsall%20Road%2C%20Perry%20Barr%2C%20B42%202LR%2C%20Birmingham%2C%20UK"
    }
  },
  {
    "id": "edgbaston-cricket-ground",
    "sectorId": "sports-adventure",
    "name": {
      "es": "Edgbaston Cricket Ground",
      "en": "Edgbaston Cricket Ground"
    },
    "kind": "venue",
    "photoIds": [
      "sports-and-adventure--edgbaston-cricket-ground"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El críquet de Birmingham se vive en Edgbaston.",
      "en": "Edgbaston is a place to experience Birmingham cricket."
    },
    "description": [
      {
        "es": "El plan de viaje cambia con el partido. El estadio anuncia lanzaderas en encuentros seleccionados y recomienda reservar el aparcamiento antes de llegar.",
        "en": "Travel arrangements depend on the fixture. The ground lists shuttles for selected matches and asks drivers to book parking in advance."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Travel to Edgbaston",
        "publisher": "edgbaston.com",
        "url": "https://www.edgbaston.com/england/travel",
        "checkedOn": "2026-11-22"
      },
      {
        "id": "official-2",
        "title": "Getting to Edgbaston Stadium | Travel, Directions & Parking",
        "publisher": "edgbaston.com",
        "url": "https://www.edgbaston.com/events/travel",
        "checkedOn": "2026-11-22"
      }
    ],
    "address": {
      "lines": [
        "Edgbaston Road"
      ],
      "postcode": "B5 7QU",
      "sourceId": "official-2"
    },
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Edgbaston%20Road%2C%20B5%207QU%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "rail",
        "mode": "rail",
        "stop": {
          "es": "Moseley Village",
          "en": "Moseley Village"
        },
        "walk": {
          "minutes": "15–20"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "birmingham-airport",
    "sectorId": "visitor-logistics-safety",
    "name": {
      "es": "Aeropuerto de Birmingham",
      "en": "Birmingham Airport"
    },
    "kind": "transport-hub",
    "photoIds": [
      "visitor-logistics-and-safety--birmingham-airport"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "La puerta aérea de la ciudad y su enlace ferroviario.",
      "en": "The city’s air gateway and its railway connection."
    },
    "description": [
      {
        "es": "Birmingham International es la estación del aeropuerto. El Air-Rail Link une su primera planta con la terminal, desde donde un ascensor baja a facturación.",
        "en": "Birmingham International is the airport station. The Air-Rail Link connects its first floor to the terminal, with a lift down to check-in."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Directions and Transport FAQs | Birmingham Airport",
        "publisher": "birminghamairport.co.uk",
        "url": "https://www.birminghamairport.co.uk/customer-support/directions-and-transport-faqs/",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Birmingham%20Airport%2C%20Birmingham%2C%20UK"
    },
    "transport": [
      {
        "id": "shuttle",
        "mode": "shuttle",
        "stop": {
          "es": "Birmingham Airport",
          "en": "Birmingham Airport"
        },
        "service": {
          "es": "Air-Rail Link",
          "en": "Air-Rail Link"
        },
        "origin": {
          "es": "Birmingham International",
          "en": "Birmingham International"
        },
        "sourceIds": [
          "official"
        ]
      }
    ],
    "accessibility": [
      {
        "text": {
          "es": "Hay ascensor desde la llegada del Air-Rail Link hasta la planta de facturación.",
          "en": "A lift connects Air-Rail Link arrivals with the check-in floor."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "birmingham-new-street-station",
    "sectorId": "visitor-logistics-safety",
    "name": {
      "es": "Estación de Birmingham New Street",
      "en": "Birmingham New Street Station"
    },
    "kind": "transport-hub",
    "photoIds": [
      "visitor-logistics-and-safety--birmingham-new-street-station"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Un punto de transbordo bajo el centro urbano.",
      "en": "A rail interchange beneath the city centre."
    },
    "description": [
      {
        "es": "Elige la salida según la calle a la que vayas. La guía de Network Rail distingue accesos desde la calle y recorridos hasta los andenes.",
        "en": "Choose an exit for the street you need. Network Rail’s station guide distinguishes routes in from street level from access to the platforms."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Network Rail Birmingham Station Guide",
        "publisher": "networkrail.co.uk",
        "url": "https://www.networkrail.co.uk/wp-content/uploads/2022/11/Birmingham-New-Street-accessible-station-guide.pdf",
        "checkedOn": "2026-11-22"
      }
    ],
    "map": {
      "provider": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/search?query=Birmingham%20New%20Street%20Station%2C%20Birmingham%2C%20UK"
    },
    "accessibility": [
      {
        "text": {
          "es": "Hay acceso sin escalones por el ascensor del cruce de Station Street y Hill Street.",
          "en": "A lift at the junction of Station Street and Hill Street provides step-free access."
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  },
  {
    "id": "city-centre-wayfinding",
    "sectorId": "visitor-logistics-safety",
    "name": {
      "es": "Señalización del centro",
      "en": "City Centre Wayfinding"
    },
    "kind": "service",
    "photoIds": [
      "visitor-logistics-and-safety--city-centre-wayfinding"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "Cómo leer los mapas peatonales del centro.",
      "en": "Finding your way with the city’s pedestrian maps."
    },
    "description": [
      {
        "es": "Los tótems del ayuntamiento sirven como puntos de orientación entre dos paradas. Busca tu destino en el plano antes de escoger el siguiente cruce.",
        "en": "The council’s map totems offer a reference point between stops. Find your destination on the map before choosing the next crossing."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Wayfinding and information maps",
        "publisher": "birmingham.gov.uk",
        "url": "https://www.birmingham.gov.uk/info/20110/report_road_and_pavement_issues/2949/wayfinding_and_information_maps",
        "checkedOn": "2026-11-22"
      }
    ]
  },
  {
    "id": "west-midlands-metro",
    "sectorId": "visitor-logistics-safety",
    "name": {
      "es": "West Midlands Metro",
      "en": "West Midlands Metro"
    },
    "kind": "transport-hub",
    "photoIds": [
      "visitor-logistics-and-safety--west-midlands-metro"
    ],
    "provenance": "author",
    "verifiedOn": "2026-11-22",
    "summary": {
      "es": "El centro de Birmingham en tranvía.",
      "en": "Central Birmingham by tram."
    },
    "description": [
      {
        "es": "Usa el plano de paradas del operador para relacionar el itinerario con el destino. Library sirve a Centenary Square y Brindleyplace acerca al visitante a los canales.",
        "en": "Match your destination to the operator’s stop map. Library serves Centenary Square and Brindleyplace brings visitors closer to the canals."
      }
    ],
    "sources": [
      {
        "id": "official",
        "title": "Tram Stop Maps - West Midlands Metro",
        "publisher": "westmidlandsmetro.com",
        "url": "https://www.westmidlandsmetro.com/maps/",
        "checkedOn": "2026-11-22"
      }
    ],
    "transport": [
      {
        "id": "tram",
        "mode": "tram",
        "stop": {
          "es": "Library Centenary Square",
          "en": "Library Centenary Square"
        },
        "service": {
          "es": "West Midlands Metro",
          "en": "West Midlands Metro"
        },
        "sourceIds": [
          "official"
        ]
      }
    ]
  }
];

/* Destacado: Aston Villa y Villa Park                                 */
/* ------------------------------------------------------------------ */

export const catalog: Catalog = {
  sectors,
  places: [...places.slice(0, 32), villaPark, ...places.slice(32)].map(enrich),
  featured: {
    placeId: 'villa-park',
    textStatus: 'author',
    eyebrow: { es: 'Destacado', en: 'Featured' },
    title: { es: 'Aston Villa en Villa Park', en: 'Aston Villa at Villa Park' },
    intro: {
      es: 'Sigue la historia del fútbol de Aston desde los primeros jugadores de críquet hasta la grada de la Holte End.',
      en: 'Trace Aston’s football story from its first cricketers to the terraces of the Holte End.',
    },
    blocks: [
      {
        id: 'club',
        heading: { es: 'El club', en: 'The club' },
        paragraphs: [{"es":"Aston Villa nació en 1874. De aquella iniciativa de jugadores de críquet salió un club que participó en la fundación de la Football League en 1888 y levantó la Copa de Europa en 1982.","en":"Founded in 1874 by cricketers, Villa helped establish the Football League in 1888. The European Cup won in 1982 took the story of this Aston club far beyond Birmingham."}],
        sourceIds: ['avfc-about'],
      },
      {
        id: 'stadium',
        heading: { es: 'El estadio', en: 'The stadium' },
        paragraphs: [{"es":"El equipo se instaló en los antiguos Aston Lower Grounds en 1897. Al acercarte, busca la Holte End: su doble graderío permite leer el estadio como cuatro tribunas con identidad propia.","en":"Villa moved to the former Aston Lower Grounds in 1897. Look for the two tiers of the Holte End as you approach: they make it easy to pick out one of the ground’s four distinct stands."}],
        sourceIds: ['avfc-125', 'avfc-travel'],
      },
      {
        id: 'visitor',
        heading: { es: 'La visita', en: 'Visiting' },
        paragraphs: [{"es":"Planea el regreso a la vez que la llegada. Las restricciones de tráfico de un día de partido hacen especialmente útiles las estaciones de Witton y Aston; consulta la guía del club para tu encuentro.","en":"Plan the journey home alongside the trip out. Matchday road restrictions make Witton and Aston stations particularly useful; check the club’s travel notes for your fixture."}],
        sourceIds: ['avfc-first-time', 'avfc-travel'],
      },
    ],
  },
};
