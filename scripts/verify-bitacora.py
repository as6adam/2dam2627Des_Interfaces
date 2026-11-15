#!/usr/bin/env python3
"""Comprueba la fidelidad de src/landing/log/ frente al DOCX con una extracción INDEPENDIENTE (XML crudo, sin python-docx).

    python3 scripts/verify-bitacora.py <tempora-bitacora-estructurada.docx>

Compara, en el orden del documento, cada párrafo no vacío de contenido (excluida la portada y la instrucción
«Para la landing…») con los párrafos de los JSON; solo se permite normalizar blancos (espacios/saltos) al comparar.
Sale con código 1 ante cualquier omisión, duplicado, reordenación o diferencia.
"""
import hashlib, json, re, sys, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
if len(sys.argv) != 2: sys.exit(__doc__)
root = Path(__file__).resolve().parent.parent / 'src' / 'landing' / 'log'
tree = ET.fromstring(zipfile.ZipFile(sys.argv[1]).read('word/document.xml'))
canon = lambda n: re.sub(r'^heading (\d)$', lambda m: 'Heading ' + m[1], n)  # el XML guarda «heading 1»
styles = {s.get(W + 'styleId'): canon(s.find(W + 'name').get(W + 'val')) for s in ET.fromstring(zipfile.ZipFile(sys.argv[1]).read('word/styles.xml')).iter(W + 'style')}

def text_of(p):
    out = []
    for el in p.iter():
        if el.tag == W + 't': out.append(el.text or '')
        elif el.tag == W + 'tab': out.append('\t')
        elif el.tag in (W + 'br', W + 'cr'): out.append('\n')
    return ''.join(out)

paras = []
for p in tree.iter(W + 'p'):
    ps = p.find(W + 'pPr/' + W + 'pStyle')
    paras.append((styles.get(ps.get(W + 'val'), 'Normal') if ps is not None else 'Normal', text_of(p)))
start = next(i for i, (s, t) in enumerate(paras) if s == 'Heading 1' and t.startswith('Fase 1'))
ws = lambda s: re.sub(r'\s+', ' ', s).strip()
expected = [ws(t) for s, t in paras[start:] if s in ('Source', 'TranscriptTable', 'Normal', 'Reference') and t.strip()]

manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
got, hash_errors = [], []
for b in manifest['blocks']:
    raw = (root / 'blocks' / f"{b['id']}.json").read_text(encoding='utf-8')
    if hashlib.sha256(raw[:-1].encode('utf-8')).hexdigest() != b['sha256']: hash_errors.append(b['id'])
    block = json.loads(raw)
    got.append(ws(b['objective']))
    got += [ws(r) for r in b['gptRefs']]
    for s in block['sections']: got += [ws(p['t']) for p in s['paragraphs']]
# Orden del documento: objetivo, referencias GPT, secciones… (el objetivo y las referencias van antes de las secciones)
errors = ['hash del bloque no coincide con el manifiesto: ' + ', '.join(hash_errors)] if hash_errors else []
if len(expected) != len(got): errors.append(f'párrafos: DOCX={len(expected)} web={len(got)}')
for i, (a, b) in enumerate(zip(expected, got)):
    if a != b: errors.append(f'párrafo {i}: difiere\n  DOCX: {a[:140]}\n  web : {b[:140]}'); 
    if len(errors) > 8: break
if sorted(expected) != sorted(got): errors.append('los multiconjuntos de párrafos no coinciden (omisiones o duplicados)')
chars_docx = sum(len(re.sub(r'\s+', '', t)) for t in expected); chars_web = sum(len(re.sub(r'\s+', '', t)) for t in got)
print(f'bloques: {len(manifest["blocks"])}  párrafos DOCX: {len(expected)}  web: {len(got)}  caracteres sin blancos: {chars_docx}/{chars_web}')
if errors:
    print('\n'.join('✗ ' + e for e in errors)); sys.exit(1)
print('✓ Texto idéntico salvo blancos; sin omisiones, duplicados ni reordenaciones.')
