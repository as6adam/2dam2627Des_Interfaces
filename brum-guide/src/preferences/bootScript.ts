import { DEFAULT_LANG, DEFAULT_THEME, LANGS, STORAGE_KEYS, THEMES } from './storageKeys.ts';

/**
 * Script clásico que Vite inserta al principio de <head> en index.html y diario.html.
 * Se ejecuta antes del primer pintado: aplica tema e idioma guardados (si son válidos)
 * para evitar el destello de tema incorrecto. Si localStorage falla, usa es + claro.
 */
export function buildThemeBootScript(): string {
  const cfg = JSON.stringify({
    k: STORAGE_KEYS,
    langs: LANGS,
    themes: THEMES,
    dl: DEFAULT_LANG,
    dt: DEFAULT_THEME,
  });
  return `(function(){var c=${cfg};var l=c.dl,t=c.dt;try{var sl=localStorage.getItem(c.k.lang),st=localStorage.getItem(c.k.theme);if(c.langs.indexOf(sl)>-1)l=sl;if(c.themes.indexOf(st)>-1)t=st;}catch(e){}var d=document.documentElement;d.lang=l;d.dataset.theme=t;d.style.colorScheme=t;})();`;
}
