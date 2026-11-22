/**
 * Secciones de planificación: Antes de viajar, Moverse, Rutas de un día,
 * Agenda anual y Habla brummie. Cada dato cita su fuente; lo que ninguna
 * fuente publica (frecuencias, tiempos, precios) se omite.
 */
import type { LocalizedText, SourceRef, TransportMode } from './types.ts';
import { c, src, t } from './details/helpers.ts';
import type { CitedText } from './types.ts';

export const TFWM_PLANNER = 'https://journeyplanner.tfwm.org.uk/';

export const travelSources: SourceRef[] = [
  src('vb-practical', 'Practical information', 'VisitBritain', 'https://www.visitbritain.com/gb/en/plan-your-trip/practical-information'),
  src('metoffice-winterbourne', 'Birmingham Winterbourne No. 2: climate averages 1981-2010', 'Met Office', 'https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages/gcqdsfz6q'),
  src('uob-directions', 'Directions', 'University of Birmingham', 'https://www.birmingham.ac.uk/contact/directions'),
  src('tfwm-swiftgo', 'Swift Go', 'Transport for West Midlands', 'https://www.tfwm.org.uk/swift-and-tickets/swift-go/'),
  src('tfwm-planner', 'Journey planner', 'Transport for West Midlands', TFWM_PLANNER),
  src('wmca-lime', 'Lime to run West Midlands cycle and e-scooter hire', 'West Midlands Combined Authority', 'https://www.wmca.org.uk/news/lime-to-run-west-midlands-cycle-and-e-scooter-hire/'),
  src('bm-tt-getting', 'How to get here · Thinktank', 'Birmingham Museums', 'https://www.birminghammuseums.org.uk/thinktank/visit/how-to-get-here'),
  src('bcc-xmas', 'Birmingham Christmas Market', 'Birmingham City Council', 'https://www.birmingham.gov.uk/christmasmarket'),
  src('bcc-pride', 'Birmingham Pride', 'Birmingham City Council', 'https://www.birmingham.gov.uk/events/event/5273/birmingham_pride'),
  src('vb-stpatricks', 'St Patrick’s in Birmingham', 'Visit Birmingham', 'https://visitbirmingham.com/whats-on/st-patricks'),
  src('bm-aston-visit', 'Visit Aston Hall', 'Birmingham Museums', 'https://www.birminghammuseums.org.uk/aston-hall/visit'),
  src('nt-b2b-booking', 'Booking your visit to Birmingham Back to Backs', 'National Trust', 'https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/birmingham-back-to-backs/booking-your-visit-to-birmingham-back-to-backs'),
  src('bcu-dictionary', 'The Birmingham dictionary', 'Birmingham City University', 'https://www.bcu.ac.uk/student-info/preparing-for-university/birmingham-dictionary'),
];

export const findTravelSource = (id: string) => travelSources.find((s) => s.id === id);

/* ----------------------------------------------------------- Antes de viajar */

export interface TravelTopic {
  id: string;
  title: LocalizedText;
  items: CitedText[];
}

export const beforeYouGo: TravelTopic[] = [
  {
    id: 'money',
    title: t('Dinero y pagos', 'Money and payments'),
    items: [
      c('La moneda es la libra esterlina (£).', 'The currency is the pound sterling (£).', 'vb-practical'),
      c('El pago sin contacto está muy extendido.', 'Contactless payment is widely used.', 'vb-practical'),
      c(
        'La propina no se espera del mismo modo que en otros países; en restaurantes, revisa si el servicio ya va incluido en la cuenta.',
        'Tipping is not expected in the same way as in some countries; in restaurants, check whether service is already on the bill.',
        'vb-practical',
      ),
    ],
  },
  {
    id: 'power',
    title: t('Enchufes', 'Plugs'),
    items: [c('Enchufe de tipo G (tres patillas rectangulares), a 220-240 V. Lleva un adaptador.', 'Type G plugs (three rectangular pins), at 220-240 V. Bring an adapter.', 'vb-practical')],
  },
  {
    id: 'weather',
    title: t('Tiempo', 'Weather'),
    items: [
      c(
        'Media anual en la estación de Winterbourne (1981-2010): máximas de unos 13,9 °C, mínimas de unos 6,3 °C y unos 809 mm de lluvia al año.',
        'Annual averages at the Winterbourne station (1981-2010): highs around 13.9 °C, lows around 6.3 °C and about 809 mm of rain a year.',
        'metoffice-winterbourne',
      ),
      c(
        'Diciembre es el mes más frío de la serie: máximas medias de 7,3 °C y mínimas de 1,9 °C. Lleva siempre una capa impermeable.',
        'December is the coldest month in the series: average highs of 7.3 °C and lows of 1.9 °C. Always pack a waterproof layer.',
        'metoffice-winterbourne',
      ),
    ],
  },
  {
    id: 'arrival',
    title: t('Llegar a la ciudad', 'Getting to the city'),
    items: [
      c(
        'Desde el aeropuerto, el Air-Rail Link gratuito lleva a la estación Birmingham International, con trenes a New Street.',
        'From the airport, the free Air-Rail Link runs to Birmingham International station, with trains to New Street.',
        'uob-directions',
      ),
      c(
        'Hay autocares exprés frecuentes desde Londres, Heathrow, Gatwick y muchas ciudades del Reino Unido. La estación de autocares de larga distancia está en Digbeth, en el centro.',
        'There are frequent express coaches from London, Heathrow, Gatwick and many UK cities. The long-distance coach station is in Digbeth, in the city centre.',
        'uob-directions',
      ),
      c('Hay paradas de taxi en New Street y por todo el centro.', 'There are taxi ranks at New Street station and throughout the city centre.', 'uob-directions'),
    ],
  },
];

