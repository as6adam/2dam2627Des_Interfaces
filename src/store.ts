import { create } from 'zustand'
import { persist, type PersistStorage } from 'zustand/middleware'
import { addDays, setHours, setMinutes } from 'date-fns'
import { notify } from './lib/notify'
import { sampleEntries, timerNotice } from './lib/i18n'
import { useProgress } from './lib/progress'
import { createSafeStorage } from './lib/storage'
import { initialCalendarView } from './lib/layout'
import { DEFAULT_VOLUME, clampVolume, parseAudioSource, sanitizeAudio, type AudioProblem } from './lib/audio'
import { DEFAULT_PERSISTED, Language, PERSIST_NAME, PERSIST_VERSION, PersistedApp, Purpose, migratePersisted, sanitizePersisted } from './lib/preferences'

/* ───────── Domain ───────── */
export type Kind = 'exam' | 'assignment' | 'study'
export interface Item {
  id: string
  kind: Kind
  subject: string
  start: string // ISO — due date/time for exams & assignments, start for study sessions
  duration: number // minutes (calendar block length)
  notes: string
  linkedTo?: string // study session → exam/assignment id
}
export const DEFAULT_DURATION: Record<Kind, number> = { exam: 90, assignment: 30, study: 60 }
export type ThemeName = 'ruby' | 'agate' | 'diamond' | 'antimatter'
export type Mode = 'light' | 'dark'
const uid = () => crypto.randomUUID()

/* ───────── App data (persisted) ───────── */
interface AppState {
  items: Item[]
  mode: Mode
  theme: ThemeName
  notifications: boolean
  /** null = el usuario aún no ha elegido (se le pregunta al arrancar). */
  purpose: Purpose | null
  language: Language
  addItem: (i: Omit<Item, 'id'>) => string
  addItems: (items: Omit<Item, 'id'>[]) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  removeItem: (id: string) => void
  setMode: (m: Mode) => void
  setTheme: (t: ThemeName) => void
  setNotifications: (b: boolean) => void
  setPurpose: (p: Purpose) => void
  setLanguage: (l: Language) => void
  loadSample: () => void
  clearAll: () => void
}
/** Misma clave (`tempora-v1`) y mismo `localStorage`, con lectura/escritura tolerantes (ver `lib/storage.ts`). */
const appStorage: PersistStorage<PersistedApp> = createSafeStorage<PersistedApp>()

export const useApp = create<AppState>()(
  persist<AppState, [], [], PersistedApp>(
    (set, get) => ({
      ...DEFAULT_PERSISTED,
      addItem: (i) => {
        const id = uid()
        set((s) => ({ items: [...s.items, { ...i, id }] }))
        return id
      },
      updateItem: (id, patch) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      addItems: (items) => set((s) => ({ items: [...s.items, ...items.map((i) => ({ ...i, id: uid() }))] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id && i.linkedTo !== id) })),
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setPurpose: (purpose) => set({ purpose }),
      setLanguage: (language) => set({ language }),
      loadSample: () => {
        const at = (days: number, h: number) => setMinutes(setHours(addDays(new Date(), days), h), 0).toISOString()
        const mk = (kind: Kind, subject: string, days: number, h: number, notes = ''): Item => ({
          id: uid(), kind, subject, start: at(days, h), duration: DEFAULT_DURATION[kind], notes,
        })
        // El ejemplo se genera en el idioma vigente; los eventos ya guardados no se modifican.
        set({ items: [...get().items, ...sampleEntries(get().language).map((e) => mk(e.kind, e.subject, e.days, e.hour, e.notes))] })
      },
      clearAll: () => set({ items: [] }),
    }),
    {
      name: PERSIST_NAME,
      version: PERSIST_VERSION,
      storage: appStorage,
      partialize: (s) => ({ items: s.items, mode: s.mode, theme: s.theme, notifications: s.notifications, purpose: s.purpose, language: s.language }),
      migrate: (persisted, version) => migratePersisted(persisted, version),
      merge: (persisted, current) => ({ ...current, ...sanitizePersisted(persisted) }),
    },
  ),
)

