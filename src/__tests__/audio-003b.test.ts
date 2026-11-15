import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryStorage, boot, legacyV0 } from './helpers'
import { clampVolume, parseAudioSource, sanitizeAudio } from '../lib/audio'
import { AudioController, ytErrorProblem, type AudioDeps, type AudioElementLike, type AudioView, type YTEvents, type YTPlayerLike } from '../lib/audioController'
import { UNREADABLE_SUFFIX, createSafeStorage } from '../lib/storage'
import { reportStorageWrite, useStorageHealth } from '../lib/storageHealth'
import { COMMON } from '../lib/i18n'
import { LANGUAGES } from '../lib/preferences'
import hooksSource from '../lib/hooks.ts?raw'
import engineSource from '../components/AudioEngine.tsx?raw'
import panelSource from '../components/RightPanel.tsx?raw'

const PRESETS = [
  { id: 'lofi', url: 'https://www.youtube.com/watch?v=53gNFOqDFcE' },
  { id: 'white', url: 'https://www.youtube.com/watch?v=yLOM8R6lbzg' },
  { id: 'alpha', url: 'https://www.youtube.com/watch?v=GEgSBuYlSoA' },
]

describe('validación de URLs (pura)', () => {
  it('reconoce YouTube en sus formas habituales', () => {
    const id = '53gNFOqDFcE'
    for (const u of [`https://www.youtube.com/watch?v=${id}`, `https://youtu.be/${id}`, `https://www.youtube.com/embed/${id}`, `https://www.youtube.com/live/${id}`, `https://youtube.com/shorts/${id}`, `https://m.youtube.com/watch?v=${id}&t=3`, `https://music.youtube.com/watch?v=${id}`, `youtube.com/watch?v=${id}`]) {
      const p = parseAudioSource(u)
      expect(p, u).toMatchObject({ ok: true, kind: 'youtube', id })
    }
  })
  it('los presets existentes siguen siendo válidos y no cambian', () => {
    for (const p of PRESETS) expect(parseAudioSource(p.url)).toMatchObject({ ok: true, kind: 'youtube' })
    expect(PRESETS.map((p) => p.url)).toEqual(['https://www.youtube.com/watch?v=53gNFOqDFcE', 'https://www.youtube.com/watch?v=yLOM8R6lbzg', 'https://www.youtube.com/watch?v=GEgSBuYlSoA'])
  })
  it('audio directo http(s)', () => {
    expect(parseAudioSource('https://example.com/stream.mp3')).toMatchObject({ ok: true, kind: 'direct' })
    expect(parseAudioSource('  http://radio.example.org:8000/live  ')).toMatchObject({ ok: true, kind: 'direct', url: 'http://radio.example.org:8000/live' })
  })
  it('rechaza protocolos ejecutables o no compatibles', () => {
    for (const u of ['javascript:alert(1)', 'data:audio/mp3;base64,AAAA', 'file:///etc/passwd', 'blob:https://x/abc', 'ftp://x.com/a.mp3', 'vbscript:x', 'about:blank'])
      expect(parseAudioSource(u), u).toEqual({ ok: false, reason: 'protocol' })
  })
  it('vacío, basura y enlaces de YouTube sin vídeo', () => {
    expect(parseAudioSource('')).toEqual({ ok: false, reason: 'empty' }); expect(parseAudioSource('   ')).toEqual({ ok: false, reason: 'empty' })
    expect(parseAudioSource('hola mundo')).toEqual({ ok: false, reason: 'invalid' })
    expect(parseAudioSource('https://www.youtube.com/playlist?list=PL123')).toEqual({ ok: false, reason: 'unsupported' })
    expect(parseAudioSource('https://youtu.be/')).toEqual({ ok: false, reason: 'unsupported' })
  })
  it('un dominio que solo CONTIENE youtube.com no se trata como YouTube', () => {
    expect(parseAudioSource('https://youtube.com.evil.example/watch?v=53gNFOqDFcE')).toMatchObject({ ok: true, kind: 'direct' })
  })
})

