import { useEffect, useState } from 'react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { LanguageMenu } from './LanguageMenu';
import { ThemeSwitch } from './ThemeSwitch';

export type AppArea = 'guide' | 'journal';

/**
 * Enlaces relativos al documento actual: funcionan igual en `/` y en `/<repo>/`.
 * En la guía, "#/" es un cambio de hash (sin recarga); desde el diario, "./" abre index.html.
 */
const hrefs: Record<AppArea, { guide: string; plan: string; journal: string }> = {
  guide: { guide: '#/', plan: '#/plan', journal: './diario.html' },
  journal: { guide: './', plan: './#/plan', journal: './diario.html' },
};

export function TopNav({ area, section }: { area: AppArea; section?: 'guide' | 'plan' }) {
  const { t } = usePreferences();
  const inPlan = area === 'guide' && section === 'plan';
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
          <a className="topnav__link" href={links.guide} aria-current={area === 'guide' && !inPlan ? 'page' : undefined}>
            {t.shell.navGuide}
          </a>
          <a className="topnav__link" href={links.plan} aria-current={inPlan ? 'page' : undefined}>
            {t.shell.navPlan}
          </a>
          <a
            className="topnav__link"
            href={links.journal}
            aria-label={t.shell.navJournal}
            aria-current={area === 'journal' ? 'page' : undefined}
          >
            <span className="topnav__long">{t.shell.navJournal}</span>
            <span className="topnav__short">{t.shell.navJournalShort}</span>
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
