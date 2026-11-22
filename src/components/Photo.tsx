import { useEffect, useState, type CSSProperties } from 'react';
import { getPhoto } from '../content/media';
import { usePreferences } from '../preferences/PreferencesProvider';
import placeholderUrl from '../assets/placeholders/photo-pending.svg';
import { useOnlineStatus } from '../pwa/useOnlineStatus';

interface PhotoProps {
  id: string | undefined;
  /** Atributo `sizes` para elegir variante. */
  sizes: string;
  /** Primera vista: carga inmediata y prioridad alta. El resto, diferida. */
  priority?: boolean;
  /** Recorte forzado (ancho/alto). Sin él se respeta la proporción original. */
  ratio?: number;
  className?: string;
  /** Muestra el crédito o el estado del permiso bajo la imagen. */
  caption?: boolean;
  /** En tarjetas la foto es decorativa: el título ya nombra el lugar. */
  decorative?: boolean;
}

/**
 * Foto con espacio reservado (aspect-ratio en el marco + width/height en <img>)
 * para evitar saltos de layout. Sin autorización confirmada se muestra el recurso
 * provisional local en la misma caja; el original nunca se publica.
 */
export function Photo({ id, sizes, priority = false, ratio, className, caption = false, decorative = false }: PhotoProps) {
  const { t, lang } = usePreferences();
  const photo = getPhoto(id);
  const online = useOnlineStatus();
  // La foto no se pudo cargar (p. ej. sin conexión y sin copia en caché).
  const [failed, setFailed] = useState(false);
  // Al recuperar la conexión se reintenta la carga.
  useEffect(() => {
    if (online) setFailed(false);
  }, [online]);
  const w = photo?.rights.width ?? 16;
  const h = photo?.rights.height ?? 9;
  // --ratio permite que el CSS de cada contexto (p. ej. la portada) imponga otro recorte.
  const frameStyle = { '--ratio': String(ratio ?? w / h) } as CSSProperties;
  const classes = ['photo', className].filter(Boolean).join(' ');

  if (photo?.image && failed) {
    const message = online ? t.photo.unavailable : t.photo.unavailableOffline;
    return (
      <figure className={`${classes} photo--unavailable`} aria-hidden={decorative || undefined}>
        <div className="photo__frame" style={frameStyle} aria-hidden="true">
          <img src={placeholderUrl} alt="" width={w} height={h} />
          <span className="photo__badge">{message}</span>
        </div>
        {!decorative && (
          <figcaption className="photo__caption">
            {message}. {photo.rights.alt[lang]}
          </figcaption>
        )}
      </figure>
    );
  }

  if (photo?.image) {
    const { image, rights } = photo;
    // Crédito visible: autor cuando consta. La licencia y el origen quedan en docs/photo-rights.md.
    const credit = rights.author;
    return (
      <figure className={classes}>
        <div className="photo__frame" style={frameStyle}>
          <picture>
            <source type="image/webp" srcSet={image.srcSetWebp} sizes={sizes} />
            <img
              src={image.fallback}
              srcSet={image.srcSetJpg}
              sizes={sizes}
              width={image.width}
              height={image.height}
              alt={decorative ? '' : rights.alt[lang]}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onError={() => setFailed(true)}
            />
          </picture>
        </div>
        {caption && credit && (
          <figcaption className="photo__caption">
            {t.photo.credit} {credit}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`${classes} photo--pending`} aria-hidden={decorative || undefined}>
      {/* El marco provisional no aporta información: se oculta y, si procede, lo explica el pie. */}
      <div className="photo__frame" style={frameStyle} aria-hidden="true">
        <img src={placeholderUrl} alt="" width={w} height={h} loading={priority ? 'eager' : 'lazy'} decoding="async" />
        <span className="photo__badge">{t.photo.pendingShort}</span>
      </div>
      {caption && !decorative && <figcaption className="photo__caption">{t.photo.pendingCaption}</figcaption>}
    </figure>
  );
}
