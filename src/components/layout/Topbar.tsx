import { type ReactNode } from 'react';
import { Search, Menu } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { useMediaQuery } from '@/hooks';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface TopbarProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

const singleLine = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

export function Topbar({ title, sub, action }: TopbarProps) {
  const { setCommandPaletteOpen, setSidebarOpen } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  // Below 1024px the search trigger collapses to an icon so the title keeps its room.
  const isWide = useMediaQuery('(min-width: 1024px)');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Fallback only: if the actions can never fit beside the title, they move to a second row
        // instead of overlapping it or running off-screen.
        flexWrap: 'wrap',
        rowGap: 8,
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
        columnGap: 12,
      }}
    >
      {/* minWidth: the menu button plus a short title ("Post") must always fit before the actions wrap. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 0', minWidth: isDesktop ? 120 : 96 }}>
        {!isDesktop && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background var(--dur-ui), color var(--dur-ui), transform var(--dur-ui)',
            }}
            className="hit-44 focus-ring bg-transparent text-[var(--tx2)] hover:bg-[var(--elev)] hover:text-[var(--tx)] active:scale-[0.96]"
          >
            <Menu size={18} />
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--tx)', ...singleLine }}>
            {title}
          </div>
          {sub && (
            <div style={{ fontSize: 13, color: 'var(--tx2)', marginTop: 2, ...singleLine }}>{sub}</div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 8,
          flexShrink: 0,
          maxWidth: '100%',
          marginLeft: 'auto',
        }}
      >
        {/* Search / command palette trigger */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          // Border colour lives in a class so .hover-border can brighten it (an inline colour would win).
          className="hover-border focus-ring border-[var(--border)]"
          style={
            isWide
              ? {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  background: 'var(--surface)',
                  fontSize: 12,
                  color: 'var(--tx2)',
                  minWidth: 0,
                  maxWidth: 220,
                  cursor: 'pointer',
                  transition: 'border-color var(--dur-ui)',
                }
              : {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  padding: 0,
                  flexShrink: 0,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  background: 'var(--surface)',
                  color: 'var(--tx2)',
                  cursor: 'pointer',
                  transition: 'border-color var(--dur-ui)',
                }
          }
          aria-label="Open command palette"
        >
          <Search size={isWide ? 13 : 16} />
          {isWide && (
            <>
              <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '1px 6px',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--tx3)',
                }}
              >
                {/Mac|iPhone|iPad/.test(navigator.platform ?? '') ? '⌘' : 'Ctrl+'}K
              </kbd>
            </>
          )}
        </button>

        <ThemeToggle />

        {action}
      </div>
    </div>
  );
}
