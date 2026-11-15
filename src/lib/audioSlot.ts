import { create } from 'zustand'
/** Contenedor VISIBLE donde vive el reproductor de YouTube (lo registra el panel derecho al montarse). */
export const useAudioSlot = create<{ el: HTMLElement | null }>()(() => ({ el: null }))
export const setAudioSlot = (el: HTMLElement | null) => useAudioSlot.setState({ el })
