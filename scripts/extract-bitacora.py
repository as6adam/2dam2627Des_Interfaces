#!/usr/bin/env python3
"""Extrae la bitácora (DOCX) a recursos estructurados del proyecto. SOLO se usa en desarrollo: el navegador nunca ve el DOCX.

    python3 scripts/extract-bitacora.py <tempora-bitacora-estructurada.docx>

Escribe src/landing/log/manifest.json (índice, referencias de página, notas de trazabilidad) y un JSON por bloque en
src/landing/log/blocks/. El texto se guarda TAL CUAL (sin resumir, corregir ni normalizar); la normalización de blancos
solo ocurre al comparar (scripts/verify-bitacora.py). Requiere python-docx (pip install python-docx).
"""
import hashlib, json, re, sys
from pathlib import Path
import docx

if len(sys.argv) != 2:
    sys.exit(__doc__)
src = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent / 'src' / 'landing' / 'log'
(root / 'blocks').mkdir(parents=True, exist_ok=True)
d = docx.Document(str(src))
P = [(p.style.name, p.text) for p in d.paragraphs]

KIND = {  # subencabezado de origen → tipo de sección
    'Prompt del usuario enviado a GPT': 'userPrompt',
    'Mensajes de progreso registrados de GPT': 'progress',
    'Respuesta de GPT anterior al prompt para Claude': 'gptResponse',
    'Continuación original de la respuesta de GPT': 'gptContinuation',
}
GROUP_KIND = {1: 'objective', 3: 'claudePrompt', 4: 'claudeResponse'}
# Transcripción (Source/TranscriptTable) frente a nota editorial del documento (Normal/Reference)
PKIND = {'Source': 'text', 'TranscriptTable': 'table', 'Normal': 'note', 'Reference': 'note'}

# ── Portada: criterios de trazabilidad (párrafos entre «Fuente y criterios…» y «Mapa de fases…») y mapa de páginas
def idx(style, startswith):
    return next(i for i, (s, t) in enumerate(P) if s == style and t.startswith(startswith))
i_crit, i_map, i_first = idx('Heading 1', 'Fuente y criterios'), idx('Heading 1', 'Mapa de fases'), idx('Heading 1', 'Fase 1')
crit = [t for s, t in P[i_crit + 1:i_map] if t.strip()]
# La última nota es una instrucción para quien implementa la landing, no contenido de la bitácora: se excluye (y se declara).
excluded = [t for t in crit if t.startswith('Para la landing:')]
trace_notes = [t for t in crit if t not in excluded]
pages = []
for s, t in P[i_map + 1:i_first]:
    if s != 'Reference' or not t.strip():
        continue
    g = re.search(r'GPT páginas (\d+) a (\d+)', t); c = re.search(r'Claude páginas (\d+) a (\d+)', t)
    pages.append({'map': t, 'gpt': [int(g[1]), int(g[2])], 'claude': [int(c[1]), int(c[2])] if c else None})

# ── Bloques
blocks, cur, phase, group, section = [], None, None, 0, None
def ident(h):
    if h.startswith('Análisis inicial'): return 'analysis'
    m = re.match(r'Iteración (\d{3}[A-C]?)\b', h); return m[1].lower()
def new_section(kind, heading):
    global section
    section = {'kind': kind, 'sourceHeading': heading, 'paragraphs': []}
    cur['sections'].append(section)
for style, text in P[i_first:]:
    if style == 'Heading 1':
        m = re.match(r'Fase (\d+)\s+(.*)', text); phase = {'number': int(m[1]), 'sourceHeading': text}
    elif style == 'Heading 2':
        cur = {'id': ident(text), 'phase': phase['number'], 'phaseSourceHeading': phase['sourceHeading'], 'sourceHeading': text, 'sections': []}
        blocks.append(cur); group, section = 0, None
    elif style == 'Heading 3':
        m = re.match(r'(\d) (.*)', text)
        if m: group = int(m[1]); section = None; new_section(GROUP_KIND[group], text) if group in GROUP_KIND else None
        else: new_section(KIND[text], text)
    elif text.strip():
        section['paragraphs'].append({'k': PKIND[style], 't': text, 's': style})
    # párrafos vacíos = separadores de maquetación: no se guardan

assert len(blocks) == 11 and len(pages) == 11, (len(blocks), len(pages))
manifest_blocks = []
for b, pg in zip(blocks, pages):
    assert pg['map'].startswith('Análisis inicial') if b['id'] == 'analysis' else f"TEMPORA-WEB-{b['id'].upper()}" in pg['map'], (b['id'], pg['map'])
    obj = b['sections'][0]
    objective = next(p['t'] for p in obj['paragraphs'] if p['s'] == 'Normal')
    gpt_refs = [p['t'] for p in obj['paragraphs'] if p['s'] == 'Reference']
    body = [s for s in b['sections'][1:]]
    b['sections'] = body
    text = json.dumps(b, ensure_ascii=False, indent=1)
    (root / 'blocks' / f"{b['id']}.json").write_text(text + '\n', encoding='utf-8')
    chars = sum(len(p['t']) for s in body for p in s['paragraphs'])
    manifest_blocks.append({
        'id': b['id'], 'phase': b['phase'], 'phaseSourceHeading': b['phaseSourceHeading'], 'sourceHeading': b['sourceHeading'],
        'objective': objective, 'gptRefs': gpt_refs, 'pageMap': pg['map'], 'gptPages': pg['gpt'], 'claudePages': pg['claude'],
        'sections': [{'kind': s['kind'], 'paragraphs': len(s['paragraphs']), 'chars': sum(len(p['t']) for p in s['paragraphs'])} for s in body],
        'chars': chars, 'sha256': hashlib.sha256(text.encode('utf-8')).hexdigest(),
    })
manifest = {
    'source': {'file': src.name, 'sha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'paragraphs': len(P), 'blocks': len(blocks)},
    'traceNotes': trace_notes, 'excludedNotes': excluded, 'blocks': manifest_blocks,
}
(root / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f"{len(blocks)} bloques, {sum(b['chars'] for b in manifest_blocks)} caracteres de transcripción → {root}")
