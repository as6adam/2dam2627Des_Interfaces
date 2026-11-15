/** Copia al portapapeles con respaldo; devuelve false si no fue posible (permiso denegado, contexto no seguro…). */
export interface ClipboardEnv {
  nav?: { clipboard?: { writeText?: (t: string) => Promise<void> } }
  doc?: Pick<Document, 'createElement' | 'body' | 'execCommand'>
}
export async function copyText(text: string, env: ClipboardEnv = { nav: typeof navigator === 'undefined' ? undefined : navigator, doc: typeof document === 'undefined' ? undefined : document }): Promise<boolean> {
  try {
    if (env.nav?.clipboard?.writeText) { await env.nav.clipboard.writeText(text); return true }
  } catch { /* se prueba el respaldo */ }
  try {
    const doc = env.doc
    if (!doc) return false
    const area = doc.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    doc.body.appendChild(area)
    area.select()
    const ok = doc.execCommand('copy')
    area.remove()
    return ok
  } catch { return false }
}
