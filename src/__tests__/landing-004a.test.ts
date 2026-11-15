import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolveBase } from '../../config/base'
import { PERSIST_NAME } from '../lib/preferences'
import { readSharedPrefs, saveSharedPref } from '../lib/sharedPrefs'
import { APP_ENTRY, appHref, tauriRedirectTarget } from '../landing/guard'
import { LANDING, PHASE_IDS, type LandingText } from '../landing/content'
import { LANGUAGES } from '../lib/preferences'
import { MemoryStorage, boot, legacyV0 } from './helpers'
import landingHtml from '../../index.html?raw'
import appHtml from '../../app/index.html?raw'
import landingMain from '../landing/main.tsx?raw'
import landingView from '../landing/Landing.tsx?raw'
import landingGuard from '../landing/guard.ts?raw'
import landingContent from '../landing/content.ts?raw'
import sharedPrefsSource from '../lib/sharedPrefs.ts?raw'
import appMain from '../main.tsx?raw'
import tailwindSource from '../../tailwind.config.js?raw'

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8')

/* ───────── Base de despliegue ───────── */
describe('resolveBase (raíz, subruta de repositorio y relativa)', () => {
  it('sin valor → base relativa, válida en la raíz, bajo un repositorio (HTTP) y en Tauri', () => {
    for (const v of [undefined, '', '  ', '.', './']) expect(resolveBase(v)).toBe('./')
  })
  it('una subruta se normaliza con barra inicial y final', () => {
    expect(resolveBase('/mi-repo/')).toBe('/mi-repo/')
    expect(resolveBase('mi-repo')).toBe('/mi-repo/')
    expect(resolveBase('/mi-repo')).toBe('/mi-repo/')
    expect(resolveBase('/a/b/')).toBe('/a/b/')
    expect(resolveBase('/')).toBe('/')
  })
  it('rechaza URLs completas y valores con caracteres peligrosos (no se adivina)', () => {
    expect(() => resolveBase('https://example.com/repo/')).toThrow(/ruta/)
    expect(() => resolveBase('//example.com/')).toThrow()
    expect(() => resolveBase('/repo?x=1')).toThrow()
    expect(() => resolveBase('/re po/')).toThrow()
  })
})

