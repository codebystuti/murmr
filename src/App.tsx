import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import AppRouter from '@/routes';

export default function App() {
  // Apply the saved theme once. Toggles set the attribute inside the theme store's transition,
  // so this must not subscribe: a second write would land before the cross-fade's "old" snapshot.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', useThemeStore.getState().theme);
  }, []);

  return <AppRouter />;
}
