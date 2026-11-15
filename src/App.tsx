import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useApp, useUI } from './store'
import { SPRING } from './lib/motion'
import { useHydrated, usePomodoroTicker, useStartupAlerts, useStorageNotice } from './lib/hooks'
import { Sidebar } from './components/Sidebar'
import { CalendarView } from './components/CalendarView'
import { RightPanel } from './components/RightPanel'
import { AudioEngine } from './components/AudioEngine'
import { ItemPopover } from './components/ItemPopover'
import { Overlays } from './components/Overlays'
import { Toasts } from './components/Toasts'
import { MobileBar, Scrim } from './components/Panels'
import { getLayout } from './lib/layout'
import { installViewportVars } from './lib/viewport'

export default function App() {
  const mode = useApp((s) => s.mode)
  const theme = useApp((s) => s.theme)
  const language = useApp((s) => s.language)
  const hydrated = useHydrated()
  const needsPurpose = useApp((s) => s.purpose === null)
  // Con un diálogo modal abierto, el fondo queda inerte (sin foco ni lectura de pantalla).
  // El audio y el Pomodoro viven fuera de este contenedor y del DOM inerte: siguen funcionando.
  const blocked = useUI((s) => s.modal !== null || s.purposeChange) || (hydrated && needsPurpose)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    root.dataset.theme = theme
  }, [mode, theme])

  // Idioma del documento = preferencia recuperada y sus cambios (sin consultar el idioma del navegador).
  useEffect(() => { document.documentElement.lang = language }, [language])

  // Teclado virtual / barras del navegador: altura visible real en --vvh/--vvt (sin visualViewport o con zoom del usuario, vale el fallback dvh).
  useEffect(() => installViewportVars(), [])
  // Un panel plegable que pasa a estar fijo (el ancho crece) deja de «estar abierto»: así no reaparece solo al volver a estrechar.
  useEffect(() => {
    const sync = () => {
      const { panel } = useUI.getState()
      const l = getLayout()
      if ((panel === 'nav' && l.navDocked) || (panel === 'focus' && l.focusDocked)) useUI.setState({ panel: null })
    }
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  usePomodoroTicker()
  useStartupAlerts()
  useStorageNotice()

  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <AudioEngine />
      {/* Estructura ÚNICA a cualquier tamaño: solo cambian clases y el estado de los paneles; nada se remonta al redimensionar. */}
      <div className="app-shell flex h-full flex-col" {...(blocked ? { inert: '' } : {})}>
        <div className="flex min-h-0 flex-1 gap-3">
          <Sidebar />
          <CalendarView />
          <RightPanel />
        </div>
        <MobileBar />
      </div>
      <Scrim />
      <ItemPopover />
      <Overlays />
      <Toasts />
    </MotionConfig>
  )
}
