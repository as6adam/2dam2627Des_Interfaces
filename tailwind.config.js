const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // Ambas entradas: la landing (index.html + src/landing) y la aplicación (app/index.html + el resto de src).
  content: ['./index.html', './app/index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Mismos puntos de ruptura que `src/lib/layout.ts` (BREAKPOINTS); una prueba los compara.
    // `wide` (1200) = navegación fija junto al calendario; `lg` (1024) = concentración fija; `md` (768) = tableta.
    screens: { sm: '640px', md: '768px', lg: '1024px', wide: '1200px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: { accent: v('accent'), 'on-accent': v('on-accent'), ink: v('ink'), sub: v('sub'), line: v('line'), glass: v('glass') },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI Variable Display"', '"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [
    // `touch:` = puntero principal táctil O ancho de móvil: objetivos táctiles cómodos (≥44 px) donde se toca con el dedo.
    // `landscape-short:` = móvil apaisado (poca altura): barras compactas.
    ({ addVariant }) => addVariant('landscape-short', '@media (orientation: landscape) and (max-height: 500px)'),
    ({ addVariant }) => addVariant('touch', ['@media (pointer: coarse)', '@media (max-width: 767.98px)']),
  ],
}