describe('saneado de fuente y volumen persistidos', () => {
  it('valores ausentes o basura → fuente y volumen iniciales', () => {
    for (const raw of [undefined, null, 'x', 7, [], {}, { preset: 5, url: {}, volume: 'a' }])
      expect(sanitizeAudio(raw, PRESETS), JSON.stringify(raw)).toEqual({ preset: 'lofi', url: PRESETS[0].url, volume: 60 })
  })
  it('volumen: se acota a 0–100, se redondea y NaN/Infinity vuelven al valor por defecto', () => {
    expect([-5, 150, 55.6, NaN, Infinity, '40' as never].map(clampVolume)).toEqual([0, 100, 56, 60, 60, 60])
  })
  it('un preset conocido recupera su URL oficial aunque la guardada esté alterada', () => {
    expect(sanitizeAudio({ preset: 'white', url: 'javascript:alert(1)', volume: 20 }, PRESETS)).toEqual({ preset: 'white', url: PRESETS[1].url, volume: 20 })
  })
  it('una fuente personalizada válida se conserva; una inválida cae al preset inicial manteniendo el volumen', () => {
    expect(sanitizeAudio({ preset: 'custom', url: 'https://example.com/a.mp3', volume: 33 }, PRESETS)).toEqual({ preset: 'custom', url: 'https://example.com/a.mp3', volume: 33 })
    expect(sanitizeAudio({ preset: 'custom', url: 'javascript:alert(1)', volume: 33 }, PRESETS)).toEqual({ preset: 'lofi', url: PRESETS[0].url, volume: 33 })
  })
})

describe('persistencia real (store + localStorage simulado)', () => {
  it('fuente y volumen se recuperan tras recargar; lo transitorio se reinicia y no se reproduce solo', async () => {
    const storage = new MemoryStorage()
    const a = await boot(storage)
    a.useAudio.getState().selectPreset('white'); a.useAudio.getState().setVolume(33)
    a.useAudio.getState().setPlaying(true); a.useAudio.getState().setStatus('ready')
    const saved = JSON.parse(storage.getItem('tempora-audio')!)
    expect(Object.keys(saved.state).sort()).toEqual(['preset', 'url', 'volume']) // sin playing/status/problem/attempt
    const b = await boot(storage)
    expect(b.useAudio.getState()).toMatchObject({ preset: 'white', url: PRESETS[1].url, volume: 33, playing: false, status: 'idle', problem: null, attempt: 0 })
  })
  it('fuente personalizada válida persiste; la inválida se rechaza sin cambiar nada', async () => {
    const storage = new MemoryStorage()
    const a = await boot(storage)
    expect(a.useAudio.getState().setCustom('javascript:alert(1)')).toBe(false)
    expect(a.useAudio.getState().preset).toBe('lofi')
    expect(a.useAudio.getState().setCustom('https://example.com/lofi.mp3')).toBe(true)
    const b = await boot(storage)
    expect(b.useAudio.getState()).toMatchObject({ preset: 'custom', url: 'https://example.com/lofi.mp3', playing: false })
  })
  it('datos de audio inválidos o incompletos → valores iniciales, sin excepción', async () => {
    for (const raw of ['{"state":{"volume":"abc","url":5,"preset":false},"version":0}', '{"state":null,"version":0}', '[]', '{"state":{"preset":"custom","url":"javascript:1","volume":999},"version":0}']) {
      const storage = new MemoryStorage(); storage.setItem('tempora-audio', raw)
      const { useAudio } = await boot(storage)
      const s = useAudio.getState()
      expect(['lofi', 'custom']).toContain(s.preset)
      expect(parseAudioSource(s.url).ok).toBe(true); expect(s.volume).toBeGreaterThanOrEqual(0); expect(s.volume).toBeLessThanOrEqual(100)
      expect(s.playing).toBe(false)
    }
  })
  it('JSON ilegible: arranca con valores iniciales y CONSERVA el original en <clave>.unreadable', async () => {
    const storage = new MemoryStorage(); storage.setItem('tempora-audio', '{"state":{"volume":4'); storage.setItem('tempora-v1', '{{ no es json')
    const { useAudio, useApp } = await boot(storage)
    expect(useAudio.getState().volume).toBe(60); expect(useApp.getState().items).toEqual([])
    useApp.getState().setMode('dark'); useAudio.getState().setVolume(10) // escribir no pierde la copia
    expect(storage.getItem('tempora-audio' + UNREADABLE_SUFFIX)).toBe('{"state":{"volume":4')
    expect(storage.getItem('tempora-v1' + UNREADABLE_SUFFIX)).toBe('{{ no es json')
  })
  it('no sobrescribe una copia ilegible anterior', () => {
    const storage = new MemoryStorage(); vi.stubGlobal('localStorage', storage)
    const s = createSafeStorage<unknown>()
    storage.setItem('k', 'primero{'); s.getItem('k'); storage.setItem('k', 'segundo{'); s.getItem('k')
    expect(storage.getItem('k' + UNREADABLE_SUFFIX)).toBe('primero{'); vi.unstubAllGlobals()
  })
  it('conserva eventos, linkedTo y preferencias existentes al cambiar el audio', async () => {
    const storage = new MemoryStorage()
    const v1 = { state: { ...legacyV0.state, purpose: 'productivity', language: 'en', mode: 'dark', theme: 'ruby', notifications: false }, version: 1 }
    storage.setItem('tempora-v1', JSON.stringify(v1))
    const { useApp, useAudio } = await boot(storage)
    useAudio.getState().selectPreset('alpha'); useAudio.getState().setVolume(5); useAudio.getState().toggle(); useAudio.getState().toggleMute()
    const s = useApp.getState()
    expect(s).toMatchObject({ purpose: 'productivity', language: 'en', mode: 'dark', theme: 'ruby', notifications: false })
    expect(s.items).toEqual(v1.state.items)
    expect(s.items.some((i) => i.linkedTo)).toBe(true)
  })
})

