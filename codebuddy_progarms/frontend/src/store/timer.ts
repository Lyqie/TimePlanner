import { create } from 'zustand';

export type TimerMode = 'focus' | 'break' | 'longBreak';

interface TimerState {
  running: boolean;
  mode: TimerMode;
  remaining: number; // 秒
  workMin: number;
  breakMin: number;
  longBreakMin: number;
  roundsBeforeLong: number;
  round: number;
  autoStart: boolean;
  taskId: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setRemaining: (sec: number) => void;
  setTask: (id: string | null) => void;
  setDurations: (p: Partial<Pick<TimerState, 'workMin' | 'breakMin' | 'longBreakMin' | 'roundsBeforeLong'>>) => void;
  setAutoStart: (v: boolean) => void;
  switchMode: (m: TimerMode) => void;
}

const durationFor = (s: TimerState, m: TimerMode) =>
  (m === 'focus' ? s.workMin : m === 'break' ? s.breakMin : s.longBreakMin) * 60;

export const useTimer = create<TimerState>((set) => ({
  running: false,
  mode: 'focus',
  remaining: 25 * 60,
  workMin: 25,
  breakMin: 5,
  longBreakMin: 15,
  roundsBeforeLong: 4,
  round: 0,
  autoStart: false,
  taskId: null,
  start: () => set({ running: true }),
  pause: () => set({ running: false }),
  reset: () => set((s) => ({ running: false, remaining: durationFor(s, s.mode) })),
  setRemaining: (sec) => set({ remaining: sec }),
  setTask: (id) => set({ taskId: id }),
  setDurations: (p) =>
    set((s) => {
      const next = { ...s, ...p };
      return { ...next, remaining: s.running ? s.remaining : durationFor(next, next.mode) };
    }),
  setAutoStart: (v) => set({ autoStart: v }),
  switchMode: (m) => set((s) => ({ mode: m, remaining: durationFor(s, m), running: false })),
}));
