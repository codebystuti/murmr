import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/shared/Logo';

export default function Nav() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const [scrolled, setScrolled] = useState(!isLanding);

  useEffect(() => {
    if (!isLanding) { setScrolled(true); return; }
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-6">
      <nav
        className="marketing-nav"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 999,
          border: `1px solid ${scrolled ? 'color-mix(in oklab, var(--text-on-gradient) 10%, transparent)' : 'color-mix(in oklab, var(--text-on-gradient) 7%, transparent)'}`,
          background: scrolled
            ? 'color-mix(in oklab, var(--bg-surface) 85%, transparent)'
            : 'color-mix(in oklab, var(--bg-surface) 70%, transparent)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          padding: '12px 16px',
          transition: 'background var(--dur-medium) ease, border-color var(--dur-medium) ease',
        }}
      >
        {/* Left: logo + beta badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Wordmark size={18} />
          </Link>
          <span
            className="nav-hide-mobile"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: 999,
              border: '1px solid var(--border-dark)',
              color: 'var(--text-tertiary)',
            }}
          >
            beta
          </span>
        </div>

        {/* Right: Sign in + Get started */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            to="/login"
            className="nav-link nav-hide-mobile"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            Sign in
          </Link>
          <Link to="/signup" className="cta cta-primary cta-sm">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
