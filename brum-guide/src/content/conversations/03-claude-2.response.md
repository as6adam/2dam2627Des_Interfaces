Los metadatos revelan que las tres fotos tienen copyright de terceros (Getty, Daniel Graves y Flickr), así que no copiaré los originales; sigo con el registro y miro las miniaturas para los textos alternativos.

Las fotos están revisadas y ya tengo base para los textos alternativos. Marco `Birmingham-Bullring.jpg` para verificar su procedencia, porque parece generada, y ahora reviso los datos de Villa Park en fuentes oficiales.

Los resultados de búsqueda resumen; verifico leyendo las páginas oficiales directamente.

Dirección, estaciones, distancias y tiempos están verificados en dos páginas oficiales del club, que discrepan en la distancia desde Witton y en la zona de exclusión de tráfico; las dejo registradas tal cual. Ahora busco fuentes sobre el club y el estadio.

Los datos de Villa Park están verificados en cuatro páginas oficiales del club; la ficha de Witton en National Rail dio 404, así que la accesibilidad de esa estación queda pendiente. Ahora empiezo el catálogo tipado.

Registro de derechos creado: 48 fotos, todas con el permiso `unconfirmed`, la procedencia que delatan sus metadatos y texto alternativo en español e inglés. Ahora el catálogo único.

Catálogo válido: 10 sectores y 40 lugares (39 de demostración y Villa Park verificado). Ahora el pipeline de imágenes y el componente de foto.

Verifiqué el pipeline en una prueba en seco fuera del proyecto; en el sitio no copié nada porque ninguna foto está autorizada. Ahora escribo el recurso provisional y el componente de foto.

Ahora los diccionarios, ampliados con las cadenas de fichas, transporte, fotos y estados.

Ahora la ficha de lugar, con los campos prácticos, las fuentes y la lista de pendientes.

Ahora los estilos de las nuevas piezas. Reescribo `content.css` entero.

Typecheck y validación del catálogo correctos. Añado la entrada de la fase 2 al diario y amplío la prueba de humo.

Ajuste previo: en la lista de fuentes los enlaces quedaban por debajo de 44 px. Quito esa excepción y reescribo la prueba de humo con las comprobaciones de la fase 2.

73/73 a la primera. Antes de fiarme, reviso el detalle del registro y las capturas.

Se ve correcto. Un detalle: el `h4` de cada opción de transporte conserva el margen por defecto y deja un hueco bajo la etiqueta del modo. Lo corrijo y reviso el tema oscuro.

Legible en oscuro. Ahora la documentación: guía de sustitución de contenidos, informe de derechos de las fotos, README y decisiones de diseño.

La fase 2 está terminada. La comprobación de tipos, la validación del catálogo y los dos builds pasan, y la prueba de humo supera 73 de 73 comprobaciones. No he hecho commit ni push, y no se ha publicado ninguna foto: los metadatos muestran que no todas son tuyas.

## Fotos: ninguna se publica todavía
Ninguna tiene autorización confirmada, y algunos metadatos lo dejan claro:
- `Birmingham-Canal.jpg` es de **Getty Images** (Thomas Faull), una imagen de banco de pago.
- `Santai Spa.jpg` es de **Daniel Graves Photography**.
- `Lickey Hills.jpg` procede de **Flickr**.
- La rotonda de la biblioteca lleva la marca de agua de **Christian Richters**.
- `Birmingham-Bullring.jpg` parece **generada o compuesta**: el canal no llega así al Bullring.

Por eso no he copiado ningún original. Las 48 están en el registro con el permiso `unconfirmed`, la procedencia que revelan sus metadatos y texto alternativo en español e inglés, que redacté mirando cada imagen. La portada ya tiene asignadas sus fotos de Welcome_to_brum, pero de momento se muestra el recurso provisional en el mismo espacio.

El pipeline (`npm run images`) lo probé en seco fuera del proyecto: genera variantes WebP y JPG a 480/960/1600 px y elimina los metadatos. Para publicar una foto basta con cambiarla a `granted` en el registro, añadir su fuente y licencia, y ejecutar ese comando.

## Catálogo y Villa Park
- **Catálogo:** un único archivo tipado ([catalog.ts](../brum-guide/src/content/catalog.ts)) con los 10 sectores en tu orden y con nombre en ES y EN.
- **Villa Park:** todos sus datos salen de las páginas oficiales del club (consultadas el 22-11-2026):
  - Dirección: B6 6HE.
  - Witton: unos 5 minutos a pie y 9 minutos en tren desde New Street.
  - Aston: unos 15 minutos a pie y entre 5 y 10 minutos en tren desde New Street.
  - Lanzadera AV82, que solo funciona en días de partido.
  - Líneas de autobús, accesibilidad, enlace al mapa en OpenStreetMap y cinco fuentes enlazadas.

  La ficha avisa de dos contradicciones entre las páginas del club: el tiempo a pie desde Witton («≈5» frente a «menos de 10» minutos) y el inicio de la zona de exclusión de tráfico (90 minutos frente a 2 horas).
- **Destacado:** los textos del club, del estadio y de la visita son **provisionales** y están marcados así. Los redacté con mis palabras a partir de las fuentes del club, porque no me llegaron los tuyos.
- **Las otras 39 fichas** son de **demostración**: solo tienen el nombre y muestran qué datos faltan. El validador del catálogo rechaza cualquier dato práctico sin fuente.

## Comprobaciones
- **Sectores:** los 10, en español y en inglés, y el enlace del destacado a la ficha de Villa Park.
- **Enlaces directos:** siete rutas, incluidos tres casos de 404.
- **Atrás y adelante:** se recupera exactamente el desplazamiento (300 y 2137 px) y el foco vuelve a la tarjeta que se pulsó.
- **Imágenes:** todas reservan su espacio y no hay saltos de layout (CLS medido: 0).
- **Contraste:** cumple WCAG AA en claro y en oscuro en cuatro tipos de página.
- **Pantallas:** sin desbordamiento y con áreas táctiles de al menos 44 px tanto a 390 como a 1440 px.

## Qué falta por facilitar o verificar
- **Permisos de las fotos:** cuáles puedo publicar, con su fuente y licencia. Las de Getty y Daniel Graves necesitan licencia expresa.
- **Tus textos para Villa Park:** club, estadio y visita.
- **Tu listado de lugares** para sustituir las 39 fichas de demostración, con sus textos y datos prácticos.
- **Accesibilidad de las estaciones de Witton y Aston:** la ficha de National Rail devolvió 404.
- **Textos alternativos:** conviene que los revises.

Cómo sustituir cada cosa está explicado en [content-guide.md](../brum-guide/docs/content-guide.md), y el estado de cada foto en [photo-rights.md](../brum-guide/docs/photo-rights.md).

Fuentes:
- [Travel & Parking](https://www.avfc.co.uk/villa-park/travel-parking)
- [Disability & Accessibility · Travel & Transport](https://www.avfc.co.uk/club/disability-accessibility/travel-transport/)
- [First Time at Villa Park](https://www.avfc.co.uk/villa-park/first-time)
- [Celebrating 125 years of Villa Park](https://www.avfc.co.uk/news/2022/april/12/125-years-of-villa-park--/)
- [About Us](https://www.avfc.co.uk/careers/about-us)
