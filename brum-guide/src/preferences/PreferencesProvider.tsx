import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dictionaries, type Dictionary } from '../i18n';
import { readStored, writeStored } from './storage';
import {
  DEFAULT_LANG,
  DEFAULT_THEME,
  STORAGE_KEYS,
  isLang,
  isTheme,
  type Lang,
  type Theme,
} from './storageKeys';

interface PreferencesValue {
  lang: Lang;
  theme: Theme;
  t: Dictionary;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  /** false si el navegador rechazó la última escritura (solo informativo). */
  persisted: boolean;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const THEME_COLOR: Record<Theme, string> = { light: '#f5f2ee', dark: '#121315' };

/** Estado inicial: el que dejó aplicado el script de arranque en <html>. */
function initialLang(): Lang {
  const fromDom = document.documentElement.lang;
  if (isLang(fromDom)) return fromDom;
  const stored = readStored(STORAGE_KEYS.lang);
  return isLang(stored) ? stored : DEFAULT_LANG;
}

function initialTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme;
  if (isTheme(fromDom)) return fromDom;
  const stored = readStored(STORAGE_KEYS.theme);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sincroniza otras pestañas/entradas abiertas a la vez (guía ↔ diario).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.lang && isLang(e.newValue)) setLangState(e.newValue);
      if (e.key === STORAGE_KEYS.theme && isTheme(e.newValue)) setThemeState(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setPersisted(writeStored(STORAGE_KEYS.lang, next));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    // Transición de color suave (HIG: evitar saltos bruscos de brillo).
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 320);
    setThemeState(next);
    setPersisted(writeStored(STORAGE_KEYS.theme, next));
  }, []);

  const value = useMemo<PreferencesValue>(
    () => ({ lang, theme, t: dictionaries[lang], setLang, setTheme, persisted }),
    [lang, theme, setLang, setTheme, persisted],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>');
  return ctx;
}
