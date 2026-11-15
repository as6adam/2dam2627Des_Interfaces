import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolveBase } from './config/base'

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Dos entradas HTML estáticas (sin router, sin redirecciones de servidor):
//   /index.html      → landing (src/landing/main.tsx)
//   /app/index.html  → aplicación (src/main.tsx)
// `base` por defecto es relativa ('./'); para una subruta absoluta: TEMPORA_BASE=/mi-repo/ npm run build (ver README).
export default defineConfig({
  base: resolveBase(process.env.TEMPORA_BASE),
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true, watch: { ignored: ['**/src-tauri/**'] } },
  build: {
    rollupOptions: { input: { landing: here('./index.html'), app: here('./app/index.html') } },
  },
})
