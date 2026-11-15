import type { Language } from '../lib/preferences'
import purpose from '../assets/screenshots/desktop-purpose.webp'
import create from '../assets/screenshots/desktop-create.webp'
import event from '../assets/screenshots/desktop-event.webp'
import date from '../assets/screenshots/desktop-date.webp'
import themes from '../assets/screenshots/desktop-themes.webp'
import settings from '../assets/screenshots/desktop-settings.webp'
import mobilePurpose from '../assets/screenshots/mobile-purpose.webp'
import mobileCreate from '../assets/screenshots/mobile-create.webp'
import mobileEvent from '../assets/screenshots/mobile-event.webp'
import mobileFocus from '../assets/screenshots/mobile-focus.webp'

const SHOTS = [
  { src: purpose, es: 'Elegir entre Académico y Productividad', en: 'Choose Academic or Productivity', mobile: false },
  { src: create, es: 'Crear un examen con asignatura, fecha y notas', en: 'Create an exam with a subject, date and notes', mobile: false },
  { src: event, es: 'Consultar un examen y preparar sesiones vinculadas', en: 'View an exam and prepare linked sessions', mobile: false },
  { src: date, es: 'Programar una sesión antes de la fecha del examen', en: 'Schedule a session before the exam deadline', mobile: false },
  { src: themes, es: 'Personalizar el tema y el modo de color', en: 'Customise the theme and colour mode', mobile: false },
  { src: settings, es: 'Ajustar el idioma, las notificaciones y los datos', en: 'Manage language, notifications and data', mobile: false },
  { src: mobilePurpose, es: 'Elegir el propósito desde el teléfono', en: 'Choose a purpose on a phone', mobile: true },
  { src: mobileCreate, es: 'Crear una tarea en Safari de iPhone', en: 'Create an assignment in iPhone Safari', mobile: true },
  { src: mobileEvent, es: 'Consultar la tarea en una hoja inferior', en: 'View assignment details in a bottom sheet', mobile: true },
  { src: mobileFocus, es: 'Usar el Pomodoro y el audio en modo oscuro', en: 'Use the Pomodoro and audio in dark mode', mobile: true },
]

export function ScreenshotGallery({ language }: { language: Language }) {
  const en = language === 'en'
  return (
    <section id="screenshots" aria-labelledby="screenshots-title" className="pt-20 sm:pt-28">
      <h2 id="screenshots-title" tabIndex={-1} className="l-h2 mb-4 outline-none">{en ? 'Tempora in use' : 'Tempora en uso'}</h2>
      <p className="l-body mb-8 max-w-[65ch] text-ink/80">{en
        ? 'Real screenshots supplied by Adam from desktop Chrome and iPhone Safari. Open any image to view it at full size.'
        : 'Capturas reales aportadas por Adam desde Chrome de escritorio y Safari de iPhone. Abre cualquier imagen para verla a tamaño completo.'}</p>
      {[false, true].map((mobile) => (
        <div key={String(mobile)} className="mb-10">
          <h3 className="l-h3 mb-4">{mobile ? (en ? 'On a phone' : 'En el teléfono') : (en ? 'On desktop' : 'En el escritorio')}</h3>
          <div className={mobile ? 'l-shots l-shots-mobile' : 'l-shots'}>
            {SHOTS.filter((s) => s.mobile === mobile).map((s) => (
              <figure key={s.src} className="l-shot">
                <a href={s.src} target="_blank" rel="noopener noreferrer" aria-label={`${en ? 'Enlarge screenshot' : 'Ampliar captura'}: ${s[language]} (${en ? 'new tab' : 'nueva pestaña'})`}>
                  <img src={s.src} alt={s[language]} width={mobile ? 944 : 1920} height={mobile ? 2048 : 1080} loading="lazy" decoding="async" />
                </a>
                <figcaption className="l-small p-4">{s[language]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
