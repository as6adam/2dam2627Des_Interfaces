import { c, fact, go, src, t, type PlaceDetail } from './helpers.ts';

const BM = 'Birmingham Museums';

export const cultureFood: Record<string, PlaceDetail> = {
  /* ---------------------------------------------------------------- Cultura */
  'aston-hall': {
    summary: t(
      'Mansión jacobea de 1618-1635 con más de 400 años de historia, junto a Villa Park.',
      'A Jacobean mansion built in 1618-1635, with over 400 years of history, next to Villa Park.',
    ),
    description: [
      t(
        'Aston Hall fue diseñada por John Thorpe y construida por sir Thomas Holte entre 1618 y 1635. Birmingham Museums la presenta como una de las últimas grandes casas levantadas en estilo jacobeo y, según la tradición que recoge, como uno de los edificios con más fama de encantados del Reino Unido.',
        'Aston Hall was designed by John Thorpe and built by Sir Thomas Holte between 1618 and 1635. Birmingham Museums describes it as one of the last great houses built in the Jacobean style and, as tradition has it, one of the most haunted buildings in the UK.',
      ),
      t(
        'Dentro, la Long Gallery y la gran escalera de roble son las piezas que más llaman la atención: la escalera todavía conserva marcas de batalla. Las salas cuentan más de cuatro siglos de vida de la casa y de quienes la habitaron.',
        'Inside, the Long Gallery and the great oak staircase are the showpieces; the staircase still bears battle damage. The rooms trace more than four centuries of the house and the people who lived in it.',
      ),
      t(
        'La visita combina bien con un partido o una visita a Villa Park, que está al lado: dos caras muy distintas de Aston en un mismo paseo. Los jardines son de acceso gratuito en horario de apertura.',
        'It pairs well with a match or a visit to Villa Park next door: two very different sides of Aston in a single walk. The gardens are free to visit during opening hours.',
      ),
    ],
    highlights: [
      c('La Long Gallery.', 'The Long Gallery.', 'bm-aston-about'),
      c('La gran escalera de roble, con marcas de batalla.', 'The great oak staircase, still showing battle damage.', 'bm-aston-about'),
      c('Los jardines, gratuitos en horario de apertura.', 'The gardens, free during opening hours.', 'bm-aston-visit'),
    ],
    practical: [
      fact(
        'status',
        'Abre por temporadas: en invierno cierra salvo eventos especiales. Según su web, vuelve a su horario habitual el 13 de febrero de 2027.',
        'Seasonal opening: closed in winter except for special events. According to its website, normal hours return on 13 February 2027.',
        'bm-aston-visit',
      ),
      fact('price', 'Los jardines son gratuitos; la casa tiene entrada de pago.', 'The gardens are free; the house has paid admission.', 'bm-aston-visit'),
      fact(
        'booking',
        'Para algunos eventos de invierno es imprescindible reservar.',
        'Some winter events require advance booking.',
        'bm-aston-visit',
      ),
    ],
    tips: [
      c(
        'Viajando en autobús de National Express o en tren de National Rail puedes conseguir hasta un 50 % de descuento en la entrada (consulta las condiciones).',
        'Travelling by National Express bus or National Rail train can get you up to 50% off admission (terms apply).',
        'bm-aston-getting',
      ),
      c(
        'Los museos de Birmingham ofrecen un 25 % de descuento en el billete Day Saver de National Express para ir a sus sedes.',
        'Birmingham Museums sites offer 25% off National Express Day Saver bus tickets.',
        'bm-aston-getting',
      ),
    ],
    transport: [
      go({
        id: 'aston-hall-bus-65',
        mode: 'bus',
        service: t('Línea 65 (National Express West Midlands)', 'Route 65 (National Express West Midlands)'),
        stop: t('Parada Aston Station', 'Aston Station stop'),
        origin: t('Centro de Birmingham', 'Birmingham city centre'),
        sourceIds: ['bm-aston-getting'],
      }),
      go({
        id: 'aston-hall-bus-11',
        mode: 'bus',
        service: t('Circulares 11A y 11C (National Express West Midlands)', 'Circular routes 11A and 11C (National Express West Midlands)'),
        stop: t('Parada Witton Station', 'Witton Station stop'),
        origin: t('Otros barrios de Birmingham', 'Other parts of Birmingham'),
        sourceIds: ['bm-aston-getting'],
      }),
      go({
        id: 'aston-hall-bus-7',
        mode: 'bus',
        service: t('Línea 7 (National Express West Midlands)', 'Route 7 (National Express West Midlands)'),
        stop: t('Parada Jardine Road', 'Jardine Road stop'),
        sourceIds: ['bm-aston-getting'],
      }),
      go({
        id: 'aston-hall-rail-aston',
        mode: 'rail',
        service: t('West Midlands Railway', 'West Midlands Railway'),
        stop: t('Estación de Aston', 'Aston station'),
        origin: t('Birmingham New Street', 'Birmingham New Street'),
        ride: t('8 min', '8 min'),
        walk: { minutes: '10' },
        sourceIds: ['bm-aston-getting'],
      }),
      go({
        id: 'aston-hall-rail-witton',
        mode: 'rail',
        service: t('West Midlands Railway, cada 30 min', 'West Midlands Railway, every 30 min'),
        stop: t('Estación de Witton', 'Witton station'),
        origin: t('Birmingham New Street', 'Birmingham New Street'),
        ride: t('10 min', '10 min'),
        walk: { minutes: '10' },
        sourceIds: ['bm-aston-getting'],
      }),
    ],
    sources: [
      src('bm-aston-about', 'About Aston Hall', BM, 'https://www.birminghammuseums.org.uk/aston-hall/about'),
      src('bm-aston-visit', 'Visit Aston Hall', BM, 'https://www.birminghammuseums.org.uk/aston-hall/visit'),
      src('bm-aston-getting', 'How to get here · Aston Hall', BM, 'https://www.birminghammuseums.org.uk/aston-hall/visit/how-to-get-here'),
    ],
  },

  'birmingham-back-to-backs': {
    summary: t(
      'El último patio de casas «espalda con espalda» de Birmingham, solo con visita guiada.',
      'Birmingham’s last court of back-to-back houses, visited by guided tour only.',
    ),
    description: [
      t(
        'Las Back to Backs son un grupo de casas adosadas literalmente espalda con espalda alrededor de un patio central: el Court 15. Las gestiona el National Trust y se visitan solo con visita guiada.',
        'The Back to Backs are a group of terraced houses built literally back to back around a central courtyard, Court 15. The National Trust runs them, and visits are by guided tour only.',
      ),
      t(
        'Es el último patio de casas espalda con espalda que se conserva en Birmingham, y la visita recorre su vida desde la década de 1840 hasta la de 1970. La visita completa dura unos 90 minutos y pasa por las tres plantas de las tres casas restauradas y por la sastrería de George Saunders.',
        'It is Birmingham’s last surviving court of back-to-back houses, and the tour runs from the 1840s to the 1970s. A full tour lasts around 90 minutes, covering all three floors of the three restored houses and George Saunders’ tailor’s shop.',
      ),
      t(
        'Pasa casi desapercibido en pleno centro: la recepción está en la esquina de Inge Street, frente a Hippodrome Square, al otro lado del arcoíris pintado en el suelo. En las fiestas de 2026 hay además una visita navideña libre los martes y domingos.',
        'It is easy to miss in the busy centre: reception is on the corner of Inge Street, opposite Hippodrome Square, on the other side of the painted rainbow. During the 2026 holidays there is also a self-led festive visit on Tuesdays and Sundays.',
      ),
    ],
    highlights: [
      c('El patio Court 15 y sus casas obreras.', 'Court 15 and its workers’ houses.', 'nt-b2b-booking'),
      c('La visita guiada por las escaleras de las casas.', 'The guided tour up through the houses’ stairways.', 'nt-b2b-booking'),
      c('La visita navideña libre (martes y domingos en las fiestas de 2026).', 'The self-led festive visit (Tuesdays and Sundays over the 2026 holidays).', 'nt-b2b-booking'),
    ],
    practical: [
      fact('booking', 'Solo con visita guiada. Reserva en línea o en el 0344 249 1895.', 'Guided tours only. Book online or on 0344 249 1895.', 'nt-b2b-booking'),
      fact(
        'duration',
        'Visita completa: unos 90 minutos. Visita de planta baja, apta para necesidades de acceso: unos 60 minutos.',
        'Full tour: around 90 minutes. Ground-floor tour, suitable for access needs: around 60 minutes.',
        'nt-b2b-booking',
      ),
      fact(
        'booking',
        'Desde marzo de 2025 no aceptan reservas de grupo los martes ni los miércoles.',
        'Since March 2025 group bookings are not taken on Tuesdays or Wednesdays.',
        'nt-b2b-booking',
      ),
    ],
    tips: [
      c(
        'Si vienes desde la estación de tren, busca la recepción en la esquina de Inge Street, frente a Hippodrome Square.',
        'Coming from the station, look for reception on the corner of Inge Street, opposite Hippodrome Square.',
        'nt-b2b',
      ),
      c(
        'Puedes cambiar la fecha de la reserva en línea hasta 24 horas antes si creaste una cuenta.',
        'You can change your booking online up to 24 hours ahead if you created an account.',
        'nt-b2b-booking',
      ),
    ],
    accessibility: [
      {
        text: t(
          'Las casas son muy pequeñas y la visita incluye varios tramos de escaleras empinadas y estrechas.',
          'The houses are very small and the tour includes several steep, winding flights of stairs.',
        ),
        sourceIds: ['nt-b2b-booking'],
      },
    ],
    sources: [
      src('nt-b2b', 'Birmingham Back to Backs', 'National Trust', 'https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/birmingham-back-to-backs'),
      src(
        'nt-b2b-booking',
        'Booking your visit to Birmingham Back to Backs',
        'National Trust',
        'https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/birmingham-back-to-backs/booking-your-visit-to-birmingham-back-to-backs',
      ),
    ],
  },

  'birmingham-museum-and-art-gallery': {
    summary: t(
      'El gran museo de la ciudad, en un edificio protegido que preside Chamberlain Square desde 1885.',
      'The city’s great museum, in a listed building overlooking Chamberlain Square since 1885.',
    ),
    description: [
      t(
        'El Birmingham Museum & Art Gallery ocupa un edificio de interés histórico (Grade II*) que vigila Chamberlain Square y Victoria Square desde 1885 y que ha recibido a millones de visitantes.',
        'Birmingham Museum & Art Gallery is housed in a Grade II* listed landmark that has watched over Chamberlain and Victoria Squares since 1885, welcoming millions of visitors.',
      ),
      t(
        'Tras su reapertura, se pueden recorrer las galerías de los prerrafaelitas, la del tesoro de Staffordshire, las de historia de Birmingham, la Round Room, la Industrial Gallery y la Bridge Gallery. Para familias está Wild City, una galería nueva.',
        'Since reopening, visitors can explore the Pre-Raphaelites galleries, the Staffordshire Hoard Gallery, the Birmingham History Galleries, the Round Room, the Industrial Gallery and the Bridge Gallery. Families have Wild City, a new gallery.',
      ),
      t(
        'Al estar en pleno centro, encaja en cualquier paseo: New Street y Snow Hill quedan a unos 10 minutos a pie y Victoria Square está a la salida.',
        'Right in the centre, it fits into any walk: New Street and Snow Hill are about 10 minutes away on foot, and Victoria Square is just outside.',
      ),
    ],
    highlights: [
      c('Las galerías de los prerrafaelitas.', 'The Pre-Raphaelites galleries.', 'bm-bmag'),
      c('El tesoro de Staffordshire.', 'The Staffordshire Hoard Gallery.', 'bm-bmag'),
      c('Las galerías de historia de Birmingham y la Round Room.', 'The Birmingham History Galleries and the Round Room.', 'bm-bmag'),
      c('Wild City, la galería familiar.', 'Wild City, the family gallery.', 'bm-bmag'),
    ],
    practical: [
      fact(
        'hours',
        'De martes a domingo, de 10:00 a 17:00; abre a diario en vacaciones escolares. Cierra del 24 al 26 de diciembre y el 1 de enero.',
        'Tuesday to Sunday, 10am to 5pm; open daily in school holidays. Closed 24-26 December and 1 January.',
        'bm-bmag',
      ),
      fact('price', 'Entrada general gratuita; se agradecen los donativos.', 'General admission is free; donations welcome.', 'bm-bmag'),
      fact('booking', 'No hace falta reservar.', 'No booking required.', 'bm-bmag'),
    ],
    tips: [
      c(
        'La entrada principal, en Chamberlain Square, tiene dos tramos de escaleras: el acceso con ascensor está en el Gas Hall, en Edmund Street.',
        'The main entrance on Chamberlain Square has two flights of stairs; the lift entrance is at the Gas Hall on Edmund Street.',
        'bm-bmag-getting',
      ),
    ],
    transport: [
      go({
        id: 'bmag-bus-colmore',
        mode: 'bus',
        service: t('Líneas que terminan en Colmore Row (National Express West Midlands)', 'Routes terminating on Colmore Row (National Express West Midlands)'),
        stop: t('Colmore Row', 'Colmore Row'),
        walk: { note: t('A poca distancia a pie del museo.', 'A short walk from the museum.') },
        sourceIds: ['bm-bmag-getting'],
      }),
      go({
        id: 'bmag-rail-newstreet',
        mode: 'rail',
        stop: t('Birmingham New Street', 'Birmingham New Street'),
        walk: { minutes: '10' },
        sourceIds: ['bm-bmag-getting'],
      }),
      go({
        id: 'bmag-rail-snowhill',
        mode: 'rail',
        stop: t('Birmingham Snow Hill', 'Birmingham Snow Hill'),
        walk: { minutes: '10' },
        sourceIds: ['bm-bmag-getting'],
      }),
    ],
    accessibility: [
      {
        text: t('Acceso con ascensor por la entrada del Gas Hall (Edmund Street).', 'Lift access via the Gas Hall entrance (Edmund Street).'),
        sourceIds: ['bm-bmag-getting'],
      },
    ],
    sources: [
      src('bm-bmag', 'Birmingham Museum & Art Gallery', BM, 'https://www.birminghammuseums.org.uk/birmingham-museum-and-art-gallery'),
      src('bm-bmag-getting', 'How to get here · BMAG', BM, 'https://www.birminghammuseums.org.uk/birmingham-museum-and-art-gallery/visit/how-to-get-here'),
    ],
  },

  'jewellery-quarter': {
    summary: t(
      'El barrio de los joyeros, con un taller que se cerró en 1981 y quedó intacto como museo.',
      'The jewellers’ quarter, with a workshop that closed in 1981 and survives untouched as a museum.',
    ),
    description: [
      t(
        'El Jewellery Quarter sigue siendo un barrio de oficio, a un paso del centro. Su visita más singular es el Museum of the Jewellery Quarter, instalado en la antigua fábrica de joyería Smith & Pepper.',
        'The Jewellery Quarter is still a working neighbourhood, a short walk from the centre. Its most unusual visit is the Museum of the Jewellery Quarter, set in the former Smith & Pepper jewellery works.',
      ),
      t(
        'Cuando los dueños de Smith & Pepper se jubilaron en 1981, dejaron de trabajar y cerraron la puerta sin más. Sin saberlo, dejaron una cápsula del tiempo: hoy es un museo que cuenta la historia del taller y del barrio.',
        'When the owners of Smith & Pepper retired in 1981 they simply stopped trading and locked the door. Without knowing it, they left a time capsule; today it is a museum telling the story of the workshop and the quarter.',
      ),
      t(
        'Llegar es fácil: la estación de Jewellery Quarter está a una parada de Snow Hill, y varias líneas de autobús dejan junto al reloj de Warstone Lane o en Vyse Street.',
        'Getting there is easy: Jewellery Quarter station is one stop from Snow Hill, and several bus routes stop by the clock on Warstone Lane or on Vyse Street.',
      ),
    ],
    highlights: [
      c('El taller de Smith & Pepper, tal y como quedó en 1981.', 'The Smith & Pepper workshop, just as it was left in 1981.', 'bm-jq'),
      c('El reloj de Warstone Lane, punto de referencia del barrio.', 'The clock on Warstone Lane, the quarter’s landmark.', 'bm-jq-getting'),
    ],
    practical: [
      fact('hours', 'Museo: de jueves a domingo, de 10:30 a 16:00.', 'Museum: Thursday to Sunday, 10.30am to 4pm.', 'bm-jq-visit'),
      fact('price', 'Entrada de pago; se recomienda reservar.', 'Admission charges apply; booking advised.', 'bm-jq-visit'),
      fact(
        'status',
        'Cierra los lunes festivos, del 24 al 26 de diciembre y el 1 de enero.',
        'Closed on bank holiday Mondays, 24-26 December and 1 January.',
        'bm-jq-visit',
      ),
    ],
    tips: [
      c(
        'Para ir en bicicleta, el museo recomienda planificar la ruta con CycleStreets.',
        'If cycling, the museum recommends planning your route with CycleStreets.',
        'bm-jq-getting',
      ),
    ],
    address: { lines: ['Museum of the Jewellery Quarter'], postcode: 'B18 6HA', sourceId: 'bm-jq-getting' },
    map: {
      provider: 'OpenStreetMap',
      url: 'https://www.openstreetmap.org/search?query=Museum%20of%20the%20Jewellery%20Quarter%2C%20Birmingham%20B18%206HA',
    },
    transport: [
      go({
        id: 'jq-bus-101',
        mode: 'bus',
        service: t('Línea 101', 'Route 101'),
        origin: t('Colmore Row', 'Colmore Row'),
        stop: t('Parada The Clock, en Warstone Lane', 'The Clock stop on Warstone Lane'),
        sourceIds: ['bm-jq-getting'],
      }),
      go({
        id: 'jq-bus-16',
        mode: 'bus',
        service: t('Línea 16', 'Route 16'),
        origin: t('Upper Dean Street', 'Upper Dean Street'),
        stop: t('Parada Vyse Street, en Great Hampton Street', 'Vyse Street stop on Great Hampton Street'),
        sourceIds: ['bm-jq-getting'],
      }),
      go({
        id: 'jq-bus-74',
        mode: 'bus',
        service: t('Línea 74', 'Route 74'),
        origin: t('Old Square', 'Old Square'),
        stop: t('Parada Vyse Street, en Great Hampton Street', 'Vyse Street stop on Great Hampton Street'),
        sourceIds: ['bm-jq-getting'],
      }),
      go({
        id: 'jq-bus-8',
        mode: 'bus',
        service: t('Circulares 8A y 8C', 'Circular routes 8A and 8C'),
        origin: t('Otros barrios de Birmingham', 'Other parts of Birmingham'),
        stop: t('Parada Jewellery Quarter Station', 'Jewellery Quarter Station stop'),
        sourceIds: ['bm-jq-getting'],
      }),
    ],
    sources: [
      src('bm-jq', 'Museum of the Jewellery Quarter', BM, 'https://www.birminghammuseums.org.uk/museum-of-the-jewellery-quarter'),
      src('bm-jq-visit', 'Visit the Museum of the Jewellery Quarter', BM, 'https://www.birminghammuseums.org.uk/museum-of-the-jewellery-quarter/visit'),
      src(
        'bm-jq-getting',
        'How to get here · Museum of the Jewellery Quarter',
        BM,
        'https://www.birminghammuseums.org.uk/museum-of-the-jewellery-quarter/visit/how-to-get-here',
      ),
    ],
  },

  /* ------------------------------------------------------------ Gastronomía */
  'birmingham-balti': {
    summary: t(
      'El plato emblema de la ciudad, en el Balti Triangle; Shababs lo cocina desde 1987.',
      'The city’s signature dish, in the Balti Triangle; Shababs has cooked it since 1987.',
    ),
    description: [
      t(
        'El balti es el plato con el que Birmingham se identifica, y el Balti Triangle es el barrio donde probarlo. Uno de sus nombres veteranos es Shababs, un negocio familiar que sirve baltis tradicionales desde 1987.',
        'Balti is the dish Birmingham identifies with, and the Balti Triangle is where to try it. One of its long-standing names is Shababs, a family business serving traditional baltis since 1987.',
      ),
      t(
        'Casi cuarenta años después de abrir, Shababs dice seguir cocinando sus baltis igual que entonces. Se puede comer en el restaurante o pedir a domicilio dentro de Birmingham.',
        'Nearly forty years after opening, Shababs says it still cooks its baltis the way it did then. You can eat in or order delivery within Birmingham.',
      ),
    ],
    highlights: [
      c('Un balti tradicional en el Balti Triangle.', 'A traditional balti in the Balti Triangle.', 'shababs-about'),
    ],
    practical: [
      fact(
        'hours',
        'Shababs abre todos los días desde las 12:00 hasta tarde, también en festivos (incluidos Navidad y Año Nuevo).',
        'Shababs opens every day from 12pm until late, including bank holidays (Christmas Day and New Year’s Day too).',
        'shababs-contact',
      ),
      fact(
        'booking',
        'Se reserva en su web; a veces piden una pequeña señal.',
        'Book through its website; a small deposit is sometimes requested.',
        'shababs-contact',
      ),
    ],
    sources: [
      src('shababs-about', 'About us', 'Shababs', 'https://www.shababs.co.uk/about-us/'),
      src('shababs-contact', 'Contact us', 'Shababs', 'https://www.shababs.co.uk/contact-us/'),
    ],
  },

  'digbeth-dining-club': {
    summary: t(
      'Pioneros de la comida callejera en las Midlands desde 2012, ahora con eventos itinerantes.',
      'Midlands street-food pioneers since 2012, now running roaming events.',
    ),
    description: [
      t(
        'Digbeth Dining Club nació en 2012 y es un organizador de eventos y recintos de comida callejera con varios premios: ha convertido espacios singulares de las Midlands en mercados de comida con ambiente.',
        'Digbeth Dining Club began in 2012 and is a multi-award-winning events and venue operator that turns unusual Midlands spaces into lively street-food markets.',
      ),
      t(
        'Abrió su primer recinto fijo, Hockley Social Club, y después Herberts Yard, en el centro de Longbridge. A finales de 2025 cerró Hockley Social Club para volver a sus raíces de eventos itinerantes, así que conviene consultar su calendario antes de ir.',
        'It opened its first permanent venue, Hockley Social Club, and later Herberts Yard in Longbridge town centre. At the end of 2025 it closed Hockley Social Club to return to its roaming-event roots, so check its calendar before you go.',
      ),
    ],
    practical: [
      fact(
        'status',
        'No tiene sede fija: los eventos cambian de lugar y de fecha. Consulta su web antes de ir.',
        'No fixed venue: events change place and date. Check its website before going.',
        'ddc-about',
        'eas-hsc',
      ),
    ],
    caveats: [
      t(
        'Hockley Social Club, su recinto del Jewellery Quarter, cerró el 31 de diciembre de 2025.',
        'Hockley Social Club, its Jewellery Quarter venue, closed on 31 December 2025.',
      ),
    ],
    sources: [
      src('ddc-about', 'About us', 'Digbeth Dining Club', 'https://digbethdiningclub.com/about-us'),
      src(
        'eas-hsc',
        '“The natural end to our five-year project has arrived”',
        'Express & Star',
        'https://www.expressandstar.com/news/the-natural-end-to-our-five-year-project-has-arrived-popular-birmingham-food-drink-and-entertainment-venue-set-to-close-at-end-of-year-5690902',
      ),
    ],
  },

  'original-patty-men': {
    description: [
      t(
        'Original Patty Men es una hamburguesería de Birmingham con local en Shaws Passage, en Digbeth.',
        'Original Patty Men is a Birmingham burger joint on Shaws Passage in Digbeth.',
      ),
      t(
        'Admite reservas de 2 a 14 personas, pero también guarda muchas mesas para quien llega sin reserva e intenta sentarte lo antes posible.',
        'It takes bookings for 2 to 14 people but keeps plenty of walk-in tables and tries to seat you as soon as possible.',
      ),
    ],
    practical: [
      fact(
        'hours',
        'Miércoles y jueves de 17:00 a 21:00 (última comanda); viernes y sábado de 12:00 a 22:00; domingo de 12:00 a 19:00 (última comanda).',
        'Wednesday and Thursday 5pm to 9pm (last orders); Friday and Saturday 12pm to 10pm; Sunday 12pm to 7pm (last orders).',
        'opm-locations',
      ),
      fact('booking', 'Reservas de 2 a 14 personas en su web; también mesas sin reserva.', 'Bookings for 2 to 14 people online; walk-in tables too.', 'opm-locations'),
    ],
    sources: [src('opm-locations', 'Locations & reservations', 'Original Patty Men', 'https://www.originalpattymen.co.uk/locationsreservations')],
  },

  purnells: {
    name: t('Plates by Purnell’s', 'Plates by Purnell’s'),
    summary: t(
      'Platos para compartir de Glynn Purnell, el primer chef con estrella Michelin de Birmingham.',
      'Sharing plates from Glynn Purnell, Birmingham’s first Michelin-starred chef.',
    ),
    description: [
      t(
        'Glynn Purnell fue el primer chef de Birmingham con estrella Michelin. Su restaurante de referencia, Purnell’s, cerró en octubre de 2024, pero su cocina sigue en Plates by Purnell’s, en Edmund Street, en el distrito de Colmore.',
        'Glynn Purnell was Birmingham’s first Michelin-starred chef. His flagship, Purnell’s, closed in October 2024, but his cooking carries on at Plates by Purnell’s on Edmund Street, in the Colmore district.',
      ),
      t(
        'Plates by Purnell’s se inspira en las tapas españolas: platos pequeños y grandes pensados para compartir, con una carta que cambia con la temporada. Ocupa el antiguo bar español Pinchos y se renovó por completo antes de abrir.',
        'Plates by Purnell’s takes its cue from Spanish tapas: small and large plates made for sharing, on a menu that changes with the seasons. It took over the former Spanish bar Pinchos and was fully refurbished before opening.',
      ),
    ],
    highlights: [c('La carta de platos para compartir, de temporada.', 'The seasonal sharing-plates menu.', 'vb-plates')],
    practical: [
      fact('hours', 'De martes a sábado, de 12:00 a 22:00.', 'Tuesday to Saturday, 12pm to 10pm.', 'plates'),
      fact('contact', 'Reservas en su web o en el 0121 461 9254.', 'Book online or on 0121 461 9254.', 'plates'),
    ],
    address: { lines: ['121 Edmund Street'], postcode: 'B3 2HJ', sourceId: 'plates' },
    map: { provider: 'OpenStreetMap', url: 'https://www.openstreetmap.org/search?query=121%20Edmund%20Street%2C%20Birmingham%20B3%202HJ' },
    caveats: [
      t(
        'El restaurante Purnell’s, en Cornwall Street, cerró en octubre de 2024. Esta ficha corresponde a Plates by Purnell’s.',
        'Purnell’s restaurant on Cornwall Street closed in October 2024. This page covers Plates by Purnell’s.',
      ),
    ],
    sources: [
      src('plates', 'Plates by Purnell’s', 'Plates by Purnell’s', 'https://platesbypurnells.com/'),
      src(
        'vb-plates',
        'Yummy Brummie: Glynn Purnell opens new tapas bar',
        'Visit Birmingham',
        'https://visitbirmingham.com/blog/post/yummy-brummie-glynn-purnell-opens-new-tapas-bar-in-birmingham/',
      ),
      src('closure', 'Chef Glynn Purnell closes Birmingham restaurant', 'The Caterer', 'https://thecaterer.com/news/chef-glynn-purnell-closes-birmingham-restaurant'),
    ],
  },
};
