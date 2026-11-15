import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const browser = await chromium.connectOverCDP('http://127.0.0.1:9223')
try {
  const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes('app/index.html'))
  assert(page, 'The native window must load app/index.html')
  await page.locator('button').first().waitFor({ state: 'attached', timeout: 30000 })
  const buttons = await page.locator('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || e.textContent.trim()).filter(Boolean))
  assert(buttons.some((s) => /Continuar|Continue|Añadir|Add/.test(s)), 'The native renderer must expose Tempora controls')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Accessibility.enable')
  const tree = await cdp.send('Accessibility.getFullAXTree')
  const namedNodes = tree.nodes.filter((n) => n.name?.value)
  assert(namedNodes.length > 2, 'The native renderer must expose accessibility names')
  const report = { application: 'Tempora', nativeWindow: true, entry: page.url(), title: await page.title(), buttons: buttons.length, accessibleNames: namedNodes.length, scope: 'Windows Tauri startup, real WebView2 DOM and Chromium accessibility tree. This is not a physical screen-reader test.' }
  await writeFile('desktop-smoke.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
} finally { await browser.close() }
