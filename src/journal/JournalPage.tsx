import { usePreferences } from '../preferences/PreferencesProvider';
import { format, formatDate, pick } from '../i18n';
import { journal } from '../content/journal';
import { AppShell } from '../components/AppShell';
import { ChevronLeftIcon } from '../components/icons';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { JournalEntryView } from './JournalEntryView';
import { Reveal, RevealItem } from '../components/Reveal';

export function JournalPage() {
  const { t, lang } = usePreferences();
  useDocumentTitle(t.meta.journalTitle);

  return (
    <AppShell area="journal">
      <div className="view journal">
        <header className="page-header">
          <p className="eyebrow">{t.journal.eyebrow}</p>
          <h1 className="title-1" tabIndex={-1}>
            {t.journal.title}
          </h1>
          <p className="lead">{t.journal.lead}</p>
        </header>

        <section className="section" aria-labelledby="entries-title">
          <h2 id="entries-title" className="visually-hidden">
            {t.journal.entriesTitle}
          </h2>
          <Reveal as="ol" group className="journal__list" role="list">
            {journal.map((entry) => (
              <RevealItem as="li" key={entry.id}>
                <JournalEntryView
                  entry={entry}
                  lang={lang}
                  phaseLabel={format(t.journal.phase, { phase: entry.phase })}
                  dateLabel={formatDate(entry.date, lang)}
                  title={pick(entry.title, lang)}
                />
              </RevealItem>
            ))}
          </Reveal>
        </section>

        <a className="back-link" href="./">
          <ChevronLeftIcon size={18} />
          {t.journal.backToGuide}
        </a>
      </div>
    </AppShell>
  );
}