describe('enlace a la aplicación', () => {
  it('es relativo a la base: nunca un /app/ fijo que ignore la subruta', () => {
    expect(appHref('./')).toBe('./app/index.html')
    expect(appHref('/')).toBe('/app/index.html')
    expect(appHref('/mi-repo/')).toBe('/mi-repo/app/index.html')
    expect(landingView).not.toMatch(/href=["'`]\/app/)
    expect(landingView).toMatch(/appHref\(import\.meta\.env\.BASE_URL\)/)
  })
  it('la entrada de Tauri y la red de seguridad apuntan al mismo archivo', () => {
    const tauri = JSON.parse(read('../../src-tauri/tauri.conf.json'))
    expect(tauri.app.windows[0].url).toBe(APP_ENTRY)
    expect(APP_ENTRY).toBe('app/index.html')
    expect(tauri.build.frontendDist).toBe('../dist') // dist/app/index.html existe: la entrada se sirve bajo ese directorio
    expect(tauri.build.devUrl).toBe('http://localhost:1420') // el servidor de desarrollo sirve /app/index.html
  })
  it('en Tauri la landing salta a la aplicación; en un navegador se muestra', () => {
    expect(tauriRedirectTarget('tauri')).toBe('app/index.html')
    expect(tauriRedirectTarget('web')).toBeNull()
  })
})

/* ───────── Preferencias compartidas (misma clave, sin importar el store) ───────── */
describe('sharedPrefs: lectura', () => {
  it('sin elección guardada: español, claro, ágata (valores iniciales de la aplicación)', () => {
    expect(readSharedPrefs(new MemoryStorage())).toEqual({ language: 'es', mode: 'light', theme: 'agate', hasMode: false })
    expect(readSharedPrefs(null).language).toBe('es')
  })
  it('lee lo que guarda la aplicación (store real): idioma, modo y tema', async () => {
    const storage = new MemoryStorage()
    const { useApp } = await boot(storage)
    useApp.getState().setLanguage('en'); useApp.getState().setMode('dark'); useApp.getState().setTheme('ruby')
    expect(readSharedPrefs(storage)).toEqual({ language: 'en', mode: 'dark', theme: 'ruby', hasMode: true })
  })
  it('valores inválidos o JSON ilegible → iniciales, sin lanzar', () => {
    const s = new MemoryStorage()
    s.setItem(PERSIST_NAME, '{no es json')
    expect(readSharedPrefs(s).language).toBe('es')
    s.setItem(PERSIST_NAME, JSON.stringify({ state: { language: 'fr', mode: 'sepia', theme: 'x' }, version: 1 }))
    expect(readSharedPrefs(s)).toMatchObject({ language: 'es', mode: 'light', theme: 'agate', hasMode: false })
    const bad = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') } }
    expect(readSharedPrefs(bad).language).toBe('es')
    expect(saveSharedPref({ language: 'en' }, bad)).toBe(false)
  })
})

describe('sharedPrefs: guardar el idioma no pisa nada más', () => {
  it('conserva eventos, propósito, notificaciones, modo, tema y campos desconocidos, y no crea otras claves', async () => {
    const storage = new MemoryStorage()
    const first = await boot(storage)
    first.useApp.getState().loadSample()
    first.useApp.getState().setPurpose('productivity')
    first.useApp.getState().setMode('dark'); first.useApp.getState().setTheme('diamond'); first.useApp.getState().setNotifications(false)
    const saved = JSON.parse(storage.getItem(PERSIST_NAME) as string)
    saved.state.extra = { keep: 'me' } // un campo futuro/desconocido no debe perderse
    storage.setItem(PERSIST_NAME, JSON.stringify(saved))
    const before = JSON.parse(storage.getItem(PERSIST_NAME) as string)
    expect(before.state.items.length).toBeGreaterThan(0)

    expect(saveSharedPref({ language: 'en' }, storage)).toBe(true)

    const after = JSON.parse(storage.getItem(PERSIST_NAME) as string)
    expect(after.state.language).toBe('en')
    expect({ ...after.state, language: before.state.language }).toEqual(before.state) // SOLO cambió el idioma
    expect(after.version).toBe(before.version)
    expect(storage.keys().filter((k) => !k.startsWith('tempora-audio'))).toEqual([PERSIST_NAME]) // ninguna clave nueva de idioma

    const second = await boot(storage) // la aplicación arranca después y ve el idioma elegido en la landing
    const st = second.useApp.getState()
    expect(st.language).toBe('en')
    expect(st.purpose).toBe('productivity')
    expect(st.mode).toBe('dark'); expect(st.theme).toBe('diamond'); expect(st.notifications).toBe(false)
    expect(st.items).toEqual(before.state.items)
  })
  it('el modo elegido en la landing lo conserva la aplicación y no toca el idioma ni los eventos', async () => {
    const storage = new MemoryStorage()
    const first = await boot(storage)
    first.useApp.getState().loadSample(); first.useApp.getState().setLanguage('en')
    const items = first.useApp.getState().items
    expect(saveSharedPref({ mode: 'dark' }, storage)).toBe(true)
    const second = await boot(storage)
    expect(second.useApp.getState().mode).toBe('dark')
    expect(second.useApp.getState().language).toBe('en')
    expect(second.useApp.getState().items).toEqual(items)
  })
  it('estado v0 (sin version): migra como la aplicación, conserva eventos y mantiene el idioma elegido', async () => {
    const storage = new MemoryStorage()
    storage.setItem(PERSIST_NAME, JSON.stringify(legacyV0))
    expect(saveSharedPref({ language: 'en' }, storage)).toBe(true)
    const st = (await boot(storage)).useApp.getState()
    expect(st.items).toEqual(legacyV0.state.items)
    expect(st.mode).toBe('dark'); expect(st.theme).toBe('ruby'); expect(st.notifications).toBe(false)
    expect(st.language).toBe('en') // la migración v0 → v1 no lo devuelve a «es»
    expect(st.purpose).toBeNull()
  })
  it('sin nada guardado crea un valor válido que la aplicación acepta con sus valores iniciales', async () => {
    const storage = new MemoryStorage()
    expect(saveSharedPref({ language: 'en' }, storage)).toBe(true)
    const st = (await boot(storage)).useApp.getState()
    expect(st.language).toBe('en'); expect(st.items).toEqual([]); expect(st.purpose).toBeNull(); expect(st.mode).toBe('light')
  })
  it('un valor ilegible NO se sobrescribe', () => {
    const s = new MemoryStorage()
    s.setItem(PERSIST_NAME, '{no es json')
    expect(saveSharedPref({ language: 'en' }, s)).toBe(false)
    expect(s.getItem(PERSIST_NAME)).toBe('{no es json')
  })
})

/* ───────── Contenido de la landing ───────── */
type Json = string | number | boolean | null | Json[] | { [k: string]: Json }
const shape = (v: unknown): Json => {
  if (typeof v === 'string') return 'string'
  if (Array.isArray(v)) return v.map(shape)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]))
  return typeof v as Json
}
// Textos traducibles: se omiten identificadores técnicos (id, icon, status) que son iguales en todos los idiomas.
const TECHNICAL_KEYS = new Set(['id', 'icon', 'status'])
const strings = (v: unknown): string[] => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.entries(v).filter(([k]) => !TECHNICAL_KEYS.has(k)).flatMap(([, x]) => strings(x)) : []

