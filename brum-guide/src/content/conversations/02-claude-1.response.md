Estado: skill `apple-design` cargada; proyecto irá en `Desktop\brum-guide`. Ahora analizo el HTML de HONOR (GSAP ScrollTrigger + Swiper detectados) antes de observarlo en el navegador.

Rechazo las cookies no esenciales en HONOR y mido con scroll real qué elementos se fijan y cómo cambian.

Node 22.23.5 cumple todos los requisitos (el más estricto es React Router 8: ≥22.22). Creo `Desktop\brum-guide` e instalo con npm.

Configuración base lista (Vite 8 multipágina, base configurable, arranque de tema inline). Ahora escribo i18n, preferencias y contratos de contenido.

Contratos e inventario listos (11 carpetas, 48 fotos, solo lectura). Sigo con i18n y preferencias.

Vistas de la guía escritas; corrijo un detalle de SectorPage y sigo con diario, entradas y estilos.

Typecheck sin errores. Compruebo que realmente analiza los archivos y lanzo el build.

Ahora el test de humo con Playwright sobre Chrome instalado (sin descargar navegadores).

44/48 en la primera pasada; el fallo es real: el enlace «Guía» de las migas mide 31 px de ancho. Lo corrijo y reviso las capturas.

Dos ajustes visuales pendientes: el menú deja traslucir el ladrillo porque la animación de `filter` anula el `backdrop-filter`, y el ladrillo está trabado. Los corrijo ahora.

Es el `vite preview` que dejó mi ejecución anterior: el `taskkill` se lanzaba de forma asíncrona justo antes de `process.exit`. Lo cierro y hago la limpieza síncrona.

48/48, pero el servidor sigue vivo tras el test. Lanzaré Vite directamente con `node` (sin `npx`/shell) para que `kill()` lo cierre de verdad.

Menú ya legible pero la fila inferior aún deja pasar el patrón; lo hago opaco (la regla de la skill: nada de material claro translúcido sobre fondo con detalle).

Ahora la documentación de referencia de movimiento con lo medido en HONOR.

La fase 1 está terminada en `[dato privado omitido]\Desktop\brum-guide`. La comprobación de tipos y los dos builds (en la raíz y con la base de prueba `/brum-guide/`) pasan sin errores, y la prueba de humo supera 48 de 48 comprobaciones. No he hecho commit, push ni publicación. Sí he inicializado git en local (`git init`) para que la carpeta `.github/workflows` tenga sentido, sin ningún commit.

## Resultados de las pruebas
La prueba (`npm run test:e2e`) se ejecuta contra el build servido con `vite preview` en `/brum-guide/`, usando el Chrome que tienes instalado. Comprueba esto:
- **Primera visita:** con el almacenamiento limpio, la página carga en español y tema claro desde el primer pintado.
- **Menú de idioma por teclado:** se abre, marca el idioma activo y Escape lo cierra devolviendo el foco al botón. Al cambiar a inglés se actualizan `<html lang>`, la navegación y el título de la pestaña.
- **Persistencia:** inglés y oscuro se mantienen tras recargar y al pasar de la guía al diario y volver, ya desde el primer pintado.
- **Rutas hash directas:** sector, lugar y tres casos de 404 (ruta desconocida, sector inventado, lugar en un sector que no le corresponde).
- **Base:** ningún enlace empieza por `/` y todas las peticiones quedan bajo `/brum-guide/`. No hay respuestas 4xx/5xx ni errores de consola.
- **Almacenamiento bloqueado:** los controles siguen funcionando y la página arranca en español y claro.
- **390 px y 1440 px:** sin desbordamiento horizontal, áreas táctiles de al menos 44 px y el menú dentro de la pantalla al abrirlo con un toque.

Durante las pruebas encontré y corregí tres fallos:
- El enlace «Guía» de las migas medía 31 px de ancho.
- El menú de idioma dejaba ver el ladrillo de la portada a través; ahora es opaco.
- El test dejaba vivo el servidor de vista previa; ahora lo cierra al terminar.

