// Sirve `dist/` sin fallback SPA, en la raíz o bajo una subruta:
//   npm run serve:dist                       → http://127.0.0.1:4180/
//   npm run serve:dist -- --prefix /mi-repo/ → http://127.0.0.1:4180/mi-repo/
// (usa un servidor HTTP: una base relativa no elimina las restricciones del navegador con file://).
import { createStaticServer, listen, normalizePrefix } from './static-server.mjs'

const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] ? args[i + 1] : fallback }
const dir = opt('dir', 'dist'), prefix = normalizePrefix(opt('prefix', '/')), want = Number(opt('port', '4180'))
const port = await listen(createStaticServer(dir, prefix), want)
console.log(`Sirviendo ${dir}/ en http://127.0.0.1:${port}${prefix}  (sin fallback SPA; Ctrl+C para salir)`)
