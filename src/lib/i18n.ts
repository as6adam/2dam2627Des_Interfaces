/**
 * Recursos de traducción y funciones PURAS (sin React, sin Zustand, sin `localStorage`).
 * Solo importa TIPOS de `store.ts` (`import type`, borrado al compilar) → no hay ciclo store ⇄ traducciones,
 * de modo que el store podrá usar `getCommon(language)` en futuras notificaciones.
 * Los hooks que leen Zustand viven en `vocab.ts`.
 *
 * Los `Record` son exhaustivos: faltar un idioma, un propósito o una clave es un error de compilación.
 */
import type { Kind, Phase, PRESETS, ThemeName } from '../store'
import { LANGUAGES, type Language, type Purpose } from './preferences'
import type { NotifyPermission } from './notify'
import type { AudioProblem, AudioUrlError } from './audio'
import type { Platform } from './platform'

/* ───────── Utilidades ───────── */
/** Singular/plural según Intl.PluralRules (es y en solo usan one/other). */
export function plural(language: Language, count: number, forms: { one: string; other: string }): string {
  return new Intl.PluralRules(language).select(count) === 'one' ? forms.one : forms.other
}
const num = (language: Language, n: number) => new Intl.NumberFormat(language).format(n)

/** Nombres nativos: no dependen del idioma de la interfaz (se reconocen aunque se esté en el idioma equivocado). */
export const LANGUAGE_NAMES: Record<Language, string> = { es: 'Español', en: 'English' }
export { LANGUAGES }

export type PresetId = (typeof PRESETS)[number]['id']

/* ───────── Vocabulario por propósito ───────── */
export interface Vocab {
  kind: Record<Kind, string>
  newKind: Record<'exam' | 'assignment', string>
  subjectLabel: string
  subjectPlaceholder: string
  nav: { exams: string; assignments: string; subjects: string; subjectsEmpty: string }
  filterChip: { exam: string; assignment: string }
  startup: { exams: (days: number) => string; assignments: (days: number) => string }
  studyPrompt: Record<'exam' | 'assignment', string>
  studySessions: string
  placeSession: string
  sessionDateLabel: string
  sessionTimeLabel: string
  removeSession: string
  /** Botón «eliminar» de un examen/entrega con sus sesiones vinculadas (n ≥ 1). */
  deleteWithSessions: (count: number) => string
  errors: { subjectRequired: string; sessionMustEndBefore: Record<'exam' | 'assignment', string>; dueBeforeSessions: Record<'exam' | 'assignment', string> }
  /** Cuerpo del aviso de bienvenida: frases completas con singular/plural/cero y «entrega/tarea» según el propósito. */
  welcomeNotice: (exams: number, examDays: number, assignments: number, assignmentDays: number) => string
}
export interface PurposeInfo { name: string; description: string }

const esWindow = (noun: string) => (d: number) =>
  plural('es', d, { one: `${noun} en el próximo día`, other: `${noun} en los próximos ${num('es', d)} días` })
const enWindow = (noun: string) => (d: number) =>
  plural('en', d, { one: `${noun} in the next day`, other: `${noun} in the next ${num('en', d)} days` })

/** Frase completa «<cantidad + sustantivo> <ventana>.»; cada forma lleva su propio sustantivo (nada de concatenar género/número). */
interface CountForms { zero: string; one: string; other: (n: number) => string }
const sentence = (language: Language, f: CountForms, n: number, days: number) => {
  const amount = n === 0 ? f.zero : n === 1 ? f.one : f.other(n)
  const window = language === 'es'
    ? plural('es', days, { one: 'en el próximo día', other: `en los próximos ${num('es', days)} días` })
    : plural('en', days, { one: 'in the next day', other: `in the next ${num('en', days)} days` })
  return `${amount} ${window}.`
}
const welcome = (language: Language, exam: CountForms, assignment: CountForms) =>
  (e: number, ed: number, a: number, ad: number) => `${sentence(language, exam, e, ed)} ${sentence(language, assignment, a, ad)}`
const esExams: CountForms = { zero: 'Sin exámenes', one: '1 examen', other: (n) => `${num('es', n)} exámenes` }
const enExams: CountForms = { zero: 'No exams', one: '1 exam', other: (n) => `${num('en', n)} exams` }

