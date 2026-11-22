import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { LANGS, type Lang } from '../preferences/storageKeys';
import { springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { CheckIcon, GlobeIcon } from './icons';

/**
 * Botón de globo + menú de idioma (patrón WAI-ARIA "menu button" con menuitemradio).
 * Teclado: Enter/Espacio/↓ abre y enfoca el idioma activo, ↑ abre en el último,
 * ↑/↓/Inicio/Fin navegan, Enter/Espacio eligen, Escape cierra y devuelve el foco.
 * El menú nace del botón (transform-origin anclado arriba a la derecha).
 */
export function LanguageMenu() {
  const { lang, setLang, t } = usePreferences();
  const { pick, reduce } = useMotionPrefs();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const menuId = useId();

  const focusItem = (index: number) => {
    const n = LANGS.length;
    itemRefs.current[((index % n) + n) % n]?.focus();
  };

  const openMenu = (focusIndex: number) => {
    pendingFocus.current = focusIndex;
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // Enfoca el elemento solicitado una vez montado el menú.
  useEffect(() => {
    if (open && pendingFocus.current !== null) {
      focusItem(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [open]);

  // Cierra al pulsar fuera (pointerdown: respuesta inmediata, también en táctil).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const activeIndex = LANGS.indexOf(lang);

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu(activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu(LANGS.length - 1);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      close(true);
    }
  };

  const choose = (next: Lang) => {
    setLang(next);
    close(true);
  };

  const onItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(LANGS.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  return (
    <div className="lang-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-button lang-menu__button"
        aria-label={t.language.buttonLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openMenu(activeIndex))}
        onKeyDown={onButtonKeyDown}
      >
        <GlobeIcon size={20} />
        <span className="lang-menu__code" aria-hidden="true">
          {lang.toUpperCase()}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={t.language.menuLabel}
            className="lang-menu__popover"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -6 }}
            transition={pick(springs.popover)}
          >
            {LANGS.map((code, index) => {
              const checked = code === lang;
              return (
                <button
                  key={code}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={checked}
                  tabIndex={-1}
                  lang={code}
                  className="lang-menu__item"
                  onClick={() => choose(code)}
                  onKeyDown={(e) => onItemKeyDown(e, index)}
                >
                  <span>{t.language.names[code]}</span>
                  <CheckIcon size={18} className="lang-menu__check" data-visible={checked} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
