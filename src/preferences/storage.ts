/**
 * Acceso a localStorage tolerante a fallos (modo privado, cuota, políticas).
 * Si falla, las preferencias siguen funcionando en memoria durante la sesión.
 */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
