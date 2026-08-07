import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { startActivitySimulator, stopActivitySimulator } from '@/lib/activity-simulator';
import { useThemeStore } from '@/lib/theme-store';

export default function AppLayout() {
  const { theme } = useThemeStore();

  useEffect(() => {
    startActivitySimulator();
    return () => stopActivitySimulator();
  }, []);

  return (
    <div
      data-theme={theme}
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
        color: 'var(--tx)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}
