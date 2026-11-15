import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PERSIST_NAME } from '../lib/preferences'
import { saveSharedPref } from '../lib/sharedPrefs'
import { INITIAL_SAVE_NOTICE, applySaveResult, dismissSaveNotice, isSaveNoticeVisible } from '../landing/noticeState'
import { SaveNotice } from '../landing/SaveNotice'
import { LANDING } from '../landing/content'
import { LANGUAGES } from '../lib/preferences'
import { MemoryStorage } from './helpers'
import landingView from '../landing/Landing.tsx?raw'
import noticeView from '../landing/SaveNotice.tsx?raw'
import noticeLogic from '../landing/noticeState.ts?raw'

/** Almacenamiento que lee bien pero NO puede escribir (cuota llena, modo privado, bloqueado…). */
class FailingWrites extends MemoryStorage {
  writes = 0
  setItem(): void { this.writes++; throw new DOMException('QuotaExceededError') }
}

describe('guardar una preferencia con almacenamiento fallido', () => {
  it('saveSharedPref devuelve false (escritura fallida) y la landing lo convierte en UN aviso visible', () => {
    const storage = new FailingWrites()
    const saved = saveSharedPref({ language: 'en' }, storage)
    expect(saved).toBe(false)
    expect(storage.writes).toBe(1) // lo intentó una vez
    expect(isSaveNoticeVisible(applySaveResult(INITIAL_SAVE_NOTICE, saved))).toBe(true)
  })
  it('un valor ilegible no se sobrescribe y también se avisa', () => {
    const storage = new MemoryStorage()
    storage.setItem(PERSIST_NAME, '{no es json')
    const saved = saveSharedPref({ mode: 'dark' }, storage)
    expect(saved).toBe(false)
    expect(storage.getItem(PERSIST_NAME)).toBe('{no es json') // datos ilegibles intactos
    expect(isSaveNoticeVisible(applySaveResult(INITIAL_SAVE_NOTICE, saved))).toBe(true)
  })
  it('almacenamiento inexistente o que lanza al leer: false, sin excepciones', () => {
    expect(saveSharedPref({ language: 'en' }, null)).toBe(false)
    expect(saveSharedPref({ language: 'en' }, { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') } })).toBe(false)
  })
  it('un guardado correcto no muestra aviso (y no hay ninguna confirmación de «guardado»)', () => {
    const storage = new MemoryStorage()
    const saved = saveSharedPref({ language: 'en' }, storage)
    expect(saved).toBe(true)
    const state = applySaveResult(INITIAL_SAVE_NOTICE, saved)
    expect(isSaveNoticeVisible(state)).toBe(false)
    expect(Object.keys(state).sort()).toEqual(['dismissed', 'failed']) // el estado solo conoce «fallo» y «cerrado»: no puede afirmar un éxito
  })
})

describe('estado del aviso: sin acumulación ni avisos falsos', () => {
  it('fallos repetidos no acumulan: el estado es el mismo objeto', () => {
    const once = applySaveResult(INITIAL_SAVE_NOTICE, false)
    expect(applySaveResult(once, false)).toBe(once)
    expect(applySaveResult(applySaveResult(once, false), false)).toBe(once)
  })
  it('cuando el almacenamiento vuelve a funcionar, el aviso se retira', () => {
    const failed = applySaveResult(INITIAL_SAVE_NOTICE, false)
    expect(isSaveNoticeVisible(failed)).toBe(true)
    expect(isSaveNoticeVisible(applySaveResult(failed, true))).toBe(false)
  })
  it('cerrar el aviso lo oculta y no reaparece con cada fallo posterior de esta visita', () => {
    const closed = dismissSaveNotice(applySaveResult(INITIAL_SAVE_NOTICE, false))
    expect(isSaveNoticeVisible(closed)).toBe(false)
    expect(isSaveNoticeVisible(applySaveResult(closed, false))).toBe(false)
    expect(isSaveNoticeVisible(applySaveResult(applySaveResult(closed, true), false))).toBe(true) // tras recuperarse y volver a fallar, sí
  })
  it('un guardado correcto sin fallos previos no cambia nada', () => {
    expect(applySaveResult(INITIAL_SAVE_NOTICE, true)).toBe(INITIAL_SAVE_NOTICE)
  })
})

describe('marcado del aviso (renderizado real, es/en)', () => {
  for (const l of LANGUAGES) {
    it(`${l}: región de estado accesible, texto traducido y botón de cierre con nombre; icono decorativo`, () => {
      const t = LANDING[l].notices
      const html = renderToStaticMarkup(createElement(SaveNotice, { visible: true, text: t.saveFailed, dismissLabel: t.dismiss, onDismiss: () => {} }))
      expect(html).toMatch(/role="status"/)
      expect(html).toMatch(/aria-live="polite"/)
      expect(html).toContain(t.saveFailed.replace(/'/g, '&#x27;'))
      expect(html).toMatch(new RegExp(`<button[^>]*aria-label="${t.dismiss}"`))
      expect(html).toMatch(/<svg[^>]*aria-hidden="true"/)
      expect((html.match(/role="status"/g) ?? []).length).toBe(1) // una sola región, no una por aviso
    })
  }
  it('sin aviso, la región de estado sigue en el DOM (vacía) para que el siguiente se anuncie', () => {
    const html = renderToStaticMarkup(createElement(SaveNotice, { visible: false, text: 'x', dismissLabel: 'y', onDismiss: () => {} }))
    expect(html).toMatch(/role="status"/)
    expect(html).not.toContain('>x<')
    expect(html).not.toMatch(/<button/)
  })
  it('los textos existen en los dos idiomas, difieren y avisan de que puede perderse al recargar', () => {
    expect(LANDING.es.notices.saveFailed).toMatch(/no se ha podido guardar/i)
    expect(LANDING.es.notices.saveFailed).toMatch(/recargarla/)
    expect(LANDING.en.notices.saveFailed).toMatch(/could not be saved/i)
    expect(LANDING.en.notices.saveFailed).toMatch(/reload/)
    expect(LANDING.es.notices.saveFailed).not.toBe(LANDING.en.notices.saveFailed)
  })
})

describe('la landing usa el resultado del guardado (no lo ignora) y no arrastra la aplicación', () => {
  it('cada llamada a saveSharedPref recoge su resultado y alimenta el aviso, fuera de los actualizadores de estado', () => {
    const calls = landingView.match(/saveSharedPref\(/g) ?? []
    expect(calls.length).toBe(2) // idioma y modo
    expect(landingView.match(/const saved = saveSharedPref\(/g)?.length).toBe(2)
    expect(landingView.match(/applySaveResult\(n, saved\)/g)?.length).toBe(2)
    expect(landingView).not.toMatch(/setNotice\(\(n\) => applySaveResult\(n, saveSharedPref/) // un actualizador impuro se ejecutaría dos veces en StrictMode
  })
  it('el aviso y su lógica no importan el store, AudioEngine ni servicios de arranque', () => {
    const imports = (src: string) => [...src.matchAll(/^import\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1])
    for (const src of [noticeView, noticeLogic]) for (const imp of imports(src)) expect(imp).toMatch(/^(lucide-react|react)$/)
  })
})
