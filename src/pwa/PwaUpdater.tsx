import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { PRESS_SCALE, springs } from '../motion/springs';
import { useMotionPrefs } from '../motion/useMotionPrefs';

/** El aviso informativo «lista sin conexión» se retira solo; el de actualización no. */
const READY_NOTICE_MS = 8000;

/** Cada cuánto se pregunta al servidor si hay un worker nuevo (además de al cargar). */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/**
 * Registro del service worker y avisos bilingües:
 * - «Hay una versión nueva»: la actualización solo se aplica al pulsar «Actualizar»
 *   (SKIP_WAITING → controllerchange → recarga). «Más tarde» la deja en espera.
 * - «Lista para usarse sin conexión»: tras la primera instalación.
 *
 * El aviso no roba el foco (no interrumpe la lectura) y se anuncia como región
 * de estado. Entra y sale por el mismo borde inferior con un muelle crítico
 * (HIG: coherencia espacial); con movimiento reducido, solo un fundido.
 */
export function PwaUpdater() {
  const { t } = usePreferences();
  const { pick, reduce } = useMotionPrefs();
  const timer = useRef<number | undefined>(undefined);
  const toastRef = useRef<HTMLDivElement>(null);
  const held = useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      timer.current = window.setInterval(() => {
        if (navigator.onLine) void registration.update();
      }, UPDATE_CHECK_MS);
    },
  });

  useEffect(() => () => window.clearInterval(timer.current), []);

  // Retira «lista sin conexión» a los 8 s, salvo que el visitante esté interactuando con él.
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const id = window.setInterval(() => {
      if (!held.current) setOfflineReady(false);
    }, READY_NOTICE_MS);
    return () => window.clearInterval(id);
  }, [offlineReady, needRefresh, setOfflineReady]);

  const visible = needRefresh || offlineReady;
  const offscreen = reduce ? { opacity: 0 } : { opacity: 0, y: 24 };

  return (
    <div className="pwa-toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={needRefresh ? 'update' : 'ready'}
            ref={toastRef}
            className="pwa-toast"
            onPointerEnter={() => (held.current = true)}
            onPointerLeave={() => (held.current = false)}
            onFocus={() => (held.current = true)}
            onBlur={() => (held.current = false)}
            data-kind={needRefresh ? 'update' : 'ready'}
            initial={offscreen}
            animate={{ opacity: 1, y: 0 }}
            exit={offscreen}
            transition={pick(springs.move)}
          >
            <div className="pwa-toast__text">
              <p className="pwa-toast__title">{needRefresh ? t.pwa.updateTitle : t.pwa.offlineReadyTitle}</p>
              <p className="pwa-toast__body">{needRefresh ? t.pwa.updateBody : t.pwa.offlineReadyBody}</p>
            </div>
            <div className="pwa-toast__actions">
              {needRefresh ? (
                <>
                  <motion.button
                    type="button"
                    className="pwa-toast__button"
                    onClick={() => setNeedRefresh(false)}
                    whileTap={{ scale: PRESS_SCALE }}
                    transition={springs.press}
                  >
                    {t.pwa.later}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="pwa-toast__button pwa-toast__button--primary"
                    onClick={() => void updateServiceWorker(true)}
                    whileTap={{ scale: PRESS_SCALE }}
                    transition={springs.press}
                  >
                    {t.pwa.updateAction}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  type="button"
                  className="pwa-toast__button"
                  onClick={() => setOfflineReady(false)}
                  whileTap={{ scale: PRESS_SCALE }}
                  transition={springs.press}
                >
                  {t.pwa.dismiss}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