/* ───────── Transient UI state ───────── */
export type Filter = { kind: 'all' | 'exam' | 'assignment' | 'subject'; subject?: string }
export type Modal =
  | null
  | { type: 'item'; start?: Date; /** Si existe: cambiar fecha/hora de ese evento (mismo ID, tipo y vínculos) en lugar de crear uno. */ editId?: string }
  | { type: 'theme' }
  | { type: 'settings' }
  | { type: 'startup' }
  | { type: 'planner'; itemId: string }
  | { type: 'statistics' }
  | { type: 'transfer' }
/** Paneles plegables. Es ESTADO DE PRESENTACIÓN: no se persiste y abrirlo/cerrarlo no toca datos, Pomodoro ni audio. */
export type Panel = 'nav' | 'focus'
interface UIState {
  /** Panel plegable abierto (solo tiene efecto visual donde ese panel no está fijo). */
  panel: Panel | null
  view: 'week' | 'day'
  cursor: Date
  filter: Filter
  modal: Modal
  popover: null | { id: string; rect: { left: number; top: number; right: number; bottom: number } }
  picking: null | { itemId: string; duration: number }
  /** Diálogo «cambiar propósito» abierto desde la navegación o Ajustes (el de primer uso es derivado: purpose === null). */
  purposeChange: boolean
  /** true desde que el selector se abre hasta que termina su animación de salida; el resumen de bienvenida espera. */
  purposeVisible: boolean
}
export const useUI = create<UIState>()(() => ({
  panel: null,
  // Vista inicial según el ancho (diaria en móvil). Solo al arrancar: ningún efecto la fuerza después.
  view: initialCalendarView(),
  cursor: new Date(),
  filter: { kind: 'all' },
  modal: null,
  popover: null,
  picking: null,
  purposeChange: false,
  purposeVisible: false,
}))

/* ───────── Pomodoro ───────── */
export type Phase = 'focus' | 'short' | 'long'
export const PHASES: Record<Phase, { label: string; secs: number }> = {
  focus: { label: 'Focus', secs: 25 * 60 },
  short: { label: 'Short break', secs: 5 * 60 },
  long: { label: 'Long break', secs: 15 * 60 },
}
interface PomoState {
  phase: Phase
  remaining: number
  running: boolean
  endAt: number | null // wall-clock end → no drift, survives throttled timers
  sessions: number
  start: () => void
  pause: () => void
  reset: () => void
  setPhase: (p: Phase) => void
  tick: () => void
}
export const usePomodoro = create<PomoState>()((set, get) => ({
  phase: 'focus',
  remaining: PHASES.focus.secs,
  running: false,
  endAt: null,
  sessions: 0,
  start: () => {
    if (get().running) return
    set({ running: true, endAt: Date.now() + get().remaining * 1000 })
  },
  pause: () => {
    const { running, endAt } = get()
    if (!running || !endAt) return
    set({ running: false, endAt: null, remaining: Math.max(1, Math.ceil((endAt - Date.now()) / 1000)) })
  },
  reset: () => set((s) => ({ running: false, endAt: null, remaining: PHASES[s.phase].secs })),
  setPhase: (p) => set({ phase: p, running: false, endAt: null, remaining: PHASES[p].secs }),
  tick: () => {
    const { running, endAt, phase, sessions, remaining } = get()
    if (!running || !endAt) return
    const left = Math.ceil((endAt - Date.now()) / 1000)
    if (left > 0) {
      if (left !== remaining) set({ remaining: left })
      return
    }
    const done = phase === 'focus' ? sessions + 1 : sessions
    const next: Phase = phase === 'focus' ? (done % 4 === 0 ? 'long' : 'short') : 'focus'
    set({ phase: next, running: false, endAt: null, remaining: PHASES[next].secs, sessions: done })
    if (phase === 'focus') useProgress.getState().recordFocus({ id: uid(), endedAt: new Date().toISOString(), minutes: PHASES.focus.secs / 60 })
    if (useApp.getState().notifications) {
      // Idioma vigente EN EL MOMENTO de emitir (no al arrancar el temporizador): cambiarlo no emite ni repite nada.
      const n = timerNotice(useApp.getState().language, phase, next)
      void notify(n.title, n.body)
    }
  },
}))

