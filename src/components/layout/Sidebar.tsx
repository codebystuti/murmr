import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutList,
  Map,
  ScrollText,
  Activity,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks';
import { useUIStore } from '@/lib/ui-store';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
  { label: 'Board', icon: LayoutList, path: '/app/board' },
  { label: 'Roadmap', icon: Map, path: '/app/roadmap' },
  { label: 'Changelog', icon: ScrollText, path: '/app/changelog' },
  { label: 'Activity', icon: Activity, path: '/app/activity' },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, path: '/app/settings' },
  { label: 'Profile', icon: User, path: '/app/profile' },
];

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, end, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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
        transition: 'all var(--dur-ui)',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {({ isActive }) => (
        <>
          <Icon size={15} style={{ opacity: isActive ? 1 : hovered ? 0.9 : 0.7, transition: 'opacity var(--dur-ui)' }} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [footerHovered, setFooterHovered] = useState(false);

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
          Northwind
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} icon={item.icon} label={item.label} end={item.path === '/app'} onClick={onNavigate} />
        ))}

        <div style={{ flex: 1 }} />

        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} icon={item.icon} label={item.label} onClick={onNavigate} />
        ))}
      </nav>

      {/* User footer */}
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
          width: '100%',
          background: footerHovered ? 'color-mix(in oklab, var(--text-on-gradient) 4%, transparent)' : 'none',
          border: 'none',
          borderTop: '1px solid var(--border)',
          font: 'inherit',
          textAlign: 'left',
          transition: 'background var(--dur-ui)',
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
    </>
  );
}

export function Sidebar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

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

  // Desktop: always-visible sidebar
  if (isDesktop) {
    return (
      <aside
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100vh',
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
            background: 'transparent',
            color: 'var(--tx3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1,
            transition: 'all var(--dur-ui)',
          }}
          className="hover:bg-[var(--elev)] hover:text-[var(--tx)]"
        >
          <X size={14} />
        </button>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>
    </>
  );
}
