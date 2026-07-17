import { create } from 'zustand';

interface UIState {
  dark: boolean;
  toggleDark: () => void;
}

const initialDark =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useUI = create<UIState>((set) => ({
  dark: initialDark,
  toggleDark: () => set((s) => ({ dark: !s.dark })),
}));
