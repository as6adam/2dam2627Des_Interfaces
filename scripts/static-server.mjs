// Servidor estático mínimo y SIN fallback SPA, para comprobar `dist/` como lo serviría un hosting de archivos estáticos
// (GitHub Pages): una ruta inexistente responde 404, nunca la landing. Opcionalmente monta `dist/` bajo un prefijo
// (p. ej. /mi-repo/) para simular la subruta de un repositorio sin recompilar.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
}

/** `prefix` debe empezar y terminar en «/» (por defecto «/»). */
export function normalizePrefix(prefix = '/') {
  const body = String(prefix).trim().replace(/^\/+|\/+$/g, '')
  return body === '' ? '/' : `/${body}/`
}

export function createStaticServer(dir, prefix = '/') {
  const root = resolve(dir)
  const base = normalizePrefix(prefix)
  return createServer(async (req, res) => {
    const send = (code, body, type = 'text/plain; charset=utf-8', extra = {}) => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', ...extra }); res.end(body) }
    try {
      const url = new URL(req.url ?? '/', 'http://localhost')
      let pathname = decodeURIComponent(url.pathname)
      if (!pathname.startsWith(base)) return send(404, 'Not found (outside the base path)')
      pathname = pathname.slice(base.length - 1) // conserva la «/» inicial
      const file = normalize(join(root, pathname))
      if (file !== root && !file.startsWith(root + sep)) return send(403, 'Forbidden')
      let info = await stat(file).catch(() => null)
      if (info?.isDirectory()) {
        if (!pathname.endsWith('/')) return send(301, '', 'text/plain', { location: base.slice(0, -1) + pathname + '/' }) // como Pages: /app → /app/
        const index = join(file, 'index.html')
        info = await stat(index).catch(() => null)
        if (!info?.isFile()) return send(404, 'Not found')
        return send(200, await readFile(index), TYPES['.html'])
      }
      if (!info?.isFile()) return send(404, 'Not found') // sin fallback: una ruta que no es un archivo NO devuelve index.html
      return send(200, await readFile(file), TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream')
    } catch {
      return send(400, 'Bad request')
    }
  })
}

export function listen(server, port = 0, host = '127.0.0.1') {
  return new Promise((ok, fail) => { server.once('error', fail); server.listen(port, host, () => ok(server.address().port)) })
}
