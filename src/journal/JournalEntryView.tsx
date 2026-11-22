import type { JournalEntry } from '../content/types';
import type { Lang } from '../preferences/storageKeys';
import { pick } from '../i18n';

interface Props {
  entry: JournalEntry;
  lang: Lang;
  title: string;
  phaseLabel: string;
  dateLabel: string;
}

export function JournalEntryView({ entry, lang, title, phaseLabel, dateLabel }: Props) {
  const headingId = `entry-${entry.id}`;
  return (
    <article className="entry material-solid" aria-labelledby={headingId}>
      <p className="entry__meta">
        <span className="chip">{phaseLabel}</span>
        <time dateTime={entry.date}>{dateLabel}</time>
      </p>
      <h3 id={headingId} className="title-2">
        {title}
      </h3>
      <p className="entry__summary">{pick(entry.summary, lang)}</p>
      <div className="entry__body">
        {entry.body.map((p, i) => (
          <p key={i}>{pick(p, lang)}</p>
        ))}
      </div>
      {entry.tags.length > 0 && (
        <ul className="entry__tags" role="list">
          {entry.tags.map((tag) => (
            <li key={tag} className="chip chip--quiet" lang="en">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
