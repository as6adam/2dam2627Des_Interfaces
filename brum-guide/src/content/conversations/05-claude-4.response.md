Activé la skill y localicé los cinco puntos marcados como no verificados en `motion-reference.md`. Vuelvo a la página de HONOR para comprobarlos.

La escala de exploración solo muestra valores fijos, así que es una escala estática de maquetación y no depende del scroll. Como los saltos programáticos dan una medición poco fiable de la cabecera, la repetiré con la rueda real del ratón.

Comprobado que al subir 300 px la cabecera global no vuelve; solo queda la subnavegación con la clase `fixed`. Reviso ahora las hojas de estilo.

Ya comprobé el disparador de la sección `zoom`, que cambia el marco de la foto a `scale(1)` en 0,7 s al cruzar el umbral. Ahora paso a móvil para revisar los carruseles y el arrastre táctil.

Hay 13 carruseles Swiper con arrastre activo en móvil; el de destacados quedó como columna. Ahora pruebo un arrastre horizontal real sobre uno de ellos.

El arrastre con el ratón no hace avanzar el carrusel, pero como Swiper escucha eventos táctiles, esa prueba no es concluyente. Voy a repetirla con eventos táctiles reales vía CDP en un Chrome con tacto emulado.

Los gestos táctiles dieron un resultado inconsistente: solo uno de cuatro avanzó el carrusel, aunque los botones «siguiente» funcionaron. Lo registraré como verificado solo parcialmente, y paso a implementar.

La API de `useSpring` admite `bounce` y `visualDuration`, así que centralizo todos los parámetros de movimiento en un solo módulo.

Ahora la infraestructura: el registro de la foto compartida (tarjeta ↔ ficha) y los componentes de revelado.

Ahora la apertura fotográfica de la portada.

Ahora conecto la transición en las tarjetas, la portada y las vistas de sector y ficha.

Ahora la ficha: índice de secciones (fijo solo en escritorio), revelado de los bloques editoriales y foto compartida.

Typecheck correcto. Ahora los estilos: escenario de apertura, controles de la tira, índice y maquetación de la ficha.

Las dos pruebas fallidas esperaban el antiguo `.hero__photo`, cuando la apertura ahora reserva el espacio con la altura del escenario. Voy a actualizar la prueba de humo y escribir una suite para el movimiento.

En escritorio el marco pasa de 0,86 a 1 y la imagen se asienta, mientras que en móvil la capa frontal no se monta y por eso el test fallaba; corrijo la aserción.

Revelado, teclado, pulsación táctil y movimiento reducido van bien; quedan cuatro puntos por aclarar, empezando por la transición en escritorio, que sospecho depende del orden de las callbacks de requestAnimationFrame.

La transición va bien en escritorio (361 → 1040 px), aunque la cola es lenta y aún va por 1016/1040 tras unos 70 frames. Mido los tiempos exactos.

La transición está bien: a unos 159 fps, 90 frames duran solo ~0,55 s, así que ajusto el test para medir por tiempo, usar `exact` en el encabezado y deslizar con eventos táctiles reales.

Solo falla el test: en móvil la tarjeta está pulsada (escala 0,97) al medir el origen, así que el vuelo parte de 345 px como debe. Ajusto el test para comparar con el rectángulo pulsado.

Movimiento 53/53 y humo 76/76. Reviso las capturas de la apertura.

Al abrir Purnell's escribiendo la URL en una pestaña que ya tenía la guía, la página aparece desplazada y la cabecera queda fuera de la vista. Lo reproduzco para confirmarlo.

Confirmado: el hash de la entrada nueva tiene `history.state` nulo, así que el router la trata como la carga inicial, y eso hace que `ScrollRestoration` y la memoria de foco restauren posiciones de otra página. Lo corrijo con una clave que use la ruta en esas entradas.

Corregido: ahora empieza arriba (0 px) en ambos modos. Añado una regresión para este caso a la suite de movimiento y vuelvo a ejecutar todo.

