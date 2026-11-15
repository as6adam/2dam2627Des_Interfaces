import type { Language } from '../lib/preferences'
import { LOG_TEXT, type LogText } from './log/text'

/**
 * Contenido de la landing, tipado y por idioma. Todo texto visible (y los nombres accesibles) sale de aquí.
 * Reglas editoriales: solo se describe lo que existe en el repositorio; lo pendiente se marca como pendiente;
 * no hay autor, centro, enlaces, fechas, métricas ni resultados de pruebas inventados.
 */

export type Status = 'done' | 'partial' | 'pending'
export type PhaseId = 'analysis' | 'design' | 'development' | 'prompts' | 'testing'
export const PHASE_IDS: readonly PhaseId[] = ['analysis', 'design', 'development', 'prompts', 'testing']
export type FeatureIcon = 'calendar' | 'link' | 'timer' | 'audio' | 'language' | 'palette' | 'devices' | 'storage' | 'planner' | 'statistics' | 'transfer'

export interface PhaseItem { text: string; status: Exclude<Status, 'partial'> }
export interface Phase { id: PhaseId; title: string; summary: string; status: Status; items: PhaseItem[] }
export interface Feature { icon: FeatureIcon; title: string; text: string }
export interface TechGroup { name: string; items: string[] }

export interface LandingText {
  documentTitle: string
  metaDescription: string
  skip: string
  header: { homeLabel: string; navLabel: string; open: string; modeLabel: string; languageLabel: string }
  nav: { about: string; features: string; tech: string; phases: string }
  languageNames: Record<Language, string>
  hero: { eyebrow: string; lead: string; primary: string; secondary: string; note: string; logoAlt: string }
  about: {
    title: string; intro: string[]
    purposes: { title: string; academic: { name: string; text: string }; productivity: { name: string; text: string }; note: string }
    context: { title: string; text: string }
  }
  features: { title: string; intro: string; items: Feature[]; notYet: { title: string; intro: string; items: string[] } }
  tech: { title: string; intro: string; groups: TechGroup[] }
  phases: {
    title: string; intro: string
    statusLabel: Record<Status, string>; itemLabel: Record<PhaseItem['status'], string>
    items: Phase[]
    prompts: LogText
  }
  access: { title: string; text: string; cta: string; privacy: string }
  /** Aviso si una preferencia (idioma o modo) no se pudo guardar en este dispositivo. */
  notices: { saveFailed: string; dismiss: string }
  footer: { text: string; top: string }
}

