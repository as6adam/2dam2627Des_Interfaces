Las 48 fotos ya están marcadas como autorizadas, con su autoría para el crédito. Ahora limito el ancho a 2400 px en portada y 1600 px en fichas para que el build no pese unos 39 MB.

Se generaron 270 variantes (30 MB) para las 48 fotos, con los originales intactos. Ahora ajusto el pie de foto para mostrar solo el autor cuando se conoce, y luego actualizo la prueba y el diario.

Un fallo: «El destacado enlaza a la ficha de Villa Park». Miro el detalle.

La prueba está en carrera con el cambio de URL: lee el `h1` antes de que React pinte la ficha. La siguiente comprobación, sobre esa misma ficha, sí pasa, así que voy a hacer que espere al título.

76/76 en dos ejecuciones seguidas. Reviso visualmente la portada y la ficha con las fotos reales.

Tres tarjetas inferiores salen vacías en la captura de página completa; supongo que es carga diferida, así que voy a desplazarme de verdad para comprobarlo.

Confirmado: antes de desplazar no se carga ninguna foto de las tarjetas, y al desplazar se cargan las 10. La carga diferida funciona como debe. Hago el build final en la raíz y limpio.

Hecho. Las 48 fotos están marcadas como autorizadas, tienen sus variantes generadas y aparecen en la guía. El build y la prueba de humo pasan: 76 de 76 comprobaciones en dos ejecuciones seguidas.

**Registro de derechos.** Las 48 figuran como `granted`, con tu declaración como base: uso académico no comercial, sin publicación pública, fechada el 22-11-2026. No he borrado la autoría que ya constaba (Getty / Thomas Faull, Daniel Graves, Christian Richters, Flickr). Ya no bloquea nada y sirve para dar el crédito: el pie de foto muestra el autor cuando se conoce. El informe está actualizado en [docs/photo-rights.md](../brum-guide/docs/photo-rights.md).

**Variantes.** `npm run images` generó 270 archivos WebP y JPG (30 MB), sin metadatos. Las fotos de portada llegan hasta 2400 px y las de las fichas hasta 1600 px, para no inflar el build. Los originales de `Brum_pics` siguen sin modificar.

**En la guía:**
- **Portada:** Victoria Square como foto principal, cuatro fotos de Welcome_to_brum en la tira y Villa Park en el destacado.
- **Sectores:** cada tarjeta lleva la foto de su primer lugar; la de Deporte y aventura lleva Villa Park.
- **Fichas:** los 40 lugares muestran su foto, con texto alternativo en español e inglés.

**Pruebas.** Añadí comprobaciones de que todas las imágenes usan `srcset` con WebP, de que ninguna está rota, de que los 40 lugares tienen foto y de que el build solo contiene variantes autorizadas. El layout sigue sin saltos (CLS 0). Lo único que falló por el camino fue una carrera del propio test, que leía el título antes de que se pintara la ficha, y ya está corregida. Las tres tarjetas que salían vacías en la captura de página completa eran efecto de la carga diferida: al desplazar de verdad se cargan las 10.

Un aviso: dijiste que no habrá publicación pública, pero el workflow de `.github/workflows/ci-pages.yml` despliega en GitHub Pages en cuanto se hace push a `main`, y esa página es pública. Si vas a subir el repositorio, conviene quitar el job de despliegue o hacer el repositorio privado.

Sigue pendiente de tu parte lo mismo de antes: los textos de Villa Park, el listado de lugares para sustituir las 39 fichas de demostración, la accesibilidad de las estaciones de Witton y Aston y la revisión de los textos alternativos.
