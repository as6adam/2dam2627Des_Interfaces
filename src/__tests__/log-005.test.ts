import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LANGUAGES } from '../lib/preferences'
import { BLOCK_IDS, MANIFEST, blockAnchor, blockFromHash, hasTranscript, promptText, sectionOf, type LogBlockData } from '../landing/log/index'
import { copyText } from '../landing/log/clipboard'
import { LOG_META, LOG_TEXT, fill } from '../landing/log/text'
import { BlockBody, PromptLog } from '../landing/Log'
import logView from '../landing/Log.tsx?raw'
import logIndex from '../landing/log/index.ts?raw'
import logClipboard from '../landing/log/clipboard.ts?raw'
import pkgRaw from '../../package.json?raw'
import b_analysis from '../landing/log/blocks/analysis.json?raw'
import b_001 from '../landing/log/blocks/001.json?raw'
import b_002a from '../landing/log/blocks/002a.json?raw'
import b_002b from '../landing/log/blocks/002b.json?raw'
import b_002c from '../landing/log/blocks/002c.json?raw'
import b_003a from '../landing/log/blocks/003a.json?raw'
import b_003b from '../landing/log/blocks/003b.json?raw'
import b_003c from '../landing/log/blocks/003c.json?raw'
import b_004a from '../landing/log/blocks/004a.json?raw'
import b_004b from '../landing/log/blocks/004b.json?raw'
import b_004c from '../landing/log/blocks/004c.json?raw'

const RAW = { analysis: b_analysis, '001': b_001, '002a': b_002a, '002b': b_002b, '002c': b_002c, '003a': b_003a, '003b': b_003b, '003c': b_003c, '004a': b_004a, '004b': b_004b, '004c': b_004c }
const DATA = Object.fromEntries(BLOCK_IDS.map((id) => [id, JSON.parse(RAW[id]) as LogBlockData])) as Record<(typeof BLOCK_IDS)[number], LogBlockData>

