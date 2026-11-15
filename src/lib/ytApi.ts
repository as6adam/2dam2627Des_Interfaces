/** Carga ÚNICA del script de la API de iframe de YouTube, con fallo y tiempo máximo. */
const SRC = 'https://www.youtube.com/iframe_api'
export const YT_LOAD_TIMEOUT_MS = 10_000
let pending: Promise<void> | null = null

export function loadYouTubeApi(timeoutMs = YT_LOAD_TIMEOUT_MS): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (pending) return pending
  pending = new Promise<void>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady // se respeta un manejador ajeno
    const script = document.createElement('script')
    let done = false
    const finish = (err?: Error) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (err) { script.remove(); if (window.onYouTubeIframeAPIReady === onReady) window.onYouTubeIframeAPIReady = prev; pending = null; reject(err) }
      else resolve()
    }
    const onReady = () => { try { prev?.() } catch { /* ajeno */ } finish() }
    const timer = setTimeout(() => finish(new Error('timeout')), timeoutMs)
    window.onYouTubeIframeAPIReady = onReady
    script.src = SRC; script.async = true
    script.onerror = () => finish(new Error('script'))
    document.head.appendChild(script)
  })
  return pending
}