describe('fallos de almacenamiento', () => {
  beforeEach(() => useStorageHealth.setState({ failing: false }))
  afterEach(() => vi.unstubAllGlobals())
  const failing = (over: Partial<Record<'getItem' | 'setItem', () => never>>) => ({ getItem: () => null, setItem: () => null, removeItem: () => null, ...over })
  it('escritura sin espacio: la app sigue funcionando en memoria y se marca el fallo', async () => {
    const storage = Object.assign(new MemoryStorage(), { setItem: () => { throw new DOMException('quota', 'QuotaExceededError') } })
    const { useApp, useAudio } = await boot(storage as never)
    const { useStorageHealth: health } = await import('../lib/storageHealth') // misma instancia que usa el store tras boot()
    expect(() => { useApp.getState().setMode('dark'); useAudio.getState().setVolume(12); useApp.getState().addItem({ kind: 'exam', subject: 'X', start: '2026-12-01T09:00:00.000Z', duration: 60, notes: '' }) }).not.toThrow()
    expect(useApp.getState().mode).toBe('dark'); expect(useApp.getState().items).toHaveLength(1); expect(useAudio.getState().volume).toBe(12)
    expect(health.getState().failing).toBe(true)
  })
  it('almacenamiento no disponible al leer (SecurityError): arranca con valores iniciales', async () => {
    const throwing = () => { throw new DOMException('denied', 'SecurityError') }
    const { useApp, useAudio } = await boot(failing({ getItem: throwing, setItem: throwing }) as never)
    expect(useApp.getState().purpose).toBeNull(); expect(useAudio.getState().volume).toBe(60)
    expect(() => useApp.getState().setTheme('ruby')).not.toThrow()
  })
  it('el aviso discreto sale UNA vez por fallo, en el idioma vigente, y nunca dice «guardado»', async () => {
    const storage = Object.assign(new MemoryStorage(), { setItem: () => { throw new Error('quota') } })
    const { useApp } = await boot(storage as never)
    const { watchStorageHealth } = await import('../lib/hooks'); const { useToasts } = await import('../lib/toasts')
    useToasts.setState({ toasts: [] })
    const stop = watchStorageHealth()
    useApp.getState().setLanguage('en')
    useApp.getState().setMode('dark'); useApp.getState().setMode('light'); useApp.getState().setTheme('ruby') // varias escrituras fallidas
    const toasts = useToasts.getState().toasts
    expect(toasts).toHaveLength(1); expect(toasts[0].body).toBe(COMMON.en.storage.writeFailed)
    expect(toasts[0].body).not.toMatch(/\b(has|have|been) saved\b|se han guardado|guardado/i)
    stop()
  })
  it('si el fallo ocurrió ANTES de montar la app (hidratación), también se avisa, una sola vez aunque el efecto se ejecute dos veces', async () => {
    const storage = Object.assign(new MemoryStorage(), { setItem: () => { throw new Error('quota') } })
    const { useApp } = await boot(storage as never)
    useApp.getState().setMode('dark') // el fallo ya se produjo
    const { watchStorageHealth } = await import('../lib/hooks'); const { useToasts } = await import('../lib/toasts'); useToasts.setState({ toasts: [] })
    watchStorageHealth()(); watchStorageHealth() // StrictMode: montar → limpiar → montar
    expect(useToasts.getState().toasts).toHaveLength(1)
  })
  it('tras recuperarse la escritura el estado vuelve a «ok» y un nuevo fallo avisaría otra vez', () => {
    reportStorageWrite(false); expect(useStorageHealth.getState().failing).toBe(true)
    reportStorageWrite(true); expect(useStorageHealth.getState().failing).toBe(false)
  })
  it('el aviso existe en ambos idiomas', () => { for (const l of LANGUAGES) expect(COMMON[l].storage.writeFailed.length).toBeGreaterThan(20) })
})

