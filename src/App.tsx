import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import AppRouter from '@/routes';

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <AppRouter />;
}
