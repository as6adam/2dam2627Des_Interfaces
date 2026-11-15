import type { Language } from '../../lib/preferences'
import type { BlockId, PhaseNumber, SectionKind } from './types'

/**
 * Textos TRADUCIBLES del registro: navegación, etiquetas, controles, mensajes, títulos y objetivos (estos últimos son
 * añadidos editoriales del documento, no transcripciones). Los prompts y las respuestas NO están aquí: son contenido
 * original único (log/blocks/*.json) y no cambian con el idioma de la interfaz.
 * Plantillas con {marcadores}: se rellenan con `fill`.
 */
export interface LogText {
  intro: string
  originalLanguage: string
  proposalsNote: string
  trace: { title: string; hint: string }
  index: { title: string; label: string }
  phase: string // «Fase {n}»
  code: { analysis: string } // las iteraciones se rotulan «TEMPORA-WEB-001…» (nombre propio, igual en ambos idiomas)
  pages: { label: string; withClaude: string; withoutClaude: string }
  apartados: { objective: string; gpt: string; claudePrompt: string; claudeResponse: string }
  apartadoHint: { claudeResponse: string }
  subTitles: Record<SectionKind, string>
  editorial: string
  editorialTranslated: string
  progressNote: string
  testsNote: string
  absent: { claudePrompt: string; claudeResponse: string }
  copy: { button: string; label: string; ok: string; fail: string }
  loading: string
  error: string
  retry: string
  permalink: string
  tableLabel: string
}

export const fill = (tpl: string, vars: Record<string, string | number>): string => tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))

const es: LogText = {
  intro: 'Registro del desarrollo de Tempora, desde el análisis inicial hasta la iteración 004C: el encargo, la respuesta de GPT, el prompt dirigido a Claude y la respuesta de Claude. Abre una iteración para consultarla.',
  originalLanguage: 'Los prompts y las respuestas se muestran tal como constan en el documento fuente, en su idioma original (español), sin resumir, corregir ni traducir.',
  proposalsNote: 'Lo propuesto en cada intercambio no es necesariamente lo implementado: el estado real de cada fase está en la lista de arriba.',
  trace: { title: 'Criterios de trazabilidad', hint: 'Notas editoriales del documento fuente, tal como constan.' },
  index: { title: 'Índice', label: 'Índice del registro por fase e iteración' },
  phase: 'Fase {n}',
  code: { analysis: 'Análisis inicial' },
  pages: { label: 'Páginas del PDF fuente', withClaude: 'GPT págs. {g} · Claude págs. {c}', withoutClaude: 'GPT págs. {g} · sin respuesta de Claude asociada' },
  apartados: { objective: '1 · Fase y objetivo', gpt: '2 · Prompt del usuario y respuesta de GPT', claudePrompt: '3 · Prompt para Claude', claudeResponse: '4 · Respuesta de Claude' },
  apartadoHint: { claudeResponse: 'Cambios, validación y limitaciones, tal como constan en el registro.' },
  subTitles: {
    userPrompt: 'Prompt del usuario enviado a GPT', progress: 'Mensajes de progreso registrados de GPT',
    gptResponse: 'Respuesta de GPT anterior al prompt para Claude', claudePrompt: 'Prompt exacto diseñado por GPT para Claude',
    gptContinuation: 'Continuación original de la respuesta de GPT', claudeResponse: 'Respuesta de Claude',
  },
  editorial: 'Nota editorial',
  editorialTranslated: 'Nota editorial (traducida)',
  progressNote: 'Son mensajes registrados en la fuente; no se presentan como razonamiento interno adicional.',
  testsNote: 'Las pruebas y los resultados que aparecen son declaraciones de la respuesta de Claude registrada; esta página no los ha vuelto a ejecutar.',
  absent: { claudePrompt: 'Esta fase no tiene prompt para Claude en el registro.', claudeResponse: 'Esta fase no tiene respuesta de Claude asociada en el registro.' },
  copy: { button: 'Copiar prompt', label: 'Copiar el prompt para Claude de {name}', ok: 'Prompt copiado', fail: 'No se pudo copiar. Selecciona el texto y cópialo manualmente.' },
  loading: 'Cargando el registro…',
  error: 'No se pudo cargar este fragmento del registro.',
  retry: 'Reintentar',
  permalink: 'Enlace directo a esta iteración',
  tableLabel: 'Tabla transcrita (desplazable)',
}

