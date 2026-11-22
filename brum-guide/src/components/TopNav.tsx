import { useEffect, useState } from 'react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { LanguageMenu } from './LanguageMenu';
import { ThemeSwitch } from './ThemeSwitch';

export type AppArea = 'guide' | 'journal';

/**
 * Enlaces relativos al documento actual: funcionan igual en `/` y en `/<repo>/`.
 * En la guía, "#/" es un cambio de hash (sin recarga); desde el diario, "./" abre index.html.
 */
const hrefs: Record<AppArea, { guide: string; journal: string }> = {
  guide: { guide: '#/', journal: './diario.html' },
  journal: { guide: './', journal: './diario.html' },
};

export function TopNav({ area }: { area: AppArea }) {
  const { t } = usePreferences();
  const [scrolled, setScrolled] = useState(false);

  // Efecto de borde de scroll: la separación aparece solo cuando hay contenido debajo.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = hrefs[area];

  return (
    <header className="topnav material" data-scrolled={scrolled}>
      <div className="topnav__inner">
        <a className="topnav__brand" href={links.guide} aria-label={t.shell.brandLabel}>
          <span className="topnav__mark" aria-hidden="true">
            B
          </span>
          <span className="topnav__wordmark">{t.meta.siteName}</span>
        </a>

        <nav className="topnav__nav" aria-label={t.shell.primaryNav}>
          <a className="topnav__link" href={links.guide} aria-current={area === 'guide' ? 'page' : undefined}>
            {t.shell.navGuide}
          </a>
          <a className="topnav__link" href={links.journal} aria-current={area === 'journal' ? 'page' : undefined}>
            {t.shell.navJournal}
          </a>
        </nav>

        <div className="topnav__controls">
          <LanguageMenu />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
