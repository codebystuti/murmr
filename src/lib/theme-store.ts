import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Must outlast the 400ms .theme-transitioning duration in globals.css, or fades get cut short.
const THEME_TRANSITION_MS = 500;
let transitionTimer: ReturnType<typeof setTimeout> | null = null;
// Latest requested theme, so repeated requests for the same theme don't restart the fade.
let requestedTheme: Theme | null = null;

function applyThemeWithTransition(next: Theme) {
  const root = document.documentElement;
  if ((requestedTheme ?? root.getAttribute('data-theme')) === next) return;
  requestedTheme = next;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.setAttribute('data-theme', next);
    return;
  }

  // Every element fades its colours on one shared timing (.theme-transitioning in globals.css), so
  // cards, text and backgrounds move together. Not a View Transition: its snapshot overlay swallows
  // every click on the page for the length of the fade.
  root.classList.add('theme-transitioning');
  root.setAttribute('data-theme', next);
  if (transitionTimer !== null) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    root.classList.remove('theme-transitioning');
    transitionTimer = null;
  }, THEME_TRANSITION_MS);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => {
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          applyThemeWithTransition(next);
          return { theme: next };
        });
      },
      setTheme: (theme) => {
        applyThemeWithTransition(theme);
        set({ theme });
      },
    }),
    { name: 'murmr-theme' }
  )
);
