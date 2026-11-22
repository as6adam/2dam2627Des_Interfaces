Las librerías de Workbox ya están instaladas, pero solo como dependencias de vite-plugin-pwa, así que las declaro como propias; la variante de imagen más grande pesa 556 KB, lo que fijará el límite de la caché.

Generaré los iconos PNG con Chrome: una versión normal de esquinas redondeadas y otra *maskable* a sangre, que también servirá de base para el `apple-touch-icon`.

Iconos correctos: el glifo queda dentro de la zona segura del 80 % en la variante maskable. Ahora configuro el manifiesto y el worker en `vite.config.ts`.

Ahora el service worker.

Ahora la parte de cliente: el aviso de nueva versión, el estado sin conexión y el fallo de fotos. Primero los textos bilingües.

Ahora los conecto: el aviso y el estado sin conexión en el armazón común, los enlaces externos de la ficha y el fallo de carga de las fotos.

Ahora los estilos: aviso, estado sin conexión y ajustes de áreas seguras en vertical y horizontal.

Build correcto: worker generado, manifiesto enlazado desde las dos páginas y 18 entradas precargadas (705 KB). Compruebo qué contiene exactamente la precarga.

La precarga ya incluye las dos páginas, el JS, el CSS, los iconos y el manifiesto, pero ninguna foto. Desactivo la inclusión automática del plugin, porque duplica iconos y manifiesto.

Precarga ya sin duplicados: 15 entradas. Actualizo el workflow de GitHub Actions.

Ahora la suite PWA: genera dos builds con versiones distintas para probar la actualización y lo comprueba todo bajo `/brum-guide/`.

47 de 48 pasan; solo falla «Más tarde cierra el aviso», y ahora investigo si es la animación de salida o que el aviso reaparezca.

La animación de salida estaba causando el fallo: ahora pasa 48 de 48. Voy a quitar código muerto del test, revisar las capturas y volver a ejecutar las otras dos suites.

Los capturas muestran dos problemas: el banner sin conexión no está alineado con la columna, y la prueba de pulsación falla porque el aviso de la primera visita tapa la tarjeta. Voy a alinear el banner y cerrar el aviso antes de pulsar.

Movimiento vuelve a 55/55; ahora documento la PWA y el protocolo para la prueba física en iPhone, que quedará como no realizada.

PWA 48/48. Cierro con el README, el diario y las decisiones de diseño, elimino el marcador obsoleto `src/pwa/status.ts` y hago la pasada final completa.

Todo pasa. Echo un vistazo a la captura del área segura en horizontal y al banner sin conexión ya alineado.

La fase 4 está terminada. La guía ya funciona como PWA instalable. Todas las pruebas pasan: humo 76/76, movimiento 55/55 y la nueva suite PWA (`npm run test:pwa`) 48/48. Todo se ha probado en **Chrome de escritorio con emulación**. **La prueba en un iPhone real no la he hecho.** No hay commit, push ni despliegue, y los originales de `Brum_pics` siguen intactos.

**Manifiesto e iconos**
- `id`, `start_url` y `scope` son relativos (`./`), así que se resuelven a `/<repo>/` sin depender de la raíz del dominio. Modo standalone, nombre «Brum» y colores del tema.
- Iconos PNG propios: 192 y 512 px, una variante *maskable* (glifo dentro de la zona segura) y `apple-touch-icon` de 180 px. Se regeneran con `npm run icons`.
- Las dos páginas llevan los metadatos de pantalla de inicio de iOS, con la barra de estado superpuesta y compensada por las áreas seguras.
- Comprobado bajo `/brum-guide/`: manifiesto, worker, diario e iconos responden con 200 y las dimensiones correctas.

**Worker (Workbox, `src/pwa/sw.ts`)**
- **Precarga** 15 recursos: las dos páginas, `offline.html`, el JS (que incluye los textos ES/EN), el CSS, los iconos y el manifiesto. Ninguna foto.
- **Diario sin conexión:** cada página responde a su propia URL y no hay fallback global. Sin conexión, `diario.html` abre el diario, y una ruta desconocida lleva a `offline.html`.
- **Fotos:** se guardan bajo demanda y solo las locales. Límites de 80 entradas, 30 días y 750 KB por archivo. Comprobé el límite de cantidad: se pidieron 240 fotos y quedaron 80 guardadas.
- **Estado sin conexión:**
  - Un banner explica qué sigue funcionando.
  - Las fotos no guardadas muestran «Foto no disponible sin conexión» en su propio espacio.
  - El mapa y las fuentes aparecen marcados como «requiere conexión».
- **Nueva versión:** aparece un aviso en español e inglés con «Más tarde» y «Actualizar». La actualización solo se aplica al confirmar. Comprobé el ciclo completo: la versión pendiente se mantiene, el aviso vuelve a salir al reabrir y, tras confirmar, la página se recarga con la versión nueva.

**Áreas seguras:** las comprobé con la emulación de Chrome. En vertical (inserciones de 59/34 px) la barra queda bajo la de estado. En horizontal (59 px laterales) el contenido se separa de la isla. En ningún caso hay desbordamiento horizontal.

**Corregido por el camino:** el aviso «Lista para usarse sin conexión» tapaba la parte inferior de una tarjeta y se quedaba con el toque. Ahora se retira solo a los 8 s, salvo que tenga el foco o el puntero encima.

**Workflow de GitHub Actions:** ejecuta `npm ci`, las comprobaciones de tipos y catálogo, las tres suites con el subpath de prueba, el build con `/<repo>/` y el despliegue de `dist/` en Pages. No se ha ejecutado porque no hay push. Recuerda que una web de GitHub Pages es pública.

**Prueba en iPhone:** [docs/pwa.md](../brum-guide/docs/pwa.md) recoge el protocolo en 14 pasos, todos marcados ☐ pendiente:
- Añadir a la pantalla de inicio y comprobar icono y modo standalone.
- Girar el dispositivo.
- Cambiar idioma y tema.
- Cerrar y reabrir.
- Probar el modo avión.
- Comprobar la actualización.

Safari solo registra el worker por HTTPS, así que la prueba exige desplegar en Pages (solo si me lo pides) o servir el build por HTTPS en tu red con un certificado de confianza.

Ahora `dist/` contiene el build con base en la raíz (`/`). Para servirlo bajo un subpath, vuelve a generarlo con `npm run build:pages` o con `BASE_PATH`.
