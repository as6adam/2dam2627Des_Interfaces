import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PRESS_SCALE, springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';

export interface IndexItem {
  id: string;
  label: string;
}

/**
 * Índice de la ficha. Adapta la subnavegación fija con anclas de la referencia:
 * - Escritorio: columna `sticky` localizada junto al contenido (solo dentro de la ficha).
 * - Móvil: fila de botones al inicio del contenido, sin fijar.
 * La sección activa se detecta con IntersectionObserver; el estado de React solo
 * cambia cuando cambia la sección, no en cada frame. Cada botón lleva el foco al
 * título de su sección (equivalente de teclado del desplazamiento).
 */
export function SectionIndex({ label, items }: { label: string; items: IndexItem[] }) {
  const { reduce } = useMotionPrefs();
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => !!x);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const heading = section.querySelector<HTMLElement>('h2, h3');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    setActive(id);
  };

  return (
    <nav className="section-index" aria-label={label}>
      <p className="section-index__label" aria-hidden="true">
        {label}
      </p>
      <ul role="list">
        {items.map((item) => (
          <li key={item.id}>
            <motion.button
              type="button"
              className="section-index__item"
              aria-current={active === item.id ? 'location' : undefined}
              onClick={() => go(item.id)}
              whileTap={{ scale: PRESS_SCALE }}
              transition={springs.press}
            >
              {item.label}
            </motion.button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