export const VOCAB: Record<Language, Record<Purpose, Vocab>> = {
  es: {
    academic: {
      kind: { exam: 'Examen', assignment: 'Entrega', study: 'Sesión de estudio' },
      newKind: { exam: 'Nuevo examen', assignment: 'Nueva entrega' },
      subjectLabel: 'Asignatura',
      subjectPlaceholder: 'p. ej. Bases de datos',
      nav: { exams: 'Exámenes próximos', assignments: 'Entregas', subjects: 'Asignaturas', subjectsEmpty: 'Las asignaturas aparecen al añadir exámenes o entregas.' },
      filterChip: { exam: 'Exámenes', assignment: 'Entregas' },
      startup: { exams: esWindow('Exámenes'), assignments: esWindow('Entregas') },
      welcomeNotice: welcome('es', esExams, { zero: 'Sin entregas', one: '1 entrega', other: (n) => `${num('es', n)} entregas` }),
      studyPrompt: {
        exam: '¿Quieres añadir una sesión de estudio para este próximo examen a tu calendario?',
        assignment: '¿Quieres añadir una sesión de estudio para esta próxima entrega a tu calendario?',
      },
      studySessions: 'Sesiones de estudio',
      placeSession: 'Haz clic en un hueco para colocar tu sesión de estudio',
      sessionDateLabel: 'Fecha de la sesión de estudio',
      sessionTimeLabel: 'Hora de la sesión de estudio',
      removeSession: 'Eliminar sesión de estudio',
      deleteWithSessions: (n) => plural('es', n, { one: 'Eliminar con su sesión de estudio', other: `Eliminar con sus ${num('es', n)} sesiones de estudio` }),
      errors: {
        subjectRequired: 'Escribe el nombre de la asignatura.',
        sessionMustEndBefore: { exam: 'La sesión de estudio debe terminar antes de que empiece el examen.', assignment: 'La sesión de estudio debe terminar antes de la hora de la entrega.' },
        dueBeforeSessions: { exam: 'El examen no puede empezar antes de que termine alguna de sus sesiones de estudio.', assignment: 'La entrega no puede ser anterior al final de alguna de sus sesiones de estudio.' },
      },
    },
    productivity: {
      // Un examen existente sigue siendo «Examen» y accesible también aquí.
      kind: { exam: 'Examen', assignment: 'Tarea', study: 'Bloque de concentración' },
      newKind: { exam: 'Nuevo examen', assignment: 'Nueva tarea' },
      subjectLabel: 'Área',
      subjectPlaceholder: 'p. ej. Proyecto personal',
      nav: { exams: 'Exámenes próximos', assignments: 'Tareas', subjects: 'Áreas', subjectsEmpty: 'Las áreas aparecen al añadir exámenes o tareas.' },
      filterChip: { exam: 'Exámenes', assignment: 'Tareas' },
      startup: { exams: esWindow('Exámenes'), assignments: esWindow('Tareas') },
      welcomeNotice: welcome('es', esExams, { zero: 'Sin tareas', one: '1 tarea', other: (n) => `${num('es', n)} tareas` }),
      studyPrompt: {
        exam: '¿Quieres añadir un bloque de concentración para este próximo examen a tu calendario?',
        assignment: '¿Quieres añadir un bloque de concentración para esta próxima tarea a tu calendario?',
      },
      studySessions: 'Bloques de concentración',
      placeSession: 'Haz clic en un hueco para colocar tu bloque de concentración',
      sessionDateLabel: 'Fecha del bloque de concentración',
      sessionTimeLabel: 'Hora del bloque de concentración',
      removeSession: 'Eliminar bloque de concentración',
      deleteWithSessions: (n) => plural('es', n, { one: 'Eliminar con su bloque de concentración', other: `Eliminar con sus ${num('es', n)} bloques de concentración` }),
      errors: {
        subjectRequired: 'Escribe el nombre del área.',
        sessionMustEndBefore: { exam: 'El bloque de concentración debe terminar antes de que empiece el examen.', assignment: 'El bloque de concentración debe terminar antes de la hora límite de la tarea.' },
        dueBeforeSessions: { exam: 'El examen no puede empezar antes de que termine alguno de sus bloques de concentración.', assignment: 'La hora límite no puede ser anterior al final de alguno de sus bloques de concentración.' },
      },
    },
  },
  en: {
    academic: {
      kind: { exam: 'Exam', assignment: 'Assignment', study: 'Study session' },
      newKind: { exam: 'New exam', assignment: 'New assignment' },
      subjectLabel: 'Subject',
      subjectPlaceholder: 'e.g. Databases',
      nav: { exams: 'Upcoming exams', assignments: 'Assignments', subjects: 'Subjects', subjectsEmpty: 'Subjects appear when you add exams or assignments.' },
      filterChip: { exam: 'Exams', assignment: 'Assignments' },
      startup: { exams: enWindow('Exams'), assignments: enWindow('Assignments') },
      welcomeNotice: welcome('en', enExams, { zero: 'No assignments', one: '1 assignment', other: (n) => `${num('en', n)} assignments` }),
      studyPrompt: {
        exam: 'Would you like to add a study session for this upcoming exam to your calendar?',
        assignment: 'Would you like to add a study session for this upcoming assignment to your calendar?',
      },
      studySessions: 'Study sessions',
      placeSession: 'Click a time slot to place your study session',
      sessionDateLabel: 'Study session date',
      sessionTimeLabel: 'Study session time',
      removeSession: 'Remove study session',
      deleteWithSessions: (n) => plural('en', n, { one: 'Delete with its study session', other: `Delete with its ${num('en', n)} study sessions` }),
      errors: {
        subjectRequired: 'Give it a subject name.',
        sessionMustEndBefore: { exam: 'The study session has to end before the exam starts.', assignment: 'The study session has to end before the assignment is due.' },
        dueBeforeSessions: { exam: 'The exam can’t start before one of its study sessions ends.', assignment: 'The due time can’t be earlier than the end of one of its study sessions.' },
      },
    },
    productivity: {
      kind: { exam: 'Exam', assignment: 'Task', study: 'Focus block' },
      newKind: { exam: 'New exam', assignment: 'New task' },
      subjectLabel: 'Area',
      subjectPlaceholder: 'e.g. Personal project',
      nav: { exams: 'Upcoming exams', assignments: 'Tasks', subjects: 'Areas', subjectsEmpty: 'Areas appear when you add exams or tasks.' },
      filterChip: { exam: 'Exams', assignment: 'Tasks' },
      startup: { exams: enWindow('Exams'), assignments: enWindow('Tasks') },
      welcomeNotice: welcome('en', enExams, { zero: 'No tasks', one: '1 task', other: (n) => `${num('en', n)} tasks` }),
      studyPrompt: {
        exam: 'Would you like to add a focus block for this upcoming exam to your calendar?',
        assignment: 'Would you like to add a focus block for this upcoming task to your calendar?',
      },
      studySessions: 'Focus blocks',
      placeSession: 'Click a time slot to place your focus block',
      sessionDateLabel: 'Focus block date',
      sessionTimeLabel: 'Focus block time',
      removeSession: 'Remove focus block',
      deleteWithSessions: (n) => plural('en', n, { one: 'Delete with its focus block', other: `Delete with its ${num('en', n)} focus blocks` }),
      errors: {
        subjectRequired: 'Give it an area name.',
        sessionMustEndBefore: { exam: 'The focus block has to end before the exam starts.', assignment: 'The focus block has to end before the task is due.' },
        dueBeforeSessions: { exam: 'The exam can’t start before one of its focus blocks ends.', assignment: 'The due time can’t be earlier than the end of one of its focus blocks.' },
      },
    },
  },
}

