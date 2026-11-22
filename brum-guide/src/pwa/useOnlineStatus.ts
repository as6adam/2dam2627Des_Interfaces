import { useSyncExternalStore } from 'react';

/**
 * Estado de conexión del navegador. Solo cambia con los eventos online/offline,
 * nunca por sondeo. `navigator.onLine` = false es fiable (sin red); true solo
 * indica que hay red, así que las fotos además tratan su propio error de carga.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
