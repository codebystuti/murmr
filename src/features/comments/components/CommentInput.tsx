import { useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useAddComment } from '@/features/comments/hooks/useComments';
import type { User } from '@/types';

interface CommentInputProps {
  postId: string;
  currentUser: User;
}

export function CommentInput({ postId, currentUser }: CommentInputProps) {
  const [body, setBody] = useState('');
  const { mutate: addComment, isPending } = useAddComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    addComment(
      { postId, authorId: currentUser.id, body: trimmed },
      {
        onSuccess: () => {
          setBody('');
          textareaRef.current?.focus();
        },
      },
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: currentUser.avatar
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
          marginTop: 4,
        }}
      >
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          getInitials(currentUser.name)
        )}
      </div>

      {/* Input area */}
      <div style={{ flex: 1 }}>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
          disabled={isPending}
          className="input-field"
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--tx)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            resize: 'none',
            lineHeight: 1.6,
            transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui)',
            boxSizing: 'border-box',
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--tx3)' }}>⌘Enter to post</span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!body.trim() || isPending}
            className="focus-ring"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background:
                body.trim() && !isPending
                  ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'
                  : 'var(--border)',
              color: body.trim() && !isPending ? 'var(--text-on-gradient)' : 'var(--tx3)',
              fontSize: 12,
              fontWeight: 600,
              cursor: body.trim() && !isPending ? 'pointer' : 'default',
              transition: 'all var(--dur-ui)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {isPending ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}