export const PURPOSE_INFO: Record<Language, Record<Purpose, PurposeInfo>> = {
  es: {
    academic: { name: 'Académico', description: 'Asignaturas, exámenes, entregas y sesiones de estudio.' },
    productivity: { name: 'Productividad', description: 'Áreas, tareas y bloques de concentración.' },
  },
  en: {
    academic: { name: 'Academic', description: 'Subjects, exams, assignments and study sessions.' },
    productivity: { name: 'Productivity', description: 'Areas, tasks and focus blocks.' },
  },
}

/* ───────── Textos comunes (independientes del propósito) ───────── */
export interface Common {
  settings: {
    title: string
    darkMode: { title: string; desc: string; switchLabel: string }
    /** Título deliberadamente bilingüe en ambos idiomas: la fila se encuentra aunque se esté en el idioma equivocado. */
    language: { title: string; desc: string }
    purpose: { title: string; desc: (purposeName: string) => string; change: string; changeLabel: string }
    notifications: {
      title: string; desc: string; test: string; testLabel: string; switchLabel: string; testBody: string
      permissionTitle: string; allow: string; allowLabel: string
      /** Estado real (permiso + disponibilidad) en lenguaje llano; `enabled` es la preferencia interna de Tempora. */
      status: (permission: NotifyPermission, platform: Platform, enabled: boolean) => string
    }
    sample: { title: string; desc: string; load: string; loadLabel: string }
    clear: { title: string; desc: (count: number) => string; clear: string; clearLabel: string; confirm: string }
    done: string
  }
  purposeDialog: {
    titleFirst: string; titleChange: string; intro: string; legend: string
    selected: string; current: string; choose: string
    cancel: string; continue: string; save: string
  }
  sidebar: {
    purposeControl: (purposeName: string) => string
    tagline: string; logoAlt: string; allEvents: string; themes: string; settings: string; navLabel: string
    mode: Record<'light' | 'dark', string>
  }
  calendar: {
    views: Record<'week' | 'day', string>; viewGroup: string; today: string; add: string
    previous: Record<'week' | 'day', string>; next: Record<'week' | 'day', string>
    clearFilter: (name: string) => string; cancelPicking: string
    /** Región con scroll propio (vista semanal estrecha): se anuncia y se señaliza que hay más días. */
    scrollHint: string; regionLabel: Record<'week' | 'day', string>
    /** Nombre accesible de una tarjeta de evento (tipo, asignatura, cuándo). */
    eventLabel: (kind: string, subject: string, when: string) => string
    dragReady: string
  }
  miniCalendar: { group: string; previousMonth: string; nextMonth: string; withEvents: string }
  popover: {
    dialogLabel: (subject: string) => string; close: string; schedulePrep: string; notNow: string
    durationGroup: string; minutes: (n: number) => string
    addToCalendar: string; pick: string; pickHint: string; delete: string
    reschedule: string; rescheduleLabel: (subject: string) => string; touchMoveHint: string
  }
  itemModal: {
    type: string; dueDate: string; time: string; notes: string; notesPlaceholder: string; cancel: string; add: string
    /** Edición de fecha y hora de un evento existente (alternativa al arrastre). */
    rescheduleTitle: string; rescheduleIntro: string; newDate: string; newTime: string; currently: string; save: string
  }
  layout: {
    barLabel: string; menu: string; focus: string; add: string
    navTitle: string; focusTitle: string; closePanel: string
    calendarLabel: string
    /** Texto añadido al botón de concentración mientras el temporizador corre (no solo color). */
    running: (mmss: string) => string
  }
  startup: { title: string; subtitle: string; gotIt: string }
  themes: { title: string; intro: string; darkMode: string; names: Record<ThemeName, { name: string; hint: string }> }
  timer: {
    section: string; phaseGroup: string; phases: Record<Phase, string>
    focusing: string; onBreak: string; ready: string; paused: string
    reset: string; start: string; pause: string
    sessionsDone: (count: number) => string; sessionsDoneLabel: (count: number) => string
  }
  audio: {
    section: string; heading: string; sourceGroup: string; presets: Record<PresetId, string>; custom: string
    urlPlaceholder: string; urlLabel: string; load: string; play: string; pause: string
    mute: string; unmute: string; volume: string
    loading: string; playing: string; paused: string
    youtubePlayer: string; retry: string; retryLabel: string; urlHelp: string
    /** Qué ha pasado y qué puede hacer el usuario (sin jerga técnica). */
    problems: Record<AudioProblem, string>
    urlErrors: Record<AudioUrlError, string>
  }
  storage: { writeFailed: string }
  errors: { invalidDateTime: string }
  toast: { region: string; close: string }
  relative: { today: string; tomorrow: string; yesterday: string; inDays: (n: number) => string; daysAgo: (n: number) => string }
  notices: {
    welcomeTitle: string
    focusDoneTitle: string; focusDoneBody: Record<'short' | 'long', string>
    breakDoneTitle: string; breakDoneBody: string
  }
}

