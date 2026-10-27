import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/features/posts/components/StatusPill';
import { UpvoteButton } from '@/features/posts/components/UpvoteButton';
import { EditPostModal } from '@/features/posts/components/EditPostModal';
import { CommentItem } from '@/features/comments/components/CommentItem';
import { CommentInput } from '@/features/comments/components/CommentInput';
import { usePost } from '@/features/posts/hooks/usePosts';
import { useDeletePost, useUpdateStatus } from '@/features/posts/hooks/usePostMutations';
import { useComments } from '@/features/comments/hooks/useComments';
import { useUserMap } from '@/hooks/useUserMap';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useEnterReveal, enterDelay } from '@/hooks/useEnterReveal';
import { canEdit, canDelete, isAdmin as checkIsAdmin } from '@/lib/authorization';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import type { PostStatus } from '@/types';
import { STATUS_META } from '@/types';

const STATUS_ORDER: PostStatus[] = ['open', 'planned', 'progress', 'shipped', 'closed'];

// Comments start right after the "Comments" heading (upvote … heading = 7 steps of the stagger);
// the comment box below them takes the last slot of the cascade.
const COMMENTS_DELAY_MS = 7 * 80;

// Phones: icon-only header actions, tighter page padding and the compact upvote, so content gets the width.
const WIDE_QUERY = '(min-width: 640px)';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isWide = useMediaQuery(WIDE_QUERY);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<PostStatus | null>(null);

  const { data: post, isLoading, error } = usePost(postId ?? '');
  const { data: comments = [], isLoading: commentsLoading } = useComments(postId ?? '');
  const revealRef = useEnterReveal<HTMLDivElement>(!!post, postId);
  // Comments load separately; they get their own reveal so they fade in (after the post) instead of popping.
  const commentsRevealRef = useEnterReveal<HTMLDivElement>(!!post && !commentsLoading, postId, '.murmr-enter-comment');
  const userMap = useUserMap();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: updateStatus } = useUpdateStatus();

  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const restoreDeleteFocus = useRef(false);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);

  // The page stays mounted when the route moves to another post: a pending confirmation or open
  // status menu belongs to the previous post.
  useEffect(() => {
    setConfirmDelete(false);
    setStatusOpen(false);
  }, [postId]);

  // Inline delete confirmation: focus lands on Cancel (the safe choice), Esc cancels, and focus returns
  // to the Delete button afterwards so keyboard users don't lose their place.
  useEffect(() => {
    if (!confirmDelete) {
      if (restoreDeleteFocus.current) deleteTriggerRef.current?.focus();
      restoreDeleteFocus.current = false;
      return;
    }
    cancelDeleteRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      restoreDeleteFocus.current = true;
      setConfirmDelete(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmDelete]);

  useEffect(() => {
    if (!statusOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setStatusOpen(false);
      statusTriggerRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [statusOpen]);

  if (!user) return null;

  const isAdmin = checkIsAdmin(user);
  const canEditPost = post ? canEdit(user, post.authorId) : false;
  const canDeletePost = post ? canDelete(user, post.authorId) : false;
  const postAuthor = post ? userMap.get(post.authorId) : undefined;

  function cancelDelete() {
    restoreDeleteFocus.current = true;
    setConfirmDelete(false);
  }

  // Shared or new-tab links have no in-app history to go back to: fall back to the board.
  function handleBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/app/board');
  }

  const pagePadding = isWide ? '28px 36px' : '20px 16px';
  const columnGap = isWide ? 24 : 12;

  function handleDelete() {
    if (!postId) return;
    deletePost(postId, {
      onSuccess: () => navigate('/app/board', { replace: true }),
    });
  }

  function handleStatusChange(status: PostStatus) {
    if (!postId) return;
    updateStatus({ id: postId, status });
    setStatusOpen(false);
    statusTriggerRef.current?.focus();
  }

  // Loading state — skeleton mirrors the real layout
  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Post" />
        <div key="post-skeleton" style={{ flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              padding: pagePadding,
              display: 'flex',
              gap: columnGap,
              maxWidth: 860,
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Upvote skeleton */}
            <div
              className="animate-pulse"
              style={{
                flexShrink: 0,
                width: isWide ? 64 : 44,
                height: isWide ? 80 : 56,
                borderRadius: 'var(--radius-container)',
                background: 'var(--elev)',
                border: '1px solid var(--border)',
              }}
            />
            {/* Content skeleton */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Status + timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="animate-pulse" style={{ height: 24, width: 80, borderRadius: 999, background: 'var(--elev)' }} />
                <div className="animate-pulse" style={{ height: 11, width: 96, borderRadius: 4, background: 'var(--elev)' }} />
              </div>
              {/* Title */}
              <div className="animate-pulse" style={{ height: 32, width: '72%', borderRadius: 6, background: 'var(--elev)' }} />
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="animate-pulse" style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--elev)' }} />
                <div className="animate-pulse" style={{ height: 11, width: 80, borderRadius: 4, background: 'var(--elev)' }} />
              </div>
              {/* Body lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div className="animate-pulse" style={{ height: 14, width: '100%', borderRadius: 4, background: 'var(--elev)' }} />
                <div className="animate-pulse" style={{ height: 14, width: '92%', borderRadius: 4, background: 'var(--elev)' }} />
                <div className="animate-pulse" style={{ height: 14, width: '78%', borderRadius: 4, background: 'var(--elev)' }} />
              </div>
              {/* Comments section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 12 }}>
                <div className="animate-pulse" style={{ height: 13, width: 100, borderRadius: 4, background: 'var(--elev)', marginBottom: 18 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{
                        height: 70,
                        borderRadius: 10,
                        background: 'var(--elev)',
                        border: '1px solid var(--border)',
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !post) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Post" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            padding: 40,
          }}
        >
          <p style={{ fontSize: 15, color: 'var(--tx2)', margin: 0 }}>Post not found.</p>
          <Button variant="default" size="sm" onClick={() => navigate('/app/board')}>
            <ArrowLeft size={13} />
            Back to board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar
        title="Post"
        // Phones need the header width for the actions; the title is the first thing on the page anyway.
        sub={isWide ? (post.title.length > 60 ? `${post.title.slice(0, 60)}…` : post.title) : undefined}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: isWide ? 6 : 8 }}>
            {/* Back + Edit step aside on phones while the delete confirmation needs the room. */}
            {(isWide || !confirmDelete) && (
              <>
                {/* Back button */}
                <Button
                  variant="default"
                  size={isWide ? 'sm' : 'icon'}
                  onClick={handleBack}
                  aria-label={isWide ? undefined : 'Back'}
                  className={isWide ? undefined : 'hit-44'}
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  {isWide && 'Back'}
                </Button>

                {/* Edit */}
                {canEditPost && (
                  <Button
                    variant="default"
                    size={isWide ? 'sm' : 'icon'}
                    onClick={() => {
                      setConfirmDelete(false);
                      setEditOpen(true);
                    }}
                    aria-label={isWide ? undefined : 'Edit post'}
                    className={isWide ? undefined : 'hit-44'}
                  >
                    <Pencil size={13} aria-hidden="true" />
                    {isWide && 'Edit'}
                  </Button>
                )}
              </>
            )}

            {/* Delete */}
            {canDeletePost && !confirmDelete && (
              <Button
                ref={deleteTriggerRef}
                variant="default"
                size={isWide ? 'sm' : 'icon'}
                onClick={() => setConfirmDelete(true)}
                aria-label={isWide ? undefined : 'Delete post'}
                className={isWide ? undefined : 'hit-44'}
                style={{ color: 'var(--status-error)', borderColor: 'color-mix(in oklab, var(--status-error) 30%, transparent)' }}
              >
                <Trash2 size={13} aria-hidden="true" />
                {isWide && 'Delete'}
              </Button>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
              <div
                role="group"
                aria-label="Delete this post?"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isWide ? 6 : 4,
                  padding: isWide ? '6px 10px' : '0 4px 0 10px',
                  borderRadius: 8,
                  border: '1px solid color-mix(in oklab, var(--status-error) 30%, transparent)',
                  background: 'color-mix(in oklab, var(--status-error) 8%, transparent)',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--status-error)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {isWide ? 'Delete this post?' : 'Delete?'}
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Confirm delete"
                  className={isWide ? 'focus-ring' : 'focus-ring hit-44'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--status-error)',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: 6,
                    ...(isWide ? null : { width: 36, height: 36 }),
                  }}
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                </button>
                <button
                  ref={cancelDeleteRef}
                  type="button"
                  onClick={cancelDelete}
                  aria-label="Cancel delete"
                  className={isWide ? 'focus-ring' : 'focus-ring hit-44'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tx3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: 6,
                    ...(isWide ? null : { width: 36, height: 36 }),
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Main content */}
      <div key={`post-content-${post.id}`} ref={revealRef} style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            padding: pagePadding,
            display: 'flex',
            gap: columnGap,
            maxWidth: 860,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Big upvote */}
          <div className="murmr-enter" style={{ flexShrink: 0, paddingTop: 4, '--enter-delay': enterDelay(0) } as React.CSSProperties}>
            <UpvoteButton post={post} big={isWide} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Status row */}
            <div
              className="murmr-enter"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                flexWrap: 'wrap',
                // Lifted while open so the status menu isn't covered by the fading sections below it.
                position: 'relative',
                zIndex: statusOpen ? 30 : undefined,
                '--enter-delay': enterDelay(1),
              } as React.CSSProperties}
            >
              {/* Status pill — clickable for admins */}
              <div style={{ position: 'relative' }}>
                {isAdmin ? (
                  <>
                    <button
                      ref={statusTriggerRef}
                      type="button"
                      onClick={() => setStatusOpen((o) => !o)}
                      className="active:scale-[0.97] focus-ring"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all var(--dur-ui)',
                      }}
                      aria-label="Change post status"
                      aria-haspopup="listbox"
                      aria-expanded={statusOpen}
                    >
                      <StatusPill status={post.status} />
                      <ChevronDown size={12} style={{ color: 'var(--tx3)', opacity: 0.6 }} aria-hidden="true" />
                    </button>

                    {statusOpen && (
                      <>
                        <div
                          style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 10,
                          }}
                          onClick={() => setStatusOpen(false)}
                        />
                        <div
                          role="listbox"
                          aria-label="Select status"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            boxShadow: '0 12px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px var(--border-2)',
                            padding: '4px',
                            zIndex: 20,
                            minWidth: 160,
                          }}
                        >
                          {STATUS_ORDER.map((s) => {
                            const { label, color } = STATUS_META[s];
                            const active = post.status === s;
                            return (
                              <button
                                key={s}
                                role="option"
                                aria-selected={active}
                                type="button"
                                onClick={() => handleStatusChange(s)}
                                onMouseEnter={() => setHoveredStatus(s)}
                                onMouseLeave={() => setHoveredStatus(null)}
                                className="focus-ring-inset"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: 7,
                                  border: 'none',
                                  background: active
                                    ? `color-mix(in oklab, ${color} 10%, transparent)`
                                    : hoveredStatus === s
                                    ? 'var(--elev)'
                                    : 'transparent',
                                  cursor: 'pointer',
                                  fontSize: 13,
                                  fontWeight: active ? 600 : 400,
                                  color: active ? color : hoveredStatus === s ? 'var(--tx)' : 'var(--tx2)',
                                  textAlign: 'left',
                                  transition: 'all var(--dur-micro)',
                                  fontFamily: 'var(--font-body)',
                                }}
                              >
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 999,
                                    background: color,
                                    flexShrink: 0,
                                  }}
                                />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <StatusPill status={post.status} />
                )}
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: 'var(--tx3)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>

            {/* Title */}
            <h1
              className="murmr-enter"
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--tx)',
                margin: '0 0 12px',
                lineHeight: 1.2,
                fontFamily: 'var(--font-display)',
                overflowWrap: 'anywhere',
                '--enter-delay': enterDelay(2),
              } as React.CSSProperties}
            >
              {post.title}
            </h1>

            {/* Author */}
            {postAuthor && (
              <div
                className="murmr-enter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  '--enter-delay': enterDelay(3),
                } as React.CSSProperties}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: postAuthor.avatar
                      ? 'transparent'
                      : 'linear-gradient(135deg, var(--grad-1), var(--grad-3))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--text-on-gradient)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {postAuthor.avatar ? (
                    <img
                      src={postAuthor.avatar}
                      alt={postAuthor.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(postAuthor.name)
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--tx2)', fontWeight: 500 }}>
                  {postAuthor.name}
                </span>
                {postAuthor.role === 'admin' && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
                      color: 'var(--text-on-gradient)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
            )}

            {/* Body */}
            {post.body && (
              <p
                className="murmr-enter"
                style={{
                  fontSize: 14,
                  color: 'var(--tx2)',
                  lineHeight: 1.7,
                  margin: '0 0 16px',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  '--enter-delay': enterDelay(4),
                } as React.CSSProperties}
              >
                {post.body}
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div
                className="murmr-enter"
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                  '--enter-delay': enterDelay(5),
                } as React.CSSProperties}
              >
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 9px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      color: 'var(--tx2)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Comments section */}
            <div
              ref={commentsRevealRef}
              className="murmr-enter"
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 16,
                '--enter-delay': enterDelay(6),
              } as React.CSSProperties}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--tx)',
                  margin: '0 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Comments
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--tx3)',
                    fontWeight: 400,
                  }}
                >
                  {commentsLoading ? '…' : comments.length}
                </span>
              </h2>

              {commentsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{
                        height: 70,
                        borderRadius: 10,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        opacity: 1 - i * 0.2,
                      }}
                    />
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p
                  className="murmr-enter-comment"
                  style={{
                    fontSize: 13,
                    color: 'var(--tx3)',
                    margin: '0 0 16px',
                    '--enter-delay': enterDelay(0, COMMENTS_DELAY_MS),
                  } as React.CSSProperties}
                >
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                <div>
                  {comments.map((comment, i) => (
                    <div
                      key={comment.id}
                      className="murmr-enter-comment"
                      style={{ '--enter-delay': enterDelay(i, COMMENTS_DELAY_MS) } as React.CSSProperties}
                    >
                      <CommentItem
                        comment={comment}
                        author={userMap.get(comment.authorId)}
                        currentUser={user}
                        isAdmin={isAdmin}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              {/* Part of the page cascade, not the comments reveal: it renders before comments load. */}
              <div className="murmr-enter" style={{ '--enter-delay': enterDelay(12) } as React.CSSProperties}>
                <CommentInput postId={post.id} currentUser={user} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditPostModal
        post={post}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
