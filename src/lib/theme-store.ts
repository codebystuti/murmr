import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => {
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          // Apply the attribute synchronously so CSS transitions fire immediately
          document.documentElement.setAttribute('data-theme', next);
          // Force all elements onto the same 300ms timing, overriding inline styles
          document.documentElement.classList.add('theme-transitioning');
          if (transitionTimer !== null) clearTimeout(transitionTimer);
          transitionTimer = setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
            transitionTimer = null;
          }, 350);
          return { theme: next };
        });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    { name: 'murmr-theme' }
  )
);
