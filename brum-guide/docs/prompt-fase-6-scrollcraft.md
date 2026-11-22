/scrollcraft

Fase 6 de Brum, la guía bilingüe (es/en) de Birmingham. Objetivo: llevarla al siguiente
nivel en contenido y en experiencia, con calidad de web de producto de Apple.

## 0. Contexto y reglas de trabajo

- Proyecto: `C:\Users\Vorb\Desktop\brum-guide\brum-guide` (React + TypeScript + Vite,
  Motion for React, PWA con Workbox). Repositorio: `C:\Users\Vorb\Desktop\brum-guide`.
  Trabaja SIEMPRE desde el repositorio, nunca desde `C:\Users\Vorb\Desktop\Brum_pics`.
- Antes de nada lee `README.md`, `docs/content-guide.md`, `docs/design-decisions.md`,
  `docs/motion-reference.md`, `src/motion/springs.ts` y `src/content/catalog.ts`, y ejecuta
  `npm run typecheck`.
- Activa también mi skill `apple-design` y aplica las Human Interface Guidelines de Apple.
- Brum_pics es de solo lectura. No muevas, renombres ni edites sus fotos.
- No hagas push ni despliegues. Para al final y enséñame el resultado.

## 1. Cómo usar scrollcraft en este proyecto

Brum ya es una app con rutas, idioma, tema, PWA y pruebas. Usa scrollcraft como MÉTODO de
diseño, no como generador de una página nueva:

- Sigue sus pasos: brief, recorrido del visitante, curva emocional con UN pico, gramática
  de página, variedad de dispositivos, un movimiento firma propio y verificación con
  capturas. Lee sus referencias `taste.md`, `devices.md`, `feel.md`, `hero-depth.md` y
  `uniqueness.md`.
- Brief: te delego la dirección creativa. Escríbelo en el workspace como «Self-authored
  under explicit creative delegation» con estas decisiones fijas:
  - Público: visitantes hispanohablantes y angloparlantes que planean o están haciendo un
    viaje a Birmingham, sobre todo desde el móvil.
  - Sensación: una ciudad industrial que sorprende (canales, ladrillo, música, fútbol).
  - Recursos: SOLO mis fotos de Brum_pics y las portadas ya registradas. No generes
    imágenes ni vídeo con kie.ai y no gastes créditos.
- Implementa los dispositivos de scrollcraft con React y Motion for React dentro de la app.
  NO añadas `scrollcraft.js` ni otro motor de animación: todos los muelles y ritmos siguen
  centralizados en `src/motion/springs.ts`.
- Workspace: crea `.scrollcraft.json` en la raíz del repositorio apuntando a
  `brum-guide/scrollcraft` y añade esa carpeta a `.gitignore` salvo `BRIEF.md` y
  `FINGERPRINTS.md`.
- Ejecuta `node <skill>/scripts/doctor.mjs`. Si hace falta ffmpeg (solo para vídeo de
  fondo), pídeme permiso antes de instalarlo con `winget install Gyan.FFmpeg`.
- Respeta sus reglas duras que encajan con la guía: nada de guiones largos (—) en textos
  visibles, nada de contadores «01 / 06», nada de cifras sin fuente, copy con anclajes
  variados (no todo centrado), animar solo transform, opacity y clip-path.
- Conflicto a resolver: scrollcraft prohíbe los avisos de «haz scroll». Convierte el botón
  «Explorar los sectores» en un control de navegación real (no un aviso), pero conserva su
  equivalente de teclado.

## 2. Fichas mucho más completas

Para cada uno de los 40 lugares, amplía la descripción (hoy es básica). Redáctalo tú en
español e inglés, con datos verificados y citados en `sources` con fecha:

- Descripción en 3 o 4 párrafos: qué es, su historia, qué ver dentro y por qué merece la
  pena.
- «Lo imprescindible»: 3 a 5 cosas concretas que ver o hacer.
- Datos prácticos cuando la web oficial los publique: horario, precio o «gratis», duración
  recomendada de la visita, si hay que reservar, y mejor momento para ir.
- Consejos del visitante: los que figuren en la web oficial o en guías reputadas (Visit
  Birmingham, la web del lugar).
- Accesibilidad: lo que publique el lugar.

Todo lo que no encuentres en una fuente se omite. No inventes horarios, precios ni
duraciones.

## 3. Cómo llegar en autobús (y en tranvía o tren)

