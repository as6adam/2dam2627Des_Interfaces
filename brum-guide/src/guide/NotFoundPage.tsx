import { Link } from 'react-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useDocumentTitle } from '../components/useDocumentTitle';

/** Estado de ruta desconocida (hash inexistente, sector o lugar sin ficha). */
export function NotFoundPage() {
  const { t } = usePreferences();
  useDocumentTitle(t.meta.notFoundTitle);
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title" className="title-1" tabIndex={-1}>
        {t.notFound.title}
      </h1>
      <p className="lead">{t.notFound.body}</p>
      <Link className="button button--primary" to="/">
        {t.notFound.cta}
      </Link>
    </section>
  );
}
