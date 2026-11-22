Arquitectura de la guía de Birmingham
Usaría React, TypeScript y Vite, con dos páginas HTML reales. index.html sería la guía interactiva y diario.html sería la entrega académica. Dentro de la guía, la portada, los sectores y las fichas serían vistas con URLs propias mediante navegación con hash. Así, un enlace como /<repo>/#/lugar/villa-park se puede compartir y recargar en GitHub Pages, y los cambios de vista se pueden animar sin recargar la página. El diario tendrá su propio enlace directo y compartirá la barra de navegación, el idioma y el tema. Vite y GitHub Pages · Entradas HTML múltiples en Vite
Capa	Elección
Interfaz	React, TypeScript y CSS con variables de diseño, Grid y Flexbox. Tipografía del sistema y componentes propios orientados al uso táctil.
Navegación	React Router con hash para la guía. Enlaces HTML entre index.html y diario.html.
Movimiento	Motion for React para profundidad vinculada al scroll, transiciones de tarjetas y muelles. CSS para estados simples de pulsación, foco y hover.
Idioma y tema	Diccionarios tipados es y en, un proveedor compartido y localStorage. Primera visita en español y tema claro. Aplicación del tema antes del primer pintado.
PWA	vite-plugin-pwa y Workbox. Manifiesto, iconos propios, service worker, caché con límites y pruebas desde la pantalla de inicio del iPhone.
Datos y despliegue	Catálogo local, fotos empaquetadas y GitHub Actions para desplegar dist/ en Pages. Sin servidor, cuentas ni claves de API.


La referencia de HONOR sirve para estudiar la relación entre el scroll y el movimiento. Le pediría a Claude que haga un fetch directo y observe la página en un navegador, mida sus comportamientos en móvil y escritorio y adapte las mecánicas comprobadas a una identidad visual propia de Birmingham. El análisis del HTML por sí solo no confirma el comportamiento de las animaciones. La guía tendrá su propia composición, secuencia, material gráfico y ajustes de movimiento. HONOR Magic8 Pro · Animaciones de scroll en Motion
Pantallas y contenido
- Portada. Apertura fotográfica de Birmingham, acceso visible a los diez sectores y un destacado de Aston Villa y Villa Park. En móvil, los accesos deben quedar al alcance sin obligar al visitante a recorrer una secuencia larga de animación.
- Sector. Cabecera fotográfica, introducción y tarjetas de lugares o paradas. El layout se adapta de una columna en móvil a una cuadrícula en escritorio. Volver desde una ficha restaura la posición de la lista y el foco en su tarjeta.
- Ficha. Foto, descripción, dirección, accesibilidad y una sección Cómo llegar con parada o estación recomendada, medios de transporte, tramo a pie, origen de referencia cuando proceda y enlace al mapa. Villa Park usará la misma ficha y tendrá un bloque editorial propio sobre el club y la cultura futbolística de la ciudad.
- Diario. Qué abarca la guía, qué ofrece al visitante y cómo se construyó. Cada entrada tendrá fecha, fase, herramienta, modelo registrado en la sesión, prompt, respuesta o resumen identificado como tal, decisiones, comprobaciones y reparto entre tú, ChatGPT y Claude Code. El diario podrá publicarse sin volcar conversaciones completas, datos personales ni rutas locales.
Comprobé [dato privado omitido]\Desktop\Brum_pics. Contiene 48 fotos: cuatro en cada una de las diez carpetas temáticas y ocho en Welcome_to_brum. Usaría esta última como fuente para la portada y asignaría las demás por lugar, conservando los originales fuera del proyecto. Algunas imágenes de la selección anterior se descargaron de terceros, así que el inventario debe distinguir las fotos propias de las que requieren verificar permiso o atribución antes de publicar.
Estructura del proyecto
brum-guide/
├── index.html                    # Entrada de la guía
├── diario.html                   # Entrada de la entrega académica
├── public/
│   ├── icons/                    # Iconos PWA y apple-touch-icon
│   └── offline.html              # Respuesta para navegación sin copia local
├── src/
│   ├── entries/                  # Arranque independiente de guía y diario
│   ├── guide/                    # Portada, sector, ficha y navegación
│   ├── journal/                  # Página y presentación de entradas
│   ├── components/               # AppShell, TopNav, selectores y tarjetas
│   ├── content/
│   │   ├── sectors.ts
│   │   ├── places.ts
│   │   ├── media.ts
│   │   └── journal.ts
│   ├── assets/images/            # Copias optimizadas para publicar
│   ├── i18n/                     # Diccionarios es/en y formato
│   ├── preferences/              # Idioma, tema y arranque del tema
│   ├── motion/                   # Muelles, scroll y movimiento reducido
│   ├── pwa/                      # Registro, estado y actualización
│   └── styles/                   # Tokens, estilos base y áreas seguras
├── docs/                         # Auditoría de referencia e instrucciones
├── tests/
└── .github/workflows/            # Verificación, compilación y Pages
Contratos de contenido. Un sector tiene id, slug, nombre y resumen ES/EN, y coverId. Un lugar tiene id, slug, sectorIds, nombre, texto ES/EN, photoIds, dirección y bloques opcionales de accesibilidad y transporte. Cada opción de transporte admite modo, parada, origen de referencia, indicaciones ES/EN, enlace, fuente y fecha de verificación. Una foto tiene id, archivo, texto alternativo ES/EN, autor, fuente y permiso o licencia. Así puedes incorporar una parada o reemplazar una foto editando el catálogo, sin tocar las pantallas. Los campos pendientes se omiten o se muestran como pendientes, según lo que ayude al visitante.

