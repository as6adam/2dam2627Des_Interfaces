import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSafeStorage } from './storage'
import { cleanProgress, EMPTY_PROGRESS, type ProgressData, type FocusEntry } from './advanced'

interface ProgressState extends ProgressData {
  toggleCompleted: (id: string) => void
  recordFocus: (entry: FocusEntry) => void
}
export const useProgress = create<ProgressState>()(persist((set) => ({
  ...EMPTY_PROGRESS,
  toggleCompleted: (id) => set((s) => { const completed = { ...s.completed }; if (completed[id]) delete completed[id]; else completed[id] = new Date().toISOString(); return { completed } }),
  recordFocus: (entry) => set((s) => s.focusLog.some((i) => i.id === entry.id) ? s : { focusLog: [...s.focusLog, entry] }),
}), {
  name: 'tempora-progress-v1', version: 1, storage: createSafeStorage<ProgressData>(),
  partialize: (s) => ({ completed: s.completed, focusLog: s.focusLog }),
  merge: (saved, current) => ({ ...current, ...cleanProgress(saved) }),
}))
