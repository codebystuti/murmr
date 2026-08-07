import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
import { canEdit, canDelete, isAdmin as checkIsAdmin } from '@/lib/authorization';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import type { PostStatus } from '@/types';
import { STATUS_META } from '@/types';

const STATUS_ORDER: PostStatus[] = ['open', 'planned', 'progress', 'shipped', 'closed'];

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<PostStatus | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const { data: post, isLoading, error } = usePost(postId ?? '');
  const { data: comments = [], isLoading: commentsLoading } = useComments(postId ?? '');
  const userMap = useUserMap();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: updateStatus } = useUpdateStatus();

  useEffect(() => {
    if (!statusOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStatusOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [statusOpen]);

  if (!user) return null;

  const isAdmin = checkIsAdmin(user);
  const canEditPost = post ? canEdit(user, post.authorId) : false;
  const canDeletePost = post ? canDelete(user, post.authorId) : false;
  const postAuthor = post ? userMap.get(post.authorId) : undefined;

  function handleDelete() {
    if (!postId) return;
    deletePost(postId, {
      onSuccess: () => navigate(-1),
    });
  }

  function handleStatusChange(status: PostStatus) {
    if (!postId) return;
    updateStatus({ id: postId, status });
    setStatusOpen(false);
  }

  // Loading state — skeleton mirrors the real layout
  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Post" />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              padding: '28px 36px',
              display: 'flex',
              gap: 24,
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
                width: 64,
                height: 80,
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
        sub={post.title.length > 60 ? `${post.title.slice(0, 60)}…` : post.title}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Back button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={13} />
              Board
            </Button>

            {/* Edit */}
            {canEditPost && (
              <Button variant="default" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                Edit
              </Button>
            )}

            {/* Delete */}
            {canDeletePost && !confirmDelete && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                style={{ color: 'var(--status-error)', borderColor: 'color-mix(in oklab, var(--status-error) 30%, transparent)' }}
              >
                <Trash2 size={13} />
                Delete
              </Button>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid color-mix(in oklab, var(--status-error) 30%, transparent)',
                  background: 'color-mix(in oklab, var(--status-error) 8%, transparent)',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--status-error)', fontWeight: 500 }}>
                  Delete this post?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Confirm delete"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--status-error)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 2,
                    outline: 'none',
                  }}
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  aria-label="Cancel delete"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tx3)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 2,
                    outline: 'none',
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
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '28px 36px',
            display: 'flex',
            gap: 24,
            maxWidth: 860,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Big upvote */}
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            <UpvoteButton post={post} big />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Status row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              {/* Status pill — clickable for admins */}
              <div style={{ position: 'relative' }}>
                {isAdmin ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStatusOpen((o) => !o)}
                      className="active:scale-[0.97]"
                      className="focus-ring"
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
                                  outline: 'none',
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
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--tx)',
                margin: '0 0 12px',
                lineHeight: 1.2,
                fontFamily: 'var(--font-display)',
              }}
            >
              {post.title}
            </h1>

            {/* Author */}
            {postAuthor && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
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
                style={{
                  fontSize: 14,
                  color: 'var(--tx2)',
                  lineHeight: 1.7,
                  margin: '0 0 16px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {post.body}
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                }}
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
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 16,
              }}
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
                  style={{
                    fontSize: 13,
                    color: 'var(--tx3)',
                    margin: '0 0 16px',
                  }}
                >
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                <div>
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      author={userMap.get(comment.authorId)}
                      currentUser={user}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}

              {/* Add comment */}
              <CommentInput postId={post.id} currentUser={user} />
            </div>
          </div>
        </motion.div>
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
