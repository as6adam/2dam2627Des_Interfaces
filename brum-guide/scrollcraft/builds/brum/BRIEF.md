# BRIEF · Brum (portada de la guía)

**Self-authored under explicit creative delegation.** El autor delegó la dirección
creativa en el prompt de la fase 6 («la dirección creativa es tuya»). Las respuestas
siguientes son decisiones propias, salvo las marcadas como *dato del encargo*, que
vienen literalmente del prompt.

## Las ocho preguntas

1. **Ambiente en 3-5 palabras.** Industrial, cálida, sorprendente, nocturna.
   Referencias (no webs): una guía impresa de bolsillo con capítulos; el ritual de
   una esclusa de canal; la luz de las farolas sobre ladrillo mojado.
2. **Recorrido, en orden.** Llegada a la ciudad (apertura) → qué es Birmingham, en
   cifras reales → elegir por dónde empezar (sectores) → una pausa fotográfica → el
   canal al anochecer (pico) → Villa Park → cómo organizar un día → planificar el
   viaje (cierre útil).
3. **Curva de energía.** Media en la apertura, baja en las cifras, media-alta en
   los sectores, muy baja en la pausa, máxima en la esclusa, alta en Villa Park,
   media en las rutas, calma resuelta en el cierre.
4. **Cómo debe sentirse, y el momento que se recuerda.** Ver la curva de
   sensaciones. El momento: *llenar una esclusa con el scroll y salir al canal de
   noche*.
5. **Algo que ninguna web haga.** El scroll como agua: la visita «sube de nivel»
   igual que un barco en una esclusa antes de entrar en la ciudad.
6. **Distancia respecto al premium minimalista.** Editorial con calor: tipografía
   grande, ladrillo y tinta, sin brutalismo. Coherente con la base apple-design ya
   construida (*dato del encargo*: «subir a nivel apple-design»).
7. **Un mundo continuo o escenas.** Escenas por capítulos. Un vuelo continuo no
   encaja con una guía práctica que se consulta a saltos.
8. **Activos.** Solo las fotos de Brum_pics y las portadas registradas
   (*dato del encargo*). Sin kie.ai, sin vídeo, sin gasto. No hay recortes con
   transparencia: la profundidad del hero se compone con fotos separadas.

**Público** (*dato del encargo*): visitantes hispanohablantes y anglohablantes,
sobre todo desde el móvil.
**Sensación** (*dato del encargo*): una ciudad industrial que sorprende (canales,
ladrillo, música, fútbol).

## Gramática

**Chaptered editorial** (capítulos de guía impresa). Navegación: barra superior
fija con Guía · Planifica · Diario, y capítulos que se leen en orden pero se
abandonan en cualquier punto hacia una ficha. Cierre: un índice útil (planificar).

Por qué perdieron las otras:
- *Filmic one-shot*: la registran las cuatro webs anteriores y una guía no es una película.
- *Continuous world*: exigiría vídeo o 3D generado; no hay activos ni presupuesto.
- *Live surface*: la guía no tiene datos en vivo que justificarla.
- *Typographic poster*: dejaría fuera las fotos, que son el mejor activo.
- *Gallery/catalog*: ya es la forma de las páginas de sector; la portada debe ser otra cosa.
- *Split stage*: rompe en móvil, que es el público principal.
- *Rhythmic cutlist*: demasiado agitada para el contenido práctico.

## Curva de sensaciones (escrita antes de los actos)

| Acto | Sensación | Qué la provoca |
|---|---|---|
| 1 Apertura | Curiosidad | Tres planos de foto que se separan al bajar; el texto queda entre ellos |
| 2 Sobre Birmingham | Confianza | Cifras reales que giran como un contador y citan su fuente |
| 3 Sectores | Apetito | Diez puertas que pasan de lado mientras bajas (escritorio) o se deslizan con el dedo (móvil) |
| 4 Pausa | Respiro | Tira de fotos que manda el usuario, sin nada que se mueva solo |
| 5 **Esclusa (pico)** | Expectación y alivio | El agua sube con el scroll, el barco con ella, las compuertas se abren al canal de noche |
| 6 Villa Park | Orgullo | La foto del estadio se descubre en barrido lateral |
| 7 Rutas de un día | Ganas de salir | Cuatro rutas entran en cascada, cada una con su primer tramo real |
| 8 Cierre | Calma resuelta | Un índice de planificación quieto y claro |

## El pico

*«Es la web en la que llenas una esclusa bajando la página y sales al canal de
noche.»* Vive en el acto 5 y tiene el mayor recorrido de la página (pin de
320 vh en escritorio, 220 vh en móvil). El acto anterior (la pausa) es el más
tranquilo.

**It's the site where** you fill a canal lock by scrolling and float out into
Birmingham at night.

## Movimiento firma

**La esclusa.** Un pin con dos muros de ladrillo, una compuerta de dos hojas y una
regla de nivel. El scroll sube el agua (clip-path sobre la foto del canal), el
barco sube con ella y la regla marca el nivel; al llegar arriba las hojas se abren
y la foto nocturna ocupa la pantalla. Código propio en `src/guide/CanalLock.tsx`;
todos los ritmos en `src/motion/springs.ts` (`motionTokens.lock`). Sin motor de
scrollcraft.

## Puerta de huellas

El registro (`scrollcraft/FINGERPRINTS.md`) estaba vacío: no hay filas que superar.
Se añade esta build como primera fila.

## Silencio intencionado

El acto 4 (pausa) no anima nada por scroll a propósito: es el valle antes del pico.
No es scroll muerto.

## Movimiento reducido

Todo se queda en su composición final y estática: hero con sus capas fijas,
esclusa llena con las compuertas abiertas, Villa Park visible, sectores en
rejilla. Sin recorridos extra.