/* ───────── Controlador del reproductor con dobles ───────── */
class FakeAudio implements AudioElementLike {
  src = ''; volume = 1; loop = false; playing = false
  listeners = new Map<string, Set<() => void>>(); removed = 0
  playImpl: () => Promise<void> = () => Promise.resolve()
  play() { this.playing = true; return this.playImpl().catch((e) => { this.playing = false; throw e }) }
  pause() { this.playing = false }
  load() {}
  removeAttribute(n: string) { if (n === 'src') this.src = '' }
  addEventListener(t: string, f: () => void) { (this.listeners.get(t) ?? this.listeners.set(t, new Set()).get(t)!).add(f) }
  removeEventListener(t: string, f: () => void) { this.listeners.get(t)?.delete(f); this.removed++ }
  emit(t: string) { this.listeners.get(t)?.forEach((f) => f()) }
}
class FakeYT implements YTPlayerLike {
  video: string; playing = false; destroyed = false; volume = -1; loads: string[] = []; cues: string[] = []
  constructor(id: string, public events: YTEvents) { this.video = id }
  loadVideoById(id: string) { this.video = id; this.loads.push(id); this.playing = true }
  cueVideoById(id: string) { this.video = id; this.cues.push(id) }
  playVideo() { this.playing = true } pauseVideo() { this.playing = false }
  setVolume(v: number) { this.volume = v } destroy() { this.destroyed = true }
  getVideoData() { return { video_id: this.video } }
}

function harness(initial: Partial<AudioView> = {}) {
  const state: AudioView = { url: PRESETS[0].url, playing: false, volume: 60, attempt: 0, ...initial }
  const log: Array<[string, string | null | undefined]> = []
  let controller!: AudioController
  const audio = new FakeAudio(); const players: FakeYT[] = []
  const api: { resolve: () => void; reject: () => void }[] = []
  const deps: AudioDeps = {
    getState: () => ({ ...state }),
    setStatus: (s, p) => { // como el store real: solo notifica si algo cambia, y cada cambio vuelve a llamar a sync()
      const prev = log[log.length - 1]
      if (prev && prev[0] === s && (prev[1] ?? null) === (p ?? null)) return
      log.push([s, p ?? null]); controller.sync()
    },
    setPlaying: (p) => { state.playing = p; controller.sync() },
    loadYouTubeApi: () => new Promise<void>((resolve, reject) => api.push({ resolve, reject })),
    createAudioElement: () => audio,
    createYouTubePlayer: (id, _v, ev) => { const p = new FakeYT(id, ev); players.push(p); return p },
    loadTimeoutMs: 1000,
  }
  controller = new AudioController(deps)
  const set = (p: Partial<AudioView>) => { Object.assign(state, p); controller.sync() }
  return { controller, state, set, log, audio, players, api, last: () => log[log.length - 1] }
}
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('controlador: nada suena solo', () => {
  it('al iniciar con una fuente de YouTube no contacta con YouTube ni reproduce', () => {
    const h = harness(); h.controller.sync()
    expect(h.api).toHaveLength(0); expect(h.players).toHaveLength(0); expect(h.last()).toEqual(['idle', null])
  })
  it('al iniciar con audio directo carga pero no reproduce', () => {
    const h = harness({ url: 'https://example.com/a.mp3' }); h.controller.sync()
    expect(h.audio.src).toBe('https://example.com/a.mp3'); expect(h.audio.playing).toBe(false)
  })
})