export const COMMON: Record<Language, Common> = {
  es: {
    settings: {
      title: 'Ajustes',
      darkMode: { title: 'Modo oscuro', desc: 'Superficies Obsidiana / Grafito.', switchLabel: 'Modo oscuro' },
      language: { title: 'Idioma / Language', desc: 'Idioma de la interfaz. Tus eventos no se traducen ni se modifican.' },
      purpose: {
        title: 'Propósito',
        desc: (name) => `${name}. Cambia el vocabulario; tus eventos no se modifican.`,
        change: 'Cambiar',
        changeLabel: 'Cambiar propósito',
      },
      notifications: {
        title: 'Notificaciones',
        desc: 'Avisos al terminar el temporizador y recordatorios al iniciar.',
        test: 'Probar',
        testLabel: 'Probar notificaciones',
        switchLabel: 'Notificaciones',
        testBody: 'Las notificaciones funcionan.',
        permissionTitle: 'Permiso del sistema',
        allow: 'Permitir',
        allowLabel: 'Permitir notificaciones del sistema',
        status: (permission, platform, enabled) => {
          const inApp = 'Mientras tanto, los avisos aparecerán dentro de Tempora.'
          const system: Record<NotifyPermission, { text: string; fallback: boolean }> = {
            unsupported: { text: 'Este entorno no admite notificaciones del sistema.', fallback: true },
            default: { text: 'Aún no has concedido permiso para las notificaciones del sistema.', fallback: true },
            granted: { text: platform === 'tauri' ? 'Las notificaciones nativas del escritorio están disponibles.' : 'Permiso concedido: los avisos llegarán como notificaciones del sistema.', fallback: false },
            denied: { text: platform === 'tauri' ? 'Las notificaciones están bloqueadas en los ajustes del sistema.' : 'El navegador bloquea las notificaciones de este sitio; puedes cambiarlo en los ajustes del sitio.', fallback: true },
          }
          const { text, fallback } = system[permission]
          return enabled ? (fallback ? `${text} ${inApp}` : text) : `Los avisos están desactivados en Tempora: no se mostrará ninguno. ${text}`
        },
      },
      sample: { title: 'Datos de ejemplo', desc: 'Añade algunos eventos de ejemplo para probar la aplicación.', load: 'Cargar', loadLabel: 'Cargar datos de ejemplo' },
      clear: {
        title: 'Borrar todos los eventos',
        desc: (n) =>
          n === 0
            ? 'No hay eventos que borrar.'
            : plural('es', n, { one: 'Elimina el único evento. No se puede deshacer.', other: `Elimina los ${num('es', n)} eventos. No se puede deshacer.` }),
        clear: 'Borrar',
        clearLabel: 'Borrar todos los eventos',
        confirm: 'Sí, borrar todo',
      },
      done: 'Listo',
    },
    purposeDialog: {
      titleFirst: '¿Cómo vas a usar Tempora?',
      titleChange: 'Cambiar propósito',
      intro: 'Solo cambia el vocabulario. Tus eventos, el temporizador y el audio no se tocan, y puedes cambiarlo cuando quieras desde Ajustes.',
      legend: 'Propósito de uso',
      selected: 'Seleccionado',
      current: 'Actual',
      choose: 'Elige una opción para continuar.',
      cancel: 'Cancelar',
      continue: 'Continuar',
      save: 'Guardar cambio',
    },
    sidebar: {
      purposeControl: (name) => `Propósito: ${name}`,
      tagline: 'Planifica. Concéntrate. Aprueba.',
      logoAlt: 'Logotipo de Tempora',
      allEvents: 'Todos los eventos',
      themes: 'Personalizar tema',
      settings: 'Ajustes',
      navLabel: 'Navegación y calendario mensual',
      mode: { light: 'Modo claro', dark: 'Modo oscuro' },
    },
    calendar: {
      views: { week: 'Semana', day: 'Día' },
      viewGroup: 'Vista del calendario',
      today: 'Hoy',
      add: 'Añadir',
      previous: { week: 'Semana anterior', day: 'Día anterior' },
      next: { week: 'Semana siguiente', day: 'Día siguiente' },
      clearFilter: (name) => `Quitar filtro: ${name}`,
      cancelPicking: 'Cancelar',
      scrollHint: 'Desliza horizontalmente para ver más días',
      regionLabel: { week: 'Calendario semanal. Se desplaza con las flechas del teclado.', day: 'Calendario del día. Se desplaza con las flechas del teclado.' },
      eventLabel: (kind, subject, when) => `${kind}: ${subject}, ${when}`,
      dragReady: 'Arrastra para mover',
    },
    miniCalendar: { group: 'Calendario mensual', previousMonth: 'Mes anterior', nextMonth: 'Mes siguiente', withEvents: 'con eventos' },
    popover: {
      dialogLabel: (subject) => `Detalles de ${subject}`,
      close: 'Cerrar',
      schedulePrep: 'Programar preparación',
      notNow: 'Ahora no',
      durationGroup: 'Duración',
      minutes: (n) => `${num('es', n)} min`,
      addToCalendar: 'Añadir al calendario',
      pick: 'Elegir',
      pickHint: 'Elige el hueco directamente en el calendario',
      delete: 'Eliminar',
      reschedule: 'Cambiar fecha y hora',
      rescheduleLabel: (subject) => `Cambiar fecha y hora de ${subject}`,
      touchMoveHint: 'También puedes mantener pulsado el evento en el calendario y arrastrarlo.',
    },
    itemModal: {
      type: 'Tipo', dueDate: 'Fecha límite', time: 'Hora', notes: 'Notas', notesPlaceholder: 'Temas, aula, materiales…', cancel: 'Cancelar', add: 'Añadir',
      rescheduleTitle: 'Cambiar fecha y hora', rescheduleIntro: 'Solo cambia cuándo ocurre; el tipo, la duración y los vínculos se mantienen.', newDate: 'Fecha', newTime: 'Hora', currently: 'Ahora', save: 'Guardar cambio',
    },
    layout: {
      barLabel: 'Navegación principal', menu: 'Menú', focus: 'Concentración', add: 'Añadir',
      navTitle: 'Navegación', focusTitle: 'Concentración', closePanel: 'Cerrar panel',
      calendarLabel: 'Calendario',
      running: (t) => `en marcha, quedan ${t}`,
    },
    startup: { title: 'Hola de nuevo', subtitle: 'Esto es lo que viene.', gotIt: 'Entendido' },
    themes: {
      title: 'Personalización de temas',
      intro: 'Obsidiana + Gemas: elige un color de acento. Se aplica al instante en toda la aplicación.',
      darkMode: 'Modo oscuro (Obsidiana / Grafito)',
      names: {
        ruby: { name: 'Rubí', hint: 'Carmesí intenso' },
        agate: { name: 'Ágata púrpura', hint: 'Púrpura vibrante' },
        diamond: { name: 'Diamante', hint: 'Cian / azul hielo' },
        antimatter: { name: 'Antimateria', hint: 'Violeta neón, vacío profundo' },
      },
    },
    timer: {
      section: 'Temporizador Pomodoro',
      phaseGroup: 'Fase del temporizador',
      phases: { focus: 'Enfoque', short: 'Descanso corto', long: 'Descanso largo' },
      focusing: 'Concentrándote',
      onBreak: 'En descanso',
      ready: 'Listo',
      paused: 'En pausa',
      reset: 'Reiniciar temporizador',
      start: 'Iniciar',
      pause: 'Pausar',
      sessionsDone: (n) => plural('es', n, { one: '1 completada', other: `${num('es', n)} completadas` }),
      sessionsDoneLabel: (n) => plural('es', n, { one: '1 sesión de enfoque completada', other: `${num('es', n)} sesiones de enfoque completadas` }),
    },
    audio: {
      section: 'Reproductor de audio',
      heading: 'Audio de enfoque',
      sourceGroup: 'Fuente de audio',
      presets: { lofi: 'Lofi Girl', white: 'Ruido blanco', alpha: 'Ondas alfa' },
      custom: 'Personalizado',
      urlPlaceholder: 'URL de YouTube o de audio directo',
      urlLabel: 'URL de audio personalizada',
      load: 'Cargar',
      play: 'Reproducir audio',
      pause: 'Pausar audio',
      mute: 'Silenciar',
      unmute: 'Activar sonido',
      volume: 'Volumen',
      loading: 'Cargando…',
      playing: 'Reproduciendo',
      paused: 'En pausa',
      youtubePlayer: 'Reproductor de YouTube',
      retry: 'Reintentar',
      retryLabel: 'Reintentar la reproducción',
      urlHelp: 'Enlaces de YouTube o de audio directo (http/https). Que un enlace sea válido no garantiza que se pueda reproducir.',
      problems: {
        blocked: 'El navegador ha bloqueado la reproducción. Pulsa Reintentar para empezar.',
        source: 'No se ha podido reproducir esta fuente. Reintenta o elige otra.',
        unavailable: 'El propietario del vídeo no permite reproducirlo fuera de YouTube. Elige otra fuente.',
        network: 'No se ha podido cargar el reproductor (sin conexión o bloqueado). Reintenta o elige otra fuente.',
      },
      urlErrors: {
        empty: 'Escribe un enlace.',
        invalid: 'Ese texto no parece un enlace válido.',
        protocol: 'Solo se admiten enlaces http o https.',
        unsupported: 'Ese enlace de YouTube no apunta a un vídeo concreto.',
      },
    },
    errors: { invalidDateTime: 'Elige una fecha y una hora válidas.' },
    toast: { region: 'Avisos', close: 'Cerrar aviso' },
    storage: { writeFailed: 'No se pueden guardar los cambios en este navegador. Puedes seguir trabajando, pero se perderán al cerrar o recargar.' },
    relative: {
      today: 'Hoy', tomorrow: 'Mañana', yesterday: 'Ayer',
      inDays: (n) => plural('es', n, { one: 'Dentro de 1 día', other: `Dentro de ${num('es', n)} días` }),
      daysAgo: (n) => plural('es', n, { one: 'Hace 1 día', other: `Hace ${num('es', n)} días` }),
    },
    notices: {
      welcomeTitle: 'Tempora — aviso',
      focusDoneTitle: 'Sesión de enfoque completada',
      focusDoneBody: { short: 'Buen trabajo. Toca un descanso corto.', long: 'Buen trabajo. Toca un descanso largo.' },
      breakDoneTitle: 'El descanso ha terminado',
      breakDoneBody: '¿Listo para otra sesión de enfoque?',
    },
  },
  en: {
    settings: {
      title: 'Settings',
      darkMode: { title: 'Dark mode', desc: 'Obsidian / Graphite surfaces.', switchLabel: 'Dark mode' },
      language: { title: 'Idioma / Language', desc: 'Interface language. Your events are not translated or modified.' },
      purpose: {
        title: 'Purpose',
        desc: (name) => `${name}. Changes the vocabulary; your events are not modified.`,
        change: 'Change',
        changeLabel: 'Change purpose',
      },
      notifications: {
        title: 'Notifications',
        desc: 'Alerts when the timer ends and reminders at launch.',
        test: 'Test',
        testLabel: 'Test notifications',
        switchLabel: 'Notifications',
        testBody: 'Notifications are working.',
        permissionTitle: 'System permission',
        allow: 'Allow',
        allowLabel: 'Allow system notifications',
        status: (permission, platform, enabled) => {
          const inApp = 'Meanwhile, alerts will appear inside Tempora.'
          const system: Record<NotifyPermission, { text: string; fallback: boolean }> = {
            unsupported: { text: 'This environment does not support system notifications.', fallback: true },
            default: { text: "You haven't granted permission for system notifications yet.", fallback: true },
            granted: { text: platform === 'tauri' ? 'Native desktop notifications are available.' : 'Permission granted: alerts will arrive as system notifications.', fallback: false },
            denied: { text: platform === 'tauri' ? 'Notifications are blocked in your system settings.' : 'Your browser is blocking notifications for this site; you can change that in the site settings.', fallback: true },
          }
          const { text, fallback } = system[permission]
          return enabled ? (fallback ? `${text} ${inApp}` : text) : `Alerts are turned off in Tempora: none will be shown. ${text}`
        },
      },
      sample: { title: 'Sample data', desc: 'Adds a few sample events to try the app out.', load: 'Load', loadLabel: 'Load sample data' },
      clear: {
        title: 'Clear all events',
        desc: (n) =>
          n === 0
            ? 'There are no events to clear.'
            : plural('en', n, { one: "Removes the only event. This can't be undone.", other: `Removes all ${num('en', n)} events. This can't be undone.` }),
        clear: 'Clear',
        clearLabel: 'Clear all events',
        confirm: 'Yes, clear everything',
      },
      done: 'Done',
    },
    purposeDialog: {
      titleFirst: 'How will you use Tempora?',
      titleChange: 'Change purpose',
      intro: 'This only changes the vocabulary. Your events, the timer and the audio are left untouched, and you can change it any time in Settings.',
      legend: 'Purpose of use',
      selected: 'Selected',
      current: 'Current',
      choose: 'Choose an option to continue.',
      cancel: 'Cancel',
      continue: 'Continue',
      save: 'Save change',
    },
    sidebar: {
      purposeControl: (name) => `Purpose: ${name}`,
      tagline: 'Plan. Focus. Pass.',
      logoAlt: 'Tempora logo',
      allEvents: 'All events',
      themes: 'Theme customization',
      settings: 'Settings',
      navLabel: 'Navigation and month calendar',
      mode: { light: 'Light mode', dark: 'Dark mode' },
    },
    calendar: {
      views: { week: 'Week', day: 'Day' },
      viewGroup: 'Calendar view',
      today: 'Today',
      add: 'Add',
      previous: { week: 'Previous week', day: 'Previous day' },
      next: { week: 'Next week', day: 'Next day' },
      clearFilter: (name) => `Clear filter: ${name}`,
      cancelPicking: 'Cancel',
      scrollHint: 'Swipe sideways to see more days',
      regionLabel: { week: 'Weekly calendar. Scroll with the arrow keys.', day: 'Day calendar. Scroll with the arrow keys.' },
      eventLabel: (kind, subject, when) => `${kind}: ${subject}, ${when}`,
      dragReady: 'Drag to move',
    },
    miniCalendar: { group: 'Month calendar', previousMonth: 'Previous month', nextMonth: 'Next month', withEvents: 'has events' },
    popover: {
      dialogLabel: (subject) => `${subject} details`,
      close: 'Close',
      schedulePrep: 'Schedule prep',
      notNow: 'Not now',
      durationGroup: 'Duration',
      minutes: (n) => `${num('en', n)} min`,
      addToCalendar: 'Add to calendar',
      pick: 'Pick',
      pickHint: 'Choose the slot directly on the calendar',
      delete: 'Delete',
      reschedule: 'Change date and time',
      rescheduleLabel: (subject) => `Change date and time of ${subject}`,
      touchMoveHint: 'You can also press and hold the event on the calendar and drag it.',
    },
    itemModal: {
      type: 'Type', dueDate: 'Due date', time: 'Time', notes: 'Notes', notesPlaceholder: 'Topics, room, materials…', cancel: 'Cancel', add: 'Add',
      rescheduleTitle: 'Change date and time', rescheduleIntro: 'Only when it happens changes; the type, duration and links stay as they are.', newDate: 'Date', newTime: 'Time', currently: 'Currently', save: 'Save change',
    },
    layout: {
      barLabel: 'Main navigation', menu: 'Menu', focus: 'Focus', add: 'Add',
      navTitle: 'Navigation', focusTitle: 'Focus', closePanel: 'Close panel',
      calendarLabel: 'Calendar',
      running: (t) => `running, ${t} left`,
    },
    startup: { title: 'Welcome back', subtitle: "Here's what's coming up.", gotIt: 'Got it' },
    themes: {
      title: 'Theme customization',
      intro: 'Obsidian + Gems: pick an accent color. It applies instantly across the whole app.',
      darkMode: 'Dark mode (Obsidian / Graphite)',
      names: {
        ruby: { name: 'Ruby', hint: 'Deep crimson' },
        agate: { name: 'Purple Agate', hint: 'Vibrant purple' },
        diamond: { name: 'Diamond', hint: 'Cyan / ice blue' },
        antimatter: { name: 'Antimatter', hint: 'Neon violet, deep void' },
      },
    },
    timer: {
      section: 'Pomodoro timer',
      phaseGroup: 'Timer phase',
      phases: { focus: 'Focus', short: 'Short break', long: 'Long break' },
      focusing: 'Focusing',
      onBreak: 'On a break',
      ready: 'Ready',
      paused: 'Paused',
      reset: 'Reset timer',
      start: 'Start',
      pause: 'Pause',
      sessionsDone: (n) => plural('en', n, { one: '1 done', other: `${num('en', n)} done` }),
      sessionsDoneLabel: (n) => plural('en', n, { one: '1 focus session completed', other: `${num('en', n)} focus sessions completed` }),
    },
    audio: {
      section: 'Audio player',
      heading: 'Focus audio',
      sourceGroup: 'Audio source',
      presets: { lofi: 'Lofi Girl', white: 'White Noise', alpha: 'Alpha Waves' },
      custom: 'Custom',
      urlPlaceholder: 'YouTube or direct audio URL',
      urlLabel: 'Custom audio URL',
      load: 'Load',
      play: 'Play audio',
      pause: 'Pause audio',
      mute: 'Mute',
      unmute: 'Unmute',
      volume: 'Volume',
      loading: 'Loading…',
      playing: 'Now playing',
      paused: 'Paused',
      youtubePlayer: 'YouTube player',
      retry: 'Retry',
      retryLabel: 'Retry playback',
      urlHelp: 'YouTube or direct audio links (http/https). A valid link does not guarantee it can be played.',
      problems: {
        blocked: 'The browser blocked playback. Press Retry to start.',
        source: "This source couldn't be played. Retry or choose another.",
        unavailable: "The video's owner doesn't allow playing it outside YouTube. Choose another source.",
        network: "The player couldn't be loaded (offline or blocked). Retry or choose another source.",
      },
      urlErrors: {
        empty: 'Enter a link.',
        invalid: "That doesn't look like a valid link.",
        protocol: 'Only http or https links are supported.',
        unsupported: "That YouTube link doesn't point to a specific video.",
      },
    },
    errors: { invalidDateTime: 'Pick a valid date and time.' },
    toast: { region: 'Alerts', close: 'Dismiss alert' },
    storage: { writeFailed: "Changes can't be saved in this browser. You can keep working, but they will be lost when you close or reload." },
    relative: {
      today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday',
      inDays: (n) => plural('en', n, { one: 'In 1 day', other: `In ${num('en', n)} days` }),
      daysAgo: (n) => plural('en', n, { one: '1 day ago', other: `${num('en', n)} days ago` }),
    },
    notices: {
      welcomeTitle: 'Tempora — heads up',
      focusDoneTitle: 'Focus session complete',
      focusDoneBody: { short: 'Nice work. Time for a short break.', long: 'Nice work. Time for a long break.' },
      breakDoneTitle: 'Break is over',
      breakDoneBody: 'Ready for another focus session?',
    },
  },
}

