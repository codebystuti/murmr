import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { startActivitySimulator, stopActivitySimulator } from '@/lib/activity-simulator';

export default function AppLayout() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <CommandPalette />
    </div>
  );
}