describe('contenido es/en', () => {
  it('mismas claves, mismo número de elementos y ningún texto vacío', () => {
    expect(shape(LANDING.en)).toEqual(shape(LANDING.es))
    for (const l of LANGUAGES) for (const s of strings(LANDING[l])) expect(s.trim().length).toBeGreaterThan(0)
  })
  it('el inglés está realmente traducido (no es copia del español) salvo nombres propios', () => {
    const same = strings(LANDING.es).filter((s, i) => s === strings(LANDING.en)[i])
    // Nombres propios, tecnologías y nombres de idioma pueden coincidir.
    for (const s of same) expect(s).toMatch(/^(Tempora|React 18|TypeScript|Tailwind CSS 3|Framer Motion|Zustand|date-fns|lucide-react|Tauri 2 \(Rust\)|Vite 5|Vitest|Español|English|Prompt|Pomodoro)$/)
  })
  it('las fases son las cinco pedidas, en orden, con los mismos estados en ambos idiomas', () => {
    expect(PHASE_IDS).toEqual(['analysis', 'design', 'development', 'prompts', 'testing'])
    for (const l of LANGUAGES) expect(LANDING[l].phases.items.map((p) => p.id)).toEqual([...PHASE_IDS])
    const sig = (t: LandingText) => t.phases.items.map((p) => [p.status, p.items.map((i) => i.status)])
    expect(sig(LANDING.en)).toEqual(sig(LANDING.es))
  })
  it('«Prompts utilizados y respuestas obtenidas»: ya no es el aviso de pendiente; el registro real se incorpora (005) y la fase queda parcial', () => {
    expect(LANDING.es.phases.items[3].title).toBe('Prompts utilizados y respuestas obtenidas')
    expect(LANDING.en.phases.items[3].title).toBe('Prompts used and responses obtained')
    for (const l of LANGUAGES) {
      expect(JSON.stringify(LANDING[l])).not.toMatch(/Documentación pendiente de incorporar|Documentation yet to be added/)
      expect(LANDING[l].phases.items[3].status).toBe('partial') // incorporado hasta 004C; lo posterior no consta en el documento
    }
  })
  it('despliegue y pruebas en dispositivos reales constan como pendientes (nada marcado como hecho sin estarlo)', () => {
    for (const l of LANGUAGES) {
      const testing = LANDING[l].phases.items.find((p) => p.id === 'testing')!
      const deploy = testing.items.find((i) => /GitHub Pages/.test(i.text))!
      expect(deploy.status).toBe('pending')
      expect(testing.items.find((i) => /(físicos|physical)/.test(i.text))!.status).toBe('pending')
      expect(testing.status).not.toBe('done')
    }
  })
  it('las funciones que no existen solo aparecen como «todavía no» / pendientes, nunca como funciones', () => {
    for (const l of LANGUAGES) {
      const t = LANDING[l]
      const claim = /planificaci[oó]n autom[aá]tica|sincroniz|estad[ií]stic|automatic scheduling|sync|statistic/i
      // «Datos en tu dispositivo» las menciona solo para negarlas (no hay cuenta, servidor ni sincronización).
      for (const f of t.features.items.filter((x) => x.icon !== 'storage')) expect(`${f.title} ${f.text}`).not.toMatch(claim)
      expect(t.features.notYet.items).toHaveLength(3)
      for (const ph of t.phases.items) for (const it of ph.items.filter((i) => claim.test(i.text))) expect(it.status).toBe('pending')
    }
  })
  it('no hay enlaces, correos ni repositorios inventados en el contenido', () => {
    for (const s of strings(LANDING)) expect(s).not.toMatch(/https?:|www\.|github\.com\/|@\w+\.\w+/i)
    expect(landingContent).not.toMatch(/https?:\/\//)
  })
})

/* ───────── Entradas, aislamiento y estilos ───────── */
describe('entradas HTML', () => {
  it('la raíz es la landing y /app/ es Tempora, cada una con su propia entrada React', () => {
    expect(landingHtml).toContain('id="landing"')
    expect(landingHtml).toContain('/src/landing/main.tsx')
    expect(landingHtml).not.toContain('/src/main.tsx')
    expect(appHtml).toContain('id="root"')
    expect(appHtml).toContain('/src/main.tsx')
    expect(appHtml).not.toContain('landing')
    for (const html of [landingHtml, appHtml]) {
      expect(html).toMatch(/viewport-fit=cover/)
      expect(html).not.toMatch(/maximum-scale|user-scalable/i)
      expect(html).toMatch(/<html lang="es"/) // español por defecto; el idioma guardado lo aplica el script de cada entrada
      expect(html).toMatch(/<title>Tempora<\/title>/)
      expect(html).toMatch(/rel="icon"[^>]*href="\/icon\.png"/) // Vite lo reescribe con la base elegida
    }
  })
  it('la app sigue montando App; la landing no', () => {
    expect(appMain).toMatch(/import App from '\.\/App'/)
    expect(appMain).not.toMatch(/landing/i)
  })
})

describe('la landing no arrastra la aplicación', () => {
  const sources: Record<string, string> = { 'landing/main.tsx': landingMain, 'landing/Landing.tsx': landingView, 'landing/guard.ts': landingGuard, 'landing/content.ts': landingContent, 'lib/sharedPrefs.ts': sharedPrefsSource }
  // Solo importaciones de VALOR cuentan: `import type` se borra al compilar.
  const valueImports = (src: string) => [...src.matchAll(/^import\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1])
  it('no importa App, el store, AudioEngine, audio, YouTube, notificaciones, hooks de arranque ni framer-motion', () => {
    const forbidden = /(^|\/)(App|store|AudioEngine|audio|audioController|audioSlot|ytApi|notify|hooks|useNotifyStatus|storage|storageHealth|i18n|vocab|Panels)(\.tsx?)?$|framer-motion|@tauri-apps/
    for (const [name, src] of Object.entries(sources)) for (const imp of valueImports(src)) expect({ file: name, import: imp, forbidden: forbidden.test(imp) }).toEqual({ file: name, import: imp, forbidden: false })
  })
  it('no crea temporizadores ni reproductores ni pide permisos', () => {
    for (const src of Object.values(sources)) expect(src).not.toMatch(/setInterval|new Audio|<audio|<iframe|Notification\.requestPermission|YT\./)
  })
  it('no muestra el selector de propósito ni el resumen de bienvenida', () => {
    for (const src of Object.values(sources)) expect(src).not.toMatch(/PurposeDialog|purposeChange|welcomeNotice|useStartupAlerts/)
  })
})

describe('estilos aislados por entrada', () => {
  const code = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '') // los comentarios pueden nombrar lo que NO hay
  const shared = code(read('../styles/shared.css')), appCss = code(read('../index.css')), landingCss = code(read('../landing/landing.css'))
  it('lo compartido no contiene alturas fijas ni user-select (eso es de cada entrada)', () => {
    expect(shared).not.toMatch(/#root|user-select|height:\s*100%|overflow-(x|y):\s*hidden|100vh|100dvh/)
    expect(shared).toMatch(/--accent: 109 63 216/) // violeta como acento inicial
    expect(shared).toMatch(/:root\.dark/)
    expect(shared).toMatch(/prefers-reduced-transparency/)
  })
  it('la aplicación conserva su altura fija, su scroll interno y user-select: none', () => {
    expect(appCss).toMatch(/@import '\.\/styles\/shared\.css'/)
    expect(appCss).toMatch(/#root \{ height: 100vh; min-height: 22rem; \}/)
    expect(appCss).toMatch(/body \{ overflow-x: hidden; overflow-y: auto; user-select: none; \}/)
  })
  it('la landing tiene altura natural y texto seleccionable, y respeta movimiento reducido y áreas seguras', () => {
    expect(landingCss).toMatch(/@import '\.\.\/styles\/shared\.css'/)
    expect(landingCss).not.toMatch(/#root|user-select:\s*none|overflow-y:\s*hidden|height:\s*100%/)
    expect(landingCss).toMatch(/prefers-reduced-motion: no-preference\) \{ html \{ scroll-behavior: smooth/)
    expect(landingCss).toMatch(/scroll-padding-top/) // la cabecera fija no tapa destinos ni foco
    expect(landingCss).not.toMatch(/user-scalable|touch-action:\s*none/)
  })
  it('Tailwind cubre ambas entradas', () => {
    expect(tailwindSource).toContain("'./index.html'")
    expect(tailwindSource).toContain("'./app/index.html'")
    expect(tailwindSource).toContain("'./src/**/*.{ts,tsx}'") // incluye src/landing
  })
  it('Vite genera las dos entradas y usa la base resuelta en un único sitio', () => {
    const cfg = read('../../vite.config.ts')
    expect(cfg).toMatch(/landing: here\('\.\/index\.html'\)/)
    expect(cfg).toMatch(/app: here\('\.\/app\/index\.html'\)/)
    expect(cfg).toMatch(/base: resolveBase\(process\.env\.TEMPORA_BASE\)/)
  })
})
