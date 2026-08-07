import { type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface TopbarProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

export function Topbar({ title, sub, action }: TopbarProps) {
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--tx)' }}>
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 13, color: 'var(--tx2)', marginTop: 2 }}>{sub}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search / command palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hover-border"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: 12,
            color: 'var(--tx2)',
            minWidth: 220,
            cursor: 'pointer',
            transition: 'border-color var(--dur-ui)',
          }}
          aria-label="Open command palette"
        >
          <Search size={13} />
          <span className="hidden sm:block" style={{ flex: 1, textAlign: 'left' }}>Search…</span>
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
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />

        {action}
      </div>
    </div>
  );
}
