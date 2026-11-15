import React from 'react'
import ReactDOM from 'react-dom/client'
import { getPlatform } from '../lib/platform'
import { tauriRedirectTarget } from './guard'
import { Landing } from './Landing'
import './landing.css'

// Entrada INDEPENDIENTE de la aplicación: no importa App, store, AudioEngine, Pomodoro ni avisos de arranque.
const redirect = tauriRedirectTarget(getPlatform())
if (redirect) {
  window.location.replace(redirect)
} else {
  ReactDOM.createRoot(document.getElementById('landing')!).render(
    <React.StrictMode>
      <Landing />
    </React.StrictMode>,
  )
}
