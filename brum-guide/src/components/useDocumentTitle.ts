import { useEffect } from 'react';
import { usePreferences } from '../preferences/PreferencesProvider';

/** Título de pestaña traducido: "<página> · Brum". */
export function useDocumentTitle(page: string) {
  const { t } = usePreferences();
  useEffect(() => {
    document.title = `${page} · ${t.meta.siteName}`;
  }, [page, t.meta.siteName]);
}
