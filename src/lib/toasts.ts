import { create } from 'zustand'

/** Avisos dentro de la aplicación (alternativa cuando no puede mostrarse una notificación del sistema). No depende de `store.ts`. */
export interface Toast { id: number; title: string; body: string }
interface ToastState {
  toasts: Toast[]
  push: (title: string, body: string) => void
  dismiss: (id: number) => void
}
let nextId = 1
const MAX = 3

export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  // Un aviso idéntico no se apila: sustituye al anterior (evita duplicados equivalentes).
  push: (title, body) => set((s) => ({ toasts: [...s.toasts.filter((t) => !(t.title === title && t.body === body)), { id: nextId++, title, body }].slice(-MAX) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
