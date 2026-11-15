/**
 * Estado del aviso «no se pudo guardar la preferencia». Función pura (sin React ni almacenamiento): se prueba aparte.
 *
 *  - Un fallo repetido NO acumula avisos: hay como mucho UNO (un único booleano visible).
 *  - Un guardado correcto lo retira: nunca queda un aviso viejo mientras el almacenamiento vuelve a funcionar.
 *  - No existe estado de «guardado con éxito»: la página no confirma nada que no se pueda comprobar.
 *  - Cerrarlo lo oculta durante esta visita; no reaparece en cada cambio posterior (ya se avisó).
 */
export interface SaveNoticeState { failed: boolean; dismissed: boolean }
export const INITIAL_SAVE_NOTICE: SaveNoticeState = { failed: false, dismissed: false }

/** `saved` es el resultado booleano de `saveSharedPref`. */
export function applySaveResult(state: SaveNoticeState, saved: boolean): SaveNoticeState {
  if (saved) return state.failed || state.dismissed ? INITIAL_SAVE_NOTICE : state
  return state.failed ? state : { ...state, failed: true }
}
export const dismissSaveNotice = (state: SaveNoticeState): SaveNoticeState => (state.dismissed ? state : { ...state, dismissed: true })
export const isSaveNoticeVisible = (state: SaveNoticeState): boolean => state.failed && !state.dismissed
