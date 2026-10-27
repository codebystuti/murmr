import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Comment, User } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { canEditComment, canDeleteComment } from '@/lib/authorization';
import { useUpdateComment, useDeleteComment } from '@/features/comments/hooks/useComments';

interface CommentItemProps {
  comment: Comment;
  author?: User;
  currentUser: User;
  isAdmin: boolean;
}

export function CommentItem({ comment, author, currentUser }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: updateComment, isPending: isSaving } = useUpdateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  const authorIsAdmin = author?.role === 'admin';
  // An optimistic comment ('temp-…') isn't saved yet: editing or deleting it would target an id that
  // doesn't exist and be lost when the real comment replaces it.
  const isSaved = !comment.id.startsWith('temp-');
  const showEdit = isSaved && canEditComment(currentUser, comment.authorId);
  const showDelete = isSaved && canDeleteComment(currentUser, comment.authorId);

  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const restoreDeleteFocus = useRef(false);

  // Inline delete confirmation: focus moves to Cancel, Esc cancels, and focus returns to the trash button.
  useEffect(() => {
    if (confirmDelete) {
      cancelDeleteRef.current?.focus();
    } else if (restoreDeleteFocus.current) {
      restoreDeleteFocus.current = false;
      deleteTriggerRef.current?.focus();
    }
  }, [confirmDelete]);

  function cancelDelete() {
    restoreDeleteFocus.current = true;
    setConfirmDelete(false);
  }

  function handleSave() {
    if (!editBody.trim()) return;
    updateComment(
      { id: comment.id, body: editBody.trim(), postId: comment.postId },
      { onSuccess: () => setEditing(false) },
    );
  }

  function handleDelete() {
    deleteComment({ id: comment.id, postId: comment.postId });
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: author?.avatar
            ? 'transparent'
            : 'linear-gradient(135deg, var(--grad-1), var(--grad-3))',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-on-gradient)',
          overflow: 'hidden',
        }}
      >
        {author?.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          getInitials(author?.name ?? '?')
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '8px 16px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: authorIsAdmin
            ? 'color-mix(in oklab, var(--grad-1) 6%, transparent)'
            : 'var(--surface)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: editing ? 10 : 4,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>
            {author?.name ?? 'Unknown user'}
          </span>

          {authorIsAdmin && (
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

          <span
            style={{
              fontSize: 11,
              color: 'var(--tx3)',
              fontFamily: 'var(--font-mono)',
              marginLeft: 'auto',
            }}
          >
            {formatRelativeTime(comment.createdAt)}
          </span>

          {/* Action buttons (non-edit mode) */}
          {!editing && (showEdit || showDelete) && (
            // Touch: wider gap so the 44px hit areas of the two 24px buttons don't overlap.
            <div className="[@media(pointer:coarse)]:!gap-5" style={{ display: 'flex', gap: 4 }}>
              {showEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBody(comment.body);
                    setEditing(true);
                    setConfirmDelete(false);
                  }}
                  aria-label="Edit comment"
                  className="hit-44 bg-transparent text-[var(--tx3)] hover:bg-[var(--elev)] hover:text-[var(--tx)] active:scale-[0.97] focus-ring"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--dur-ui)',
                  }}
                >
                  <Pencil size={12} />
                </button>
              )}

              {showDelete && !confirmDelete && (
                <button
                  ref={deleteTriggerRef}
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete comment"
                  disabled={isDeleting}
                  className="hit-44 bg-transparent text-[var(--tx3)] hover:bg-[color-mix(in_oklab,var(--status-error)_12%,transparent)] hover:text-[var(--status-error)] active:scale-[0.97] focus-ring-error"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--dur-ui)',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}

              {/* Inline delete confirmation */}
              {confirmDelete && (
                <div
                  role="group"
                  aria-label="Delete this comment?"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      cancelDelete();
                    }
                  }}
                  className="[@media(pointer:coarse)]:!gap-5"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'color-mix(in oklab, var(--status-error) 8%, transparent)',
                    border: '1px solid color-mix(in oklab, var(--status-error) 20%, transparent)',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--status-error)' }}>Delete?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    aria-label="Confirm delete"
                    className="hit-44 focus-ring"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--status-error)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      borderRadius: 4,
                    }}
                  >
                    <Check size={12} />
                  </button>
                  <button
                    ref={cancelDeleteRef}
                    type="button"
                    onClick={cancelDelete}
                    aria-label="Cancel delete"
                    className="hit-44 focus-ring"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--tx3)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      borderRadius: 4,
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body or edit textarea */}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              autoFocus
              className="input-field"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--tx)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                resize: 'vertical',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditing(false);
                  setEditBody(comment.body);
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--tx2)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
                className="focus-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !editBody.trim()}
                className="active:scale-[0.97] focus-ring"
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
                  color: 'var(--text-on-gradient)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isSaving ? 'default' : 'pointer',
                  opacity: !editBody.trim() ? 0.4 : 1,
                  fontFamily: 'var(--font-body)',
                  transition: 'all var(--dur-ui)',
                }}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
            <p style={{ fontSize: 10, color: 'var(--tx3)', margin: 0 }}>
              {/Mac|iPhone|iPad/.test(navigator.platform ?? '') ? '⌘' : 'Ctrl+'}Enter to save · Esc to cancel
            </p>
          </div>
        ) : (
          <p
            style={{
              fontSize: 13,
              color: 'var(--tx)',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {comment.body}
          </p>
        )}
      </div>
    </div>
  );
}
