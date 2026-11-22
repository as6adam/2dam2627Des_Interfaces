import { useId, useRef } from 'react';
import { motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { HOME_STRIP_PHOTOS } from '../content/media';
import { Photo } from '../components/Photo';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { PRESS_SCALE, springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';

/**
 * Tira de bienvenida. En móvil es un carrusel con scroll-snap nativo, que conserva
 * el impulso y el rebote del sistema. El gesto de deslizar tiene dos equivalentes:
 * botones anterior/siguiente visibles y flechas del teclado sobre la región enfocada.
 */
export function PhotoStrip() {
  const { t } = usePreferences();
  const { reduce } = useMotionPrefs();
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const step = (dir: 1 | -1) => {
    const list = listRef.current;
    const item = list?.querySelector('li');
    if (!list || !item) return;
    list.scrollBy({ left: dir * (item.getBoundingClientRect().width + 12), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section className="section strip-section" aria-labelledby={`${id}-title`}>
      <div className="section__header">
        <h2 id={`${id}-title`} className="title-3">
          {t.home.welcomeLabel}
        </h2>
        <div className="strip__controls">
          {([-1, 1] as const).map((dir) => (
            <motion.button
              key={dir}
              type="button"
              className="icon-button"
              aria-controls={`${id}-list`}
              aria-label={dir < 0 ? t.home.stripPrev : t.home.stripNext}
              onClick={() => step(dir)}
              whileTap={{ scale: PRESS_SCALE }}
              transition={springs.press}
            >
              {dir < 0 ? <ChevronLeftIcon size={18} /> : <ChevronRightIcon size={18} />}
            </motion.button>
          ))}
        </div>
      </div>
      {/* tabIndex=0: la región desplazable se puede recorrer con las flechas */}
      <ul id={`${id}-list`} ref={listRef} className="strip" role="list" tabIndex={0} aria-label={t.home.welcomeLabel}>
        {HOME_STRIP_PHOTOS.map((photoId) => (
          <li key={photoId}>
            <Photo id={photoId} sizes="(min-width: 1120px) 270px, (min-width: 700px) 24vw, 70vw" ratio={4 / 5} />
          </li>
        ))}
      </ul>
    </section>
  );
}