/* --------------------------------------------------------------- Moverse */

export const gettingAround: TravelTopic[] = [
  {
    id: 'swift-go',
    title: t('Autobús y tranvía con Swift Go', 'Bus and tram with Swift Go'),
    items: [
      c(
        'Swift Go permite viajar en todos los tranvías y en la mayoría de autobuses sin comprar billete antes; el sistema calcula la tarifa.',
        'Swift Go lets you travel on all trams and most buses without buying a ticket first; the system works out your fare.',
        'tfwm-swiftgo',
      ),
      c('En el autobús se valida al subir; no hace falta validar al bajar.', 'On the bus, tap when you get on; you do not need to tap off.', 'tfwm-swiftgo'),
      c(
        'Hay tope de tarifa: nunca pagas más que el tope de día, de tres días o semanal. El tope diario es de £4,50 en autobús y £7,90 en autobús y tranvía; no sirve en el tren.',
        'Fares are capped: you never pay more than the day, 3-day or weekly cap. The daily cap is £4.50 for bus and £7.90 for bus and tram; it is not valid on trains.',
        'tfwm-swiftgo',
      ),
    ],
  },
  {
    id: 'tram',
    title: t('Tranvía', 'Tram'),
    items: [
      c(
        'El tranvía West Midlands Metro llega ya hasta Millennium Point, en Eastside, pasando por Albert Street, con servicios cada 15 minutos en ese ramal.',
        'The West Midlands Metro tram now runs to Millennium Point in Eastside via Albert Street, with services every 15 minutes on that branch.',
        'bm-tt-getting',
      ),
    ],
  },
  {
    id: 'rail',
    title: t('Tren de cercanías', 'Local trains'),
    items: [
      c(
        'La línea Cross-City une New Street con la estación University con cuatro trenes por hora, en unos diez minutos.',
        'The Cross-City line links New Street with University station, with four trains an hour, in about ten minutes.',
        'uob-directions',
      ),
    ],
  },
  {
    id: 'cycle',
    title: t('Bicicleta y canales', 'Cycling and canals'),
    items: [
      c(
        'Desde el 1 de abril de 2026, Lime gestiona el alquiler de bicis y patinetes eléctricos de West Midlands.',
        'Since 1 April 2026, Lime runs the West Midlands bike and e-scooter hire scheme.',
        'wmca-lime',
      ),
      c(
        'El camino del canal de Worcester y Birmingham va del centro al campus de Edgbaston, para ir a pie o en bici.',
        'The Worcester & Birmingham Canal towpath runs from the city centre to the Edgbaston campus, on foot or by bike.',
        'uob-directions',
      ),
    ],
  },
  {
    id: 'planner',
    title: t('Planifica cada trayecto', 'Plan each journey'),
    items: [
      c(
        'Para horarios y frecuencias del día, usa el planificador de TfWM: esta guía no publica tiempos que las fuentes no dan.',
        'For the day’s times and frequencies, use the TfWM journey planner: this guide does not publish times its sources do not give.',
        'tfwm-planner',
      ),
    ],
  },
];

/* ------------------------------------------------------------ Rutas de un día */

export interface RouteStop {
  placeId: string;
  note: LocalizedText;
}
export interface RouteLeg {
  mode: TransportMode | 'walk';
  text: LocalizedText;
  /** Ficha cuyas fuentes respaldan el tramo. */
  sourcePlaceId: string;
}
export interface DayRoute {
  id: string;
  title: LocalizedText;
  mood: LocalizedText;
  /** Paradas con el tramo que lleva a cada una (el primero, desde el centro). */
  steps: Array<{ leg: RouteLeg; stop: RouteStop }>;
}