## Archivos principales
- **Configuración:** [vite.config.ts](../brum-guide/vite.config.ts) define las dos entradas, la base configurable (`--base` o `BASE_PATH`) e inserta el script que aplica tema e idioma antes del primer pintado, generado desde [bootScript.ts](../brum-guide/src/preferences/bootScript.ts).
- **Guía:** [router.tsx](../brum-guide/src/guide/router.tsx) para las rutas hash, [LanguageMenu.tsx](../brum-guide/src/components/LanguageMenu.tsx), [ThemeSwitch.tsx](../brum-guide/src/components/ThemeSwitch.tsx) y [tokens.css](../brum-guide/src/styles/tokens.css), que incluye los tokens de áreas seguras.
- **Contenido:** los contratos de sector, lugar, foto y diario están en [types.ts](../brum-guide/src/content/types.ts).
- **Documentación:** [motion-reference.md](../brum-guide/docs/motion-reference.md), [design-decisions.md](../brum-guide/docs/design-decisions.md), [photo-inventory.md](../brum-guide/docs/photo-inventory.md) y el [README](../brum-guide/README.md) con los comandos.

## Skill `apple-design`
Se cargó bien. Estas decisiones salen de ella:
- **Muelles:** sin rebote por defecto; el rebote queda reservado a gestos con impulso.
- **Respuesta al pulsar:** las tarjetas se reducen al 97 % en cuanto se tocan, no al soltar.
- **Selector de tema:** la píldora se puede interrumpir y cambiar de sentido a mitad de recorrido.
- **Menú de idioma:** se abre desde el botón del globo y se cierra por el mismo camino.
- **Barra superior:** es translúcida y solo muestra el borde cuando hay contenido debajo.
- **Movimiento reducido:** los desplazamientos se convierten en fundidos breves, y el modo de transparencia reducida da superficies sólidas.
- **Tipografía:** el espaciado entre letras cambia con el tamaño: más ajustado en titulares, neutro en el texto.
- **Navegación:** áreas táctiles de 44 px y, al cambiar de vista, el foco pasa al título.

## Referencia de HONOR
La descargué con `curl` y la observé en el navegador integrado a 1440 y a 390 px. Los efectos de scroll usan GSAP con 57 disparadores, pero ninguno fija elementos: todo lo fijo es CSS `position: sticky`. Hay tres mecánicas principales:
- **Paralaje por capas:** el texto sube de 108 px a 0 y su opacidad pasa de 0,5 a 1.
- **Clases por umbral:** al cruzar un punto se activa una clase y, al volver hacia arriba, se desactiva.
- **Vídeo al entrar:** el vídeo arranca cuando la sección aparece en pantalla.

En móvil se desactiva el paralaje y el carrusel de destacados pasa a ser una columna de 4195 px. El documento separa lo observado de lo inferido y propone una adaptación para cada mecánica, por ejemplo un selector Día/Noche con tus fotos de Victoria Square. Lo que no pude comprobar: gestos táctiles reales, Safari en iOS y las hojas de estilo externas.

## Pendiente
- **Catálogo:** las 48 fotos (11 carpetas) están inventariadas pero sin copiar ni modificar. Las fichas de lugar se generan provisionalmente a partir de los nombres de archivo.
- **PWA:** `vite-plugin-pwa` está instalado pero desactivado. `offline.html` y los iconos ya están preparados.
- **Animaciones de scroll:** se dejan para su fase, siguiendo la referencia de HONOR.
- **Avisos de npm:** hay 4 avisos de seguridad moderados en dependencias de `vite-plugin-pwa` que solo se usan al compilar. La única solución que ofrece npm es bajar ese plugin a una versión anterior con cambios incompatibles, así que no la he aplicado.
- **Tamaño del bundle:** el bloque compartido pesa unos 121 KB comprimido; se puede reducir cuando lleguen las animaciones.
- **Workflow de GitHub:** el de CI y Pages está escrito, pero no hará nada hasta que subas el repositorio.
