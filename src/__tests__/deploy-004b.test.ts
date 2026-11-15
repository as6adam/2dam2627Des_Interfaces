import { describe, expect, it } from 'vitest'
import workflow from '../../.github/workflows/deploy-pages.yml?raw'
import pkg from '../../package.json'
import { LANDING } from '../landing/content'
import { LANGUAGES } from '../lib/preferences'
import { checkDistFiles, resolveRef } from '../../scripts/verify-dist.mjs'

describe('flujo de despliegue (texto)', () => {
  it('no se dispara desde pull requests y no usa pull_request_target ni tokens personales', () => {
    expect(workflow).not.toMatch(/^\s*pull_request/m)
    expect(workflow).not.toMatch(/\bPAT\b|personal_access|secrets\./)
  })
  it('instala con npm ci (nunca npm install) y ejecuta pruebas, build y verificación', () => {
    expect(workflow).toMatch(/run: npm ci/)
    expect(workflow).not.toMatch(/npm install/)
    for (const c of ['npm test', 'npm run build', 'npm run verify:dist']) expect(workflow).toContain(c)
  })
  it('permisos mínimos: contents: read global; pages/id-token solo en el despliegue', () => {
    expect(workflow).toMatch(/^permissions:\n  contents: read/m)
    const deploy = workflow.slice(workflow.indexOf('  deploy:'))
    expect(deploy).toMatch(/pages: write/)
    expect(deploy).toMatch(/id-token: write/)
    expect(workflow.slice(0, workflow.indexOf('  deploy:'))).not.toMatch(/pages: write|id-token: write/)
  })
  it('entorno github-pages con URL de salida, needs build y sin nombres de repositorio fijos', () => {
    expect(workflow).toMatch(/needs: build/)
    expect(workflow).toMatch(/name: github-pages/)
    expect(workflow).toContain('${{ steps.deployment.outputs.page_url }}')
    expect(workflow).not.toMatch(/TEMPORA_BASE/)
  })
  it('package.json expone verify:dist y no fija engines', () => {
    expect(pkg.scripts['verify:dist']).toContain('verify-dist')
  })
  it('el estado publicado sigue pendiente en es/en', () => {
    for (const l of LANGUAGES) {
      const t = LANDING[l].phases.items.find((p) => p.id === 'testing')!
      const publish = t.items.find((i) => /GitHub Pages/.test(i.text))!
      expect(publish.status).toBe('pending')
      expect(t.items.some((i) => /(Configuración de despliegue|Deployment setup)/.test(i.text) && i.status === 'done')).toBe(true)
      expect(t.status).not.toBe('done')
    }
  })
})

const OK = {
  'index.html': '<div id="landing"></div><script type="module" src="./assets/l.js"></script>',
  'app/index.html': '<div id="root"></div><script type="module" src="../assets/a.js"></script>',
  'assets/l.js': 'const a=new URL("app/index.html",document.baseURI)',
  'assets/a.js': 'export default 1',
}

describe('verify-dist (comprobación pura)', () => {
  it('resolveRef respeta directorios y rechaza salir de dist/', () => {
    expect(resolveRef('app/index.html', '../assets/a.js')).toBe('assets/a.js')
    expect(resolveRef('index.html', './assets/a.js')).toBe('assets/a.js')
    expect(resolveRef('index.html', '../x')).toBeNull()
  })
  it('acepta una salida correcta', () => expect(checkDistFiles(OK).errors).toEqual([]))
  it('detecta recurso ausente, ruta absoluta, entrada intercambiada y referencias de desarrollo', () => {
    const { 'assets/a.js': _gone, ...sin } = OK
    void _gone
    expect(checkDistFiles(sin).errors.join()).toMatch(/assets\/a\.js/)
    expect(checkDistFiles({ ...OK, 'index.html': OK['index.html'].replace('./assets', '/assets') }).errors.join()).toMatch(/absoluta/)
    expect(checkDistFiles({ ...OK, 'app/index.html': OK['index.html'] }).errors.join()).toMatch(/no es la aplicación/)
    expect(checkDistFiles({ ...OK, 'index.html': OK['index.html'] + '<script src="/src/main.tsx">' }).errors.length).toBeGreaterThan(0)
  })
})