export const dayRoutes: DayRoute[] = [
  {
    id: 'canals',
    title: t('Canales y plazas', 'Canals and squares'),
    mood: t('Ladrillo, agua y las grandes plazas del centro, todo a pie.', 'Brick, water and the big central squares, all on foot.'),
    steps: [
      {
        leg: { mode: 'walk', text: t('3 min a pie desde New Street.', '3 min on foot from New Street.'), sourcePlaceId: 'mailbox' },
        stop: { placeId: 'mailbox', note: t('Empieza junto al canal.', 'Start on the canal.') },
      },
      {
        leg: { mode: 'tram', text: t('Tranvía hasta la parada Library, junto a la entrada.', 'Tram to Library stop, by the entrance.'), sourcePlaceId: 'symphony-hall' },
        stop: { placeId: 'library-of-birmingham', note: t('Sube a la planta 9 y la sala de Shakespeare.', 'Go up to floor 9 and the Shakespeare room.') },
      },
      {
        leg: { mode: 'walk', text: t('A pie hasta Chamberlain Square.', 'On foot to Chamberlain Square.'), sourcePlaceId: 'birmingham-museum-and-art-gallery' },
        stop: { placeId: 'birmingham-museum-and-art-gallery', note: t('Prerrafaelitas y tesoro de Staffordshire; entrada gratuita.', 'Pre-Raphaelites and the Staffordshire Hoard; free entry.') },
      },
      {
        leg: { mode: 'walk', text: t('A pie hasta Colmore Row.', 'On foot to Colmore Row.'), sourcePlaceId: 'great-western-arcade' },
        stop: { placeId: 'great-western-arcade', note: t('Termina bajo la cubierta victoriana.', 'Finish under the Victorian roof.') },
      },
    ],
  },
  {
    id: 'makers',
    title: t('Oficio y escenarios', 'Makers and stages'),
    mood: t('Talleres que se pararon en el tiempo y una noche de teatro.', 'Workshops frozen in time and a night at the theatre.'),
    steps: [
      {
        leg: { mode: 'rail', text: t('Tren de Snow Hill a Jewellery Quarter: una parada.', 'Train from Snow Hill to Jewellery Quarter: one stop.'), sourcePlaceId: 'jewellery-quarter' },
        stop: { placeId: 'jewellery-quarter', note: t('El taller Smith & Pepper (de jueves a domingo).', 'The Smith & Pepper workshop (Thursday to Sunday).') },
      },
      {
        leg: { mode: 'rail', text: t('Vuelve al centro; la recepción está frente a Hippodrome Square.', 'Head back to the centre; reception faces Hippodrome Square.'), sourcePlaceId: 'birmingham-back-to-backs' },
        stop: { placeId: 'birmingham-back-to-backs', note: t('Visita guiada con reserva.', 'Guided tour, booked ahead.') },
      },
      {
        leg: { mode: 'walk', text: t('A la vuelta de la esquina, en Hurst Street.', 'Round the corner on Hurst Street.'), sourcePlaceId: 'birmingham-hippodrome' },
        stop: { placeId: 'birmingham-hippodrome', note: t('Cierra con una función.', 'End with a show.') },
      },
    ],
  },
  {
    id: 'aston',
    title: t('Aston, de la mansión al estadio', 'Aston, from mansion to stadium'),
    mood: t('Cuatro siglos de historia y la Holte End en una sola tarde.', 'Four centuries of history and the Holte End in one afternoon.'),
    steps: [
      {
        leg: { mode: 'rail', text: t('Tren de New Street a Aston (8 min) y 10 min a pie.', 'Train from New Street to Aston (8 min) and a 10-minute walk.'), sourcePlaceId: 'aston-hall' },
        stop: { placeId: 'aston-hall', note: t('Comprueba antes la temporada de apertura.', 'Check the opening season first.') },
      },
      {
        leg: { mode: 'walk', text: t('Al lado de Aston Hall.', 'Right next to Aston Hall.'), sourcePlaceId: 'villa-park' },
        stop: { placeId: 'villa-park', note: t('Busca la Holte End.', 'Look for the Holte End.') },
      },
    ],
  },
  {
    id: 'green',
    title: t('Edgbaston verde', 'Green Edgbaston'),
    mood: t('Campus, canal y jardines a pocos minutos del centro.', 'Campus, canal and gardens minutes from the centre.'),
    steps: [
      {
        leg: { mode: 'rail', text: t('Cross-City de New Street a University (unos 10 min) y 5 min a pie.', 'Cross-City from New Street to University (about 10 min) and a 5-minute walk.'), sourcePlaceId: 'university-of-birmingham' },
        stop: { placeId: 'university-of-birmingham', note: t('O llega a pie por el camino del canal.', 'Or walk in along the canal towpath.') },
      },
      {
        leg: { mode: 'tram', text: t('Desde el centro, tranvía a Edgbaston Village y 8 min a pie.', 'From the centre, tram to Edgbaston Village and an 8-minute walk.'), sourcePlaceId: 'birmingham-botanical-gardens' },
        stop: { placeId: 'birmingham-botanical-gardens', note: t('Lleva un pícnic.', 'Bring a picnic.') },
      },
    ],
  },
];

