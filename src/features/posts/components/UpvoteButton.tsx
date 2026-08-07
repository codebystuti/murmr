import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToggleUpvote } from '@/features/posts/hooks/usePostMutations';
import { formatNumber } from '@/lib/utils';

interface UpvoteButtonProps {
  post: Post;
  big?: boolean;
}

export function UpvoteButton({ post, big = false }: UpvoteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: toggleUpvote, isPending } = useToggleUpvote();
  const [hovered, setHovered] = useState(false);

  const hasVoted = user ? post.upvotedBy.includes(user.id) : false;
  const active = hasVoted;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isPending) return;
    if (!user) {
      toast.error('Sign in to upvote', {
        action: {
          label: 'Sign in',
          onClick: () => navigate('/login'),
        },
      });
      return;
    }
    toggleUpvote({ postId: post.id, userId: user.id });
  }

  const showHoverState = hovered && !active && !isPending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${hasVoted ? 'Remove upvote' : 'Upvote'} — ${post.upvotes} upvotes`}
      aria-pressed={hasVoted}
      className="active:scale-[0.97] focus-ring"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: big ? 64 : 44,
        height: big ? 80 : 56,
        borderRadius: big ? 14 : 10,
        border: active
          ? '1px solid color-mix(in oklab, var(--grad-2) 50%, transparent)'
          : showHoverState
          ? '1px solid color-mix(in oklab, var(--grad-2) 30%, transparent)'
          : '1px solid var(--border)',
        background: active
          ? 'linear-gradient(180deg, color-mix(in oklab, var(--grad-2) 18%, transparent), color-mix(in oklab, var(--grad-1) 12%, transparent))'
          : showHoverState
          ? 'color-mix(in oklab, var(--grad-1) 6%, transparent)'
          : 'var(--surface)',
        color: active || showHoverState ? 'var(--tx)' : 'var(--tx2)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: big ? 16 : 12,
        flexShrink: 0,
        cursor: isPending ? 'default' : 'pointer',
        transition: 'all var(--dur-ui) var(--ease-out-expo)',
      }}
    >
      <svg
        width={big ? 14 : 10}
        height={big ? 9 : 6}
        viewBox="0 0 10 6"
        fill="none"
        style={{ marginBottom: 3 }}
        aria-hidden="true"
      >
        <path
          d="M1 5L5 1L9 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {formatNumber(post.upvotes)}
    </button>
  );
}
