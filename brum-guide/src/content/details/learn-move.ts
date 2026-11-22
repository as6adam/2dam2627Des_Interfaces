import { c, fact, go, src, t, type PlaceDetail } from './helpers.ts';

const BCC = 'Birmingham City Council';
const LOB = 'https://www.birmingham.gov.uk/info/50132/visiting_the_library_of_birmingham/1408/getting_to_the_library_of_birmingham';

export const learnMove: Record<string, PlaceDetail> = {
  /* -------------------------------------------------------------- Educación */
  'library-of-birmingham': {
    summary: t(
      'La gran biblioteca de Centenary Square, con colecciones de archivo, fotografía y libro raro de importancia internacional.',
      'The great library on Centenary Square, with internationally important archive, photography and rare-book collections.',
    ),
    description: [
      t(
        'La Library of Birmingham reúne colecciones de archivos, fotografía y libro raro que el ayuntamiento describe como de importancia internacional, con una sala de exposiciones que abre esos fondos al público.',
        'The Library of Birmingham holds archive, photography and rare-book collections that the council describes as internationally important, with a gallery that opens them up to the public.',
      ),
      t(
        'En la planta 9 está la Shakespeare Memorial Room, a la que se sube en ascensor o por escaleras. El edificio preside Centenary Square, junto a Symphony Hall y la parada de tranvía Library.',
        'Floor 9 holds the Shakespeare Memorial Room, reached by lift or stairs. The building overlooks Centenary Square, beside Symphony Hall and the Library tram stop.',
      ),
      t(
        'Queda a unos 10-15 minutos a pie de New Street y 15-20 de Snow Hill. Muchas líneas de autobús paran en Broad Street, al lado.',
        'It is about 10-15 minutes’ walk from New Street and 15-20 from Snow Hill. Many bus routes stop nearby on Broad Street.',
      ),
    ],
    highlights: [
      c('La Shakespeare Memorial Room, en la planta 9.', 'The Shakespeare Memorial Room on floor 9.', 'lob-exhibit'),
      c('Las colecciones de archivo, fotografía y libro raro.', 'The archive, photography and rare-book collections.', 'lob-about'),
    ],
    transport: [
      go({ id: 'lob-bus', mode: 'bus', stop: t('Paradas de Broad Street', 'Broad Street stops'), sourceIds: ['lob-getting'] }),
      go({
        id: 'lob-rail-snowhill',
        mode: 'rail',
        stop: t('Birmingham Snow Hill', 'Birmingham Snow Hill'),
        walk: { minutes: '15–20' },
        sourceIds: ['lob-getting'],
      }),
    ],
    accessibility: [
      {
        text: t(
          'Dos plazas para titulares de Blue Badge en Cambridge Street, detrás de la biblioteca; la entrada principal se alcanza por un paso cubierto.',
          'Two Blue Badge bays on Cambridge Street behind the library; the main entrance is reached along a covered walkway.',
        ),
        sourceIds: ['lob-getting'],
      },
    ],
    sources: [
      src('lob-getting', 'Getting to the Library of Birmingham', BCC, LOB),
      src('lob-about', 'About the Library of Birmingham', BCC, 'https://www.birmingham.gov.uk/info/50132/visiting_the_library_of_birmingham/1412/about_the_library_of_birmingham'),
      src('lob-exhibit', 'Holding an exhibition at the Library of Birmingham', BCC, 'https://www.birmingham.gov.uk/info/20087/libraries/2664/holding_an_exhibition_at_the_library_of_birmingham/4'),
    ],
  },

  'shakespeare-memorial-room': {
    summary: t(
      'Una sala dedicada a Shakespeare, instalada en la planta 9 de la Library of Birmingham.',
      'A room dedicated to Shakespeare, installed on floor 9 of the Library of Birmingham.',
    ),
    description: [
      t(
        'La Shakespeare Memorial Room está en la planta 9 de la Library of Birmingham y se llega en ascensor o por escaleras. El ayuntamiento también la ofrece como espacio de exposiciones, con tres vitrinas para libros, objetos y obra.',
        'The Shakespeare Memorial Room is on floor 9 of the Library of Birmingham, reached by lift or stairs. The council also offers it as an exhibition space, with three display cases for books, objects and artwork.',
      ),
      t(
        'Combina bien con un paseo por Centenary Square y una vuelta por el resto de la biblioteca.',
        'It pairs well with a walk around Centenary Square and a look at the rest of the library.',
      ),
    ],
    sources: [],
  },

  'university-of-birmingham': {
    summary: t(
      'El campus de Edgbaston, a diez minutos en tren de New Street y unido al centro por el canal.',
      'The Edgbaston campus, ten minutes by train from New Street and linked to the centre by the canal.',
    ),
    description: [
      t(
        'La Universidad de Birmingham tiene su campus principal en Edgbaston. La línea Cross-City conecta New Street con la estación University con cuatro trenes por hora; el viaje dura unos diez minutos y el centro del campus queda a cinco minutos a pie.',
        'The University of Birmingham’s main campus is in Edgbaston. The Cross-City line links New Street with University station, with four trains an hour; the journey takes about ten minutes and the centre of campus is a five-minute walk away.',
      ),
      t(
        'También se puede llegar andando o en bici por el camino de sirga del canal de Worcester y Birmingham, que va del centro al campus; algunos tramos son accesibles en silla de ruedas y con carrito.',
        'You can also walk or cycle along the Worcester & Birmingham Canal towpath, which runs from the city centre to campus; some stretches are wheelchair and pushchair accessible.',
      ),
    ],
    highlights: [
      c('El paseo por el canal desde el centro.', 'The canal towpath walk from the city centre.', 'uob-directions'),
    ],
    practical: [
      fact(
        'price',
        'El aparcamiento es de pago de lunes a domingo de 8:00 a 18:00 (también festivos); después de las 18:00 es gratis.',
        'Parking is charged Monday to Sunday 8am to 6pm (bank holidays included); after 6pm it is free.',
        'uob-directions',
      ),
    ],
    transport: [
      go({
        id: 'uob-rail',
        mode: 'rail',
        service: t('Línea Cross-City, 4 trenes por hora', 'Cross-City line, 4 trains an hour'),
        stop: t('University', 'University'),
        origin: t('Birmingham New Street', 'Birmingham New Street'),
        ride: t('unos 10 min', 'about 10 min'),
        walk: { minutes: '5' },
        sourceIds: ['uob-directions'],
      }),
      go({
        id: 'uob-cycle',
        mode: 'cycle',
        service: t('Camino del canal de Worcester y Birmingham', 'Worcester & Birmingham Canal towpath'),
        stop: t('Campus de Edgbaston', 'Edgbaston campus'),
        origin: t('Centro de Birmingham', 'Birmingham city centre'),
        sourceIds: ['uob-directions'],
      }),
    ],
    sources: [src('uob-directions', 'Directions', 'University of Birmingham', 'https://www.birmingham.ac.uk/contact/directions')],
  },

  'birmingham-city-university': {
    summary: t(
      'El campus urbano de BCU en Eastside, a pie desde New Street y Moor Street.',
      'BCU’s city-centre campus in Eastside, walkable from New Street and Moor Street.',
    ),
    description: [
      t(
        'El campus del centro de Birmingham City University está en Eastside, junto al parque de Eastside City Park. Se llega a pie desde New Street y desde Moor Street.',
        'Birmingham City University’s city-centre campus is in Eastside, by Eastside City Park. It is walkable from both New Street and Moor Street.',
      ),
      t(
        'Desde Moor Street, sal por la entrada principal, gira a la derecha por Moor Street Queensway y sigue hasta el cruce de Chapel Street con Jennens Road.',
        'From Moor Street, leave by the main entrance, turn right along Moor Street Queensway and continue to the junction of Chapel Street and Jennens Road.',
      ),
    ],
    transport: [
      go({ id: 'bcu-rail-moor', mode: 'rail', stop: t('Birmingham Moor Street', 'Birmingham Moor Street'), walk: {}, sourceIds: ['bcu-directions'] }),
      go({ id: 'bcu-rail-newstreet', mode: 'rail', stop: t('Birmingham New Street', 'Birmingham New Street'), walk: {}, sourceIds: ['bcu-directions'] }),
    ],
    sources: [
      src('bcu-directions', 'City Centre Campus: map and directions', 'Birmingham City University', 'https://www.bcu.ac.uk/about-us/maps-and-campuses/city-centre-campus/map-and-directions/'),
    ],
  },

  /* --------------------------------------------------------------- Bienestar */
  'moseley-road-baths': {
    summary: t(
      'Baños públicos de 1907, protegidos (Grade II*), hoy cerrados por obras de restauración.',
      'Public baths from 1907, Grade II* listed, currently closed for refurbishment.',
    ),
    description: [
      t(
        'Moseley Road Baths abrió en 1907 y es un edificio protegido Grade II*. Según su organización, son los únicos baños del país construidos antes de 1914 que han acogido baño de forma continuada desde su apertura.',
        'Moseley Road Baths opened in 1907 and is Grade II* listed. Its operator says they are the only baths in the country built before 1914 to have hosted swimming continuously since opening.',
      ),
      t(
        'Tras años de campaña vecinal frente a la amenaza de cierre de 2015, una organización benéfica (CIO) asumió la gestión en abril de 2018 con un solo objetivo: mantener la piscina abierta al público.',
        'After years of community campaigning against the threat of closure in 2015, a charitable organisation (CIO) took over management in April 2018 with one purpose: keeping the pool open to the public.',
      ),
      t(
        'Ahora mismo la piscina está cerrada por obras de restauración. Trata el edificio como una parada patrimonial y consulta sus noticias antes de planear un baño.',
        'The pool is currently closed for refurbishment. Treat the building as a heritage stop and check its news before planning a swim.',
      ),
    ],
    practical: [
      fact('status', 'Piscina cerrada por obras de restauración.', 'Pool closed for refurbishment.', 'mrb-contact'),
    ],
    sources: [
      src('mrb-home', 'Moseley Road Baths', 'Moseley Road Baths CIO', 'https://moseleyroadbaths.org.uk/'),
      src('mrb-about', 'About us', 'Moseley Road Baths CIO', 'https://moseleyroadbaths.org.uk/about-us/'),
      src('mrb-contact', 'Contact us', 'Moseley Road Baths CIO', 'https://moseleyroadbaths.org.uk/contact-us/'),
    ],
  },

  'harborne-pool-and-fitness-centre': {
    summary: t(
      'Piscina, gimnasio y clases en Harborne, gestionados por Places Leisure.',
      'Pool, gym and classes in Harborne, run by Places Leisure.',
    ),
    description: [
      t(
        'Harborne Pool and Fitness Centre ofrece piscina, gimnasio y clases dirigidas, también para niños. Lo gestiona Places Leisure.',
        'Harborne Pool and Fitness Centre offers a pool, a gym and classes, including for children. It is run by Places Leisure.',
      ),
      t(
        'Las sesiones se reservan con la aplicación de Places Leisure; las cuotas incluyen hasta 15 días de reserva anticipada.',
        'Sessions are booked through the Places Leisure app; memberships include up to 15 days’ advance booking.',
      ),
    ],
    practical: [
      fact(
        'booking',
        'Reserva de actividades en la app de Places Leisure, con hasta 15 días de antelación según la cuota.',
        'Book activities in the Places Leisure app, up to 15 days ahead depending on membership.',
        'official',
      ),
    ],
  },

  /* ------------------------------------------------------- Deporte y aventura */
  'ackers-adventure': {
    summary: t(
      'Pista de esquí y actividades al aire libre en Small Heath.',
      'A ski slope and outdoor activities in Small Heath.',
    ),
    description: [
      t(
        'Ackers Adventure es un centro de actividades al aire libre en Small Heath, con pista de esquí y una residencia para grupos. Los horarios cambian según la temporada y la actividad, así que hay que mirar cada una.',
        'Ackers Adventure is an outdoor activity centre in Small Heath, with a ski slope and a residential centre for groups. Hours vary by season and activity, so check each one.',
      ),
      t(
        'La entrada está unos 250 metros más allá de la estación de Small Heath, al final de una zona de parque vallada. Su ubicación exacta se puede buscar con what3words.',
        'The entrance is about 250 metres past Small Heath station, towards the end of a fenced area of parkland. Its exact spot can be found with what3words.',
      ),
    ],
    practical: [
      fact('hours', 'Oficina: de lunes a viernes, de 10:00 a 16:00. Las actividades varían por temporada.', 'Office: Monday to Friday, 10am to 4pm. Activity times vary by season.', 'ackers-contact'),
    ],
    transport: [
      go({ id: 'ackers-bus-8', mode: 'bus', service: t('Líneas 8A y 8C', 'Routes 8A and 8C'), stop: t('Walford Road', 'Walford Road'), walk: { minutes: '10' }, sourceIds: ['ackers-contact'] }),
      go({ id: 'ackers-bus-4', mode: 'bus', service: t('Línea 4', 'Route 4'), stop: t('Warwick Road', 'Warwick Road'), walk: { minutes: '15' }, sourceIds: ['ackers-contact'] }),
      go({ id: 'ackers-bus-5-6', mode: 'bus', service: t('Líneas 5 y 6', 'Routes 5 and 6'), stop: t('Stratford Road', 'Stratford Road'), walk: { minutes: '20' }, sourceIds: ['ackers-contact'] }),
      go({
        id: 'ackers-rail',
        mode: 'rail',
        stop: t('Small Heath', 'Small Heath'),
        origin: t('Birmingham Snow Hill o Moor Street', 'Birmingham Snow Hill or Moor Street'),
        walk: { minutes: '15' },
        sourceIds: ['ackers-contact'],
      }),
    ],
    sources: [src('ackers-contact', 'Contact', 'Ackers Adventure', 'https://ackers-adventure.co.uk/contact/')],
  },

  'alexander-stadium': {
    summary: t('El estadio de atletismo de Perry Barr, con instalaciones abiertas al público.', 'Perry Barr’s athletics stadium, with facilities open to the public.'),
    practical: [
      fact(
        'hours',
        'De lunes a viernes de 7:00 a 21:00; sábados y domingos de 8:30 a 17:00.',
        'Monday to Friday 7am to 9pm; Saturday and Sunday 8.30am to 5pm.',
        'official',
      ),
    ],
  },

  'edgbaston-cricket-ground': {
    summary: t(
      'El estadio de críquet de Edgbaston, con autobús lanzadera desde el centro en los grandes partidos.',
      'Edgbaston cricket stadium, with a shuttle bus from the centre on big match days.',
    ),
    description: [
      t(
        'Edgbaston es el gran estadio de críquet de Birmingham. En los días de partido importante hay mucho tráfico, así que conviene salir con tiempo y, si vas en coche, reservar aparcamiento.',
        'Edgbaston is Birmingham’s big cricket stadium. Major match days are busy, so allow extra time and, if driving, book parking in advance.',
      ),
      t(
        'Para partidos seleccionados funciona el autobús 501 desde Smallbrook Queensway, cerca de New Street, desde dos horas antes del inicio. La estación Moseley Village queda a 15-20 minutos a pie.',
        'For selected fixtures the 501 shuttle runs from Smallbrook Queensway, near New Street, from up to two hours before play. Moseley Village station is a 15-20 minute walk.',
      ),
      t(
        'El estadio está fuera de la zona de aire limpio (Clean Air Zone), aunque algunas rutas la cruzan.',
        'The stadium is outside the Clean Air Zone, though some routes to it pass through it.',
      ),
    ],
    practical: [
      fact('booking', 'El aparcamiento debe reservarse con antelación.', 'Parking must be booked in advance.', 'official'),
    ],
    transport: [
      go({
        id: 'edg-501',
        mode: 'shuttle',
        service: t('Lanzadera 501', '501 Shuttle Bus'),
        origin: t('Smallbrook Queensway, cerca de New Street', 'Smallbrook Queensway, near New Street'),
        stop: t('Priory Road', 'Priory Road'),
        availability: t('Solo partidos seleccionados; desde 2 h antes del inicio', 'Selected fixtures only; from up to 2 hours before play'),
        notes: [t('La vuelta sale de la Indoor School al acabar el juego.', 'Return services leave from the Indoor School after the close of play.')],
        sourceIds: ['official'],
      }),
    ],
  },

  /* ----------------------------------------------------------------- Logística */
  'birmingham-new-street-station': {
    summary: t(
      'La principal estación de tren de la ciudad, bajo Grand Central, con acceso sin escalones.',
      'The city’s main railway station, beneath Grand Central, with step-free access.',
    ),
    description: [
      t(
        'Birmingham New Street, en Station Street, es la gran estación de la ciudad y la gestiona Network Rail. Los andenes están por debajo del nivel de la entrada principal.',
        'Birmingham New Street, on Station Street, is the city’s main station and is managed by Network Rail. The platforms are below the level of the main entrance.',
      ),
      t(
        'La taquilla abre de lunes a sábado de 5:15 a 23:00. Hay puntos de ayuda dentro y fuera de la estación, y conexión con tranvía, autobús, taxi y aeropuerto.',
        'The ticket office opens Monday to Saturday 5.15am to 11pm. There are help points inside and outside the station, plus links to tram, bus, taxi and the airport.',
      ),
    ],
    practical: [
      fact('hours', 'Taquilla: de lunes a sábado, de 5:15 a 23:00.', 'Ticket office: Monday to Saturday, 05:15 to 23:00.', 'nr-bhm'),
    ],
    address: { lines: ['Station Street'], postcode: 'B2 4QA', sourceId: 'nr-bhm' },
    map: { provider: 'OpenStreetMap', url: 'https://www.openstreetmap.org/search?query=Birmingham%20New%20Street%20station%2C%20B2%204QA' },
    sources: [src('nr-bhm', 'Birmingham New Street', 'National Rail', 'https://www.nationalrail.co.uk/stations/birmingham-new-street/')],
  },
};