describe('bitácora: correspondencia con el documento fuente', () => {
  it('11 bloques: análisis inicial + 001, 002A–C, 003A–C y 004A–C, en orden y sin duplicados', () => {
    expect(BLOCK_IDS).toEqual(['analysis', '001', '002a', '002b', '002c', '003a', '003b', '003c', '004a', '004b', '004c'])
    expect(MANIFEST.source.blocks).toBe(11)
    expect(MANIFEST.blocks.map((b) => b.id)).toEqual([...BLOCK_IDS])
    expect(new Set(MANIFEST.blocks.map((b) => b.id)).size).toBe(11)
    expect(MANIFEST.blocks.map((b) => b.phase)).toEqual([1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4])
  })
  it('cada archivo coincide con el manifiesto: id, secciones, párrafos y caracteres', () => {
    for (const m of MANIFEST.blocks) {
      const d = DATA[m.id]
      expect({ id: d.id, phase: d.phase }).toEqual({ id: m.id, phase: m.phase })
      expect(d.sections.map((s) => [s.kind, s.paragraphs.length, s.paragraphs.reduce((n, p) => n + p.t.length, 0)]))
        .toEqual(m.sections.map((s) => [s.kind, s.paragraphs, s.chars]))
      expect(d.sections.reduce((n, s) => n + s.paragraphs.reduce((k, p) => k + p.t.length, 0), 0)).toBe(m.chars)
    }
  })
  it('cada iteración tiene prompt de usuario, mensajes de progreso y respuesta de GPT; la «continuación» solo donde el documento la tiene (001 y 002A)', () => {
    for (const id of BLOCK_IDS) {
      const kinds = DATA[id].sections.map((s) => s.kind)
      for (const k of ['userPrompt', 'progress', 'gptResponse', 'claudePrompt', 'claudeResponse'] as const) expect(kinds).toContain(k)
      expect(kinds.includes('gptContinuation')).toBe(id === '001' || id === '002a')
    }
  })
  it('el análisis inicial no tiene prompt ni respuesta de Claude: solo la nota del documento, sin inventar contenido', () => {
    const d = DATA.analysis
    for (const k of ['claudePrompt', 'claudeResponse'] as const) {
      const s = sectionOf(d, k)!
      expect(hasTranscript(s)).toBe(false)
      expect(s.paragraphs).toHaveLength(1)
      expect(s.paragraphs[0].k).toBe('note')
      expect(s.paragraphs[0].t).toMatch(/^No consta/)
    }
    expect(MANIFEST.blocks[0].claudePages).toBeNull()
    for (const id of BLOCK_IDS.slice(1)) {
      expect(hasTranscript(sectionOf(DATA[id], 'claudePrompt'))).toBe(true)
      expect(hasTranscript(sectionOf(DATA[id], 'claudeResponse'))).toBe(true)
      expect(MANIFEST.blocks.find((b) => b.id === id)!.claudePages).not.toBeNull()
    }
  })
  it('transcripción (text/table) y nota editorial (note) se distinguen por estilo de origen', () => {
    const map = { Source: 'text', TranscriptTable: 'table', Normal: 'note', Reference: 'note' } as const
    for (const id of BLOCK_IDS) for (const s of DATA[id].sections) for (const p of s.paragraphs) {
      expect(p.k).toBe(map[p.s as keyof typeof map])
      expect(p.t.trim()).not.toBe('')
    }
    // Los prompts y respuestas son transcripción; las notas editoriales son las del documento («Fuente: páginas…», «No consta…»)
    for (const id of BLOCK_IDS.slice(1)) expect(DATA[id].sections.find((s) => s.kind === 'claudeResponse')!.paragraphs[0].t).toMatch(/^Fuente: páginas \d+ a \d+ del PDF/)
  })
  it('conserva identificadores, comandos y nombres tal como constan', () => {
    const all = (id: (typeof BLOCK_IDS)[number]) => DATA[id].sections.flatMap((s) => s.paragraphs.map((p) => p.t)).join('\n')
    for (const tok of ['npm run verify:dist', 'deploy-pages.yml', 'npm ci', 'TEMPORA-WEB-004B']) expect(all('004b')).toContain(tok)
    expect(all('001')).toContain('tempora-v1')
  })
  it('las referencias de página del documento y la discrepancia de numeración se conservan', () => {
    expect(MANIFEST.blocks.map((b) => [b.gptPages, b.claudePages])).toEqual([
      [[1, 6], null], [[6, 13], [54, 56]], [[13, 18], [57, 59]], [[18, 22], [60, 61]], [[22, 27], [62, 64]], [[27, 31], [64, 67]],
      [[31, 35], [67, 70]], [[35, 40], [71, 74]], [[40, 45], [74, 77]], [[45, 50], [77, 79]], [[50, 54], [79, 81]],
    ])
    expect(MANIFEST.traceNotes.join('\n')).toMatch(/omite el séptimo/)
    expect(MANIFEST.traceNotes.join('\n')).toMatch(/81 páginas/)
    expect(MANIFEST.traceNotes.join('\n')).not.toMatch(/Para la landing/) // instrucción de implementación, no contenido
    expect(MANIFEST.excludedNotes).toHaveLength(1)
  })
})

