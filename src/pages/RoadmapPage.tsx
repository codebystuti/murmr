import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MessageSquare, ChevronUp } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { useUpdateStatus } from '@/features/posts/hooks/usePostMutations';
import { useUserMap, useUsersLoading } from '@/hooks/useUserMap';
import { useEnterReveal, enterDelay } from '@/hooks/useEnterReveal';
import { useInsertAnimation } from '@/hooks/useInsertAnimation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/authorization';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { STATUS_META } from '@/types';
import type { Post, PostStatus } from '@/types';

const COLUMNS: { status: PostStatus; label: string; color: string }[] = [
  { status: 'planned', label: 'Planned', color: 'var(--status-planned)' },
  { status: 'progress', label: 'In Progress', color: 'var(--status-progress)' },
  { status: 'shipped', label: 'Shipped', color: 'var(--status-shipped)' },
];

const ALL_STATUSES: PostStatus[] = ['open', 'planned', 'progress', 'shipped', 'closed'];

interface RoadmapCardProps {
  post: Post;
  authorName?: string;
  adminMode: boolean;
  delay: string;
  onStatusMoved: (status: PostStatus) => void;
}

function RoadmapCard({ post, authorName, adminMode, delay, onStatusMoved }: RoadmapCardProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateStatus();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavigate() {
    navigate(`/app/post/${post.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Keys pressed on the status chevron or its menu bubble up here; only the card itself opens the post.
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  }

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenuOpen(false);
        // Keep keyboard focus on the card's chevron instead of dropping it to <body>.
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus the first menu item when dropdown opens
    const firstItem = dropdownRef.current?.querySelector<HTMLButtonElement>('button');
    firstItem?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  function handleStatusChange(status: PostStatus) {
    updateStatus({ id: post.id, status });
    setMenuOpen(false);
    // Stacked view: reveal where the card just went, so it doesn't look like it vanished.
    onStatusMoved(status);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open post: ${post.title}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="murmr-enter bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--border-2)] hover:bg-[var(--elev)] active:bg-[color-mix(in_oklab,var(--elev)_55%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      style={{
        padding: 16,
        cursor: 'pointer',
        transition: 'background var(--dur-ui) var(--ease-out-expo), border-color var(--dur-ui) var(--ease-out-expo), box-shadow var(--dur-ui) var(--ease-out-expo), transform var(--dur-ui) var(--ease-out-expo)',
        position: 'relative',
        zIndex: menuOpen ? 30 : undefined,
        '--enter-delay': delay,
      } as React.CSSProperties}
    >
      {/* Admin status changer */}
      {adminMode && (
        <div
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Change status"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="hit-44 text-[var(--tx3)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--dur-ui) var(--ease-out-expo)',
            }}
          >
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  ref={dropdownRef}
                  style={{
                    animation: 'murmr-menu-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: '0 12px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px var(--border-2)',
                    padding: 4,
                    minWidth: 150,
                    zIndex: 20,
                    outline: 'none',
                  }}
                  role="listbox"
                  aria-label="Select status"
                >
                  {ALL_STATUSES.map((s) => {
                    const { label, color } = STATUS_META[s];
                    const isCurrent = post.status === s;
                    return (
                      <button
                        key={s}
                        role="option"
                        aria-selected={isCurrent}
                        type="button"
                        onClick={() => handleStatusChange(s)}
                        className="hover:bg-[var(--elev)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '8px 8px',
                          borderRadius: 8,
                          border: 'none',
                          background: isCurrent ? `color-mix(in oklab, ${color} 10%, transparent)` : 'transparent',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent ? color : 'var(--tx2)',
                          textAlign: 'left',
                          transition: 'all var(--dur-micro)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', lineHeight: 1.35, marginBottom: 6, paddingRight: adminMode ? 24 : 0, overflowWrap: 'anywhere' }}>
        {post.title}
      </div>

      {post.body && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--tx2)',
            lineHeight: 1.55,
            marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
        >
          {post.body}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: 'var(--tx3)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <ChevronUp size={11} />
          {formatNumber(post.upvotes)}
        </span>
        <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx3)' }}>
          <MessageSquare size={11} />
          {post.commentCount}
        </span>
        {authorName && (
          <>
            <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{authorName}</span>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
    </div>
  );
}

interface ColumnProps {
  label: string;
  color: string;
  posts: Post[];
  adminMode: boolean;
  userMap: Map<string, { name: string }>;
  index: number;
  onStatusMoved: (status: PostStatus) => void;
}

interface ColumnLayout {
  /** Below 1024px columns stack vertically as collapsible sections. */
  stacked: boolean;
  expanded: boolean;
  onToggle: () => void;
  /** True when a section is opened after the page's first render, so its cards grow in. */
  animateExpand: boolean;
}

function SectionBody({ animate, id, children }: { animate: boolean; id: string; children: React.ReactNode }) {
  const ref = useInsertAnimation<HTMLDivElement>(animate);
  return (
    <div ref={ref} id={id}>
      {children}
    </div>
  );
}

function RoadmapColumn({ label, color, posts, adminMode, userMap, index, onStatusMoved, stacked, expanded, onToggle, animateExpand }: ColumnProps & ColumnLayout) {
  const columnDelay = index * 80;
  const bodyId = `roadmap-section-${index}`;

  const headerContent = (
    <>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--tx3)',
          marginLeft: 'auto',
        }}
      >
        {posts.length}
      </span>
      {stacked && (
        <ChevronDown
          size={16}
          aria-hidden="true"
          style={{
            color: 'var(--tx3)',
            flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--dur-ui) var(--ease-out-expo)',
          }}
        />
      )}
    </>
  );

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 0',
    borderBottom: `2px solid ${color}`,
    marginBottom: 2,
    '--enter-delay': enterDelay(0, columnDelay),
  } as React.CSSProperties;

  const cards = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: stacked ? 'visible' : 'auto', paddingTop: stacked ? 8 : 0 }}>
        {posts.length === 0 ? (
          <div
            className="murmr-enter"
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              border: '1px dashed var(--border)',
              borderRadius: 12,
              color: 'var(--tx3)',
              fontSize: 12,
              '--enter-delay': enterDelay(1, columnDelay),
            } as React.CSSProperties}
          >
            No {label.toLowerCase()} posts
          </div>
        ) : (
          posts.map((post, i) => (
            <RoadmapCard
              key={post.id}
              post={post}
              authorName={userMap.get(post.authorId)?.name}
              adminMode={adminMode}
              delay={enterDelay(i + 1, columnDelay)}
              onStatusMoved={onStatusMoved}
            />
          ))
        )}
      </div>
  );

  if (stacked) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="murmr-enter focus-ring-inset hover:bg-[var(--elev)]"
          style={{
            ...headerStyle,
            width: '100%',
            minHeight: 44,
            padding: '10px 8px',
            margin: '0 -8px 2px',
            boxSizing: 'content-box',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${color}`,
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font-body)',
            transition: 'background-color var(--dur-ui) var(--ease-out-expo)',
          }}
        >
          {headerContent}
        </button>
        {expanded && (
          <SectionBody animate={animateExpand} id={bodyId}>
            {cards}
          </SectionBody>
        )}
      </section>
    );
  }

  return (
    <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Column header */}
      <div className="murmr-enter" style={headerStyle}>
        {headerContent}
      </div>
      {cards}
    </div>
  );
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const { data: allPosts = [], isLoading: postsLoading } = usePosts();
  const userMap = useUserMap();
  const usersLoading = useUsersLoading();
  const isLoading = postsLoading || usersLoading;
  const revealRef = useEnterReveal<HTMLDivElement>(!isLoading);
  const adminMode = isAdmin(user);

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      posts: allPosts
        .filter((p) => p.status === col.status)
        .sort((a, b) => b.upvotes - a.upvotes),
    }));
  }, [allPosts]);

  const [planned, progress, shipped] = columns.map((col) => col.posts.length);

  // Phones and tablets: stacked collapsible sections instead of side-scrolling columns.
  const stacked = !useMediaQuery('(min-width: 1024px)');
  const [openSections, setOpenSections] = useState<Set<PostStatus>>(() => new Set<PostStatus>(['planned']));
  const toggleSection = (status: PostStatus) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  const revealSection = (status: PostStatus) =>
    setOpenSections((prev) => (prev.has(status) ? prev : new Set(prev).add(status)));
  // Sections open at first paint use the page entrance fade; ones opened later grow in.
  const firstContentRender = useRef(true);
  useEffect(() => {
    if (!isLoading) firstContentRender.current = false;
  }, [isLoading]);

  return (
    <div ref={revealRef} className="flex flex-col overflow-hidden" style={{ flex: 1, background: 'var(--bg)' }}>
      <Topbar
        title="Roadmap"
        sub={
          isLoading
            ? 'Loading…'
            : stacked
            ? // The section headers already carry each count; the full breakdown gets truncated here.
              `${planned + progress + shipped} posts`
            : `${planned} planned · ${progress} in progress · ${shipped} shipped`
        }
      />

      {isLoading ? (
        <div className="flex gap-6 p-6 flex-1 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col gap-3">
              <div className="animate-pulse h-8 rounded-lg" style={{ background: 'var(--elev)' }} />
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="animate-pulse rounded-xl"
                  style={{
                    height: 100,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    opacity: 1 - j * 0.15,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: stacked ? 'column' : 'row',
            gap: stacked ? 16 : 20,
            padding: stacked ? '16px 24px 32px' : '20px 28px',
            flex: 1,
            overflowX: stacked ? 'hidden' : 'auto',
            overflowY: 'auto',
            alignItems: stacked ? 'stretch' : 'flex-start',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {columns.map((col, i) => (
            <RoadmapColumn
              key={col.status}
              label={col.label}
              color={col.color}
              posts={col.posts}
              adminMode={adminMode}
              userMap={userMap}
              index={i}
              onStatusMoved={revealSection}
              stacked={stacked}
              expanded={!stacked || openSections.has(col.status)}
              onToggle={() => toggleSection(col.status)}
              animateExpand={!firstContentRender.current}
            />
          ))}
        </div>
      )}
    </div>
  );
}