Criterio PWA. Instalada desde Safari, la guía debe abrir desde su propio icono en modo standalone, con las barras del navegador fuera de la interfaz. La barra de estado del sistema puede seguir visible. El proyecto debe respetar las áreas seguras arriba, abajo y en los laterales. Después de una primera carga completa, la portada, el catálogo textual y el diario deben funcionar sin conexión, con un estado explícito para fotos todavía no guardadas y servicios externos como los mapas. Safari y la app instalada conservan sus preferencias por separado mediante localStorage. Cambiar a inglés en la app instalada debe sobrevivir a su cierre y reapertura, aunque la primera instalación pueda arrancar en español. Modo standalone e iconos en iOS · Áreas seguras · Almacenamiento de la app instalada · Vite PWA y Workbox
Fases y prompts para Claude Code
Pega cada prompt por separado en la raíz del mismo proyecto. Al terminar cada fase tendrás una comprobación concreta para decidir si pasas a la siguiente.
1. Prompt maestro — base, referencia, idioma y tema
Actúa como desarrollador principal de una guía turística bilingüe de Birmingham,
Inglaterra. Ejecuta únicamente la fase 1 en el directorio actual. Inspecciona
primero el repositorio y sus instrucciones y conserva el trabajo existente.
Si aún no hay proyecto, inicializa aquí React + TypeScript + Vite con npm.

1. Activa e invoca explícitamente mi skill instalada `apple-design` antes de
   diseñar la interfaz. Lee sus instrucciones y aplícalas junto con las Human
   Interface Guidelines de Apple a jerarquía, tarjetas, tipografía, áreas
   táctiles, foco, gestos y transiciones con física de muelles. Informa al
   final qué decisiones concretas salieron de la skill. Si no puedes cargarla,
   indica el motivo exacto y aplica las HIG directamente.

2. Haz fetch directo de https://www.honor.com/es/phones/honor-magic8-pro/
   desde la terminal o mediante tu herramienta web. Después observa la página
   renderizada en móvil y escritorio con las herramientas de navegador de
   las que dispongas. Registra en docs/motion-reference.md qué secciones
   responden al scroll, qué elementos permanecen fijos, cómo cambian
   la posición, escala, opacidad y profundidad, qué dispara las
   secciones interactivas y qué diferencias ves en pantallas táctiles.
   Separa las observaciones de las inferencias y marca lo que no pudiste
   verificar. Propón para cada mecánica comprobada una adaptación concreta
   a la portada, las tarjetas o las fichas de Birmingham. Diseña una
   composición y un ritmo propios, con los recursos gráficos de la guía.
   No copies código, recursos gráficos ni la composición de HONOR.

3. Instala automáticamente con npm las versiones compatibles de React,
   TypeScript, Vite, React Router, Motion for React y vite-plugin-pwa,
   además de las dependencias de comprobación que uses. Comprueba antes
   que la versión de Node satisface sus requisitos y conserva package-lock.json.
   Resuelve por terminal las instalaciones que puedas hacer dentro del
   proyecto. Si una instalación queda bloqueada, identifica el paso pendiente.
   No añadas otro motor de animación para resolver los mismos efectos.

4. Configura Vite con dos entradas reales, index.html y diario.html. Prevé
   una base configurable para servir en raíz y en /<repo>/ de GitHub Pages.
   Evita rutas absolutas que asuman la raíz del dominio. Crea la estructura
   de src/ por áreas de responsabilidad. Configura navegación hash en la
   guía para portada, sector, lugar y un estado de ruta desconocida.
   Enlaza la guía con el diario y el diario con la guía.