/* ───────── Errores de formulario: se guarda un código (+ parámetros), el texto se resuelve al renderizar ───────── */
export type FormError =
  | { code: 'subjectRequired' }
  | { code: 'invalidDateTime' }
  | { code: 'sessionMustEndBefore'; kind: 'exam' | 'assignment' }
  | { code: 'dueBeforeSessions'; kind: 'exam' | 'assignment' }

export function formErrorText(language: Language, purpose: Purpose | null, error: FormError): string {
  switch (error.code) {
    case 'subjectRequired': return getVocab(language, purpose).errors.subjectRequired
    case 'invalidDateTime': return COMMON[language].errors.invalidDateTime
    case 'sessionMustEndBefore': return getVocab(language, purpose).errors.sessionMustEndBefore[error.kind]
    case 'dueBeforeSessions': return getVocab(language, purpose).errors.dueBeforeSessions[error.kind]
  }
}

/* ───────── Acceso (puro) ───────── */
/** Sin propósito elegido (solo durante el primer arranque) se usa el vocabulario académico. */
export const getVocab = (language: Language, purpose: Purpose | null): Vocab => VOCAB[language][purpose ?? 'academic']
export const getPurposeInfo = (language: Language): Record<Purpose, PurposeInfo> => PURPOSE_INFO[language]
export const getCommon = (language: Language): Common => COMMON[language]

