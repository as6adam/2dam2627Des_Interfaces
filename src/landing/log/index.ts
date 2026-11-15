import manifestJson from './manifest.json'
import analysisUrl from './blocks/analysis.json?url'
import u001 from './blocks/001.json?url'
import u002a from './blocks/002a.json?url'
import u002b from './blocks/002b.json?url'
import u002c from './blocks/002c.json?url'
import u003a from './blocks/003a.json?url'
import u003b from './blocks/003b.json?url'
import u003c from './blocks/003c.json?url'
import u004a from './blocks/004a.json?url'
import u004b from './blocks/004b.json?url'
import u004c from './blocks/004c.json?url'
import { BLOCK_IDS, type BlockId, type LogBlockData, type LogSection, type Manifest, type SectionKind } from './types'

export * from './types'
export const MANIFEST = manifestJson as unknown as Manifest

/**
 * Cada iteración es un archivo JSON aparte (recurso estático con hash, no código): se descarga con `fetch` solo cuando alguien
 * la abre o llega con su ancla. La URL sale de `?url` de Vite, así que respeta la base relativa y la subruta de despliegue.
 */
const URLS: Record<BlockId, string> = {
  analysis: analysisUrl, '001': u001, '002a': u002a, '002b': u002b, '002c': u002c,
  '003a': u003a, '003b': u003b, '003c': u003c, '004a': u004a, '004b': u004b, '004c': u004c,
}
const cache = new Map<BlockId, Promise<LogBlockData>>()
export function loadBlock(id: BlockId): Promise<LogBlockData> {
  let p = cache.get(id)
  if (!p) {
    p = fetch(URLS[id]).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<LogBlockData> })
    p.catch(() => { cache.delete(id) }) // un fallo de red no queda en caché: «Reintentar» vuelve a pedirlo
    cache.set(id, p)
  }
  return p
}

/** Anclas estables, iguales en ambos idiomas: #log-analysis, #log-001, #log-002a… */
export const ANCHOR_PREFIX = 'log-'
export const blockAnchor = (id: BlockId): string => `${ANCHOR_PREFIX}${id}`
export function blockFromHash(hash: string): BlockId | null {
  const raw = hash.replace(/^#/, '').toLowerCase()
  if (!raw.startsWith(ANCHOR_PREFIX)) return null
  const id = raw.slice(ANCHOR_PREFIX.length)
  return (BLOCK_IDS as readonly string[]).includes(id) ? (id as BlockId) : null
}

export const sectionOf = (data: LogBlockData, kind: SectionKind): LogSection | undefined => data.sections.find((s) => s.kind === kind)
/** ¿La sección contiene transcripción (y no solo notas editoriales como «No consta un prompt…»)? */
export const hasTranscript = (s: LogSection | undefined): boolean => !!s && s.paragraphs.some((p) => p.k !== 'note')
/** Texto que copia «Copiar prompt»: solo el prompt para Claude, párrafo a párrafo, sin notas editoriales ni encabezados añadidos. */
export const promptText = (s: LogSection | undefined): string => (s ? s.paragraphs.filter((p) => p.k !== 'note').map((p) => p.t).join('\n\n') : '')