5. Implementa un AppShell responsive compartido. En la barra superior
   incluye un botón de globo con nombre accesible que despliegue Español
   y English, indique el idioma activo y sea operable con teclado y tacto.
   Añade un selector Claro/Oscuro. Usa español y claro en almacenamiento
   limpio. Persiste preferencias válidas con claves propias del proyecto en
   localStorage, aplica el tema antes del primer pintado en las dos entradas
   y actualiza document.documentElement.lang al cambiar de idioma. Si el
   almacenamiento falla, mantén operativos los controles durante la sesión.
   Traduce navegación, controles, títulos y estados iniciales. Prepara
   viewport-fit=cover y los tokens de áreas seguras.

6. Deja una portada básica, las vistas de sector y lugar preparadas para
   catálogos futuros y un diario inicial con contexto de la web. Inspecciona
   en modo lectura [dato privado omitido]\Desktop\Brum_pics e inventaría las once
   carpetas sin modificar ni importar fotos todavía. Prepara los contratos
   de sector, lugar, foto y diario. Reserva la implementación final de la
   PWA, el catálogo completo y las animaciones de scroll para sus fases.

7. Ejecuta la comprobación de tipos y el build. Sirve el resultado y prueba
   ambos HTML, una ruta hash directa y los enlaces con una base de prueba
   /brum-guide/. Prueba la primera visita en español y claro, y que inglés
   y oscuro sobreviven a una recarga y al salto entre ambos HTML. Revisa
   una anchura móvil de 390 px y una de escritorio de 1440 px. Deja en el
   README los comandos y devuelve resultados reales, archivos principales
   y puntos pendientes. No publiques, no hagas push y detente al concluir.
2. Catálogo, fotografías y recorrido por la ciudad
Ejecuta la fase 2 sobre la base aprobada. Activa y usa mi skill `apple-design`
y las Human Interface Guidelines de Apple para jerarquía, tipografía, tarjetas,
gestos, foco y el comportamiento previsto de las transiciones con muelles.
Instala desde la terminal cualquier dependencia imprescindible para esta fase.

Desarrolla la portada, las vistas de sector y las fichas con un único catálogo
tipado. Incluye estas diez categorías, con nombre ES y EN: Culture and
Heritage, Gastronomy and Culinary, Nature and Outdoors, Shopping and Retail,
Entertainment and Nightlife, Family and Recreation, Education and Literature,
Health and Wellness, Sports and Adventure, Visitor Logistics and Safety.

Implementa el destacado de Aston Villa y Villa Park, enlazado a su ficha.
Incluye contexto del club, estadio y experiencia del visitante con los textos
que te entregue. Cada lugar debe admitir dirección, opciones de transporte,
parada o estación, origen cuando proceda, tramo a pie, mapa, accesibilidad,
fuente y fecha de verificación. Importa solo los datos que te facilite o que
puedas verificar en las fuentes pertinentes. Si faltan mi listado o textos,
usa entradas de demostración identificadas como tales y deja una guía breve
para sustituirlas. No inventes servicios, recorridos ni tiempos de viaje.

Lee [dato privado omitido]\Desktop\Brum_pics. Respeta los originales y copia solo
las fotos autorizadas para el sitio. Usa Welcome_to_brum para la portada,
genera variantes responsivas cuando proceda y registra fuente, autor,
permiso y texto alternativo ES/EN. Deja un recurso local provisional para
las fotos sin autorización confirmada. Reserva dimensiones para evitar saltos
de layout y carga de forma diferida las imágenes fuera de la primera vista.

Comprueba los diez sectores, Villa Park, enlaces directos, atrás/adelante,
restauración de foco y desplazamiento, textos ES/EN y legibilidad en ambos
temas. Ejecuta el build. Resume qué contenido queda por facilitar o verificar.
3. Tarjetas, profundidad y transiciones
Ejecuta la fase 3. Activa y usa mi skill `apple-design` y las Human Interface
Guidelines de Apple. Aplica sus criterios a tarjetas, gestos táctiles,
jerarquía tipográfica, foco y transiciones con física de muelles. Revisa
docs/motion-reference.md y vuelve a comprobar en la página oficial de HONOR
cualquier comportamiento cuya observación aún sea incierta.

