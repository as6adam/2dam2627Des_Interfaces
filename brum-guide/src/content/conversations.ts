import meta from './conversations/index.json';

/**
 * Parejas prompt/respuesta del diario (src/content/conversations/).
 * Cada intervención vive en su propio archivo de texto; index.json fija el orden,
 * la herramienta, la numeración y el estado. Solo se publican las entradas con
 * `status: "published"` y contenido en ambos archivos.
 */
export type ConversationTool = 'chatgpt' | 'claude';

interface IndexEntry {
  id: string;
  order: number;
  tool: ConversationTool;
  number: number;
  status: 'published' | 'draft';
  promptFile: string;
  responseFile: string;
  redactions: number;
}

export interface Conversation {
  id: string;
  order: number;
  tool: ConversationTool;
  number: number;
  prompt: string;
  response: string;
  redactions: number;
}

const files = import.meta.glob<string>('./conversations/*.{txt,md}', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const read = (name: string) => (files[`./conversations/${name}`] ?? '').replace(/\r\n/g, '\n').trimEnd();

const index = meta as { declaredModels: string[]; declaredTools: string[]; entries: IndexEntry[] };

/** Modelos tal como los declara el documento fuente. */
export const declaredModels = index.declaredModels;

export const conversations: Conversation[] = index.entries
  .filter((e) => e.status === 'published')
  .map((e) => ({
    id: e.id,
    order: e.order,
    tool: e.tool,
    number: e.number,
    prompt: read(e.promptFile),
    response: read(e.responseFile),
    redactions: e.redactions,
  }))
  .filter((c) => c.prompt && c.response)
  .sort((a, b) => a.order - b.order);

/** Recuento por herramienta de las parejas publicadas. */
export const countsByTool = conversations.reduce<Record<ConversationTool, number>>(
  (acc, c) => ((acc[c.tool] += 1), acc),
  { chatgpt: 0, claude: 0 },
);

/** Modelo declarado para cada herramienta (por coincidencia de nombre en el documento). */
export function modelFor(tool: ConversationTool): string | undefined {
  return declaredModels.find((m) => (tool === 'chatgpt' ? /^GPT/i.test(m) : /opus|sonnet|haiku|claude/i.test(m)));
}
