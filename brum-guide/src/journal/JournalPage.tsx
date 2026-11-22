import { usePreferences } from '../preferences/PreferencesProvider';
import { format } from '../i18n';
import { conversations, countsByTool, declaredModels } from '../content/conversations';
import { AppShell } from '../components/AppShell';
import { ChevronLeftIcon } from '../components/icons';
import { Reveal, RevealItem } from '../components/Reveal';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { ConversationEntry } from './ConversationEntry';

const TOOL_NAME = { chatgpt: 'ChatGPT', claude: 'Claude' } as const;

export function JournalPage() {
  const { t } = usePreferences();
  useDocumentTitle(t.journal.title);
  const roles = [
    { key: 'student', ...t.journal.roles.student },
    { key: 'chatgpt', ...t.journal.roles.chatgpt },
    { key: 'claude', ...t.journal.roles.claude },
  ];

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

        <section className="section journal__intro" aria-labelledby="about-title">
          <div className="journal__about">
            <div>
              <h2 id="about-title" className="title-3">
                {t.journal.aboutTitle}
              </h2>
              <p>{t.journal.aboutBody}</p>
            </div>
            <div>
              <h2 className="title-3">{t.journal.audienceTitle}</h2>
              <p>{t.journal.audienceBody}</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="roles-title">
          <h2 id="roles-title" className="title-2">
            {t.journal.rolesTitle}
          </h2>
          <p className="note">{t.journal.rolesLead}</p>
          <Reveal as="ul" group className="roles" role="list">
            {roles.map((r) => (
              <RevealItem as="li" key={r.key} className="role" data-role={r.key}>
                <p className="role__kind">{r.kind}</p>
                <h3 className="title-3">{r.name}</h3>
                <ul className="bullet-list">
                  {r.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </Reveal>
          <p className="journal__models">
            <span>{t.journal.modelsLabel}:</span>{' '}
            {declaredModels.map((m, i) => (
              <span key={m}>
                {i > 0 && ' · '}
                <code>{m}</code>
              </span>
            ))}
          </p>
        </section>

        <section className="section" aria-labelledby="conversations-title">
          <h2 id="conversations-title" className="title-2">
            {t.journal.conversationsTitle}
          </h2>
          <p className="note">{t.journal.conversationsLead}</p>
          <p className="section__count">{format(t.journal.count, { chatgpt: countsByTool.chatgpt, claude: countsByTool.claude })}</p>
          <p className="note">{t.journal.originalNote}</p>

          <nav className="conv-index" aria-label={t.journal.indexLabel}>
            <ol role="list">
              {conversations.map((c) => (
                <li key={c.id}>
                  <a href={`#conv-${c.id}`} data-tool={c.tool}>
                    {format(t.journal.promptLabel, { n: c.number, tool: TOOL_NAME[c.tool] })}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <ol className="conv-list" role="list">
            {conversations.map((c) => (
              <li key={c.id}>
                <ConversationEntry conversation={c} />
              </li>
            ))}
          </ol>
        </section>

        <a className="back-link" href="./">
          <ChevronLeftIcon size={18} />
          {t.journal.backToGuide}
        </a>
      </div>
    </AppShell>
  );
}