- Para cada lugar, añade las líneas de autobús que paran cerca, con el nombre de la parada,
  el operador (National Express West Midlands u otros) y el tramo a pie. Usa como fuentes
  la web del lugar, Transport for West Midlands (tfwm.org.uk) y la del operador.
- Añade también el tranvía (West Midlands Metro) y el tren cuando sean la mejor opción.
- Incluye el origen típico (Birmingham New Street, Moor Street, Snow Hill o Bull Street)
  solo si una fuente da el trayecto.
- No inventes frecuencias ni tiempos de viaje. Si la fuente no los da, omítelos.
- Enlaza el planificador de viajes de TfWM y el mapa de cada lugar.

## 4. Información extra que enriquece la guía

Crea estas secciones nuevas, bilingües, con fuentes oficiales y en el mismo diseño:

- **Antes de viajar:** moneda y pago sin contacto, enchufe tipo G y voltaje, clima por
  estaciones (Met Office), propinas, horarios habituales del comercio, número de
  emergencias y enlace a «Teléfonos útiles».
- **Moverse por la ciudad:** abonos y billetes de transporte (Swift, tarjetas sin
  contacto), red de tranvía, bicicletas públicas si existen, y cómo llegar desde el
  aeropuerto.
- **Rutas de un día:** 3 o 4 itinerarios temáticos que combinen fichas del catálogo, por
  ejemplo «Canales y ladrillo», «Día de fútbol en Aston», «Birmingham en familia» o
  «Compras y cultura en el centro». Cada parada enlaza a su ficha y lleva el tramo de
  transporte verificado.
- **Cerca de aquí:** en cada ficha, 2 o 3 lugares del catálogo próximos (misma zona según
  su dirección verificada).
- **Agenda anual:** grandes eventos recurrentes (por ejemplo, el mercado de Navidad
  alemán, el Birmingham Pride o los festivales), solo los confirmados en webs oficiales,
  con el mes y no con fechas exactas si estas cambian cada año.
- **Habla brummie:** un pequeño glosario de expresiones locales, con fuente.
- **Mapa general:** todos los lugares sobre un mapa. Que funcione sin depender de
  servicios externos al cargar (por ejemplo, un mapa SVG propio con los barrios y
  enlaces a OpenStreetMap), para no romper el modo sin conexión.

Integra estas secciones en la navegación (barra superior y pie) sin saturar la barra en
móvil.

## 5. Experiencia y animaciones de nivel Apple

Rediseña el recorrido con el método scrollcraft y la skill apple-design:

- Portada con profundidad real por capas (fondo, sujeto, primer plano y atmósfera) a
  partir de mis fotos, con composición propia para móvil.
- Un pico emocional único y bien preparado (propuesta: los canales al atardecer o Villa
  Park), con la mayor parte del recorrido de scroll y del presupuesto visual.
- Al menos cuatro familias de dispositivos distintos a lo largo de la portada (por
  ejemplo: paralaje por capas, galería horizontal anclada, revelado con clip-path, cifras
  reales que se construyen, mapa que se dibuja) y nunca el mismo dos veces seguidas.
- Un movimiento firma propio de Brum que no exista en otras webs.
- Transiciones entre vistas que conserven la foto y el título compartidos.
- Microinteracciones táctiles y de foco con muelles, sin depender del hover.
- Movimiento reducido: sin paralaje ni desplazamientos amplios, con el mismo contenido.
- Rendimiento: 60 fps en móvil de gama media, CLS cercano a 0 y fotos diferidas fuera de
  la primera vista.

## 6. Verificación

- `npm run typecheck`, `npm run build:pages`, `test:e2e`, `test:motion`, `test:journal` y
  `test:pwa`. Amplía las pruebas para las secciones y fichas nuevas.
- Capturas de scrollcraft (`scripts/shoot.mjs`) a 1440 px, a 390 px y con movimiento
  reducido. Revisa contraste en claro y oscuro.
- Comprueba que las páginas nuevas funcionan sin conexión tras la primera carga.
- Build de producción con `BASE_PATH=/2dam2627Des_Interfaces/brum-guide/`.

## 7. Entrega

Resume:
- los archivos modificados;
- las fuentes consultadas;
- el brief y el pico elegido;
- los dispositivos usados por sección y el movimiento firma;
- los resultados de las pruebas;
- lo pendiente, incluida la prueba en un iPhone físico.

No hagas push. Para publicar después se hace push a la rama T5_Guía_de_viajes_de_mi_pueblo
y se lanza el workflow «Tempora y Brum en Pages» sobre la rama Pomodoro_Tempora.
