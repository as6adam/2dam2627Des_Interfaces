import { create } from 'zustand'

/** ¿Falla la escritura en el almacenamiento local? (cuota llena, bloqueado, modo privado…). La app sigue en memoria. */
export const useStorageHealth = create<{ failing: boolean }>()(() => ({ failing: false }))
export const reportStorageWrite = (ok: boolean) => { if (useStorageHealth.getState().failing === ok) useStorageHealth.setState({ failing: !ok }) }
