// Valida el artefacto `dist/` ANTES de subirlo a Pages.
//   node scripts/verify-dist.mjs [dir]          → comprobación estática + servidor HTTP sin fallback (raíz y subruta)
//   node scripts/verify-dist.mjs [dir] --no-http → solo la comprobación estática
// Sale con código 1 si algo falla. `checkDistFiles` es pura (mapa de archivos en memoria) y la prueban los tests.
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createStaticServer, listen } from './static-server.mjs'

const TEXT = /\.(html|js|mjs|css|json|svg|txt)$/i
const posix = (p) => p.split(sep).join('/')
const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '')
const isExternal = (u) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u)

/** Resuelve `ref` respecto al archivo `from` (rutas relativas a dist/, con «/»). Devuelve null si sale de dist/. */
export function resolveRef(from, ref) {
  const clean = ref.split(/[?#]/)[0]
  const parts = (clean.startsWith('/') ? clean.slice(1) : dirOf(from) + clean).split('/')
  const out = []
  for (const p of parts) { if (p === '' || p === '.') continue; if (p === '..') { if (!out.length) return null; out.pop() } else out.push(p) }
  return out.join('/')
}

const DEV_MARKERS = [/\/src\/(main|landing\/main)\.tsx/, /@vite\/client/, /@react-refresh/, /localhost:1420/]
const refsInHtml = (html) => [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map((m) => m[1]).filter((u) => !isExternal(u))
const refsInCss = (css) => [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]).filter((u) => !isExternal(u) && !u.startsWith('data:'))
const refsInJs = (js) => [
  ...[...js.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)].map((m) => m[1]),
  ...[...js.matchAll(/import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)].map((m) => m[1]),
  ...[...js.matchAll(/new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)].map((m) => m[1]),
].filter((u) => !isExternal(u))

/**
 * @param {Record<string, string|Uint8Array>} files  ruta relativa a dist/ (con «/») → contenido (texto como string)
 * @param {{ base?: string }} [opts] base con la que se compiló ('./' por defecto, o '/subruta/')
 * @returns {{ errors: string[], checks: string[] }}
 */
export function checkDistFiles(files, { base = './' } = {}) {
  const errors = [], checks = []
  const has = (p) => Object.prototype.hasOwnProperty.call(files, p)
  const text = (p) => (typeof files[p] === 'string' ? files[p] : '')
  const check = (label, bad) => { if (bad.length) errors.push(...bad.map((b) => `${label}: ${b}`)); else checks.push(label) }
  const relative = base === './'

  // 1. Entradas
  check('existen dist/index.html y dist/app/index.html', ['index.html', 'app/index.html'].filter((f) => !has(f)).map((f) => `falta dist/${f}`))
  const htmls = ['index.html', 'app/index.html'].filter(has)

  // 2. Cada entrada es la correcta (no una copia de la otra)
  const bad = []
  if (has('index.html') && !(text('index.html').includes('id="landing"') && !text('index.html').includes('id="root"'))) bad.push('dist/index.html no es la landing (#landing)')
  if (has('app/index.html') && !(text('app/index.html').includes('id="root"') && !text('app/index.html').includes('id="landing"'))) bad.push('dist/app/index.html no es la aplicación (#root)')
  check('la raíz es la landing y /app/ es la aplicación', bad)

  // 3. Referencias locales de HTML, CSS y JS existen y siguen la base
  const missing = [], absolute = []
  const visit = (from, refs) => {
    for (const ref of refs) {
      let target
      if (relative) {
        if (ref.startsWith('/')) { absolute.push(`${from} → ${ref} (ruta absoluta en una compilación relativa: se rompería bajo una subruta)`); continue }
        target = resolveRef(from, ref)
      } else {
        if (!ref.startsWith(base) && ref.startsWith('/')) { absolute.push(`${from} → ${ref} (no empieza por la base ${base})`); continue }
        target = ref.startsWith('/') ? resolveRef(from, ref.slice(base.length - 1)) : resolveRef(from, ref)
      }
      if (target === null || target === '') { if (target === null) missing.push(`${from} → ${ref} (sale de dist/)`); continue }
      if (!has(target) && !has(target.replace(/\/$/, '') + '/index.html')) missing.push(`${from} → ${ref}`)
    }
  }
  for (const f of htmls) visit(f, refsInHtml(text(f)))
  for (const f of Object.keys(files)) {
    if (f.endsWith('.js')) visit(f, refsInJs(text(f)))
    if (f.endsWith('.css')) visit(f, refsInCss(text(f)))
  }
  check('los recursos locales (HTML, CSS, imports y URL de JS) existen', missing)
  check(relative ? 'las URL son relativas (sin rutas absolutas)' : `las URL empiezan por la base ${base}`, absolute)

  // 4. Sin referencias de desarrollo
  const dev = []
  // Los JSON del registro son TRANSCRIPCIONES (pueden mencionar /src/main.tsx o localhost): solo se examina código y páginas.
  for (const [f, c] of Object.entries(files)) if (typeof c === 'string' && TEXT.test(f) && !f.endsWith('.json')) for (const re of DEV_MARKERS) if (re.test(c)) dev.push(`${f} contiene ${re}`)
  check('sin referencias de desarrollo (/src/main.tsx, @vite/client, localhost:1420)', dev)

  // 5. El enlace de la landing apunta a la aplicación correcta
  const link = []
  const scripts = has('index.html') ? refsInHtml(text('index.html')).filter((r) => /\.js$/.test(r)).map((r) => resolveRef('index.html', r)).filter(Boolean) : []
  const landingJs = scripts.map((s) => text(s)).join('\n')
  if (!landingJs) link.push('no se encontró el script de la landing')
  else {
    if (!landingJs.includes('app/index.html')) link.push('el código de la landing no contiene el enlace app/index.html')
    if (/["'`]\/app\//.test(landingJs)) link.push('la landing enlaza a /app/ absoluto (ignora la subruta)')
  }
  check('«Ir a Tempora» apunta a app/index.html respetando la base', link)

  // 6. La landing no arrastra el reproductor de la aplicación
  const closure = new Set(), queue = [...scripts]
  while (queue.length) { const f = queue.pop(); if (closure.has(f) || !has(f)) continue; closure.add(f); for (const r of refsInJs(text(f))) { const t = resolveRef(f, r); if (t && t.endsWith('.js')) queue.push(t) } }
  const player = [...closure].filter((f) => /youtube\.com\/iframe_api/.test(text(f)))
  check('la landing (y sus imports) no incluye el reproductor de YouTube', player.map((f) => `${f} contiene el cargador de la API de YouTube`))
  return { errors, checks }
}

export async function loadDist(dir) {
  const files = {}
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) await walk(p)
      else { const rel = posix(relative(dir, p)); files[rel] = TEXT.test(e.name) ? await readFile(p, 'utf8') : new Uint8Array(await readFile(p)) }
    }
  }
  await walk(dir)
  return files
}