const en: LogText = {
  intro: 'The development record of Tempora, from the initial analysis to iteration 004C: the request, GPT’s answer, the prompt written for Claude and Claude’s response. Open an iteration to read it.',
  originalLanguage: 'Prompts and responses are shown exactly as they appear in the source document, in their original language (Spanish), without summarising, correcting or translating them.',
  proposalsNote: 'What is proposed in each exchange is not necessarily what was implemented: the real status of each phase is in the list above.',
  trace: { title: 'Traceability notes', hint: 'Editorial notes from the source document, as written (in Spanish).' },
  index: { title: 'Index', label: 'Record index by phase and iteration' },
  phase: 'Phase {n}',
  code: { analysis: 'Initial analysis' },
  pages: { label: 'Source PDF pages', withClaude: 'GPT pp. {g} · Claude pp. {c}', withoutClaude: 'GPT pp. {g} · no associated Claude response' },
  apartados: { objective: '1 · Phase and goal', gpt: '2 · User prompt and GPT’s response', claudePrompt: '3 · Prompt for Claude', claudeResponse: '4 · Claude’s response' },
  apartadoHint: { claudeResponse: 'Changes, validation and limitations, as they appear in the record.' },
  subTitles: {
    userPrompt: 'User prompt sent to GPT', progress: 'Progress messages recorded from GPT',
    gptResponse: 'GPT’s response before the prompt for Claude', claudePrompt: 'Exact prompt written by GPT for Claude',
    gptContinuation: 'Original continuation of GPT’s response', claudeResponse: 'Claude’s response',
  },
  editorial: 'Editorial note',
  editorialTranslated: 'Editorial note (translated)',
  progressNote: 'These are messages recorded in the source; they are not presented as additional internal reasoning.',
  testsNote: 'The tests and results shown are statements made in the recorded Claude response; this page has not run them again.',
  absent: { claudePrompt: 'This phase has no prompt for Claude in the record.', claudeResponse: 'This phase has no associated Claude response in the record.' },
  copy: { button: 'Copy prompt', label: 'Copy the prompt for Claude of {name}', ok: 'Prompt copied', fail: 'Could not copy. Select the text and copy it manually.' },
  loading: 'Loading the record…',
  error: 'This part of the record could not be loaded.',
  retry: 'Retry',
  permalink: 'Direct link to this iteration',
  tableLabel: 'Transcribed table (scrollable)',
}
export const LOG_TEXT: Record<Language, LogText> = { es, en }

/**
 * Títulos y objetivos por idioma. El español reproduce los del documento (los títulos se verifican contra el manifiesto en
 * las pruebas); el inglés es traducción de esos añadidos editoriales, NO de las transcripciones.
 */
export interface BlockMeta { title: string; objective?: string }
export const LOG_META: Record<Language, { phases: Record<PhaseNumber, string>; blocks: Record<BlockId, BlockMeta> }> = {
  es: {
    phases: { 1: 'Análisis y arquitectura', 2: 'Internacionalización', 3: 'Adaptación al navegador', 4: 'Landing y despliegue' },
    blocks: {
      analysis: { title: 'Análisis y arquitectura inicial' }, '001': { title: 'Preferencias y selector de propósito' },
      '002a': { title: 'Base bilingüe y selector de idioma' }, '002b': { title: 'Traducción completa de la interfaz' }, '002c': { title: 'Fechas y notificaciones bilingües' },
      '003a': { title: 'Compatibilidad entre navegador y Tauri' }, '003b': { title: 'Audio y persistencia web' }, '003c': { title: 'Diseño adaptable y accesibilidad' },
      '004a': { title: 'Landing bilingüe y dos entradas HTML' }, '004b': { title: 'Preparación de GitHub Pages' }, '004c': { title: 'Verificación local y publicación pendiente' },
    },
  },
  en: {
    phases: { 1: 'Analysis and architecture', 2: 'Internationalization', 3: 'Browser adaptation', 4: 'Landing and deployment' },
    blocks: {
      analysis: { title: 'Initial analysis and architecture', objective: 'Define the scope, the complementary features and the initial architecture of Tempora Web.' },
      '001': { title: 'Preferences and purpose selector', objective: 'Add the purpose choice and prepare persistent preferences without separating the events.' },
      '002a': { title: 'Bilingual base and language selector', objective: 'Complete the English vocabulary and connect the language switch in Settings.' },
      '002b': { title: 'Full interface translation', objective: 'Translate the visible and accessible interface while keeping its behaviour.' },
      '002c': { title: 'Bilingual dates and notifications', objective: 'Complete dates, relative messages and notifications in both languages.' },
      '003a': { title: 'Browser and Tauri compatibility', objective: 'Separate native and web features, especially notices and permissions.' },
      '003b': { title: 'Audio and web persistence', objective: 'Fix the audio and harden local storage in the browser.' },
      '003c': { title: 'Adaptive layout and accessibility', objective: 'Adapt the layout and controls to mobile, tablet and desktop.' },
      '004a': { title: 'Bilingual landing and two HTML entries', objective: 'Create the landing page and separate its resources and entry from the app’s.' },
      '004b': { title: 'GitHub Pages preparation', objective: 'Prepare the workflow and verify the artifact for GitHub Pages.' },
      '004c': { title: 'Local verification and pending publication', objective: 'Run the final local check and document that publication is blocked by the lack of a destination and access.' },
    },
  },
}