const es: LandingText = {
  documentTitle: 'Tempora · Planificador de estudio y productividad',
  metaDescription: 'Tempora es un planificador de estudio y productividad con calendario, exámenes y entregas, sesiones vinculadas, Pomodoro y audio de concentración. Proyecto académico de 2.º de DAM.',
  skip: 'Saltar al contenido',
  header: { homeLabel: 'Tempora, inicio de la página', navLabel: 'Secciones de la página', open: 'Ir a Tempora', modeLabel: 'Modo oscuro', languageLabel: 'Idioma' },
  nav: { about: 'Proyecto', features: 'Qué incluye', tech: 'Tecnologías', phases: 'Fases' },
  languageNames: { es: 'Español', en: 'English' },
  hero: {
    eyebrow: 'Proyecto académico · 2.º de DAM',
    lead: 'Un planificador para tener exámenes, entregas y sesiones de estudio en un mismo calendario, y concentrarte con un Pomodoro y audio de fondo.',
    primary: 'Ir a Tempora',
    secondary: 'Ver las fases del proyecto',
    note: 'Funciona en el navegador y está preparada para empaquetarse como aplicación de escritorio con Tauri. Tus datos se guardan en tu propio dispositivo.',
    logoAlt: 'Icono de Tempora',
  },
  about: {
    title: 'Sobre el proyecto',
    intro: [
      'Tempora reúne en una sola pantalla un calendario semanal y diario, los exámenes y entregas que se acercan, un temporizador Pomodoro y un reproductor de audio para concentrarte.',
      'Nació para estudiar mejor: al abrir un examen o una entrega, propone reservar sesiones de estudio en el calendario y las vincula a él. El mismo calendario sirve también para organizar tareas y bloques de trabajo.',
    ],
    purposes: {
      title: 'Dos propósitos, los mismos eventos',
      academic: { name: 'Académico', text: 'Habla de asignaturas, exámenes, entregas y sesiones de estudio.' },
      productivity: { name: 'Productividad', text: 'Habla de áreas, exámenes, tareas y bloques de concentración.' },
      note: 'Cambiar de propósito solo cambia el vocabulario: los eventos guardados siguen ahí.',
    },
    context: {
      title: 'Contexto',
      text: 'Tempora es un proyecto académico de 2.º de Desarrollo de Aplicaciones Multiplataforma (DAM), construido de forma iterativa: cada versión añade o corrige una parte concreta y se valida antes de pasar a la siguiente.',
    },
  },
  features: {
    title: 'Qué incluye hoy',
    intro: 'Esto es lo que la aplicación hace ahora mismo.',
    items: [
      { icon: 'calendar', title: 'Calendario semanal y diario', text: 'Vista de semana y de día con minicalendario. Se añade un evento con un clic en un hueco, se mueve arrastrándolo (en pasos de 15 minutos) o con un formulario de fecha y hora, también con teclado. En móvil abre en la vista diaria.' },
      { icon: 'link', title: 'Exámenes, entregas y sesiones vinculadas', text: 'Cada examen o entrega puede tener sesiones de estudio vinculadas, que deben terminar antes de la fecha límite. Al abrir la aplicación, un resumen avisa de lo que viene: exámenes a 15 días y entregas a 30.' },
      { icon: 'timer', title: 'Pomodoro', text: 'Fases de concentración de 25 minutos, descansos cortos de 5 y largos de 15 (uno cada cuatro sesiones), con contador de sesiones y aviso al terminar cada fase.' },
      { icon: 'audio', title: 'Audio de concentración', text: 'Tres fuentes predefinidas (Lofi Girl, White Noise y Alpha Waves) y una fuente propia: un enlace de YouTube o un audio directo. YouTube puede rechazar algunas incrustaciones; en ese caso la aplicación lo indica.' },
      { icon: 'language', title: 'Español e inglés', text: 'Interfaz, fechas y avisos en los dos idiomas. El idioma se recuerda y es el mismo en esta página y en la aplicación.' },
      { icon: 'palette', title: 'Personalización', text: 'Cuatro temas de acento (Rubí, Ágata púrpura, Diamante y Antimateria, con el violeta como inicial) y modo claro u oscuro.' },
      { icon: 'devices', title: 'Móvil, tableta y escritorio', text: 'En escritorio, tres áreas visibles; en tableta, paneles plegables; en móvil, una barra inferior con menú, añadir y concentración.' },
      { icon: 'planner', title: 'Planificación automática', text: 'Desde un examen o una entrega futura, elige el número de sesiones, su duración, el horario y los días disponibles. Revisa una propuesta repartida antes de la fecha límite, sin solaparse con los eventos existentes.' },
      { icon: 'transfer', title: 'Transferencia entre dispositivos', text: 'Exporta un archivo JSON de Tempora e impórtalo desde el otro dispositivo. Incluye vista previa, detección de duplicados y elección de la versión en conflicto. Es manual; las eliminaciones no se propagan y no hay sincronización en la nube.' },
      { icon: 'statistics', title: 'Estadísticas de concentración', text: 'Consulta periodos de 7, 30 y 90 días: tiempo programado por asignatura o área, eventos completados, Pomodoros finalizados, minutos de concentración, días activos y racha. El historial empieza a registrarse desde la versión 1.1.' },
      { icon: 'storage', title: 'Datos en tu dispositivo', text: 'Los eventos, preferencias e historial se guardan localmente. Puedes transferirlos manualmente por archivo; no hay cuenta ni nube.' },
    ],
    notYet: {
      title: 'Posibles ampliaciones',
      intro: 'Estas funciones no existen en Tempora por ahora:',
      items: ['Sincronización automática en la nube con cuentas', 'Colaboración en tiempo real', 'Integración con otros calendarios'],
    },
  },
  tech: {
    title: 'Tecnologías',
    intro: 'Una aplicación web con una carcasa de escritorio, probada con herramientas estándar.',
    groups: [
      { name: 'Interfaz', items: ['React 18', 'TypeScript', 'Tailwind CSS 3', 'Framer Motion'] },
      { name: 'Estado y utilidades', items: ['Zustand', 'date-fns', 'lucide-react'] },
      { name: 'Escritorio', items: ['Tauri 2 (Rust)'] },
      { name: 'Herramientas', items: ['Vite 5', 'Vitest', 'Playwright'] },
    ],
  },
  phases: {
    title: 'Fases del proyecto',
    intro: 'Qué se ha hecho en cada fase y qué falta. Lo pendiente está marcado como pendiente.',
    statusLabel: { done: 'Implementada', partial: 'Parcial', pending: 'Pendiente' },
    itemLabel: { done: 'Hecho', pending: 'Pendiente' },
    items: [
      {
        id: 'analysis', title: 'Análisis', status: 'done',
        summary: 'Qué debía resolver Tempora y con qué límites.',
        items: [
          { text: 'Necesidad: organizar exámenes y entregas, preparar su estudio y concentrarse con un temporizador y audio.', status: 'done' },
          { text: 'Decisiones de producto: dos propósitos con los mismos eventos, español e inglés, datos locales y sin servidor.', status: 'done' },
          { text: 'Validación inicial con Adam, usuario y autor, en PC e iPhone: uso, capturas y comentarios que permitieron corregir el horario, las tarjetas y el flujo de fechas.', status: 'done' },
        ],
      },
      {
        id: 'design', title: 'Diseño', status: 'done',
        summary: 'Identidad visual y distribución de la interfaz.',
        items: [
          { text: 'Identidad «Obsidiana + Gemas»: violeta como acento inicial, cuatro temas y modo claro y oscuro.', status: 'done' },
          { text: 'Tipografía del sistema, superficies translúcidas y movimiento breve que respeta «reducir movimiento».', status: 'done' },
          { text: 'Distribución adaptable a móvil, tableta y escritorio.', status: 'done' },
          { text: 'Esta página de presentación.', status: 'done' },
          { text: 'Capturas reales de Chrome de escritorio y Safari de iPhone incorporadas a la galería.', status: 'done' },
        ],
      },
      {
        id: 'development', title: 'Desarrollo', status: 'done',
        summary: 'Lo construido, por iteraciones.',
        items: [
          { text: 'Calendario con vistas de semana y día, eventos, sesiones vinculadas y validación de fechas.', status: 'done' },
          { text: 'Pomodoro, audio de concentración y avisos.', status: 'done' },
          { text: 'Persistencia local con migraciones y sin borrar datos que no se pueden leer.', status: 'done' },
          { text: 'Idiomas, propósitos y adaptación a distintos tamaños de pantalla.', status: 'done' },
          { text: 'Planificación automática con revisión de huecos, transferencia manual entre dispositivos por archivo y estadísticas con historial persistente de Pomodoro.', status: 'done' },
        ],
      },
      {
        id: 'prompts', title: 'Prompts utilizados y respuestas obtenidas', status: 'done',
        summary: 'Registro completo para la entrega: desde el análisis inicial hasta 004C, conservando los prompts y respuestas originales. Los retoques posteriores de publicación quedan fuera del registro por decisión del autor.',
        items: [],
      },
      {
        id: 'testing', title: 'Pruebas y despliegue', status: 'partial',
        summary: 'Cómo se comprueba y cómo se ha publicado.',
        items: [
          { text: 'Pruebas automáticas con Vitest sobre la lógica: persistencia, validación de fechas, distribución adaptable y audio.', status: 'done' },
          { text: 'Revisiones manuales en navegador, con pantallas y toque emulados.', status: 'done' },
          { text: 'Prueba básica en iPhone con Safari: funcionamiento confirmado por Adam y documentado con capturas.', status: 'done' },
          { text: 'Pruebas específicas con teclado virtual, tecnologías de asistencia y aplicación de escritorio Tauri.', status: 'pending' },
          { text: 'Flujo de GitHub Actions ejecutado: instalación, pruebas, compilación y verificación del paquete antes del despliegue.', status: 'done' },
          { text: 'Landing y aplicación publicadas en GitHub Pages; despliegue y acceso comprobados por Adam.', status: 'done' },
        ],
      },
    ],
    prompts: LOG_TEXT.es,
  },
  access: {
    title: 'Abre Tempora',
    text: 'La aplicación se abre en su propia página. No necesita cuenta: empieza a usarla y tus datos se guardan en este dispositivo.',
    cta: 'Ir a Tempora',
    privacy: 'Nada se envía a ningún servidor de Tempora.',
  },
  notices: {
    saveFailed: 'No se ha podido guardar tu preferencia en este dispositivo. Se mantiene en esta página, pero puede perderse al recargarla.',
    dismiss: 'Cerrar aviso',
  },
  footer: { text: 'Tempora · proyecto académico de 2.º de DAM', top: 'Volver al principio' },
}

