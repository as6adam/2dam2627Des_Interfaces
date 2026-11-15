import { parseAudioSource, clampVolume, type AudioProblem } from './audio'

/**
 * Controlador del reproductor, sin React y con dependencias inyectables (se prueba con dobles).
 * Reglas:
 * - La reproducción solo empieza por intención explícita del usuario (`playing` en el store); nunca al cargar.
 * - Cada activación de fuente incrementa `gen`: toda respuesta asíncrona de una carga anterior se descarta.
 * - Solo suena una cosa a la vez (YouTube o audio directo).
 * - No hay reintentos automáticos: tras un fallo se espera una acción del usuario (reintentar o cambiar de fuente).
 */
export type AudioStatus = 'idle' | 'loading' | 'ready' | 'error'
export interface AudioView { url: string; playing: boolean; volume: number; attempt: number }
export interface YTPlayerLike {
  loadVideoById(id: string): void; cueVideoById(id: string): void
  playVideo(): void; pauseVideo(): void; setVolume(v: number): void; destroy(): void
  getVideoData?(): { video_id?: string } | undefined
}
export interface YTEvents { onReady(): void; onStateChange(data: number): void; onError(code: number): void; onAutoplayBlocked(): void }
export interface AudioElementLike {
  src: string; volume: number; loop: boolean
  play(): Promise<void> | void; pause(): void; load(): void; removeAttribute(name: string): void
  addEventListener(type: string, fn: () => void): void; removeEventListener(type: string, fn: () => void): void
}
export interface AudioDeps {
  getState(): AudioView
  setStatus(status: AudioStatus, problem?: AudioProblem | null): void
  setPlaying(playing: boolean): void
  loadYouTubeApi(): Promise<void>
  /** Crea el reproductor en el contenedor visible; devuelve null si no hay contenedor. */
  createYouTubePlayer(videoId: string, volume: number, events: YTEvents): YTPlayerLike | null
  createAudioElement(): AudioElementLike
  /** Tiempo máximo (ms) para considerar bloqueada una carga. */
  loadTimeoutMs?: number
}

/** Códigos de error de YouTube: 101/150 = el propietario no permite incrustarlo; el resto = vídeo no disponible o error del reproductor. */
export const ytErrorProblem = (code: number): AudioProblem => (code === 101 || code === 150 ? 'unavailable' : 'source')

export class AudioController {
  private gen = 0
  private key = ''
  private kind: 'youtube' | 'direct' | 'none' = 'none'
  private yt: YTPlayerLike | null = null
  private ytReady = false
  private ytWanted: string | null = null // vídeo que debe tener el reproductor (el último pedido)
  private ytInitial: string | null = null
  private audio: AudioElementLike | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private disposed = false
  private lastVolume = -1
  private busy = false
  private loadingGen = -1 // generación para la que ya se pidió la API de YouTube (evita pedirla de nuevo en cada sync)
  private again = false

  constructor(private d: AudioDeps) {}

  /** Reconcilia el reproductor con el estado actual del store. Idempotente. */
  sync() {
    if (this.disposed) return
    if (this.busy) { this.again = true; return } // los cambios que provoca el propio controlador en el store no se reentran
    this.busy = true
    try {
      // Tope de seguridad: un fallo de lógica nunca debe bloquear el hilo principal.
      for (let i = 0; i < 10 && (i === 0 || this.again) && !this.disposed; i++) {
        this.again = false
        const s = this.d.getState()
        const key = `${s.url}#${s.attempt}`
        if (key !== this.key) { this.key = key; this.activate(s) } else this.applyPlaying(s.playing)
        this.applyVolume(s.volume)
      }
    } finally { this.busy = false }
  }

  dispose() {
    this.disposed = true
    this.gen++
    this.clearTimer()
    try { this.yt?.destroy() } catch { /* ya destruido */ }
    this.yt = null; this.ytReady = false
    if (this.audio) { this.audio.pause(); this.unbindAudio(this.audio) }
    this.audio = null
  }

  /* ───────── activación de fuente ───────── */
  private activate(s: AudioView) {
    const gen = ++this.gen
    this.clearTimer()
    const src = parseAudioSource(s.url)
    if (!src.ok) { this.kind = 'none'; this.pauseYT(); this.silenceAudio(); return this.fail('source') }
    if (src.kind === 'direct') {
      this.kind = 'direct'
      this.pauseYT()
      const a = this.ensureAudio()
      a.pause(); a.src = src.url; a.load()
      this.d.setStatus('loading', null)
      this.startTimer(gen, 'source')
      if (s.playing) this.playDirect(gen)
      return
    }
    // YouTube
    this.kind = 'youtube'
    this.silenceAudio()
    this.ytWanted = src.id
    if (this.yt && this.ytReady) { // reproductor ya listo: se cambia de vídeo
      s.playing ? this.yt.loadVideoById(src.id) : this.yt.cueVideoById(src.id)
      this.d.setStatus('ready', null)
    } else if (this.yt) { // creándose: onReady cargará el último vídeo pedido
      this.d.setStatus('loading', null); this.startTimer(gen, 'network')
    } else if (s.playing) this.createYT(gen)
    else this.d.setStatus('idle', null) // sin contactar con YouTube hasta que el usuario pulse reproducir
  }

