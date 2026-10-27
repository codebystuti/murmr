import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Search, X } from 'lucide-react';
import type { StatusFilter, SortOption } from '@/features/posts/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'planned', label: 'Planned' },
  { key: 'progress', label: 'In progress' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'closed', label: 'Closed' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'upvotes', label: 'Most upvoted' },
  { key: 'newest', label: 'Newest' },
  { key: 'comments', label: 'Most discussed' },
];

interface FilterBarProps {
  status: StatusFilter;
  sort: SortOption;
  search: string;
  onStatusChange: (status: StatusFilter) => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (q: string) => void;
  statusCounts?: Record<StatusFilter, number>;
}

export function FilterBar({ status, sort, search, onStatusChange, onSortChange, onSearchChange, statusCounts }: FilterBarProps) {
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Sort';
  const [sortOpen, setSortOpen] = useState(false);
  // Below 1024px: search gets its own row, then one horizontally scrolling row of chips beside the sort.
  const isWide = useMediaQuery('(min-width: 1024px)');
  const isPhone = !useMediaQuery('(min-width: 640px)');

  const chips = STATUS_FILTERS.map((f) => {
    const active = f.key === status;
    const count = statusCounts?.[f.key];
    return (
      <button
        key={f.key}
        type="button"
        onClick={() => onStatusChange(f.key)}
        aria-pressed={active}
        className={
          active
            ? 'border-[color-mix(in_oklab,var(--grad-1)_40%,transparent)] bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] text-[var(--tx)] active:scale-[0.97] focus-ring'
            : 'border-[var(--border)] bg-transparent text-[var(--tx2)] hover:border-[var(--border-2)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring'
        }
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          // Width/style only: a `border` shorthand here would reset border-color to currentColor,
          // overriding the class colour and making the border track the text (stark on theme change).
          borderWidth: 1,
          borderStyle: 'solid',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color var(--dur-ui), border-color var(--dur-ui), color var(--dur-ui), box-shadow var(--dur-ui), transform var(--dur-ui)',
          fontFamily: 'var(--font-body)',
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {f.label}
        {count !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: active ? 'var(--tx2)' : 'var(--tx3)',
              opacity: count === 0 ? 0.4 : active ? 1 : 0.7,
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  });

  const searchBox = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        transition: 'border-color var(--dur-ui)',
        ...(isWide ? { minWidth: 180, flexShrink: 0 } : { width: '100%', minHeight: 44 }),
      }}
      className="has-[:focus]:border-[var(--border-2)]"
    >
      <Search size={13} style={{ color: 'var(--tx3)', flexShrink: 0 }} aria-hidden="true" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search posts…"
        aria-label="Search posts"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          // 16px on phones keeps iOS Safari from zooming the page when the field gets focus.
          fontSize: isPhone ? 16 : 12,
          color: 'var(--tx)',
          flex: 1,
          fontFamily: 'var(--font-body)',
          minWidth: 0,
        }}
      />
      {search.length > 0 && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--tx3)',
            flexShrink: 0,
            borderRadius: 4,
          }}
          className="hit-44 focus-ring hover:text-[var(--tx)]"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );

  /* Sort — custom dropdown replacing native <select> */
  const sortMenu = (
    <DropdownMenu.Root open={sortOpen} onOpenChange={setSortOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Sort posts: ${currentSortLabel}`}
          className="border-[var(--border)] hover:border-[var(--border-2)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: isPhone ? '8px 12px' : '8px 16px',
            borderRadius: 8,
            // See the chip comment: keep border-color coming from the class, not currentColor.
            borderWidth: 1,
            borderStyle: 'solid',
            background: 'transparent',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'border-color var(--dur-ui), color var(--dur-ui), box-shadow var(--dur-ui), transform var(--dur-ui)',
            minHeight: 44,
            color: 'var(--tx2)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {!isPhone && <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>Sort:</span>}
          <span style={{ color: 'var(--tx)', fontWeight: 600 }}>{currentSortLabel}</span>
          <ChevronDown
            size={12}
            aria-hidden="true"
            style={{
              color: 'var(--tx3)',
              transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform var(--dur-ui)`,
            }}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="sort-menu-content"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: '0 12px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px var(--border-2)',
            padding: 4,
            minWidth: 160,
            zIndex: 50,
            outline: 'none',
            transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
          }}
        >
          {SORT_OPTIONS.map((o) => {
            const isSelected = o.key === sort;
            return (
              <DropdownMenu.Item
                key={o.key}
                onSelect={() => onSortChange(o.key)}
                className="data-[highlighted]:bg-[color-mix(in_oklab,var(--grad-1)_15%,transparent)] data-[highlighted]:text-[var(--tx)] focus:outline-none"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isPhone ? '12px 8px' : '8px 8px',
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--tx)' : 'var(--tx2)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'background var(--dur-micro)',
                  userSelect: 'none',
                }}
              >
                {isSelected && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--grad-1)',
                      flexShrink: 0,
                    }}
                  />
                )}
                {!isSelected && <span style={{ width: 6, flexShrink: 0 }} />}
                {o.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  const barStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border)',
    // Solid, like the Topbar on every other page. The bar sits in normal flow with nothing scrolling
    // behind it, so a translucent background plus backdrop-filter bought no visuals while forcing
    // Board onto its own GPU layer, which made its borders repaint differently during a theme change.
    background: 'var(--bg)',
    flexShrink: 0,
  };

  if (!isWide) {
    return (
      <div
        style={{
          ...barStyle,
          display: 'flex',
          flexDirection: 'column',
          // Same 12px above and below the search box.
          gap: 12,
          padding: '12px 24px',
        }}
      >
        {searchBox}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* One row of chips that scrolls sideways. It bleeds to the left edge so chips scroll off-screen
              rather than being cut at the gutter; the 2px inset keeps focus rings from being clipped. */}
          <div
            role="group"
            aria-label="Filter by status"
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              minWidth: 0,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              overscrollBehaviorX: 'contain',
              padding: '2px 2px 2px 24px',
              margin: '-2px -2px -2px -24px',
            }}
          >
            {chips}
          </div>
          {sortMenu}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...barStyle,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        flexWrap: 'wrap',
      }}
    >
      {/* Status pill filters */}
      <div role="group" aria-label="Filter by status" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        {chips}
      </div>

      {/* Inline search input */}
      {searchBox}

      {sortMenu}
    </div>
  );
}

export type { StatusFilter, SortOption };
