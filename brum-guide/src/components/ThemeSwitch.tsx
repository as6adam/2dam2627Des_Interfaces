import { useRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { THEMES, type Theme } from '../preferences/storageKeys';
import { springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { MoonIcon, SunIcon } from './icons';

/**
 * Control segmentado Claro/Oscuro (radiogroup con tabindex itinerante).
 * La "píldora" activa se desplaza con un muelle críticamente amortiguado
 * y parte siempre de su posición actual, así que se puede interrumpir.
 */
export function ThemeSwitch() {
  const { theme, setTheme, t } = usePreferences();
  const { pick } = useMotionPrefs();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const labels: Record<Theme, string> = { light: t.theme.light, dark: t.theme.dark };
  const icons: Record<Theme, typeof SunIcon> = { light: SunIcon, dark: MoonIcon };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const n = THEMES.length;
    const next = ((index + delta) % n + n) % n;
    const nextTheme = THEMES[next];
    if (!nextTheme) return;
    setTheme(nextTheme);
    refs.current[next]?.focus();
  };

  return (
    <div className="segmented" role="radiogroup" aria-label={t.theme.groupLabel}>
      {THEMES.map((value, index) => {
        const checked = value === theme;
        const Icon = icons[value];
        return (
          <button
            key={value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="segmented__option"
            onClick={() => setTheme(value)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {checked && (
              <motion.span
                layoutId="theme-thumb"
                className="segmented__thumb"
                transition={pick(springs.move)}
                aria-hidden="true"
              />
            )}
            <Icon size={18} className="segmented__icon" />
            <span className="segmented__label">{labels[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