describe('bitácora: idiomas', () => {
  it('títulos y fases en ambos idiomas; los de español coinciden con los del documento', () => {
    for (const m of MANIFEST.blocks) {
      const derived = m.sourceHeading.replace(/^(Análisis inicial|Iteración \w+) /, '')
      expect(LOG_META.es.blocks[m.id].title).toBe(derived)
      expect(LOG_META.en.blocks[m.id].title).not.toBe(derived)
      expect(LOG_META.en.blocks[m.id].objective).toBeTruthy()
      expect(m.phaseSourceHeading).toBe(`Fase ${m.phase} ${LOG_META.es.phases[m.phase]}`)
    }
  })
  it('las etiquetas tienen las mismas claves en es y en', () => {
    const shape = (v: unknown): unknown => (typeof v === 'object' && v ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v)
    expect(shape(LOG_TEXT.en)).toEqual(shape(LOG_TEXT.es))
  })
  it('las transcripciones no dependen del idioma de la interfaz: el contenido original está en un solo sitio', () => {
    expect(JSON.stringify(LOG_TEXT)).not.toContain(DATA['001'].sections[0].paragraphs[0].t.slice(0, 60))
    // El tipo de datos no tiene campos por idioma
    for (const id of BLOCK_IDS) expect(Object.keys(DATA[id]).sort()).toEqual(['id', 'phase', 'phaseSourceHeading', 'sections', 'sourceHeading'])
  })
  it('el índice se pinta en ambos idiomas con anclas estables y todo cerrado; las transcripciones no están en el HTML inicial', () => {
    for (const l of LANGUAGES) {
      const html = renderToStaticMarkup(createElement(PromptLog, { language: l }))
      for (const id of BLOCK_IDS) {
        expect(html).toContain(`id="${blockAnchor(id)}"`)
        expect(html).toContain(`href="#${blockAnchor(id)}"`)
      }
      expect(html).toContain(LOG_TEXT[l].index.label)
      expect(html).not.toMatch(/<details[^>]*id="log-[^"]*"[^>]*\sopen/)
      expect(html).not.toContain('Rol y Contexto: Eres un arquitecto') // primer prompt del análisis: llega solo al abrir
      expect(html).not.toMatch(/Documentación pendiente|Documentation yet to be added/)
      expect(html).toContain('lang="es"') // notas de trazabilidad: idioma original señalado
    }
    expect(renderToStaticMarkup(createElement(PromptLog, { language: 'en' }))).toContain('Open an iteration')
    expect(renderToStaticMarkup(createElement(PromptLog, { language: 'es' }))).toContain('Abre una iteración')
  })
  it('una iteración abierta muestra el objetivo en el idioma de la interfaz y conserva el original en español', () => {
    const es = renderToStaticMarkup(createElement(BlockBody, { id: '004c', t: LOG_TEXT.es, language: 'es' }))
    const en = renderToStaticMarkup(createElement(BlockBody, { id: '004c', t: LOG_TEXT.en, language: 'en' }))
    expect(es).toContain(MANIFEST.blocks[10].objective)
    expect(en).toContain(LOG_META.en.blocks['004c'].objective!)
    expect(en).toContain(MANIFEST.blocks[10].gptRefs[0]) // la referencia original no se traduce
    expect(en).toContain(LOG_TEXT.en.editorialTranslated)
    expect(es).toContain(fill(LOG_TEXT.es.pages.withClaude, { g: '50–54', c: '79–81' }))
  })
})

describe('bitácora: anclas', () => {
  it('#log-<id> se reconoce (sin distinguir mayúsculas) y lo demás se ignora', () => {
    for (const id of BLOCK_IDS) expect(blockFromHash(`#${blockAnchor(id)}`)).toBe(id)
    expect(blockFromHash('#LOG-002A')).toBe('002a')
    for (const h of ['', '#', '#phases', '#log-', '#log-999', '#log-001x', '#about']) expect(blockFromHash(h)).toBeNull()
    expect(new Set(BLOCK_IDS.map(blockAnchor)).size).toBe(11)
  })
})

