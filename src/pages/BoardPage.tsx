import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LayoutList } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { SubmitFeedbackModal } from '@/components/shared/SubmitFeedbackModal';
import { PostCard } from '@/features/posts/components/PostCard';
import { FilterBar } from '@/features/posts/components/FilterBar';
import type { StatusFilter, SortOption } from '@/features/posts/types';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { useBoards } from '@/features/boards/hooks/useBoards';
import { useUserMap } from '@/hooks/useUserMap';
import { formatNumber } from '@/lib/utils';
import type { Post, PostStatus } from '@/types';

export default function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitOpen, setSubmitOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const boardSlug = searchParams.get('board') ?? 'all';
  const statusFilter = (searchParams.get('status') as StatusFilter) ?? 'all';
  const sort = (searchParams.get('sort') as SortOption) ?? 'upvotes';

  const { data: boards = [], isLoading: boardsLoading } = useBoards();
  const userMap = useUserMap();

  // Resolve current board id from slug
  const currentBoardId = useMemo(() => {
    if (boardSlug === 'all') return undefined;
    return boards.find((b) => b.slug === boardSlug)?.id;
  }, [boardSlug, boards]);

  const { data: allPosts = [], isLoading: postsLoading } = usePosts(currentBoardId);

  // Client-side filter + sort
  const filteredPosts = useMemo(() => {
    let result: Post[] = allPosts;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === (statusFilter as PostStatus));
    }
    return [...result].sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'comments') {
        return b.commentCount - a.commentCount;
      }
      return b.upvotes - a.upvotes; // default: most upvoted
    });
  }, [allPosts, statusFilter, sort]);

  // Count per status for filter pill badges
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: allPosts.length,
      open: 0,
      planned: 0,
      progress: 0,
      shipped: 0,
      closed: 0,
    };
    for (const post of allPosts) {
      counts[post.status]++;
    }
    return counts;
  }, [allPosts]);

  function setParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });
  }

  const currentBoard = boards.find((b) => b.slug === boardSlug);
  const uniqueContributors = new Set(allPosts.map((p) => p.authorId)).size;
  const isFiltered = statusFilter !== 'all';

  const isLoading = boardsLoading || postsLoading;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar
        title={currentBoard?.name ?? 'Feedback board'}
        sub={
          isLoading
            ? 'Loading…'
            : isFiltered
            ? `${formatNumber(filteredPosts.length)} of ${formatNumber(allPosts.length)} posts · ${formatNumber(uniqueContributors)} contributors`
            : `${formatNumber(allPosts.length)} posts · ${formatNumber(uniqueContributors)} contributors`
        }
        action={
          <Button variant="primary" size="sm" onClick={() => setSubmitOpen(true)}>
            + New post
          </Button>
        }
      />

      {/* Board tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        {[{ slug: 'all', name: 'All boards' }, ...boards.map((b) => ({ slug: b.slug, name: b.name }))].map(
          (tab) => {
            const active = boardSlug === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setParam('board', tab.slug)}
                className={
                  active
                    ? 'text-[var(--tx)] active:scale-[0.97] focus-ring-inset'
                    : 'text-[var(--tx2)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring-inset'
                }
                style={{
                  padding: '12px 8px',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  background: 'none',
                  border: 'none',
                  borderBottom: active
                    ? '2px solid var(--grad-2)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--dur-ui)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)',
                  marginBottom: -1,
                }}
              >
                {tab.name}
              </button>
            );
          },
        )}
      </div>

      {/* Filter bar */}
      <FilterBar
        status={statusFilter}
        sort={sort}
        onStatusChange={(s) => setParam('status', s)}
        onSortChange={(s) => setParam('sort', s)}
        statusCounts={statusCounts}
      />

      {/* Post list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {isLoading ? (
          // Skeleton
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  height: 94,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  opacity: 1 - i * 0.1,
                }}
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          // Empty state — two variants: filtered vs. truly empty
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-container)',
                background: 'var(--elev)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <LayoutList size={20} style={{ color: 'var(--tx3)' }} />
            </div>

            {isFiltered ? (
              <>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  No posts match this filter.
                </h3>
                <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0, maxWidth: 320 }}>
                  Try clearing the filter or switching boards.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  style={{ marginTop: 4 }}
                  onClick={() => setParam('status', 'all')}
                >
                  Clear filter
                </Button>
              </>
            ) : (
              <>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  No posts yet
                </h3>
                <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0, maxWidth: 320 }}>
                  Share what you'd like to see — your feedback shapes the roadmap.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ marginTop: 4 }}
                  onClick={() => setSubmitOpen(true)}
                >
                  + New post
                </Button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.1 : 0.4,
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.48),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <PostCard
                    post={post}
                    author={userMap.get(post.authorId)}
                    postId={post.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <p
              style={{
                fontSize: 11,
                color: 'var(--tx3)',
                textAlign: 'center',
                padding: '16px 0 8px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <SubmitFeedbackModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        defaultBoardId={currentBoardId}
      />
    </div>
  );
}