  private createYT(gen: number) {
    if (this.loadingGen === gen) return
    this.loadingGen = gen
    this.d.setStatus('loading', null)
    this.startTimer(gen, 'network')
    this.d.loadYouTubeApi().then(() => {
      if (gen !== this.gen || this.disposed || this.kind !== 'youtube' || this.yt) return // respuesta antigua
      const id = this.ytWanted!
      const ref: { p: YTPlayerLike | null } = { p: null } // los eventos llegan después de la creación
      const player = this.d.createYouTubePlayer(id, this.d.getState().volume, {
        onReady: () => ref.p && this.onYTReady(ref.p),
        onStateChange: (data) => ref.p && this.onYTState(ref.p, data),
        onError: (code) => { const p = ref.p; if (p && this.yt === p && this.matches(p)) this.fail(ytErrorProblem(code)) },
        onAutoplayBlocked: () => { if (ref.p && this.yt === ref.p) this.fail('blocked') },
      })
      if (!player) return this.fail('unavailable')
      ref.p = player; this.yt = player; this.ytReady = false; this.ytInitial = id
    }).catch(() => { if (gen === this.gen && !this.disposed) this.fail('network') })
  }

  private onYTReady(player: YTPlayerLike) {
    if (this.disposed || this.yt !== player) return
    this.ytReady = true
    player.setVolume(clampVolume(this.d.getState().volume))
    if (this.kind !== 'youtube') return // mientras tanto se eligió audio directo: no suena YouTube
    this.clearTimer()
    const wantPlay = this.d.getState().playing
    if (this.ytWanted && this.ytWanted !== this.ytInitial) { wantPlay ? player.loadVideoById(this.ytWanted) : player.cueVideoById(this.ytWanted); this.ytInitial = this.ytWanted }
    this.d.setStatus('ready', null)
    if (wantPlay) player.playVideo()
  }

  private onYTState(player: YTPlayerLike, data: number) {
    if (this.disposed || this.yt !== player || this.kind !== 'youtube') return
    if (data === 1) this.d.setStatus('ready', null) // reproduciendo
    if (data === 0 && this.d.getState().playing) player.playVideo() // bucle
  }

  /** ¿El evento de error corresponde al vídeo vigente? (descarta errores de un vídeo anterior). */
  private matches(player: YTPlayerLike) {
    const cur = player.getVideoData?.()?.video_id
    return !cur || !this.ytWanted || cur === this.ytWanted
  }

  /* ───────── reproducción / pausa ───────── */
  private applyPlaying(playing: boolean) {
    if (this.kind === 'youtube') {
      if (this.yt && this.ytReady) playing ? this.yt.playVideo() : this.yt.pauseVideo()
      else if (playing && !this.yt) this.createYT(this.gen) // primera reproducción: ahora sí se carga YouTube
    } else if (this.kind === 'direct' && this.audio) {
      playing ? this.playDirect(this.gen) : this.audio.pause()
    }
  }

  private playDirect(gen: number) {
    const a = this.audio
    if (!a) return
    let p: Promise<void> | void
    try { p = a.play() } catch { return this.fail('source') }
    Promise.resolve(p).then(() => {
      if (gen !== this.gen || this.disposed) return
      this.clearTimer(); this.d.setStatus('ready', null)
    }, (err: unknown) => {
      if (gen !== this.gen || this.disposed) return
      const name = (err as { name?: string } | null)?.name
      if (name === 'AbortError') return // interrumpida por una carga posterior; no es un error
      this.fail(name === 'NotAllowedError' ? 'blocked' : 'source')
    })
  }

  private applyVolume(v: number) {
    const vol = clampVolume(v)
    if (vol === this.lastVolume) return
    this.lastVolume = vol
    if (this.yt && this.ytReady) this.yt.setVolume(vol)
    if (this.audio) this.audio.volume = vol / 100
  }

  /* ───────── utilidades ───────── */
  private fail(problem: AudioProblem) {
    this.clearTimer()
    this.d.setPlaying(false) // primero la intención: así el sync que provoca el cambio de estado no vuelve a intentar reproducir
    this.d.setStatus('error', problem)
    if (this.kind === 'direct') this.audio?.pause()
    if (this.kind === 'youtube' && this.ytReady) this.yt?.pauseVideo()
  }

  private pauseYT() { if (this.yt && this.ytReady) this.yt.pauseVideo() }

  private silenceAudio() {
    const a = this.audio
    if (!a) return
    a.pause(); a.removeAttribute('src'); a.load() // quitar el atributo NO detiene un audio en curso: hay que pausar y recargar
  }

  private ensureAudio() {
    if (this.audio) return this.audio
    const a = this.d.createAudioElement()
    a.loop = true
    a.addEventListener('canplay', this.onCanPlay); a.addEventListener('error', this.onAudioError)
    return (this.audio = a)
  }
  private unbindAudio(a: AudioElementLike) { a.removeEventListener('canplay', this.onCanPlay); a.removeEventListener('error', this.onAudioError) }
  private onCanPlay = () => { if (this.kind === 'direct' && !this.disposed) { this.clearTimer(); this.d.setStatus('ready', null) } }
  private onAudioError = () => { if (this.kind === 'direct' && !this.disposed) this.fail('source') }

  private startTimer(gen: number, problem: AudioProblem) {
    this.clearTimer()
    this.timer = setTimeout(() => { if (gen === this.gen && !this.disposed) this.fail(problem) }, this.d.loadTimeoutMs ?? 15_000)
  }
  private clearTimer() { if (this.timer) clearTimeout(this.timer); this.timer = null }
}
