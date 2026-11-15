/**
 * Registro de desarrollo (bitácora). Separa dos cosas:
 *  - CONTENIDO ORIGINAL ÚNICO (`LogBlockData`): transcripciones tal como constan en el documento fuente, en su idioma
 *    original. No se duplica ni se traduce por idioma de la interfaz. Se extrae con scripts/extract-bitacora.py.
 *  - METADATOS Y ETIQUETAS TRADUCIBLES (`log/text.ts`): títulos, objetivos y textos de la interfaz en es/en.
 */
export type BlockId = 'analysis' | '001' | '002a' | '002b' | '002c' | '003a' | '003b' | '003c' | '004a' | '004b' | '004c'
export const BLOCK_IDS: readonly BlockId[] = ['analysis', '001', '002a', '002b', '002c', '003a', '003b', '003c', '004a', '004b', '004c']
export type PhaseNumber = 1 | 2 | 3 | 4

export type SectionKind = 'userPrompt' | 'progress' | 'gptResponse' | 'claudePrompt' | 'gptContinuation' | 'claudeResponse'

/** `text`/`table` = transcripción literal; `note` = nota editorial del propio documento (no es una transcripción). */
export interface LogParagraph { k: 'text' | 'table' | 'note'; t: string; s: string }
export interface LogSection { kind: SectionKind; sourceHeading: string; paragraphs: LogParagraph[] }
export interface LogBlockData { id: BlockId; phase: PhaseNumber; phaseSourceHeading: string; sourceHeading: string; sections: LogSection[] }

/** Índice ligero (se carga con la landing). Las transcripciones, no. */
export interface ManifestBlock {
  id: BlockId; phase: PhaseNumber; phaseSourceHeading: string; sourceHeading: string
  objective: string; gptRefs: string[]; pageMap: string
  gptPages: [number, number]; claudePages: [number, number] | null
  sections: { kind: SectionKind; paragraphs: number; chars: number }[]
  chars: number; sha256: string
}
export interface Manifest {
  source: { file: string; sha256: string; paragraphs: number; blocks: number }
  traceNotes: string[]; excludedNotes: string[]; blocks: ManifestBlock[]
}