/* --------------------------------------------------------------- Agenda anual */

export interface AgendaItem {
  id: string;
  /** Meses (1-12) en que suele celebrarse. */
  months: number[];
  title: LocalizedText;
  text: LocalizedText;
  placeId?: string;
  sourceIds: string[];
}

export const agenda: AgendaItem[] = [
  {
    id: 'aston-season',
    months: [2],
    title: t('Aston Hall reabre su temporada', 'Aston Hall reopens for the season'),
    text: t('Tras el cierre de invierno, la casa vuelve a su horario el 13 de febrero de 2027.', 'After the winter closure, the house returns to normal hours on 13 February 2027.'),
    placeId: 'aston-hall',
    sourceIds: ['bm-aston-visit'],
  },
  {
    id: 'st-patricks',
    months: [3],
    title: t('San Patricio en Digbeth', 'St Patrick’s in Digbeth'),
    text: t('Desfile y fiesta irlandesa en Digbeth, en torno al 17 de marzo.', 'An Irish parade and festival in Digbeth, around 17 March.'),
    sourceIds: ['vb-stpatricks'],
  },
  {
    id: 'pride',
    months: [5],
    title: t('Birmingham Pride', 'Birmingham Pride'),
    text: t('El fin de semana del puente de primavera, en el barrio de Hurst Street. En 2026, el 23 y 24 de mayo.', 'The spring bank holiday weekend, around Hurst Street. In 2026, 23-24 May.'),
    sourceIds: ['bcc-pride'],
  },
  {
    id: 'christmas-market',
    months: [11, 12],
    title: t('Mercado navideño de Fráncfort', 'Frankfurt Christmas Market'),
    text: t('Casetas y luces por el centro de noviembre a diciembre.', 'Stalls and lights across the centre from November to December.'),
    sourceIds: ['bcc-xmas'],
  },
  {
    id: 'b2b-festive',
    months: [12],
    title: t('Navidad en las Back to Backs', 'Christmas at the Back to Backs'),
    text: t('En las fiestas de 2026, visita libre los martes y domingos.', 'Over the 2026 holidays, a self-led visit on Tuesdays and Sundays.'),
    placeId: 'birmingham-back-to-backs',
    sourceIds: ['nt-b2b-booking'],
  },
];

/* --------------------------------------------------------------- Habla brummie */

export interface GlossaryTerm {
  term: string;
  say?: string;
  meaning: LocalizedText;
  example?: string;
}

export const glossary: GlossaryTerm[] = [
  { term: 'Bostin’', meaning: t('Estupendo, genial.', 'Wonderful, brilliant.'), example: 'That was a bostin’ cob, bab!' },
  { term: 'Bab', meaning: t('Apelativo cariñoso para gente cercana, como «cariño».', 'A term of endearment for people you know well, like “hun”.') },
  { term: 'Babby', meaning: t('Bebé.', 'Baby.') },
  { term: 'Cob', meaning: t('Panecillo, bollo de pan.', 'A bread roll.') },
  { term: 'Pop', meaning: t('Refresco con gas.', 'A fizzy drink.') },
  { term: 'Tara-a-bit', say: 'ta-rah-a-bit', meaning: t('Adiós; se acorta a «ta-rah».', 'Goodbye; often shortened to “ta-rah”.') },
  { term: 'Island', meaning: t('Rotonda, al dar indicaciones.', 'A roundabout, when giving directions.'), example: 'Take a left at the island.' },
  { term: 'Tip Top', meaning: t('Polo de hielo largo y de sabores.', 'A long, flavoured ice lolly.') },
  { term: 'Gambol', say: 'gam-bowl', meaning: t('Voltereta hacia delante.', 'A forward roll.') },
  { term: 'Yam Yam', meaning: t('Persona con acento del Black Country, que dice «How am ya?».', 'Someone with a Black Country accent, who says “How am ya?”.') },
];
export const glossarySourceId = 'bcu-dictionary';
