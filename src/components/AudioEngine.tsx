import { useEffect } from 'react'
import { useAudio } from '../store'
import { AudioController } from '../lib/audioController'
import { loadYouTubeApi } from '../lib/ytApi'
import { useAudioSlot } from '../lib/audioSlot'
import { getCommon } from '../lib/i18n'
import { useApp } from '../store'

/** Re-exportado por compatibilidad; la lógica de URLs vive en `lib/audio.ts`. */
export { youtubeId } from '../lib/audio'

/**
 * Monta UNA vez el controlador del reproductor (no depende de idioma, propósito, tema ni distribución, así que esos cambios no lo reinician).
 * Bajo StrictMode el efecto se ejecuta, se limpia y se vuelve a ejecutar: `dispose()` destruye el reproductor y descarta cargas pendientes.
 */
export function AudioEngine() {
  useEffect(() => {
    const controller = new AudioController({
      getState: () => { const s = useAudio.getState(); return { url: s.url, playing: s.playing, volume: s.volume, attempt: s.attempt } },
      setStatus: (status, problem) => useAudio.getState().setStatus(status, problem),
      setPlaying: (p) => useAudio.getState().setPlaying(p),
      loadYouTubeApi,
      createAudioElement: () => new Audio(),
      createYouTubePlayer: (videoId, volume, events) => {
        const slot = useAudioSlot.getState().el
        if (!slot || !window.YT?.Player) return null
        const el = document.createElement('div')
        slot.appendChild(el)
        const playerVars: Record<string, unknown> = { controls: 0, playsinline: 1, rel: 0, disablekb: 1 }
        if (/^https?:$/.test(location.protocol)) playerVars.origin = location.origin
        const player = new window.YT.Player(el, {
          width: '100%', height: '200', videoId, playerVars,
          events: { onReady: () => events.onReady(), onStateChange: (e: { data: number }) => events.onStateChange(e.data), onError: (e: { data: number }) => events.onError(e.data), onAutoplayBlocked: () => events.onAutoplayBlocked() },
        })
        try { player.setVolume?.(volume) } catch { /* aún no está listo: se aplica en onReady */ }
        try { const f = player.getIframe?.(); if (f) f.title = getCommon(useApp.getState().language).audio.youtubePlayer } catch { /* sin iframe todavía */ }
        return player
      },
    })
    controller.sync()
    const unsubscribe = useAudio.subscribe(() => controller.sync())
    return () => { unsubscribe(); controller.dispose() }
  }, [])
  return null
}
