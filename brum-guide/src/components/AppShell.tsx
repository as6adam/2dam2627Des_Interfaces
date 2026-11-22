import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { PwaUpdater } from '../pwa/PwaUpdater';
import { TopNav, type AppArea } from './TopNav';

/**
 * Armazón común a guía y diario: enlace de salto, barra superior translúcida,
 * estado sin conexión, contenido principal, pie con la versión y avisos de la PWA.
 * `reducedMotion="user"` hace que Motion respete la preferencia del sistema.
 */
export function AppShell({ area, section, children }: { area: AppArea; section?: 'guide' | 'plan'; children: ReactNode }) {
  const { t } = usePreferences();
  return (
    <MotionConfig reducedMotion="user">
      {/* El hash lo usa el router: se enfoca el contenido sin tocar la URL. */}
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {t.shell.skipToContent}
      </a>
      <TopNav area={area} section={section} />
      <OfflineBanner />
      <main id="main" className="shell-main" tabIndex={-1}>
        {children}
      </main>
      <footer className="shell-footer" data-app-version={__APP_VERSION__}>
        <p>{t.shell.footerNote}</p>
        <nav className="shell-footer__links" aria-label={t.shell.footerPlan}>
          <a className="text-link" href="./#/plan">{t.shell.footerPlan}</a>
          <a className="text-link" href="./#/plan/map">{t.shell.footerMap}</a>
          <a className="text-link" href="./#/useful-numbers">{t.shell.numbers}</a>
        </nav>
      </footer>
      <PwaUpdater />
    </MotionConfig>
  );
}
