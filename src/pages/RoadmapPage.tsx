import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, MessageSquare, ChevronUp } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { useUpdateStatus } from '@/features/posts/hooks/usePostMutations';
import { useUserMap } from '@/hooks/useUserMap';
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
}

function RoadmapCard({ post, authorName, adminMode }: RoadmapCardProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  function handleNavigate() {
    navigate(`/app/post/${post.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  }

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenuOpen(false);
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
  }

  return (
    <motion.div
      layout={!shouldReduceMotion}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`Open post: ${post.title}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--border-2)] hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      style={{
        padding: 16,
        cursor: 'pointer',
        transition: 'all var(--dur-ui) var(--ease-out-expo)',
        position: 'relative',
      }}
    >
      {/* Admin status changer */}
      {adminMode && (
        <div
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Change status"
            className="text-[var(--tx3)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'all var(--dur-ui)',
            }}
          >
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{
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
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', lineHeight: 1.35, marginBottom: 6, paddingRight: adminMode ? 24 : 0 }}>
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
    </motion.div>
  );
}

interface ColumnProps {
  label: string;
  color: string;
  posts: Post[];
  adminMode: boolean;
  userMap: Map<string, { name: string }>;
  index: number;
}

function RoadmapColumn({ label, color, posts, adminMode, userMap, index }: ColumnProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.3,
        delay: shouldReduceMotion ? 0 : index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ flex: '1 1 0', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 0',
          borderBottom: `2px solid ${color}`,
          marginBottom: 2,
        }}
      >
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
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                border: '1px dashed var(--border)',
                borderRadius: 12,
                color: 'var(--tx3)',
                fontSize: 12,
              }}
            >
              No {label.toLowerCase()} posts
            </motion.div>
          ) : (
            posts.map((post) => (
              <RoadmapCard
                key={post.id}
                post={post}
                authorName={userMap.get(post.authorId)?.name}
                adminMode={adminMode}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const { data: allPosts = [], isLoading } = usePosts();
  const userMap = useUserMap();
  const adminMode = isAdmin(user);

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      posts: allPosts
        .filter((p) => p.status === col.status)
        .sort((a, b) => b.upvotes - a.upvotes),
    }));
  }, [allPosts]);

  const totalShipped = allPosts.filter((p) => p.status === 'shipped').length;
  const totalPlanned = allPosts.filter((p) => p.status === 'planned' || p.status === 'progress').length;

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <Topbar
        title="Roadmap"
        sub={
          isLoading
            ? 'Loading…'
            : `${totalPlanned} in progress · ${totalShipped} shipped`
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
            gap: 20,
            padding: '20px 28px',
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            alignItems: 'flex-start',
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
