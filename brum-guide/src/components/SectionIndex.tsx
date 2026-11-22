import { useEffect, useRef, useState } from 'react';
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

  // Mientras dura un desplazamiento lanzado desde el índice, se ignoran los avisos intermedios.
  const lock = useRef(false);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => !!x);
    // Sección actual: la última cuyo inicio ya ha pasado el 35 % superior de la ventana.
    // Se calcula sobre todas las secciones (no solo las que cambian), así el resultado
    // no depende del orden de los avisos. Solo cambia el estado si cambia la sección.
    const update = () => {
      if (lock.current) return;
      const line = window.innerHeight * 0.35;
      let current = targets[0]?.id;
      for (const t of targets) if (t.getBoundingClientRect().top <= line) current = t.id;
      if (current) setActive(current);
    };
    const io = new IntersectionObserver(update, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    lock.current = true;
    const release = () => {
      lock.current = false;
      window.removeEventListener('scrollend', release);
    };
    window.addEventListener('scrollend', release);
    window.setTimeout(release, 1500); // respaldo si el navegador no emite scrollend
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
