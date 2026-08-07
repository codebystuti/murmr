import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Pencil, MessageSquare, ChevronUp, X, Check, Loader2, FileText, MessageCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/features/posts/components/StatusPill';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { useDeletePost } from '@/features/posts/hooks/usePostMutations';
import { useCommentsByAuthor } from '@/features/comments/hooks/useCommentsByAuthor';
import { useDeleteComment } from '@/features/comments/hooks/useComments';
import { useUpdateUser } from '@/features/users/hooks/useUpdateUser';
import { useAuth } from '@/hooks/useAuth';
import { canDelete, canDeleteComment } from '@/lib/authorization';
import { formatRelativeTime, formatNumber, getInitials } from '@/lib/utils';
import type { Post, Comment, User } from '@/types';

type ProfileTab = 'posts' | 'comments' | 'upvoted';

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'posts', label: 'My Posts' },
  { key: 'comments', label: 'My Comments' },
  { key: 'upvoted', label: 'Upvoted' },
];

// ── Edit Profile Modal ─────────────────────────────────────────────
interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  userId: string;
}

function EditProfileModal({ open, onOpenChange, currentName, userId }: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const { mutate: updateUser, isPending } = useUpdateUser();
  const shouldReduceMotion = useReducedMotion();

  const transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === currentName) { onOpenChange(false); return; }
    updateUser(
      { id: userId, data: { name: name.trim() } },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.15 }}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(8,7,13,0.6)',
                  backdropFilter: 'blur(6px)',
                  zIndex: 40,
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97, y: shouldReduceMotion ? 0 : 4 }}
                transition={transition}
                style={{
                  position: 'fixed',
                  inset: 0,
                  margin: 'auto',
                  width: 'min(440px, 94vw)',
                  height: 'fit-content',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  boxShadow: '0 30px 80px -10px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  outline: 'none',
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
              <Dialog.Title style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', margin: 0, letterSpacing: '-0.01em' }}>
                Edit profile
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="bg-transparent text-[var(--tx3)] hover:bg-[var(--elev)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all var(--dur-ui)' }}
                >
                  <X size={14} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--tx2)', marginBottom: 6 }}>
                    Display name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--grad-1)] focus:ring-inset"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      background: 'var(--bg)',
                      color: 'var(--tx)', fontSize: 14, fontFamily: 'var(--font-body)',
                      outline: 'none', transition: 'box-shadow var(--dur-ui)', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <Dialog.Close asChild>
                  <Button type="button" variant="default" size="sm">Cancel</Button>
                </Dialog.Close>
                <Button type="submit" variant="primary" size="sm" disabled={isPending || !name.trim()}>
                  {isPending && <Loader2 size={13} className="animate-spin" />}
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ── Post row ───────────────────────────────────────────────────────
function ProfilePostRow({ post }: { post: Post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: deletePost, isPending: deleting } = useDeletePost();
  const [confirmDel, setConfirmDel] = useState(false);

  const canDel = user ? canDelete(user, post.authorId) : false;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View post: ${post.title}`}
      onClick={() => navigate(`/app/post/${post.id}`)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/app/post/${post.id}`);
        }
      }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      style={{ border: '1px solid transparent', transition: 'all var(--dur-ui)', cursor: 'pointer' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4, lineHeight: 1.35 }}>
          {post.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPill status={post.status} size="sm" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
            <ChevronUp size={11} />
            {formatNumber(post.upvotes)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--tx3)' }}>
            <MessageSquare size={10} />
            {post.commentCount}
          </span>
          <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>

      {canDel && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {!confirmDel ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setConfirmDel(true); }}
              className="bg-transparent text-[var(--tx3)] hover:bg-[color-mix(in_oklab,var(--status-error)_10%,transparent)] hover:text-[var(--status-error)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
              style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--dur-ui)' }}
              aria-label="Delete post"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'color-mix(in oklab, var(--status-error) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--status-error) 20%, transparent)' }}>
              <span style={{ fontSize: 11, color: 'var(--status-error)' }}>Delete?</span>
              <button
                type="button"
                disabled={deleting}
                onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Confirm delete"
              >
                {deleting ? <Loader2 size={11} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmDel(false); }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Cancel delete"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Comment row ────────────────────────────────────────────────────