describe('controlador: YouTube', () => {
  it('regresión: reproducir no entra en bucle de sincronización (la API se pide una sola vez, pocos cambios de estado)', () => {
    const h = harness({ playing: true }); h.controller.sync(); h.controller.sync(); h.controller.sync()
    expect(h.api).toHaveLength(1); expect(h.log.length).toBeLessThan(4)
  })
  it('reproducir crea el reproductor tras cargar la API, una sola vez', async () => {
    const h = harness(); h.controller.sync(); h.set({ playing: true })
    h.set({ playing: true }); h.controller.sync()
    expect(h.api.length).toBeGreaterThanOrEqual(1)
    h.api.forEach((a) => a.resolve()); await flush()
    expect(h.players).toHaveLength(1)
    h.players[0].events.onReady(); expect(h.players[0].playing).toBe(true); expect(h.last()).toEqual(['ready', null])
  })
  it('cambios rápidos de fuente mientras carga: se usa la ÚLTIMA y no se crean reproductores de más', async () => {
    const h = harness({ playing: true }); h.controller.sync()
    h.set({ url: PRESETS[1].url }); h.set({ url: PRESETS[2].url })
    h.api.forEach((a) => a.resolve()); await flush()
    expect(h.players).toHaveLength(1); expect(h.players[0].video).toBe('GEgSBuYlSoA')
  })
  it('cambio de fuente mientras el reproductor aún no está listo: onReady carga la última (no se pierde el cambio)', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api.forEach((a) => a.resolve()); await flush()
    h.set({ url: PRESETS[1].url }) // el reproductor existe pero no está listo
    h.players[0].events.onReady()
    expect(h.players[0].loads).toEqual(['yLOM8R6lbzg'])
  })
  it('una carga de API antigua no crea un reproductor si ya se eligió audio directo', async () => {
    const h = harness({ playing: true }); h.controller.sync()
    h.set({ url: 'https://example.com/a.mp3' })
    h.api.forEach((a) => a.resolve()); await flush()
    expect(h.players).toHaveLength(0); expect(h.audio.playing).toBe(true)
  })
  it('error 101/150 → «unavailable»; otros códigos → «source»; un error de un vídeo anterior se ignora', async () => {
    expect([101, 150, 100, 2, 5].map(ytErrorProblem)).toEqual(['unavailable', 'unavailable', 'source', 'source', 'source'])
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].resolve(); await flush(); h.players[0].events.onReady()
    h.set({ url: PRESETS[1].url }); h.players[0].video = 'antiguo-id-1' // el error llega de otro vídeo
    h.players[0].events.onError(100); expect(h.last()?.[0]).not.toBe('error')
    h.players[0].video = 'yLOM8R6lbzg'; h.players[0].events.onError(150); expect(h.last()).toEqual(['error', 'unavailable']); expect(h.state.playing).toBe(false)
  })
  it('autoplay bloqueado → «blocked» (distinto de un error de fuente) y se puede reintentar', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].resolve(); await flush(); h.players[0].events.onReady(); h.players[0].events.onAutoplayBlocked()
    expect(h.last()).toEqual(['error', 'blocked']); expect(h.state.playing).toBe(false)
    h.set({ attempt: 1, playing: true }) // «Reintentar»
    expect(h.players[0].playing).toBe(true)
  })
  it('fallo al cargar la API → «network»; reintentar vuelve a pedir la carga', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].reject(); await flush()
    expect(h.last()).toEqual(['error', 'network'])
    const before = h.api.length; h.set({ attempt: 1, playing: true }); expect(h.api.length).toBeGreaterThan(before)
  })
  it('espera excesiva sin respuesta → «network» (sin bucles de reintento)', async () => {
    vi.useFakeTimers(); const h = harness({ playing: true }); h.controller.sync()
    vi.advanceTimersByTime(1001); expect(h.last()).toEqual(['error', 'network'])
    const n = h.api.length; vi.advanceTimersByTime(60_000); expect(h.api.length).toBe(n); vi.useRealTimers()
  })
  it('pausa, reanudación y volumen', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].resolve(); await flush(); h.players[0].events.onReady()
    h.set({ playing: false }); expect(h.players[0].playing).toBe(false)
    h.set({ playing: true }); expect(h.players[0].playing).toBe(true)
    h.set({ volume: 25 }); expect(h.players[0].volume).toBe(25)
    h.set({ volume: 400 }); expect(h.players[0].volume).toBe(100)
  })
})