Ambas suites están en verde: movimiento con 55/55 y humo con 76/76. Ahora actualizo la referencia de HONOR, escribo el registro de verificación y añado la entrada al diario.

Ahora las decisiones de diseño, el diario y el README.

Paso final: añado la suite de movimiento al workflow de CI y repito todo desde cero (typecheck, build, las dos suites y el build en la raíz).

La fase 3 está terminada. El build pasa, la prueba de humo supera 76 de 76 comprobaciones y la nueva suite de movimiento (`npm run test:motion`) supera 55 de 55, todo en Chrome 158 headless. No he instalado nada: Motion ya estaba. Nada está commiteado ni publicado, y los originales de `Brum_pics` siguen intactos.

## Reverificación en HONOR
- **Cabecera:** al subir 300 px con la rueda real, la cabecera global no reaparece; solo se queda fija la subnavegación.
- **Escala:** ninguna escala está ligada al scroll. Lo que sí existe es un salto por umbral en la sección `zoom`: el marco de la foto pasa de `scale(1.5)` a `scale(1)` en 0,7 s. Esa es la base de la apertura de Brum.
- **Movimiento reducido:** solo hay dos reglas en sus 25 hojas de estilo, y ninguna afecta a las animaciones del producto.
- **Móvil:** hay 13 carruseles Swiper con arrastre táctil activo. Con tacto emulado, solo 1 de 4 deslizamientos avanzó un carrusel; los botones funcionaron siempre.
- **Sin verificar:** dispositivos físicos, Safari para iOS y la reproducción de vídeo en modo de bajo consumo.

## Las tres interacciones
1. **Apertura fotográfica** en la portada: el marco de la foto de Victoria Square se abre (de 0,86 a 1) mientras la imagen se asienta (de 1,18 a 1), y la Biblioteca vista desde el canal sube en primer plano.
   - El escenario solo queda fijo con `sticky` en escritorio. En móvil no hay paralaje, solo un leve asentamiento de la imagen.
   - Durante el scroll únicamente cambian estilos en línea (385 cambios de estilo, ninguno de otro tipo), así que React no se vuelve a renderizar en cada frame.
   - El botón «Explorar los sectores» es la alternativa visible y de teclado al recorrido por scroll.
2. **Revelado progresivo:** las secciones de las fichas, el diario y las tarjetas aparecen una sola vez al llegar a ellas, con 28 px de desplazamiento y entrada escalonada.
   - La ficha tiene ahora un índice de secciones, fijo solo en escritorio, que lleva el foco al título de cada sección.
3. **Transición tarjeta ↔ ficha:** la foto viaja de la tarjeta a la ficha y vuelve por el mismo camino con el botón atrás. Llega al 98 % en 527 ms y sin rebote.
   - En pantalla táctil, la tarjeta se encoge a 0,97 nada más tocarla, y el viaje sale de ese tamaño pulsado.

Todos los parámetros de muelle, distancias y ritmos están en [springs.ts](../brum-guide/src/motion/springs.ts).

## Pruebas por entorno
- **Escritorio a 1440 px:** con ratón y con teclado.
- **Móvil a 390 px:** con tacto emulado; los gestos se generan con eventos táctiles de Chrome, no con un dedo real.
- **Movimiento reducido, en ambos anchos:** sin paralaje, escalas, desplazamientos amplios ni viaje de la foto. Solo quedan fundidos breves, y el acceso directo y el foco funcionan igual.

## Fallo encontrado y corregido
Al escribir o pegar una dirección de la guía en la barra de una pestaña donde ya estaba abierta, la página nueva aparecía desplazada 679 px y el foco no iba a su título. Ahora empieza arriba con el foco en el título, y hay una prueba para que no vuelva a pasar.

El registro de qué se verificó y en qué entorno está en [motion-verification.md](../brum-guide/docs/motion-verification.md), y la reverificación de HONOR, en [motion-reference.md](../brum-guide/docs/motion-reference.md). También he añadido la suite de movimiento al workflow de CI y una entrada de la fase 3 al diario.
