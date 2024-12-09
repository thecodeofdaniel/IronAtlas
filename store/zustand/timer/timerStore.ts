import { create } from 'zustand';

interface TimerState {
  seconds: number;
  isPaused: boolean;
  isActive: boolean;
  actions: {
    startTimer: (initialSeconds: number) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => void;
    tick: () => void;
    incrementTimer: (seconds: number) => void;
    decrementTimer: (seconds: number) => void;
  };
}

export const useTimerStore = create<TimerState>((set) => ({
  seconds: 0,
  isPaused: true,
  isActive: false,
  actions: {
    startTimer: (initialSeconds: number) =>
      set({ seconds: initialSeconds, isPaused: false, isActive: true }),
    pauseTimer: () => set({ isPaused: true }),
    resumeTimer: () => set({ isPaused: false }),
    stopTimer: () => set({ seconds: 0, isPaused: true, isActive: false }),
    tick: () => set((state) => ({ seconds: Math.max(0, state.seconds - 1) })),
    incrementTimer: (seconds) =>
      set((state) => ({ seconds: state.seconds + seconds })),
    decrementTimer: (seconds) =>
      set((state) => ({ seconds: state.seconds - seconds })),
  },
}));
