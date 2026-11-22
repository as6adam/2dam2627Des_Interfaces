import { c, fact, go, src, t, type PlaceDetail } from './helpers.ts';

const BM = 'Birmingham Museums';

export const nightsFamily: Record<string, PlaceDetail> = {
  /* ------------------------------------------------------------ Ocio y noche */
  'birmingham-hippodrome': {
    summary: t(
      'Uno de los teatros con más público del Reino Unido, con más de 125 años de historia en Southside.',
      'One of the UK’s busiest theatres, with more than 125 years of history in Southside.',
    ),
    description: [
      t(
        'El Birmingham Hippodrome es una organización benéfica independiente y uno de los espacios artísticos con más actividad del Reino Unido. Su historia abarca más de 125 años.',
        'Birmingham Hippodrome is an independent charity and one of the UK’s busiest and most vibrant arts venues. Its history spans more than 125 years.',
      ),
      t(
        'Recibe a más de 600.000 espectadores de pago al año en la sala principal y en el Patrick Studio: grandes musicales, ballet y ópera, teatro y espectáculos familiares. Hay funciones con lengua de signos británica, subtítulos, audiodescripción y funciones relajadas.',
        'It welcomes more than 600,000 paying visitors a year to its main house and the Patrick Studio for big musicals, ballet and opera, drama and family shows. There are BSL, captioned, audio-described and relaxed performances.',
      ),
      t(
        'Está en Hurst Street, en el barrio de Southside, a unos 10 minutos a pie de Moor Street y cerca de New Street por la salida Southside. También tiene entrada pública por Thorp Street.',
        'It stands on Hurst Street in Southside, about 10 minutes’ walk from Moor Street and close to New Street via the Southside exit. There is also a public entrance on Thorp Street.',
      ),
    ],
    highlights: [
      c('Un gran musical en la sala principal.', 'A big musical in the main house.', 'hipp-about'),
      c('El Patrick Studio, la sala pequeña.', 'The Patrick Studio, the smaller space.', 'hipp-about'),
      c('Funciones accesibles: BSL, subtítulos, audiodescripción y relajadas.', 'Accessible performances: BSL, captioned, audio-described and relaxed.', 'hipp-faq'),
    ],
    practical: [
      fact(
        'hours',
        'Taquilla presencial (entrada de Thorp Street): de lunes a viernes, de 10:00 a 17:00, y durante las funciones.',
        'Ticket counter (Thorp Street reception): Monday to Friday, 10am to 5pm, and during performances.',
        'hipp-faq',
      ),
    ],
    tips: [
      c(
        'National Express West Midlands ofrece un billete de día especial para quien va al Hippodrome; consulta el correo previo a tu visita.',
        'National Express West Midlands has a visitor day-ticket offer for Hippodrome audiences; check your pre-visit email.',
        'hipp-getting',
      ),
      c(
        'Si necesitas el baño a menudo, reserva butacas de pasillo en el lado derecho del auditorio: todos los aseos están en ese lado.',
        'If you may need the toilet urgently, book aisle seats on auditorium right: all the toilets are on that side.',
        'hipp-access',
      ),
    ],
    transport: [
      go({
        id: 'hipp-bus',
        mode: 'bus',
        service: t('Líneas 6, 61, 63, 87, X1 y X2', 'Routes 6, 61, 63, 87, X1 and X2'),
        stop: t('Cerca del teatro', 'Near the theatre'),
        sourceIds: ['hipp-getting'],
      }),
      go({
        id: 'hipp-rail-moor',
        mode: 'rail',
        stop: t('Birmingham Moor Street', 'Birmingham Moor Street'),
        walk: { minutes: '10', distance: t('unas 0,5 millas', 'about 0.5 miles') },
        sourceIds: ['hipp-getting'],
      }),
      go({
        id: 'hipp-rail-newstreet',
        mode: 'rail',
        stop: t('Birmingham New Street, salida Southside', 'Birmingham New Street, Southside exit'),
        walk: { note: t('La salida Southside tiene escaleras y ascensor.', 'The Southside exit has both steps and a lift.') },
        sourceIds: ['hipp-getting'],
      }),
    ],
    accessibility: [
      {
        text: t(
          'Aparcamiento Arcadian con plazas reservadas a unas 150 yardas de la entrada; aseos accesibles en las plantas 1 a 4.',
          'The Arcadian car park has allocated bays about 150 yards from the entrance; accessible toilets on levels 1 to 4.',
        ),
        sourceIds: ['hipp-access'],
      },
    ],
    sources: [
      src('hipp-about', 'About us', 'Birmingham Hippodrome', 'https://www.birminghamhippodrome.com/about-us/'),
      src('hipp-getting', 'Getting here', 'Birmingham Hippodrome', 'https://www.birminghamhippodrome.com/plan-your-visit/essential-info/getting-here/'),
      src('hipp-access', 'Accessible facilities', 'Birmingham Hippodrome', 'https://www.birminghamhippodrome.com/plan-your-visit/access/accessible-facilities/'),
      src('hipp-faq', 'Help centre FAQs', 'Birmingham Hippodrome', 'https://www.birminghamhippodrome.com/help-centre-faqs/'),
    ],
  },

  'o2-academy-birmingham': {
    summary: t(
      'Tres salas de conciertos en un mismo edificio, a unos 500 metros de New Street.',
      'Three concert rooms in one building, about 500 metres from New Street.',
    ),
    description: [
      t(
        'O2 Academy Birmingham reúne tres salas en un mismo edificio, así que en noches con todas en marcha hay bastante gente. La sala principal es la mayor y tiene una zona elevada en el balcón.',
        'O2 Academy Birmingham houses three venues in one building, so it gets busy when all of them are running. The main room is the largest and has a raised viewing area on the balcony.',
      ),
      t(
        'Desde New Street son unos 500 metros por la salida Southside hacia Smallbrook Queensway. Muchas líneas de autobús paran en Bristol Street o Smallbrook Queensway.',
        'It is about 500 metres from New Street via the Southside exit towards Smallbrook Queensway. Plenty of bus routes stop on Bristol Street or Smallbrook Queensway.',
      ),
    ],
    practical: [
      fact(
        'contact',
        'Accesibilidad: +44 (0)121 622 8250, de lunes a viernes de 10:00 a 17:00.',
        'Access enquiries: +44 (0)121 622 8250, Monday to Friday 10am to 5pm.',
        'o2-access',
      ),
    ],
    tips: [
      c(
        'Si necesitas apoyo de acceso, llega unos 15 minutos antes de abrir puertas y habla con el equipo de la cola.',
        'If you need access support, arrive about 15 minutes before doors and speak to the queue team.',
        'o2-access',
      ),
    ],
    address: { lines: ['Bristol Street'], postcode: 'B1 1DB', sourceId: 'o2-getting' },
    transport: [
      go({
        id: 'o2-bus',
        mode: 'bus',
        service: t('Líneas 44, 66A, 82, 87, 144, 146, 62, 63, 64 y 66', 'Routes 44, 66A, 82, 87, 144, 146, 62, 63, 64 and 66'),
        stop: t('Bristol Street o Smallbrook Queensway', 'Bristol Street or Smallbrook Queensway'),
        sourceIds: ['o2-getting'],
      }),
      go({
        id: 'o2-rail',
        mode: 'rail',
        stop: t('Birmingham New Street, salida Southside', 'Birmingham New Street, Southside exit'),
        walk: { distance: t('unos 500 m', 'about 500 m') },
        sourceIds: ['o2-getting'],
      }),
    ],
    accessibility: [
      {
        text: t(
          'El aparcamiento de The Mailbox, a 600 metros, tiene 16 plazas accesibles. El balcón de la sala principal admite hasta seis sillas de ruedas.',
          'The Mailbox car park, 600 metres away, has 16 accessible spaces. The main room’s balcony has room for up to six wheelchairs.',
        ),
        sourceIds: ['o2-getting', 'o2-access'],
      },
    ],
    sources: [
      src('o2-getting', 'Getting here', 'O2 Academy Birmingham', 'https://www.academymusicgroup.com/o2academybirmingham/getting-here'),
      src('o2-access', 'Accessibility', 'O2 Academy Birmingham', 'https://www.academymusicgroup.com/o2academybirmingham/accessibility'),
    ],
  },

  'symphony-hall': {
    summary: t(
      'La gran sala de conciertos de la ciudad, en Centenary Square, con el tranvía en la puerta.',
      'The city’s great concert hall on Centenary Square, with the tram at the door.',
    ),
    description: [
      t(
        'Symphony Hall está en Centenary Square, junto a la Library of Birmingham. La gestiona B:Music, que también lleva el Town Hall.',
        'Symphony Hall stands on Centenary Square next to the Library of Birmingham. It is run by B:Music, which also runs Town Hall.',
      ),
      t(
        'La parada de tranvía Library está junto a la entrada principal, las paradas de Broad Street quedan a unos 150 metros y New Street y Snow Hill se recorren a pie. Hay butacas con acceso a nivel en todas las plantas.',
        'Library tram stop is right by the main entrance, Broad Street bus stops are about 150 metres away, and New Street and Snow Hill are within walking distance. There are level-access seats on every level.',
      ),
    ],
    tips: [
      c(
        'El punto de bajada de coche más cercano es Cambridge Street, a 2 minutos a pie.',
        'The nearest drop-off point is Cambridge Street, a 2-minute walk away.',
        'sh-getting',
      ),
    ],
    practical: [
      fact('contact', 'Línea de accesibilidad: (0)121 289 6343.', 'Access line: (0)121 289 6343.', 'sh-access'),
      fact(
        'price',
        'El acompañante imprescindible de una persona con discapacidad tiene entrada gratuita.',
        'Essential companions of disabled visitors get a free ticket.',
        'sh-access',
      ),
    ],
    transport: [
      go({
        id: 'sh-tram',
        mode: 'tram',
        service: t('West Midlands Metro', 'West Midlands Metro'),
        stop: t('Library (Centenary Square)', 'Library (Centenary Square)'),
        walk: { note: t('Junto a la entrada principal.', 'Right by the main entrance.') },
        sourceIds: ['sh-getting'],
      }),
      go({
        id: 'sh-bus',
        mode: 'bus',
        stop: t('Paradas de Broad Street', 'Broad Street stops'),
        walk: { distance: t('unos 150 m', 'about 150 m') },
        sourceIds: ['sh-getting'],
      }),
    ],
    sources: [
      src('sh-getting', 'Getting here · Symphony Hall', 'B:Music', 'https://bmusic.co.uk/your-visit/symphony-hall/getting-here'),
      src('sh-access', 'Accessibility information · Symphony Hall', 'B:Music', 'https://bmusic.co.uk/accessibility-information-symphony-hall'),
    ],
  },

  'the-night-owl': {
    summary: t('Sala de música y baile en Lower Trinity Street, en Digbeth.', 'A music and dance venue on Lower Trinity Street, Digbeth.'),
  },

  /* ----------------------------------------------------------------- Familia */
  'thinktank-science-museum': {
    summary: t(
      'El museo de ciencia de la ciudad: planetario 4K, una ciudad a escala infantil y jardín científico.',
      'The city’s science museum: a 4K planetarium, a child-sized city and an outdoor science garden.',
    ),
    description: [
      t(
        'Thinktank está dentro de Millennium Point, en Digbeth, a pocos minutos del centro y del Bullring. Tiene un planetario 4K, un jardín científico interactivo al aire libre y galerías sobre el pasado industrial de Birmingham con máquinas de vapor, trenes, coches y aviones.',
        'Thinktank is inside Millennium Point in Digbeth, minutes from the city centre and the Bullring. It has a 4K planetarium, an interactive outdoor Science Garden and galleries on Birmingham’s industrial past with steam engines, trains, cars and planes.',
      ),
      t(
        'Para los más pequeños está MiniBrum, una ciudad a su medida dividida en zonas de juego, donde se les anima a pensar como científicos: probar ideas, resolver problemas y crear.',
        'For younger visitors there is MiniBrum, a child-sized city made of play zones where children are encouraged to think like scientists: testing ideas, solving problems and being creative.',
      ),
      t(
        'El tranvía llega ahora directamente a Millennium Point, y Moor Street está a 10 minutos a pie. Hay mañanas adaptadas para personas autistas, antes de la apertura al público.',
        'The tram now runs directly to Millennium Point, and Moor Street is a 10-minute walk away. There are autism-friendly mornings before the museum opens to the public.',
      ),
    ],
    highlights: [
      c('El planetario 4K.', 'The 4K Planetarium.', 'bm-tt'),
      c('MiniBrum, la ciudad a escala infantil.', 'MiniBrum, the child-sized city.', 'bm-tt'),
      c('El Science Garden, al aire libre.', 'The outdoor Science Garden.', 'bm-tt'),
      c('Máquinas de vapor, trenes, coches y aviones de época.', 'Historic steam engines, trains, cars and planes.', 'bm-tt'),
    ],
    practical: [fact('booking', 'Se venden entradas en línea.', 'Admission tickets can be booked online.', 'bm-tt')],
    tips: [
      c(
        'Viajando en autobús de National Express o en tren de National Rail puedes conseguir hasta un 50 % de descuento en la entrada (consulta las condiciones).',
        'Travelling by National Express bus or National Rail train can get you up to 50% off admission (terms apply).',
        'bm-tt-getting',
      ),
    ],
    transport: [
      go({
        id: 'tt-bus',
        mode: 'bus',
        service: t('Líneas 14, 55/55A, 66 y 94 (National Express West Midlands)', 'Routes 14, 55/55A, 66 and 94 (National Express West Midlands)'),
        origin: t('The Priory Queensway (frente a Argos)', 'The Priory Queensway (opposite Argos)'),
        stop: t('Jennens Road', 'Jennens Road'),
        sourceIds: ['bm-tt-getting'],
      }),
      go({
        id: 'tt-tram',
        mode: 'tram',
        service: t('West Midlands Metro, cada 15 min', 'West Midlands Metro, every 15 min'),
        stop: t('Millennium Point (vía Albert Street)', 'Millennium Point (via Albert Street)'),
        sourceIds: ['bm-tt-getting'],
      }),
      go({
        id: 'tt-rail-newstreet',
        mode: 'rail',
        stop: t('Birmingham New Street', 'Birmingham New Street'),
        walk: { minutes: '15' },
        sourceIds: ['bm-tt-getting'],
      }),
    ],
    accessibility: [
      {
        text: t(
          'Desde las plantas 1 y 2 del aparcamiento de Millennium Point se entra al edificio sin escalones.',
          'Levels 1 and 2 of the Millennium Point car park give step-free access into the building.',
        ),
        sourceIds: ['bm-tt-getting'],
      },
    ],
    sources: [
      src('bm-tt', 'Thinktank', BM, 'https://www.birminghammuseums.org.uk/thinktank'),
      src('bm-tt-getting', 'How to get here · Thinktank', BM, 'https://www.birminghammuseums.org.uk/thinktank/visit/how-to-get-here'),
    ],
  },

  'cadbury-world': {
    summary: t(
      'La atracción del chocolate en Bournville, a un paseo señalizado desde la estación.',
      'The chocolate attraction in Bournville, a signposted walk from the station.',
    ),
  },
  'legoland-discovery-centre': {
    summary: t(
      'Atracción familiar de LEGO en Arena Birmingham, a cuatro minutos del tranvía.',
      'A family LEGO attraction at Arena Birmingham, four minutes from the tram.',
    ),
  },
  'national-sea-life-centre': {
    summary: t(
      'Acuario junto al canal en Brindleyplace, a dos minutos del tranvía.',
      'A canalside aquarium in Brindleyplace, two minutes from the tram.',
    ),
  },
};