describe('controlador: audio directo y exclusión mutua', () => {
  it('play() rechazado con NotAllowedError → «blocked»; reintentar funciona', async () => {
    const h = harness({ url: 'https://example.com/a.mp3' }); h.controller.sync()
    h.audio.playImpl = () => Promise.reject(Object.assign(new Error('x'), { name: 'NotAllowedError' }))
    h.set({ playing: true }); await flush()
    expect(h.last()).toEqual(['error', 'blocked']); expect(h.state.playing).toBe(false)
    h.audio.playImpl = () => Promise.resolve(); h.set({ attempt: 1, playing: true }); await flush()
    expect(h.audio.playing).toBe(true); expect(h.last()).toEqual(['ready', null])
  })
  it('error de fuente (evento error del elemento o NotSupportedError) → «source»', async () => {
    const h = harness({ url: 'https://example.com/a.mp3' }); h.controller.sync(); h.audio.emit('error')
    expect(h.last()).toEqual(['error', 'source'])
    const h2 = harness({ url: 'https://example.com/b.mp3', playing: true }); h2.audio.playImpl = () => Promise.reject(Object.assign(new Error('x'), { name: 'NotSupportedError' }))
    h2.controller.sync(); await flush(); expect(h2.last()).toEqual(['error', 'source'])
  })
  it('AbortError (carga interrumpida por otra fuente) NO es un error', async () => {
    const h = harness({ url: 'https://example.com/a.mp3', playing: true }); h.audio.playImpl = () => Promise.reject(Object.assign(new Error('x'), { name: 'AbortError' }))
    h.controller.sync(); await flush(); expect(h.log.some(([s]) => s === 'error')).toBe(false)
  })
  it('de directo a YouTube y viceversa: nunca suenan a la vez', async () => {
    const h = harness({ url: 'https://example.com/a.mp3', playing: true }); h.controller.sync(); await flush()
    expect(h.audio.playing).toBe(true)
    h.set({ url: PRESETS[0].url }); expect(h.audio.playing).toBe(false); expect(h.audio.src).toBe('') // se detiene y se vacía
    h.api.forEach((a) => a.resolve()); await flush(); h.players[0].events.onReady(); expect(h.players[0].playing).toBe(true); expect(h.audio.playing).toBe(false)
    h.set({ url: 'https://example.com/b.mp3' }); expect(h.players[0].playing).toBe(false); expect(h.audio.playing).toBe(true)
  })
  it('un onReady tardío no hace sonar YouTube si ya se cambió a audio directo', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].resolve(); await flush()
    h.set({ url: 'https://example.com/a.mp3' }); h.players[0].events.onReady()
    expect(h.players[0].playing).toBe(false)
  })
  it('el volumen se acota y se aplica al elemento', () => {
    const h = harness({ url: 'https://example.com/a.mp3', volume: 150 }); h.controller.sync(); expect(h.audio.volume).toBe(1)
    h.set({ volume: 30 }); expect(h.audio.volume).toBeCloseTo(0.3)
  })
})