/* ───────── Notificaciones automáticas: funciones PURAS (idioma y propósito se resuelven al emitir) ───────── */
export interface Notice { title: string; body: string }

export function welcomeNotice(language: Language, purpose: Purpose | null, c: { exams: number; examDays: number; assignments: number; assignmentDays: number }): Notice {
  return { title: COMMON[language].notices.welcomeTitle, body: getVocab(language, purpose).welcomeNotice(c.exams, c.examDays, c.assignments, c.assignmentDays) }
}

/** Fin de una fase: `finished` es la que acaba y `next` la que toca (corto/largo tras concentración). */
export function timerNotice(language: Language, finished: Phase, next: Phase): Notice {
  const n = COMMON[language].notices
  return finished === 'focus'
    ? { title: n.focusDoneTitle, body: n.focusDoneBody[next === 'long' ? 'long' : 'short'] }
    : { title: n.breakDoneTitle, body: n.breakDoneBody }
}

/* ───────── Datos de ejemplo (solo al generarlos; los ya guardados no se tocan) ───────── */
export interface SampleEntry { kind: Kind; subject: string; days: number; hour: number; notes: string }
const SAMPLE: Record<Language, SampleEntry[]> = {
  es: [
    { kind: 'exam', subject: 'Bases de datos', days: 6, hour: 10, notes: 'Temas 1–5, JOIN en SQL' },
    { kind: 'exam', subject: 'Sistemas operativos', days: 12, hour: 16, notes: '' },
    { kind: 'assignment', subject: 'Proyecto Android', days: 3, hour: 20, notes: 'Entregar en el aula virtual' },
    { kind: 'assignment', subject: 'Práctica de Streams en Java', days: 21, hour: 18, notes: '' },
    { kind: 'exam', subject: 'Redes (lejano)', days: 40, hour: 9, notes: '' },
    { kind: 'assignment', subject: 'Borrador del proyecto final (lejano)', days: 45, hour: 12, notes: '' },
  ],
  en: [
    { kind: 'exam', subject: 'Databases', days: 6, hour: 10, notes: 'Chapters 1–5, SQL joins' },
    { kind: 'exam', subject: 'Operating Systems', days: 12, hour: 16, notes: '' },
    { kind: 'assignment', subject: 'Android Project', days: 3, hour: 20, notes: 'Submit via the virtual classroom' },
    { kind: 'assignment', subject: 'Java Streams Lab', days: 21, hour: 18, notes: '' },
    { kind: 'exam', subject: 'Networks (far away)', days: 40, hour: 9, notes: '' },
    { kind: 'assignment', subject: 'Thesis draft (far away)', days: 45, hour: 12, notes: '' },
  ],
}
export const sampleEntries = (language: Language): SampleEntry[] => SAMPLE[language]