/* ───────── Audio ───────── */
export const PRESETS = [
  { id: 'lofi', label: 'Lofi Girl', url: 'https://www.youtube.com/watch?v=53gNFOqDFcE' },
  { id: 'white', label: 'White Noise', url: 'https://www.youtube.com/watch?v=yLOM8R6lbzg' },
  { id: 'alpha', label: 'Alpha Waves', url: 'https://www.youtube.com/watch?v=GEgSBuYlSoA' },
] as const
export type AudioStatus = 'idle' | 'loading' | 'ready' | 'error'
interface AudioState {
  preset: string
  url: string
  volume: number
  /** Intención del usuario de que suene (NO se persiste: tras recargar nunca se reproduce solo). */
  playing: boolean
  /** Estado transitorio del reproductor (no se persiste). */
  status: AudioStatus
  problem: AudioProblem | null
  /** Se incrementa en «reintentar» para volver a cargar la misma fuente (transitorio). */
  attempt: number
  preMute: number
  selectPreset: (id: string) => void
  /** Valida la URL (http/https); devuelve false si no es aceptable. */
  setCustom: (url: string) => boolean
  toggle: () => void
  retry: () => void
  setPlaying: (b: boolean) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  setStatus: (s: AudioStatus, problem?: AudioProblem | null) => void
}
const audioDefaults = sanitizeAudio(null, PRESETS)
export const useAudio = create<AudioState>()(
  persist(
    (set) => ({
      ...audioDefaults,
      playing: false,
      status: 'idle',
      problem: null,
      attempt: 0,
      preMute: DEFAULT_VOLUME,
      selectPreset: (id) => {
        const p = PRESETS.find((x) => x.id === id)
        if (p) set({ preset: id, url: p.url, problem: null })
      },
      setCustom: (url) => {
        const p = parseAudioSource(url)
        if (!p.ok) return false
        set({ preset: 'custom', url: p.url, problem: null })
        return true
      },
      toggle: () => set((s) => (s.playing ? { playing: false } : s.status === 'error' ? { playing: true, problem: null, attempt: s.attempt + 1 } : { playing: true, problem: null })),
      retry: () => set((s) => ({ playing: true, problem: null, attempt: s.attempt + 1 })),
      setPlaying: (playing) => set({ playing }),
      setVolume: (v) => set((s) => { const volume = clampVolume(v); return volume > 0 ? { volume, preMute: volume } : { volume, preMute: s.volume > 0 ? s.volume : s.preMute } }),
      toggleMute: () => set((s) => (s.volume === 0 ? { volume: s.preMute || DEFAULT_VOLUME } : { volume: 0, preMute: s.volume })),
      setStatus: (status, problem) => set((s) => {
        const p = status === 'error' ? problem ?? 'source' : problem ?? null
        return s.status === status && s.problem === p ? s : { status, problem: p } // sin cambios no se notifica
      }),
    }),
    {
      name: 'tempora-audio',
      storage: createSafeStorage<{ preset: string; url: string; volume: number }>(),
      // Solo fuente y volumen; playing/status/problem/attempt son transitorios y se reinician al recargar.
      partialize: (s) => ({ preset: s.preset, url: s.url, volume: s.volume }),
      // Cualquier dato recuperado se sanea (valores ausentes o inválidos → fuente y volumen iniciales).
      merge: (persisted, current) => ({ ...current, ...sanitizeAudio(persisted, PRESETS) }),
    },
  ),
)
