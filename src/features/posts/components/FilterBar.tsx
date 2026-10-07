import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Search, X } from 'lucide-react';
import type { StatusFilter, SortOption } from '@/features/posts/types';

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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--bg) 90%, transparent)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {/* Status pill filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => {
          const active = f.key === status;
          const count = statusCounts?.[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onStatusChange(f.key)}
              className={
                active
                  ? 'border-[color-mix(in_oklab,var(--grad-1)_40%,transparent)] bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] text-[var(--tx)] active:scale-[0.97] focus-ring'
                  : 'border-[var(--border)] bg-transparent text-[var(--tx2)] hover:border-[var(--border-2)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring'
              }
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--dur-ui)',
                fontFamily: 'var(--font-body)',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
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
        })}
      </div>

      {/* Inline search input */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          minWidth: 180,
          flexShrink: 0,
          transition: 'border-color var(--dur-ui)',
        }}
        className="has-[:focus]:border-[var(--border-2)]"
      >
        <Search size={13} style={{ color: 'var(--tx3)', flexShrink: 0 }} aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts…"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 12,
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
            className="hover:text-[var(--tx)]"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Sort — custom dropdown replacing native <select> */}
      <DropdownMenu.Root open={sortOpen} onOpenChange={setSortOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Sort posts"
            className="border-[var(--border)] hover:border-[var(--border-2)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid',
              background: 'transparent',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all var(--dur-ui)',
              minHeight: 44,
              color: 'var(--tx2)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>Sort:</span>
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
                    padding: '8px 8px',
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
    </div>
  );
}

export type { StatusFilter, SortOption };