const en: LandingText = {
  documentTitle: 'Tempora · Study and productivity planner',
  metaDescription: 'Tempora is a study and productivity planner with a calendar, exams and assignments, linked sessions, a Pomodoro timer and focus audio. A second-year DAM academic project.',
  skip: 'Skip to content',
  header: { homeLabel: 'Tempora, top of the page', navLabel: 'Page sections', open: 'Open Tempora', modeLabel: 'Dark mode', languageLabel: 'Language' },
  nav: { about: 'Project', features: 'What it does', tech: 'Technology', phases: 'Phases' },
  languageNames: { es: 'Español', en: 'English' },
  hero: {
    eyebrow: 'Academic project · 2nd year DAM',
    lead: 'A planner that keeps exams, assignments and study sessions in one calendar, and helps you focus with a Pomodoro timer and background audio.',
    primary: 'Open Tempora',
    secondary: 'See the project phases',
    note: 'It runs in the browser and is set up to be packaged as a desktop app with Tauri. Your data stays on your own device.',
    logoAlt: 'Tempora icon',
  },
  about: {
    title: 'About the project',
    intro: [
      'Tempora puts a weekly and daily calendar, your upcoming exams and assignments, a Pomodoro timer and a focus audio player on a single screen.',
      'It started as a way to study better: when you open an exam or an assignment, it offers to book study sessions on the calendar and links them to it. The same calendar also works for organising tasks and work blocks.',
    ],
    purposes: {
      title: 'Two purposes, the same events',
      academic: { name: 'Academic', text: 'Talks about subjects, exams, assignments and study sessions.' },
      productivity: { name: 'Productivity', text: 'Talks about areas, exams, tasks and focus blocks.' },
      note: 'Changing purpose only changes the wording: your saved events stay where they are.',
    },
    context: {
      title: 'Context',
      text: 'Tempora is a second-year academic project for Desarrollo de Aplicaciones Multiplataforma (DAM, cross-platform application development), built iteratively: each version adds or fixes one specific part and is checked before the next one.',
    },
  },
  features: {
    title: 'What it does today',
    intro: 'This is what the app does right now.',
    items: [
      { icon: 'calendar', title: 'Weekly and daily calendar', text: 'Week and day views with a mini calendar. Add an event by clicking a slot, move it by dragging (in 15-minute steps) or with a date and time form, which also works from the keyboard. On a phone it opens in the day view.' },
      { icon: 'link', title: 'Exams, assignments and linked sessions', text: 'Each exam or assignment can have linked study sessions, which must end before the deadline. When the app opens, a summary tells you what is coming: exams within 15 days and assignments within 30.' },
      { icon: 'timer', title: 'Pomodoro', text: '25-minute focus phases, 5-minute short breaks and 15-minute long breaks (one every four sessions), with a session counter and an alert at the end of each phase.' },
      { icon: 'audio', title: 'Focus audio', text: 'Three built-in sources (Lofi Girl, White Noise and Alpha Waves) and your own: a YouTube link or a direct audio stream. YouTube may refuse some embeds, and the app says so when that happens.' },
      { icon: 'language', title: 'Spanish and English', text: 'Interface, dates and alerts in both languages. The language is remembered and is the same on this page and in the app.' },
      { icon: 'palette', title: 'Personalisation', text: 'Four accent themes (Ruby, Purple agate, Diamond and Antimatter, with violet as the default) and light or dark mode.' },
      { icon: 'devices', title: 'Phone, tablet and desktop', text: 'On desktop, three visible areas; on tablet, collapsible panels; on a phone, a bottom bar with menu, add and focus.' },
      { icon: 'planner', title: 'Automatic planning', text: 'From a future exam or assignment, choose the number of sessions, their duration, available hours and days. Review a proposal spread before the deadline, without overlapping existing events.' },
      { icon: 'transfer', title: 'Cross-device transfer', text: 'Export a Tempora JSON file and import it on the other device. Includes a preview, duplicate detection and a choice of conflicting versions. It is manual; deletions are not propagated and there is no cloud sync.' },
      { icon: 'statistics', title: 'Focus statistics', text: 'Review 7, 30 and 90-day periods: scheduled time by subject or area, completed events, finished Pomodoros, focus minutes, active days and streak. History starts being recorded with version 1.1.' },
      { icon: 'storage', title: 'Data on your device', text: 'Events, preferences and history are saved locally. You can transfer them manually by file; there is no account or cloud.' },
    ],
    notYet: {
      title: 'Possible extensions',
      intro: 'These features do not exist in Tempora for now:',
      items: ['Automatic cloud sync with accounts', 'Real-time collaboration', 'Integration with other calendars'],
    },
  },
  tech: {
    title: 'Technology',
    intro: 'A web app with a desktop shell, checked with standard tools.',
    groups: [
      { name: 'Interface', items: ['React 18', 'TypeScript', 'Tailwind CSS 3', 'Framer Motion'] },
      { name: 'State and utilities', items: ['Zustand', 'date-fns', 'lucide-react'] },
      { name: 'Desktop', items: ['Tauri 2 (Rust)'] },
      { name: 'Tooling', items: ['Vite 5', 'Vitest', 'Playwright'] },
    ],
  },
  phases: {
    title: 'Project phases',
    intro: 'What has been done in each phase and what is missing. Anything pending is marked as pending.',
    statusLabel: { done: 'Implemented', partial: 'Partial', pending: 'Pending' },
    itemLabel: { done: 'Done', pending: 'Pending' },
    items: [
      {
        id: 'analysis', title: 'Analysis', status: 'done',
        summary: 'What Tempora had to solve, and within which limits.',
        items: [
          { text: 'Need: organise exams and assignments, prepare for them, and focus with a timer and audio.', status: 'done' },
          { text: 'Product decisions: two purposes sharing the same events, Spanish and English, local data and no server.', status: 'done' },
          { text: 'Initial validation with Adam, both user and author, on PC and iPhone: use, screenshots and feedback led to fixes in calendar hours, event cards and the date flow.', status: 'done' },
        ],
      },
      {
        id: 'design', title: 'Design', status: 'done',
        summary: 'Visual identity and interface layout.',
        items: [
          { text: '“Obsidian + Gems” identity: violet as the default accent, four themes, and light and dark mode.', status: 'done' },
          { text: 'System typography, translucent surfaces and short motion that respects “reduce motion”.', status: 'done' },
          { text: 'A layout that adapts to phone, tablet and desktop.', status: 'done' },
          { text: 'This presentation page.', status: 'done' },
          { text: 'Real desktop Chrome and iPhone Safari screenshots included in the gallery.', status: 'done' },
        ],
      },
      {
        id: 'development', title: 'Development', status: 'done',
        summary: 'What has been built, iteration by iteration.',
        items: [
          { text: 'Calendar with week and day views, events, linked sessions and date validation.', status: 'done' },
          { text: 'Pomodoro, focus audio and alerts.', status: 'done' },
          { text: 'Local persistence with migrations that never delete data it cannot read.', status: 'done' },
          { text: 'Languages, purposes and adaptation to different screen sizes.', status: 'done' },
          { text: 'Automatic planning with reviewed time slots, manual cross-device file transfer and statistics with persistent Pomodoro history.', status: 'done' },
        ],
      },
      {
        id: 'prompts', title: 'Prompts used and responses obtained', status: 'done',
        summary: 'Complete delivery record: initial analysis through 004C, preserving the original prompts and responses. Later publishing adjustments are outside the scope chosen by the author.',
        items: [],
      },
      {
        id: 'testing', title: 'Testing and deployment', status: 'partial',
        summary: 'How it is checked and how it has been published.',
        items: [
          { text: 'Automated Vitest tests for the logic: persistence, date validation, adaptive layout and audio.', status: 'done' },
          { text: 'Manual browser checks, with emulated screens and touch.', status: 'done' },
          { text: 'Basic physical iPhone Safari check: operation confirmed by Adam and documented with screenshots.', status: 'done' },
          { text: 'Specific tests with the on-screen keyboard, assistive technology and the Tauri desktop app.', status: 'pending' },
          { text: 'GitHub Actions workflow executed: installation, tests, build and package verification before deployment.', status: 'done' },
          { text: 'Landing and application published on GitHub Pages; deployment and access checked by Adam.', status: 'done' },
        ],
      },
    ],
    prompts: LOG_TEXT.en,
  },
  access: {
    title: 'Open Tempora',
    text: 'The app opens on its own page. It needs no account: start using it and your data is saved on this device.',
    cta: 'Open Tempora',
    privacy: 'Nothing is sent to any Tempora server.',
  },
  notices: {
    saveFailed: 'Your preference could not be saved on this device. It stays in effect on this page, but it may be lost when you reload.',
    dismiss: 'Dismiss notice',
  },
  footer: { text: 'Tempora · a second-year DAM academic project', top: 'Back to top' },
}

export const LANDING: Record<Language, LandingText> = { es, en }
export const getLanding = (language: Language): LandingText => LANDING[language]

