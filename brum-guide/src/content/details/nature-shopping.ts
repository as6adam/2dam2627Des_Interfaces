import { c, fact, go, src, t, type PlaceDetail } from './helpers.ts';

const BCC = 'Birmingham City Council';

export const natureShopping: Record<string, PlaceDetail> = {
  /* -------------------------------------------------------------- Naturaleza */
  'birmingham-botanical-gardens': {
    summary: t(
      'Jardines en Edgbaston, abiertos casi todo el año y a unos minutos a pie del tranvía.',
      'Gardens in Edgbaston, open almost all year and a few minutes’ walk from the tram.',
    ),
    description: [
      t(
        'Los Birmingham Botanical Gardens están en Westbourne Road, en Edgbaston, al oeste del centro. Son un buen plan de medio día con niños o para descansar entre museos.',
        'Birmingham Botanical Gardens are on Westbourne Road in Edgbaston, west of the centre. They make a good half-day plan with children or a break between museums.',
      ),
      t(
        'En 2026 abren todos los días salvo el 25 y el 26 de diciembre, y se permite llevar comida para hacer pícnic.',
        'In 2026 they open every day except 25 and 26 December, and you are welcome to bring a picnic.',
      ),
      t(
        'La parada de tranvía Edgbaston Village queda a unos 8 minutos a pie. La mayor parte del recinto es accesible en silla de ruedas y se pueden alquilar scooters de movilidad.',
        'Edgbaston Village tram stop is about 8 minutes away on foot. Most of the site is wheelchair-friendly, and mobility scooters can be hired.',
      ),
    ],
    highlights: [c('Un pícnic en los jardines.', 'A picnic in the gardens.', 'bbg-info')],
    practical: [
      fact('hours', 'Abre todos los días de 2026 salvo el 25 y el 26 de diciembre.', 'Open every day in 2026 except 25 and 26 December.', 'bbg-info'),
      fact('contact', 'Reservas y consultas: 0121 454 1860.', 'Bookings and enquiries: 0121 454 1860.', 'bbg-info'),
    ],
    tips: [
      c(
        'El acompañante imprescindible de una persona con discapacidad entra gratis.',
        'An essential companion of a disabled visitor gets in free.',
        'bbg-info',
      ),
    ],
    accessibility: [
      {
        text: t(
          'La mayor parte del recinto es accesible en silla de ruedas; hay scooters de movilidad de alquiler.',
          'Most of the site is wheelchair-friendly, and mobility scooters can be hired.',
        ),
        sourceIds: ['bbg-info'],
      },
    ],
    sources: [
      src('bbg-info', 'Visitor information', 'Birmingham Botanical Gardens', 'https://birminghambotanicalgardens.org.uk/plan-your-visit/visitor-information/'),
    ],
  },

  'cannon-hill-park': {
    summary: t(
      'Un parque de 1873 con lagos, río y minigolf, donde cada sábado se corre un parkrun gratuito.',
      'An 1873 park with lakes, a river and mini golf, home to a free parkrun every Saturday.',
    ),
    description: [
      t(
        'Cannon Hill Park abrió en 1873 en unos terrenos donados por Louisa Ryland. Con los espacios verdes que lo rodean forma una gran zona de unos 250 acres junto al río Rea.',
        'Cannon Hill Park opened in 1873 on land donated by Louisa Ryland. Together with the green spaces around it, it forms a large area of about 250 acres along the River Rea.',
      ),
      t(
        'Es el parque de los planes sencillos: lagos, paseos, un minigolf de 36 hoyos y la Golden Lion Inn, una posada del siglo XVI. La Ruta Ciclista Nacional 5 cruza el parque.',
        'It is the park for easy plans: lakes, walks, 36-hole mini golf and the Golden Lion Inn, a 16th-century inn. National Cycle Route 5 runs through it.',
      ),
      t(
        'Los sábados por la mañana más de 750 corredores se juntan en el parkrun gratuito, y los domingos hay una carrera infantil. Russell Road, Edgbaston Road y Pershore Road dan acceso; elige la puerta antes de quedar.',
        'On Saturday mornings more than 750 runners turn out for the free parkrun, and there is a junior run on Sundays. Russell Road, Edgbaston Road and Pershore Road all lead in, so agree on a gate before meeting.',
      ),
    ],
    highlights: [
      c('El parkrun gratuito de los sábados.', 'The free Saturday parkrun.', 'bcc-chp'),
      c('El minigolf de 36 hoyos.', 'The 36-hole mini golf.', 'bcc-chp'),
      c('La Golden Lion Inn, del siglo XVI.', 'The 16th-century Golden Lion Inn.', 'bcc-chp'),
      c('El paseo junto al río Rea por la Ruta Ciclista Nacional 5.', 'The River Rea walk along National Cycle Route 5.', 'bcc-chp'),
    ],
    practical: [fact('price', 'El acceso al parque es libre; el parkrun es gratuito.', 'The park is free to enter, and parkrun is free.', 'bcc-chp')],
    transport: [
      go({
        id: 'chp-bus-roads',
        mode: 'bus',
        stop: t('Paradas de Edgbaston Road, Pershore Road y Willows Road', 'Stops on Edgbaston Road, Pershore Road and Willows Road'),
        sourceIds: ['bcc-chp'],
      }),
    ],
    sources: [src('bcc-chp', 'Cannon Hill Park', BCC, 'https://www.birmingham.gov.uk/directory_record/9091/')],
  },

  'lickey-hills': {
    summary: t(
      'Cinco colinas de bosque y brezal al suroeste, abiertas al público desde 1888, con rutas señalizadas.',
      'Five wooded, heathy hills to the southwest, open to the public since 1888, with waymarked trails.',
    ),
    description: [
      t(
        'Las Lickey Hills se abrieron al público en 1888 y se declararon parque rural en 1971. Hay restos neolíticos y fueron coto de caza real; hoy son cinco colinas de bosque, brezal y miradores.',
        'The Lickey Hills opened to the public in 1888 and became a country park in 1971. There is Neolithic evidence here, and the hills were once a royal hunting ground; today they are five hills of woodland, heath and viewpoints.',
      ),
      t(
        'Desde el centro de visitantes de Warren Lane salen rutas señalizadas de 1,8, 2,5 y 5,6 millas, así que se puede elegir entre un paseo corto o una mañana entera.',
        'Waymarked routes of 1.8, 2.5 and 5.6 miles start from the visitor centre on Warren Lane, so you can choose between a short stroll or a full morning.',
      ),
      t(
        'Llegar en tren hace de la subida desde Barnt Green por Fiery Hill Road, unos 25 minutos a pie, la primera parte de la excursión.',
        'Arriving by train makes the climb from Barnt Green along Fiery Hill Road, about 25 minutes on foot, the first part of the outing.',
      ),
    ],
    highlights: [
      c('Las rutas señalizadas de 1,8, 2,5 y 5,6 millas.', 'The waymarked routes of 1.8, 2.5 and 5.6 miles.', 'bcc-lickey'),
      c('Las cinco colinas y sus miradores.', 'The five hills and their viewpoints.', 'bcc-lickey'),
    ],
    transport: [
      go({
        id: 'lickey-bus',
        mode: 'bus',
        stop: t('Línea regular de autobús hasta la zona', 'Regular bus route to the area'),
        walk: { minutes: '25' },
        sourceIds: ['bcc-lickey'],
      }),
    ],
    sources: [src('bcc-lickey', 'Lickey Hills Country Park', BCC, 'https://www.birmingham.gov.uk/directory_record/9128/lickey_hills_country_park')],
  },

  'sutton-park': {
    summary: t(
      'Brezal, bosque, humedales y siete lagos en Sutton Coldfield, con ganado y ponis salvajes.',
      'Heathland, woodland, wetlands and seven lakes in Sutton Coldfield, grazed by cattle and wild ponies.',
    ),
    description: [
      t(
        'Sutton Park, en Sutton Coldfield, reúne brezal abierto, bosques, siete lagos, humedales y marismas, cada uno con su propia flora y fauna; algunas especies apenas se ven en el resto de la región.',
        'Sutton Park in Sutton Coldfield brings together open heathland, woodland, seven lakes, wetlands and marshes, each with its own plants and wildlife, some rarely seen elsewhere in the region.',
      ),
      t(
        'El ganado y los ponis salvajes pastan en libertad. Es un lugar para caminar horas sin sensación de ciudad.',
        'Cattle and wild ponies graze the land. It is a place to walk for hours without feeling you are in a city.',
      ),
    ],
    highlights: [
      c('Los siete lagos.', 'The seven lakes.', 'bcc-sutton'),
      c('El ganado y los ponis salvajes.', 'The cattle and wild ponies.', 'bcc-sutton'),
    ],
    sources: [src('bcc-sutton', 'Sutton Park', BCC, 'https://www.birmingham.gov.uk/info/20089/parks/405/sutton_park/5')],
  },

  /* ---------------------------------------------------------------- Compras */
  'bullring-and-selfridges': {
    summary: t(
      'El gran centro comercial junto a los mercados y la iglesia de St Martin, con Selfridges como icono.',
      'The big shopping centre beside the markets and St Martin’s Church, with Selfridges as its icon.',
    ),
    description: [
      t(
        'El Bullring es el corazón comercial del centro, junto a los mercados del Bullring y la iglesia de St Martin. Selfridges ocupa el edificio curvo que se ha convertido en postal de la ciudad.',
        'The Bullring is the centre’s shopping heart, beside the Bullring Markets and St Martin’s Church. Selfridges occupies the curved building that has become a city postcard.',
      ),
      t(
        'Se conecta a pie con Grand Central y New Street. Hay tres aparcamientos oficiales (Bullring Centre, Moor Street y Edgbaston Street), todos con plazas para personas con discapacidad.',
        'It connects on foot with Grand Central and New Street. There are three official car parks (Bullring Centre, Moor Street and Edgbaston Street), all with disabled bays.',
      ),
    ],
    highlights: [c('El edificio de Selfridges, junto a St Martin.', 'The Selfridges building, beside St Martin’s.', 'bullring-access')],
    accessibility: [
      {
        text: t(
          'Desde el aparcamiento principal se entra al Bullring sin escalones; hay ascensores a todas las plantas junto a M&S.',
          'The main car park gives step-free access into the Bullring, and lifts by M&S serve every level.',
        ),
        sourceIds: ['bullring-access'],
      },
    ],
    sources: [src('bullring-access', 'Accessibility', 'Bullring & Grand Central', 'https://www.bullring.co.uk/accessibility')],
  },

  'grand-central': {
    summary: t(
      'Tiendas y restaurantes encima de la estación de New Street.',
      'Shops and restaurants above New Street station.',
    ),
    description: [
      t(
        'Grand Central está encima de la estación de New Street: se sube por escaleras mecánicas desde el vestíbulo y se llega a un atrio con tiendas y restaurantes.',
        'Grand Central sits on top of New Street station: escalators rise from the concourse to an atrium of shops and restaurants.',
      ),
      t(
        'Tiene cinco entradas y rutas sin escalones por todo el recinto, así que es un buen punto de encuentro al llegar en tren.',
        'It has five entrances and step-free routes throughout, which makes it a handy meeting point when arriving by train.',
      ),
    ],
    practical: [
      fact(
        'hours',
        'Shopmobility: de lunes a viernes de 10:00 a 19:30, sábados de 9:30 a 19:30 y domingos de 10:30 a 16:30.',
        'Shopmobility: Monday to Friday 10am to 7.30pm, Saturday 9.30am to 7.30pm and Sunday 10.30am to 4.30pm.',
        'bullring-access',
      ),
    ],
    tips: [
      c(
        'La aplicación gratuita Waymap da indicaciones de audio paso a paso, dentro y fuera del centro.',
        'The free Waymap app gives turn-by-turn audio directions indoors and outdoors.',
        'bullring-access',
      ),
    ],
    accessibility: [
      {
        text: t('Cinco entradas y rutas sin escalones por todo el centro.', 'Five entrances and step-free routes throughout.'),
        sourceIds: ['bullring-access'],
      },
    ],
    sources: [src('bullring-access', 'Accessibility', 'Bullring & Grand Central', 'https://www.bullring.co.uk/accessibility')],
  },

  'great-western-arcade': {
    summary: t(
      'Galería victoriana de 1876-77 construida sobre el túnel del tren, elegida edificio favorito de la ciudad en 1988.',
      'An 1876-77 Victorian arcade built over the rail tunnel, voted the city’s favourite building in 1988.',
    ),
    description: [
      t(
        'La Great Western Arcade se construyó entre 1876 y 1877 para cubrir el túnel ferroviario que une Moor Street y Snow Hill. La levantó la Great Western Company con diseño de W. H. Ward, inspirado en el pabellón de Paxton para la Gran Exposición. Está protegida (Grade II).',
        'The Great Western Arcade was built in 1876-77 to span the railway tunnel between Moor Street and Snow Hill. The Great Western Company built it to a design by W. H. Ward, influenced by Paxton’s Great Exhibition building. It is Grade II listed.',
      ),
      t(
        'Se restauró en 1984, la Birmingham Civic Society la premió en 1985 y en 1988 fue votada el edificio favorito de Birmingham. Hoy reúne comercio independiente bajo su cubierta.',
        'It was restored in 1984, won a Birmingham Civic Society award in 1985 and was voted Birmingham’s favourite building in 1988. Today it gathers independent shops under its roof.',
      ),
      t(
        'Tiene entradas por Temple Row y por Colmore Row, en pleno distrito de negocios.',
        'It has entrances on Temple Row and Colmore Row, in the heart of the business district.',
      ),
    ],
    highlights: [
      c('La galería victoriana sobre el túnel del tren.', 'The Victorian arcade over the railway tunnel.', 'gwa-about'),
      c('El comercio independiente.', 'Its independent shops.', 'gwa-visit'),
    ],
    sources: [
      src('gwa-visit', 'Visit us', 'Great Western Arcade', 'https://greatwesternarcade.co.uk/visit-us'),
      src('gwa-about', 'About GWA', 'Great Western Arcade', 'https://greatwesternarcade.co.uk/about-gwa'),
    ],
  },

  mailbox: {
    summary: t(
      'Tiendas, restaurantes y ocio junto a los canales, a tres minutos de New Street.',
      'Shops, restaurants and leisure on the canals, three minutes from New Street.',
    ),
    description: [
      t(
        'The Mailbox se presenta como uno de los mayores espacios de uso mixto del Reino Unido fuera de Londres: tiendas, restauración, ocio y hoteles en un edificio que mira a la red de canales.',
        'The Mailbox describes itself as one of the UK’s largest mixed-use destinations outside London: shops, dining, leisure and hotels in a building overlooking the canal network.',
      ),
      t(
        'Está a unos tres minutos a pie de New Street y es un buen inicio o final para pasear por los canales. El recinto abre las 24 horas; las tiendas tienen su propio horario.',
        'It is about three minutes’ walk from New Street and a good start or end point for a canal walk. The venue is open 24/7; shops keep their own hours.',
      ),
    ],
    tips: [c('Empieza aquí un paseo por los canales.', 'Start a canal walk here.', 'mailbox-about')],
    sources: [
      src('mailbox-about', 'About', 'Mailbox', 'https://mailboxlife.com/about/'),
      src('mailbox-visit', 'Plan your visit', 'Mailbox', 'https://mailboxlife.com/visitors/plan-your-visit/'),
    ],
  },
};
