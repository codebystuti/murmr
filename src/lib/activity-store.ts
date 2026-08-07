import { create } from 'zustand';

interface ActivityStore {
  unseenCount: number;
  markSeen: () => void;
  increment: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  unseenCount: 0,
  markSeen: () => set({ unseenCount: 0 }),
  increment: () => set((s) => ({ unseenCount: s.unseenCount + 1 })),
}));