describe('bitácora: copiar prompt', () => {
  it('copia solo el prompt para Claude, párrafo a párrafo y sin notas editoriales', () => {
    const s = sectionOf(DATA['002a'], 'claudePrompt')!
    expect(promptText(s)).toBe(s.paragraphs.filter((p) => p.k !== 'note').map((p) => p.t).join('\n\n'))
    for (const p of s.paragraphs) expect(promptText(s)).toContain(p.t)
    expect(promptText(sectionOf(DATA.analysis, 'claudePrompt'))).toBe('')
    expect(promptText(undefined)).toBe('')
  })
  it('usa el portapapeles; si falla, el respaldo; si también falla, devuelve false (se muestra el aviso)', async () => {
    const written: string[] = []
    expect(await copyText('a', { nav: { clipboard: { writeText: async (t) => { written.push(t) } } } })).toBe(true)
    expect(written).toEqual(['a'])
    const area = { value: '', style: { cssText: '' }, setAttribute() {}, select() {}, remove() {} }
    const doc = (ok: boolean) => ({ createElement: () => area, body: { appendChild() {} }, execCommand: () => ok }) as never
    expect(await copyText('b', { nav: { clipboard: { writeText: async () => { throw new Error('denegado') } } }, doc: doc(true) })).toBe(true)
    expect(await copyText('c', { nav: { clipboard: { writeText: async () => { throw new Error('denegado') } } }, doc: doc(false) })).toBe(false)
    expect(await copyText('d', { nav: {}, doc: { createElement: () => { throw new Error('sin DOM') }, body: null, execCommand: () => false } as never })).toBe(false)
    expect(await copyText('e', {})).toBe(false)
  })
  it('el botón tiene nombre accesible con la iteración y una región viva para el resultado (copiado o fallo)', () => {
    expect(logView).toMatch(/aria-label=\{fill\(t\.copy\.label/)
    expect(logView).toMatch(/role="status" aria-live="polite"/)
    expect(logView).toMatch(/t\.copy\.fail/)
    expect(LOG_TEXT.es.copy.fail).toMatch(/manualmente/)
    expect(LOG_TEXT.en.copy.fail).toMatch(/manually/)
  })
})

describe('bitácora: seguridad, rendimiento y alcance', () => {
  it('el texto se pinta como texto: nada de HTML del documento ni parser DOCX en el navegador', () => {
    for (const src of [logView, logIndex, logClipboard]) expect(src).not.toMatch(/dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|DOMParser/)
    expect(pkgRaw).not.toMatch(/mammoth|"docx"|python-docx|jszip|html-react-parser/)
    expect(logView).not.toMatch(/docx/i)
    const html = renderToStaticMarkup(createElement('p', null, '<img src=x onerror=alert(1)>'))
    expect(html).toContain('&lt;img')
  })
  it('las transcripciones no se importan como código: solo URL de recurso (?url) y carga diferida', () => {
    const imports = [...logIndex.matchAll(/^import\s+\w+\s+from\s+'(\.\/blocks\/[^']+)'/gm)].map((m) => m[1])
    expect(imports).toHaveLength(11)
    for (const i of imports) expect(i).toMatch(/\.json\?url$/)
    expect(logIndex).toMatch(/fetch\(URLS\[id\]\)/)
    expect(logView).not.toMatch(/from '\.\/log\/blocks/)
  })
  it('el registro no arrastra la aplicación (store, audio, YouTube, notificaciones, framer-motion, Tauri)', () => {
    const forbidden = /(^|\/)(App|store|AudioEngine|audio|audioController|audioSlot|ytApi|notify|hooks|useNotifyStatus|storage|storageHealth|i18n|vocab|Panels)(\.tsx?)?$|framer-motion|@tauri-apps/
    for (const src of [logView, logIndex, logClipboard]) for (const m of src.matchAll(/^import\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm)) expect(forbidden.test(m[1])).toBe(false)
    for (const src of [logView, logIndex]) expect(src).not.toMatch(/setInterval|new Audio|<audio|<iframe|YT\./)
  })
  it('apartados con controles semánticos: details/summary, sin animaciones propias, sin tarjetas por párrafo', () => {
    expect(logView).toMatch(/<details/)
    expect(logView).toMatch(/<summary/)
    expect(logView).not.toMatch(/framer-motion|motion\./)
  })
})
