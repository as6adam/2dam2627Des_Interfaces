import { AnimatePresence, motion } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Estado sin conexión: explica qué sigue funcionando y qué no, en lugar de
 * un error genérico. Aparece bajo la barra superior (nace de ella) y no tapa
 * contenido interactivo.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = usePreferences();
  const { pick, reduce } = useMotionPrefs();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: -8 };
  return (
    <div className="offline-region" role="status" aria-live="polite">
      <AnimatePresence>
        {!online && (
          <motion.div
            className="offline-banner"
            initial={hidden}
            animate={{ opacity: 1, y: 0 }}
            exit={hidden}
            transition={pick(springs.popover)}
          >
            <div className="offline-banner__inner">
              <span className="offline-banner__dot" aria-hidden="true" />
              <p>
                <strong>{t.pwa.offlineTitle}.</strong> {t.pwa.offlineBody}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
