import type { ReactNode } from 'react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useOnlineStatus } from '../pwa/useOnlineStatus';

/**
 * Enlace a un servicio externo (mapa, fuentes). Se abre en otra pestaña y,
 * sin conexión, avisa de que necesita red en lugar de fallar en silencio.
 */
export function ExternalLink({ href, children, lang }: { href: string; children: ReactNode; lang?: string }) {
  const { t } = usePreferences();
  const online = useOnlineStatus();
  return (
    <span className="external-link" data-offline={!online || undefined}>
      <a className="text-link" href={href} target="_blank" rel="noopener noreferrer" lang={lang}>
        {children}
        <span className="visually-hidden"> {t.place.newTab}</span>
      </a>
      {!online && <span className="external-link__note">{t.pwa.needsConnection}</span>}
    </span>
  );
}
