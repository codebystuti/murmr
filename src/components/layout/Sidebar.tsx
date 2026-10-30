import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  LayoutList,
  Map,
  ScrollText,
  Activity,
  Settings,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks';
import { useUIStore } from '@/lib/ui-store';
import { useActivityStore } from '@/lib/activity-store';
import { getInitials } from '@/lib/utils';

const ACTIVITY_PATH = '/app/activity';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
  { label: 'Board', icon: LayoutList, path: '/app/board' },
  { label: 'Roadmap', icon: Map, path: '/app/roadmap' },
  { label: 'Changelog', icon: ScrollText, path: '/app/changelog' },
  { label: 'Activity', icon: Activity, path: ACTIVITY_PATH },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, path: '/app/settings' },
  { label: 'Profile', icon: User, path: '/app/profile' },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, end, badge, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className="focus-ring"
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
        background: isActive
          ? 'color-mix(in oklab, var(--grad-1) 12%, transparent)'
          : hovered
          ? 'color-mix(in oklab, var(--text-on-gradient) 4%, transparent)'
          : 'transparent',
        color: isActive || hovered ? 'var(--tx)' : 'var(--tx2)',
        border: isActive
          ? '1px solid color-mix(in oklab, var(--grad-1) 30%, transparent)'
          : '1px solid transparent',
        transition: 'background var(--dur-ui), color var(--dur-ui), border-color var(--dur-ui), box-shadow var(--dur-ui)',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {({ isActive }) => (
        <>
          <Icon size={15} style={{ opacity: isActive ? 1 : hovered ? 0.9 : 0.7, transition: 'opacity var(--dur-ui)' }} />
          {label}
          {badge !== undefined && badge > 0 && (
            <>
              <span
                aria-hidden="true"
                style={{
                  marginLeft: 'auto',
                  minWidth: 18,
                  height: 18,
                  padding: '0 6px',
                  borderRadius: 6,
                  background: 'var(--elev)',
                  color: 'var(--tx2)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  lineHeight: '18px',
                  textAlign: 'center',
                }}
              >
                {badge > 99 ? '99+' : badge}
              </span>
              <span className="sr-only">, {badge} new</span>
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unseenCount = useActivityStore((s) => s.unseenCount);
  const [footerHovered, setFooterHovered] = useState(false);

  function signOut() {
    logout();
    qc.clear();
    navigate('/login');
    onNavigate?.();
  }

  return (
    <>
      {/* Workspace header */}
      <div
        style={{
          padding: '20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2), var(--grad-3))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--text-on-gradient)',
            flexShrink: 0,
          }}
        >
          m
        </span>
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', fontSize: 15, color: 'var(--tx)' }}>
          Murmr
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            end={item.path === '/app'}
            badge={item.path === ACTIVITY_PATH && pathname !== ACTIVITY_PATH ? unseenCount : undefined}
            onClick={onNavigate}
          />
        ))}

        <div style={{ flex: 1 }} />

        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} icon={item.icon} label={item.label} onClick={onNavigate} />
        ))}
      </nav>

      {/* User footer: profile link + sign out */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          background: footerHovered ? 'color-mix(in oklab, var(--text-on-gradient) 4%, transparent)' : 'none',
          transition: 'background var(--dur-ui)',
        }}
      >
        <button
          type="button"
          onClick={() => { navigate('/app/profile'); onNavigate?.(); }}
          onMouseEnter={() => setFooterHovered(true)}
          onMouseLeave={() => setFooterHovered(false)}
          className="focus-ring-inset"
          style={{
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
            background: 'none',
            border: 'none',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'linear-gradient(135deg, var(--grad-2), var(--grad-3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-on-gradient)',
              flexShrink: 0,
            }}
          >
            {user ? getInitials(user.name) : '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Guest'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'capitalize' }}>
              {user?.role ?? 'user'}
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          className="hit-44 focus-ring bg-transparent text-[var(--tx3)] hover:bg-[color-mix(in_oklab,var(--tx)_8%,transparent)] hover:text-[var(--tx)] active:scale-[0.94]"
          style={{
            width: 32,
            height: 32,
            marginRight: 10,
            borderRadius: 8,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background var(--dur-ui), color var(--dur-ui), box-shadow var(--dur-ui), transform var(--dur-ui)',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  // Close on route change (mobile)
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop, setSidebarOpen]);

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen || isDesktop) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen, isDesktop, closeSidebar]);

  // Drawer is a modal dialog: focus moves in on open, Tab stays inside, focus returns to the menu button on close.
  useEffect(() => {
    if (!sidebarOpen || isDesktop) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus({ preventScroll: true });

    const trap = (e: KeyboardEvent) => {
      const drawer = drawerRef.current;
      if (e.key !== 'Tab' || !drawer) return;
      const items = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && drawer.contains(active);
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);

    return () => {
      document.removeEventListener('keydown', trap);
      // After a nav link the old page (and its menu button) unmounts a few frames later, so for a short
      // while focus that fell back to <body> is handed to the menu button of whichever page is showing.
      let frames = 0;
      const restore = () => {
        const active = document.activeElement;
        if (frames === 0 && opener?.isConnected) {
          opener.focus({ preventScroll: true });
        } else if (!active || active === document.body) {
          document.querySelector<HTMLElement>('button[aria-label="Open menu"]')?.focus({ preventScroll: true });
        }
        if (++frames < 12) requestAnimationFrame(restore);
      };
      requestAnimationFrame(restore);
    };
  }, [sidebarOpen, isDesktop]);

  // Desktop: always-visible sidebar
  if (isDesktop) {
    return (
      <aside
        className="h-[100vh] supports-[height:100dvh]:h-[100dvh]"
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
        }}
      >
        <SidebarContent />
      </aside>
    );
  }

  // Mobile: slide-out drawer
  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="murmr-palette-backdrop"
        onClick={closeSidebar}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8,7,13,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
        }}
      />
      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="murmr-sidebar-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          boxShadow: '8px 0 32px -8px rgba(0,0,0,0.4)',
        }}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          style={{
            position: 'absolute',
            top: 16,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1,
            transition: 'background var(--dur-ui), color var(--dur-ui), box-shadow var(--dur-ui), transform var(--dur-ui)',
          }}
          className="hit-44 focus-ring bg-transparent text-[var(--tx3)] hover:bg-[color-mix(in_oklab,var(--tx)_8%,transparent)] hover:text-[var(--tx)] active:scale-[0.94]"
        >
          <X size={14} />
        </button>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>
    </>
  );
}
