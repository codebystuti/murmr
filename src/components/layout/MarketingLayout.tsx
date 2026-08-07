import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '@/marketing/components/Nav';
import { initLenis, destroyLenis } from '@/lib/lenis';

export default function MarketingLayout() {
  useEffect(() => {
    const lenis = initLenis();
    return () => {
      destroyLenis();
      void lenis;
    };
  }, []);

  return (
    <div
      className="marketing-root film-grain min-h-screen"
      style={{
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        isolation: 'isolate',
      }}
    >
      <Nav />
      <Outlet />
    </div>
  );
}