function ProfileCommentRow({ comment, postTitle, currentUser }: { comment: Comment; postTitle?: string; currentUser: User }) {
  const navigate = useNavigate();
  const { mutate: deleteComment, isPending: deleting } = useDeleteComment();
  const [confirmDel, setConfirmDel] = useState(false);
  const canDel = canDeleteComment(currentUser, comment.authorId);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={postTitle ? `View post: ${postTitle}` : 'View post'}
      onClick={() => navigate(`/app/post/${comment.postId}`)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/app/post/${comment.postId}`);
        }
      }}
      className="p-3 rounded-xl hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      style={{ border: '1px solid transparent', transition: 'all var(--dur-ui)', cursor: 'pointer' }}
    >
      {postTitle && (
        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          on: {postTitle}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <p style={{ fontSize: 13, color: 'var(--tx)', margin: 0, lineHeight: 1.5, flex: 1, minWidth: 0 }}>
          {comment.body}
        </p>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {formatRelativeTime(comment.createdAt)}
          </span>
          {canDel && (!confirmDel ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setConfirmDel(true); }}
              className="bg-transparent text-[var(--tx3)] hover:text-[var(--status-error)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
              aria-label="Delete comment"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          ) : (
            <div
              style={{ display: 'flex', gap: 4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={deleting}
                onClick={() => deleteComment({ id: comment.id, postId: comment.postId })}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Confirm delete"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Cancel delete"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [editOpen, setEditOpen] = useState(false);

  const { data: allPosts = [], isLoading: postsLoading } = usePosts();
  const { data: myComments = [], isLoading: commentsLoading } = useCommentsByAuthor(user?.id ?? '');

  const myPosts = useMemo(
    () => allPosts.filter((p) => p.authorId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allPosts, user?.id],
  );

  const upvotedPosts = useMemo(
    () => allPosts.filter((p) => user && p.upvotedBy.includes(user.id)).sort((a, b) => b.upvotes - a.upvotes),
    [allPosts, user],
  );

  const postMap = useMemo(() => new Map(allPosts.map((p) => [p.id, p.title])), [allPosts]);

  const tabMotion = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -4 },
    transition: { duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.16, 1, 0.3, 1] as const },
  };

  if (!user) return null;

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <Topbar title="Profile" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', padding: '24px 24px', boxSizing: 'border-box' }}>
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 24, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: user.avatar ? 'transparent' : 'linear-gradient(135deg, var(--grad-1), var(--grad-3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-on-gradient)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(user.name)
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', letterSpacing: '-0.02em' }}>
                  {user.name}
                </span>
                {user.role === 'admin' && (
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
                      background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
                      color: 'var(--text-on-gradient)', letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--tx3)', marginTop: 2 }}>{user.email}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[
                  { label: 'Posts', value: myPosts.length },
                  { label: 'Upvoted', value: upvotedPosts.length },
                  { label: 'Comments', value: myComments.length },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', fontFamily: 'var(--font-mono)' }}>
                      {formatNumber(s.value)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setEditOpen(true)}
              style={{ flexShrink: 0 }}
            >
              <Pencil size={13} />
              Edit
            </Button>
          </motion.div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderBottom: '1px solid var(--border)',
              marginBottom: 16,
            }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={
                    active
                      ? 'text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-inset'
                      : 'text-[var(--tx2)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-inset'
                  }
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--grad-2)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all var(--dur-ui)',
                    fontFamily: 'var(--font-body)',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content — only mounts the active panel */}
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div key="posts" {...tabMotion}>
                {postsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse" style={{ height: 64, borderRadius: 12, background: 'var(--surface)', opacity: 1 - i * 0.2 }} />
                    ))}
                  </div>
                ) : myPosts.length === 0 ? (
                  <EmptyTabState icon={<FileText size={20} style={{ color: 'var(--tx3)' }} />} label="No posts yet" sub="Your submitted posts will appear here." action={<Button variant="primary" size="sm" onClick={() => navigate('/app/board')}>Browse board</Button>} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {myPosts.map((post) => (
                      <ProfilePostRow key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div key="comments" {...tabMotion}>
                {commentsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse" style={{ height: 56, borderRadius: 12, background: 'var(--surface)', opacity: 1 - i * 0.2 }} />
                    ))}
                  </div>
                ) : myComments.length === 0 ? (
                  <EmptyTabState icon={<MessageCircle size={20} style={{ color: 'var(--tx3)' }} />} label="No comments yet" sub="Comments you've left will appear here." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {myComments.map((comment) => (
                      <ProfileCommentRow key={comment.id} comment={comment} postTitle={postMap.get(comment.postId)} currentUser={user} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'upvoted' && (
              <motion.div key="upvoted" {...tabMotion}>
                {postsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse" style={{ height: 64, borderRadius: 12, background: 'var(--surface)', opacity: 1 - i * 0.2 }} />
                    ))}
                  </div>
                ) : upvotedPosts.length === 0 ? (
                  <EmptyTabState icon={<ChevronUp size={20} style={{ color: 'var(--tx3)' }} />} label="No upvoted posts" sub="Posts you upvote will appear here." action={<Button variant="primary" size="sm" onClick={() => navigate('/app/board')}>Browse board</Button>} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {upvotedPosts.map((post) => (
                      <ProfilePostRow key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        currentName={user.name}
        userId={user.id}
      />
    </div>
  );
}

function EmptyTabState({ label, sub, action, icon }: { label: string; sub: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 12, textAlign: 'center' }}>
      {icon && (
        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-container)', background: 'var(--elev)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          {icon}
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--tx3)', margin: 0, maxWidth: 280 }}>{sub}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
