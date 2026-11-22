import type { ReactNode } from 'react';

/**
 * Renderizado seguro de una respuesta: el texto se convierte en elementos React
 * (nunca innerHTML). Reconoce lo que usan las transcripciones:
 * - párrafos (se conservan los saltos de línea internos),
 * - listas con «-», «*» o «1.»,
 * - tablas separadas por tabuladores,
 * - árboles de carpetas y bloques ``` como texto preformateado,
 * - encabezados «#», **negrita**, `código` y enlaces [texto](destino), que se
 *   muestran como texto porque apuntan a archivos locales del proyecto.
 */
type Block =
  | { kind: 'p'; lines: string[] }
  | { kind: 'h'; level: number; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'pre'; text: string };

const LIST = /^\s*(?:[-*•]|\d+[.)])\s+/;
const ORDERED = /^\s*\d+[.)]\s+/;
const TREE = /[├└│]|^\s*[\w.-]+\/\s*(#.*)?$/;

export function parseTranscript(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^```/.test(line.trim())) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test((lines[i] ?? '').trim())) body.push(lines[i++] ?? '');
      i++;
      blocks.push({ kind: 'pre', text: body.join('\n') });
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ kind: 'h', level: h[1]!.length, text: h[2]! });
      i++;
      continue;
    }
    if (line.includes('\t')) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? '').includes('\t')) rows.push((lines[i++] ?? '').split('\t').map((c) => c.trim()));
      blocks.push({ kind: 'table', rows });
      continue;
    }
    if (TREE.test(line) && (TREE.test(lines[i + 1] ?? '') || /[├└│]/.test(line))) {
      const body: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim() && TREE.test(lines[i] ?? '')) body.push(lines[i++] ?? '');
      blocks.push({ kind: 'pre', text: body.join('\n') });
      continue;
    }
    if (LIST.test(line)) {
      const ordered = ORDERED.test(line);
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim()) {
        const l = lines[i] ?? '';
        if (LIST.test(l)) items.push(l.replace(LIST, ''));
        else if (/^\s+\S/.test(l) && items.length) items[items.length - 1] += `\n${l.trim()}`;
        else break;
        i++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && (lines[i] ?? '').trim() && !LIST.test(lines[i] ?? '') && !(lines[i] ?? '').includes('\t') && !/^#{1,4}\s/.test(lines[i] ?? '') && !/^```/.test((lines[i] ?? '').trim())) {
      para.push(lines[i++] ?? '');
    }
    if (para.length) blocks.push({ kind: 'p', lines: para });
    else i++;
  }
  return blocks;
}

/** **negrita**, `código` y [texto](destino) → elementos; el resto, texto. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={`${keyBase}-${k++}`}>{inline(m[1], `${keyBase}-b${k}`)}</strong>);
    else if (m[2] !== undefined) out.push(<code key={`${keyBase}-${k++}`}>{m[2]}</code>);
    else out.push(<span key={`${keyBase}-${k++}`} className="transcript__ref">{m[3]}</span>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderBlock(block: Block, key: string): ReactNode {
  switch (block.kind) {
    case 'h': {
      const Tag = block.level <= 2 ? "h5" : "h6";
      return (
        <Tag key={key} className="transcript__heading">
          {inline(block.text, key)}
        </Tag>
      );
    }
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag key={key} className="transcript__list">
          {block.items.map((item, i) => (
            <li key={i}>{inline(item, `${key}-${i}`)}</li>
          ))}
        </Tag>
      );
    }
    case 'table':
      return (
        <div key={key} className="transcript__table-wrap">
          <table className="transcript__table">
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) =>
                    r === 0 ? <th key={c} scope="col">{cell}</th> : c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>,
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'pre':
      return (
        <pre key={key} className="transcript__pre">
          {block.text}
        </pre>
      );
    case 'p':
      return (
        <p key={key} className="transcript__p">
          {inline(block.lines.join('\n'), key)}
        </p>
      );
  }
}