describe('controlador: limpieza (StrictMode: montar → limpiar → montar)', () => {
  it('dispose destruye el reproductor, quita listeners, pausa y descarta respuestas pendientes', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.api[0].resolve(); await flush(); h.players[0].events.onReady()
    h.controller.dispose()
    expect(h.players[0].destroyed).toBe(true)
    const h2 = harness({ playing: true }); h2.controller.sync(); h2.controller.dispose(); h2.api[0].resolve(); await flush()
    expect(h2.players).toHaveLength(0) // la carga pendiente se descartó
    const h3 = harness({ url: 'https://example.com/a.mp3', playing: true }); h3.controller.sync(); h3.controller.dispose()
    expect(h3.audio.removed).toBe(2); expect(h3.audio.playing).toBe(false)
  })
  it('un controlador nuevo tras dispose empieza limpio y no duplica reproductores', async () => {
    const h = harness({ playing: true }); h.controller.sync(); h.controller.dispose()
    const h2 = harness({ playing: true }); h2.controller.sync(); h2.api[0].resolve(); await flush(); expect(h2.players).toHaveLength(1)
  })
  it('sync tras dispose no hace nada', () => { const h = harness({ playing: true }); h.controller.dispose(); h.controller.sync(); expect(h.api).toHaveLength(0) })
})

describe('Pomodoro y audio son independientes', () => {
  it('cambiar de fuente, volumen o idioma no toca endAt ni la duración; tras una pausa larga se reconcilia una sola vez', async () => {
    const storage = new MemoryStorage()
    vi.resetModules(); vi.doMock('../lib/notify', () => ({ notify: vi.fn().mockResolvedValue('system') }))
    const { useApp, useAudio, usePomodoro } = await boot(storage)
    useApp.setState({ notifications: true })
    usePomodoro.getState().start(); const before = { ...usePomodoro.getState() }
    useAudio.getState().selectPreset('alpha'); useAudio.getState().setVolume(5); useAudio.getState().toggleMute(); useApp.getState().setLanguage('en'); useApp.getState().setPurpose('productivity')
    expect(usePomodoro.getState()).toMatchObject({ endAt: before.endAt, remaining: before.remaining, phase: 'focus', running: true })
    // pestaña inactiva: sin ticks durante mucho tiempo; al volver, UN tick reconcilia con la marca temporal
    usePomodoro.setState({ endAt: Date.now() - 20 * 60_000 }); usePomodoro.getState().tick()
    expect(usePomodoro.getState()).toMatchObject({ running: false, phase: 'short', sessions: 1 })
    usePomodoro.getState().tick(); expect(usePomodoro.getState().sessions).toBe(1)
    vi.doUnmock('../lib/notify')
  })
})

describe('guardas estáticas', () => {
  it('el ticker se reconcilia al volver a la pestaña (visibilitychange/focus)', () => {
    expect(hooksSource).toMatch(/visibilitychange/); expect(hooksSource).toMatch(/addEventListener\('focus'/)
  })
  it('AudioEngine no depende de idioma/propósito/tema y el efecto se limpia con dispose', () => {
    expect(engineSource).toMatch(/\}, \[\]\)/); expect(engineSource).toMatch(/controller\.dispose\(\)/)
    expect(engineSource).not.toMatch(/useApp\(\(s\) => s\.(language|purpose|theme)/)
  })
  it('no hay reproducción automática: el panel no llama a play ni a setPlaying(true) al montar', () => {
    expect(panelSource).not.toMatch(/useEffect/); expect(panelSource).not.toMatch(/setPlaying\(true\)/)
  })
  it('los textos de problemas y errores de URL existen en ambos idiomas', () => {
    for (const l of LANGUAGES) {
      expect(Object.keys(COMMON[l].audio.problems).sort()).toEqual(['blocked', 'network', 'source', 'unavailable'])
      expect(Object.keys(COMMON[l].audio.urlErrors).sort()).toEqual(['empty', 'invalid', 'protocol', 'unsupported'])
    }
  })
})
