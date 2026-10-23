import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { startActivitySimulator, stopActivitySimulator } from '@/lib/activity-simulator';

export default function AppLayout() {
  useEffect(() => {
    startActivitySimulator();
    return () => stopActivitySimulator();
  }, []);

  return (
    <div
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}
