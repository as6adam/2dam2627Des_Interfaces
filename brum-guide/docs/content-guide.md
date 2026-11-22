# Guía para sustituir el contenido de demostración

Todo el contenido vive en dos archivos:

- `src/content/catalog.ts`: sectores, lugares y el destacado de portada (un único catálogo tipado).
- `src/content/photo-rights.json`: registro de derechos y texto alternativo de cada foto.

Después de cada cambio, ejecuta `npm run check:catalog`. Rechaza datos prácticos sin fuente,
fuentes sin fecha y entradas de demostración con datos.

## 1. Sustituir una entrada de demostración

Cada entrada `provenance: 'demo'` solo tiene el nombre (tomado del archivo de foto) y el
sector. Para convertirla en una ficha real, añade esto:

```ts
{
  id: 'aston-hall',                       // no lo cambies: forma parte de la URL
  sectorId: 'culture-heritage',
  name: { es: 'Aston Hall', en: 'Aston Hall' },
  kind: 'venue',
  provenance: 'author',                   // 'author' si los textos son tuyos; 'verified' si solo hay datos comprobados
  verifiedOn: 'AAAA-MM-DD',               // día en que comprobaste los datos prácticos
  summary: { es: '…', en: '…' },
  description: [{ es: '…', en: '…' }],
  address: { lines: ['…'], postcode: '…', sourceId: 'web-oficial' },
  map: { provider: 'OpenStreetMap', url: 'https://www.openstreetmap.org/search?query=…' },
  transport: [
    {
      id: 'rail-x',
      mode: 'rail',                       // rail | tram | bus | shuttle | coach | air | cycle
      stop: { es: 'Estación de …', en: '… station' },
      service: { es: 'Línea …', en: '… line' },     // opcional
      origin: { es: 'Birmingham New Street', en: 'Birmingham New Street' }, // cuando proceda
      ride: { es: '… min', en: '… min' },           // solo si la fuente lo publica
      walk: { minutes: '≈ 10', distance: { es: '0,5 millas', en: '0.5 miles' } },
      sourceIds: ['web-oficial'],
    },
  ],
  accessibility: [{ text: { es: '…', en: '…' }, sourceIds: ['web-oficial'] }],
  sources: [
    { id: 'web-oficial', title: '…', publisher: '…', url: 'https://…', checkedOn: 'AAAA-MM-DD' },
  ],
  photoIds: ['culture-and-heritage--aston-hall'],
}
```

Reglas:

- **No inventes servicios, recorridos ni tiempos.** Si la fuente no publica un dato, deja el
  campo fuera: la ficha lo listará en «Pendiente de facilitar o verificar».
- Copia los tiempos tal como los publica la fuente (por ejemplo `≈ 5` o `< 10`). No los
  recalcules.
- Si dos fuentes no coinciden, regístralo en `caveats`.
- Para quitar una entrada de demostración que no vaya a usarse, bórrala del catálogo.
  El sector la dejará de contar automáticamente.

## 2. Sustituir los textos de Villa Park

En `catalog.featured` cambia `textStatus: 'provisional'` por `'author'` y reemplaza los
`paragraphs` de cada bloque (`club`, `stadium`, `visitor`). Mantén `sourceIds` si los
textos siguen apoyándose en esas fuentes, o deja la lista vacía (`[]`) si son tuyos y no
citan ninguna.

## 3. Autorizar una foto

1. En `photo-rights.json`, en la foto correspondiente, rellena `source` (URL o «Foto propia»),
   `author` y `license` (p. ej. «Permiso escrito de X, 2026-11-30» o «CC BY 4.0»), y cambia
   `permission` a `"granted"`.
2. Revisa los textos alternativos `alt.es` y `alt.en`, redactados a partir de la imagen.
3. Ejecuta `npm run images`. Lee el original de `../Brum_pics` (o la ruta indicada con
   `--src`), genera variantes WebP/JPG en `src/assets/images/` sin metadatos y actualiza
   `src/content/image-manifest.json`.
4. Ejecuta `npm run report:photos` para actualizar `docs/photo-rights.md`.

Si una foto deja de estar autorizada, vuelve a poner `"unconfirmed"` y ejecuta `npm run images`:
se retiran sus variantes y vuelve a mostrarse el recurso provisional.

Las fotos de la portada salen de `Welcome_to_brum` y se eligen en `src/content/media.ts`
(`HOME_HERO_PHOTO`, `HOME_STRIP_PHOTOS`).

## 4. Diario: añadir o completar una pareja prompt/respuesta

Las conversaciones del diario viven en `src/content/conversations/`:

- `index.json`: orden, herramienta (`chatgpt` | `claude`), número y estado de cada entrada.
- `NN-herramienta-N.prompt.txt`: texto íntegro del prompt. Se muestra tal cual en el bloque de consola.
- `NN-herramienta-N.response.md`: respuesta. Admite párrafos, listas `-`/`1.`, `**negrita**`,
  `` `código` ``, tablas con tabuladores y bloques ```` ``` ````.

La entrada 6 de Claude está completa. La prueba del diario comprueba una pareja de ChatGPT y seis de Claude.

Para una pareja nueva, añade sus dos archivos y una entrada en `index.json` con el siguiente
`order`. Solo se publican las entradas con `"status": "published"` y texto en los dos archivos.
`npm run import:conversations -- "<ruta al .txt>"` vuelve a importar el documento completo
sin sobrescribir los borradores ya existentes.

## 5. Ampliar una ficha (fase 6)

Las ampliaciones viven en `src/content/details/*.ts`, una entrada por id de lugar, con los
ayudantes de `helpers.ts`:

- `t(es, en)`: texto bilingüe. `c(es, en, ...fuentes)`: texto citado (imprescindibles, consejos).
- `fact(tipo, es, en, ...fuentes)`: dato práctico (`status`, `hours`, `price`, `booking`,
  `duration`, `contact`).
- `go({...})`: opción de transporte (modo, línea, parada, origen, trayecto, tramo a pie).
- `src(id, título, editor, url)`: fuente con la fecha de consulta `CHECKED`.

`enrich()` (`details/index.ts`) sustituye nombre, resumen, descripción, dirección, mapa,
imprescindibles, datos prácticos y consejos; añade transporte (la opción nueva reemplaza a la
antigua con el mismo modo y parada), accesibilidad, avisos y fuentes. Si la ficha base y la
ampliación citan la misma URL, queda una sola fuente.

Regla: lo que ninguna fuente publica se omite. Nada de horarios, precios, frecuencias ni
tiempos calculados. `npm run check:catalog` comprueba que cada dato cite una fuente existente
y que las coordenadas caigan en el área de Birmingham.

Las coordenadas están en `details/locations.ts` (centroide del código postal en postcodes.io,
u OpenStreetMap cuando no hay código postal). Las secciones de planificación están en
`src/content/travel.ts`, con sus fuentes en `travelSources`.