const TYPE_OK = { '.json': /json/, '.js': /javascript/, '.css': /text\/css/, '.png': /image\/png/, '.html': /text\/html/ }

/** Rastrea la salida a través de un servidor SIN fallback, en la raíz y bajo una subruta de prueba. */
export async function crawlOverHttp(dir, files) {
  const errors = [], checks = []
  for (const prefix of ['/', '/subruta-de-prueba/tempora/']) {
    const server = createStaticServer(dir, prefix)
    const port = await listen(server)
    const origin = `http://127.0.0.1:${port}`
    const label = (s) => `[${prefix}] ${s}`
    const get = (path) => fetch(origin + path, { redirect: 'manual' })
    try {
      const miss = await get(prefix + 'no-existe-este-archivo.js')
      ;(miss.status === 404 ? checks : errors).push(label(`una ruta inexistente responde 404 (sin fallback SPA): ${miss.status}`))
      const bad = []
      const seen = new Set()
      const fetchChecked = async (path, expected) => {
        if (seen.has(path)) return null
        seen.add(path)
        const r = await get(path)
        const ext = path.endsWith('/') ? '.html' : (path.match(/\.[a-z0-9]+$/i) ?? [''])[0].toLowerCase()
        const type = r.headers.get('content-type') ?? ''
        if (r.status !== 200) bad.push(`${path} → ${r.status}`)
        else if (TYPE_OK[ext] && !TYPE_OK[ext].test(type)) bad.push(`${path} → content-type ${type} (¿una página en lugar del archivo?)`)
        else if (ext !== '.html' && /text\/html/.test(type)) bad.push(`${path} devuelve HTML en lugar de un recurso`)
        const body = r.status === 200 ? Buffer.from(await r.arrayBuffer()) : null
        if (body && expected && !body.toString('utf8').includes(expected)) bad.push(`${path} no contiene ${expected}`)
        return body ? body.toString('utf8') : null
      }
      const landing = await fetchChecked(prefix, 'id="landing"')
      const landingFile = await fetchChecked(prefix + 'index.html', 'id="landing"')
      const app = await fetchChecked(prefix + 'app/index.html', 'id="root"')
      const appDir = await fetchChecked(prefix + 'app/', 'id="root"') // como Pages: /app/ sirve app/index.html
      for (const [page, pagePath] of [[landingFile, prefix + 'index.html'], [app, prefix + 'app/index.html']]) {
        if (!page) continue
        for (const ref of refsInHtml(page)) {
          const t = resolveRef(pagePath.slice(prefix.length), ref.startsWith('/') ? ref.slice(prefix.length) : ref)
          if (t) await fetchChecked(prefix + t)
        }
      }
      // Recursos referenciados desde CSS/JS (imports, URL, url())
      for (const f of Object.keys(files)) {
        if (!/^assets\/.+\.(js|css)$/.test(f)) continue
        const refs = f.endsWith('.css') ? refsInCss(files[f]) : refsInJs(files[f])
        for (const ref of refs) { const t = resolveRef(f, ref); if (t) await fetchChecked(prefix + t) }
      }
      // El enlace de la landing lleva a la app (no a la landing)
      void landing; void appDir
      const appUrl = new URL('./app/index.html', origin + prefix + 'index.html')
      const target = await (await get(appUrl.pathname)).text()
      if (!target.includes('id="root"') || target.includes('id="landing"')) bad.push(`${appUrl.pathname} no es la aplicación`)
      ;(bad.length ? errors : checks).push(...(bad.length ? bad.map((b) => label(b)) : [label(`landing, app, /app/ y ${seen.size} recursos se resuelven con 200 y el tipo correcto`)]))
    } finally { server.close() }
  }
  return { errors, checks }
}

async function main() {
  const args = process.argv.slice(2)
  const dir = args.find((a) => !a.startsWith('--')) ?? 'dist'
  const files = await loadDist(dir).catch((e) => { console.error(`No se pudo leer ${dir}/: ${e.message}`); process.exit(1) })
  const res = checkDistFiles(files, { base: process.env.TEMPORA_BASE ? `/${process.env.TEMPORA_BASE.replace(/^\/+|\/+$/g, '')}/` : './' })
  if (!args.includes('--no-http')) { const net = await crawlOverHttp(dir, files); res.errors.push(...net.errors); res.checks.push(...net.checks) }
  for (const c of res.checks) console.log('✓', c)
  for (const e of res.errors) console.error('✗', e)
  if (res.errors.length) { console.error(`\n${res.errors.length} problema(s) en ${dir}/: NO subir este artefacto.`); process.exit(1) }
  console.log(`\n${dir}/ validado (${Object.keys(files).length} archivos).`)
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
