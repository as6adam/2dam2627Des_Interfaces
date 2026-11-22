import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { HOME_HERO_PHOTO, HOME_INSET_PHOTO, HOME_STRIP_PHOTOS } from '../content/media';
import { Photo } from '../components/Photo';
import { Link } from 'react-router';
import { pick } from '../i18n';
import { sectors } from '../content/queries';
import { motionTokens, scrollSmoothing } from '../motion/springs';
import { useMediaQuery, useMotionPrefs, WIDE_QUERY } from '../motion/useMotionPrefs';

/**
 * Apertura fotográfica con profundidad ligada al scroll.
 *
 * Principios observados en la referencia y cómo se adaptan:
 * - Sección `zoom`: el marco de la foto entra desde translateY(17vw) scale(1.5)
 *   y se asienta en scale(1). Aquí el marco se abre de 0,86 a 1 mientras la
 *   imagen interior se asienta de 1,18 a 1. Al ir en sentidos opuestos, ese
 *   contraste es lo que da profundidad.
 * - Sección `night`: capas a distinta velocidad. Aquí una segunda foto (la
 *   Biblioteca desde el canal) sube en primer plano más deprisa que el fondo.
 * - Lección invertida: el texto nunca queda a medio opacar en reposo.
 *
 * Técnica: scroll nativo + `position: sticky` solo en este escenario (escritorio).
 * useScroll → MotionValues → transform/opacity. No hay estado de React por frame.
 * Móvil: sin escenario fijo ni paralaje; solo un leve asentamiento de la imagen.
 * Movimiento reducido: composición estática, sin recorrido extra.
 */
export function PhotoOpening() {
  const { reduce } = useMotionPrefs();
  const wide = useMediaQuery(WIDE_QUERY);
  // Al cambiar de modo se remonta para que useScroll tome los nuevos offsets.
  const mode = reduce ? 'static' : wide ? 'stage' : 'compact';
  return <OpeningInner key={mode} mode={mode} />;
}

type Mode = 'static' | 'stage' | 'compact';

function OpeningInner({ mode }: { mode: Mode }) {
  const { t, lang } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const o = motionTokens.opening;

  const { scrollYProgress } = useScroll({
    target: ref,
    // Escenario: progreso mientras el escenario está fijo. Compacto: mientras la sección sale.
    offset: mode === 'stage' ? ['start start', 'end end'] : ['start start', 'end start'],
  });
  const p = useSpring(scrollYProgress, scrollSmoothing);

  const frameScale = useTransform(p, [0, 0.55], [o.frameScaleFrom, 1]);
  const imageScale = useTransform(p, [0, 0.85], [mode === 'stage' ? o.imageScaleFrom : o.mobileImageScaleFrom, 1]);
  const insetY = useTransform(p, [0.18, 0.72], [`${o.insetRiseFromPct}%`, '0%']);
  const insetOpacity = useTransform(p, [0.18, 0.4], [0, 1]);
  const sceneOpacity = useTransform(p, [0.46, 0.78], [0, 1]);
  const sceneScale = useTransform(p, [0.46, 1], [1.12, 1]);
  const copyY = useTransform(p, [0, 1], [0, -o.copyRisePx]);
  // Móvil: la capa frontal sube un poco más deprisa que la foto al salir (separación de planos).
  const insetMobileY = useTransform(p, [0, 1], [0, -motionTokens.openingMobile.insetRisePx]);

  const animated = mode !== 'static';
  const stage = mode === 'stage';

  return (
    <section
      ref={ref}
      className={`opening opening--${mode}`}
      data-sc-act="opening"
      aria-labelledby="home-title"
      // Recorrido del escenario fijo (solo escritorio animado): el scroll sigue siendo nativo.
      style={stage ? { height: `${o.runwayVh}vh` } : undefined}
    >
      <div className="opening__stage">
        <motion.div className="opening__frame" style={stage ? { scale: frameScale } : undefined}>
          <motion.div className="opening__image" style={animated ? { scale: imageScale } : undefined}>
            <Photo id={HOME_HERO_PHOTO} className="opening__photo" sizes="(min-width: 1120px) 1120px, 100vw" priority />
          </motion.div>
          {stage && <motion.div aria-hidden="true" className="opening__scene" style={{opacity: sceneOpacity, scale: sceneScale}}><Photo id={HOME_STRIP_PHOTOS[1]} className="opening__photo" sizes="100vw" decorative /></motion.div>}
        </motion.div>

        {stage && (
          <motion.div className="opening__inset" style={{ y: insetY, opacity: insetOpacity }}>
            <Photo id={HOME_INSET_PHOTO} className="opening__inset-photo" sizes="300px" ratio={2 / 3} />
          </motion.div>
        )}
        {mode === 'compact' && (
          <motion.div className="opening__inset" style={{ y: insetMobileY }}>
            <Photo id={HOME_INSET_PHOTO} className="opening__inset-photo" sizes="160px" ratio={2 / 3} />
          </motion.div>
        )}
        {mode === 'static' && (
          <div className="opening__inset">
            <Photo id={HOME_INSET_PHOTO} className="opening__inset-photo" sizes="300px" ratio={2 / 3} />
          </div>
        )}

        <motion.div className="opening__copy" style={stage ? { y: copyY } : undefined}>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 id="home-title" className="display" tabIndex={-1}>
            {t.home.title}
          </h1>
          <p className="lead">{t.home.lead}</p>
          {/* Navegación real (no una pista de scroll): cada sector es un enlace. */}
          <nav className="opening__nav" aria-labelledby="opening-nav-label">
            <p id="opening-nav-label" className="opening__nav-label">
              {t.home.openingCue}
            </p>
            <ul className="opening__chips" role="list">
              {sectors.map((sector) => (
                <li key={sector.id}>
                  <Link className="chip opening__chip" to={`/sector/${sector.id}`} data-accent={sector.accent}>
                    {pick(sector.name, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