Implementa con Motion for React tres interacciones propias: apertura
fotográfica con profundidad ligada al scroll, revelado progresivo de
secciones editoriales y transición entre tarjeta y ficha. Reproduce el
principio de las mecánicas observadas, ajustando amplitud, ritmo, duración
y composición al contenido de Birmingham. Mantén el scroll nativo. Usa
sticky de forma localizada, anima principalmente transform y opacity y evita
actualizar el estado de React en cada frame. En pantallas táctiles ofrece
respuesta de pulsación y acceso completo sin hover. Los gestos auxiliares
deben tener un equivalente por teclado o control visible.

Aplica prefers-reduced-motion, elimina en ese modo el paralaje y los
desplazamientos amplios, y conserva el acceso directo y el foco correcto en
cada vista. Centraliza los parámetros de muelle. Instala por terminal solo
las dependencias que falten. Revisa el comportamiento real a 390 y 1440 px,
prueba teclado, tacto emulado y movimiento reducido, y registra qué
mecánicas se verificaron y en qué entorno.
4. PWA, modo sin conexión y GitHub Pages
Ejecuta la fase 4. Activa y usa mi skill `apple-design` y las Human Interface
Guidelines de Apple para áreas seguras, controles, estados sin conexión,
tipografía, interacción táctil y transiciones con muelles. Instala
automáticamente desde la terminal los paquetes PWA o de prueba que falten.

Configura el manifiesto con id estable, start_url y scope dentro de la base
del proyecto, display standalone, nombre, colores e iconos PNG propios de
192 y 512 px, variante maskable y apple-touch-icon de 180 px. Comprueba que
el manifiesto, el worker, el diario y los iconos resuelven bajo /<repo>/.
Ajusta las áreas seguras en orientación vertical y horizontal.

Configura Workbox para precargar las dos páginas HTML y sus recursos
esenciales, incluidos los textos ES/EN. Mantén el diario accesible sin
conexión como página independiente. Evita un fallback global a index.html
que capture diario.html. Guarda bajo demanda solo imágenes locales, con
límites de tamaño, cantidad y antigüedad. Ofrece un estado claro para fotos
y servicios externos no disponibles sin conexión. Implementa un aviso
bilingüe de nueva versión y actualiza tras la confirmación del visitante.

Prepara un workflow de GitHub Actions con npm ci, comprobaciones, build y
despliegue de dist/ a Pages. Prueba primero el build servido con un subpath:
entrada directa a ambas páginas, fichas por hash, enlaces, worker activo,
recarga sin conexión tras la primera carga y actualización de versión.
Documenta la prueba física en iPhone desde Safari: añadir a pantalla de
inicio, comprobar icono y modo standalone, girar el dispositivo, cambiar
idioma y tema, cerrar y reabrir, y probar modo avión. Distingue pruebas de
escritorio o simuladas de las realizadas en iPhone. No des por pasada una
prueba física que no hayas hecho. No hagas push ni despliegues sin que te
lo pida.
5. Diario académico y revisión de entrega
Ejecuta la fase 5. Activa y usa mi skill `apple-design` y las Human Interface
Guidelines de Apple también en diario.html. Revisa tipografía, contraste,
tarjetas, áreas táctiles, navegación por teclado y movimiento reducido.
Instala por terminal cualquier herramienta de comprobación imprescindible.

Completa diario.html como página enlazada en ambos sentidos con index.html.
Incluye qué abarca la guía, qué puede hacer un visitante y por qué se
eligieron esta arquitectura, este diseño y este enfoque PWA. Presenta una
cronología editable con fecha, fase, herramienta, modelo confirmado, prompt,
respuesta o resumen identificado, aportación humana, decisión y evidencia
de prueba. Explica el reparto real: yo defino requisitos, aporto y valido
contenido; ChatGPT diseña arquitectura y prompts; Claude Code implementa
y verifica lo que haya ejecutado. Usa solo los registros que te facilite.
Marca como pendiente el modelo o el material que no puedas confirmar.
No publiques secretos, rutas privadas ni conversaciones por defecto.

Haz la revisión final de navegación, traducciones, tema persistente, foco,
movimiento reducido, fotos y permisos, Villa Park, diez sectores y el diario.
Ejecuta comprobaciones, build y smoke tests bajo la base de GitHub Pages.
Devuelve una lista breve de evidencias verificadas y de lo que siga
pendiente en el iPhone, el repositorio de publicación o el contenido.
El primer hito es una guía mínima y un diario que compilen, se enlacen y conserven el idioma y el tema en una URL bajo /<repo>/. Eso deja lista la base sobre la que añadir el catálogo y el movimiento, y permite probar la instalación en el iPhone antes de dar por cerrada la entrega.
