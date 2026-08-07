import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import type { Post, User } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { UpvoteButton } from './UpvoteButton';
import { StatusPill } from './StatusPill';

interface PostCardProps {
  post: Post;
  author?: User;
  postId: string;
}

export function PostCard({ post, author, postId }: PostCardProps) {
  return (
    <article
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--elev)] hover:border-[var(--border-2)] hover:[box-shadow:var(--shadow)] focus-within:bg-[var(--elev)] focus-within:border-[var(--border-2)]"
      style={{
        position: 'relative',
        display: 'flex',
        gap: 12,
        padding: 16,
        alignItems: 'flex-start',
        transition: 'all var(--dur-ui) var(--ease-out-expo)',
      }}
    >
      {/* Overlay link fills the card; sits above static content (z:1) but below upvote (z:2) */}
      <Link
        to={`/app/post/${postId}`}
        aria-label={post.title}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--grad-1)]"
        style={{ zIndex: 1 }}
      />

      {/* Upvote sits above the overlay — clicks register on the button, not the link */}
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <UpvoteButton post={post} />
      </div>

      {/* Content is position:static (below the positioned overlay); clicks pass through to the Link */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--tx)',
            marginBottom: 4,
            lineHeight: 1.35,
            letterSpacing: '-0.005em',
          }}
        >
          {post.title}
        </div>

        {post.body && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--tx2)',
              marginBottom: 8,
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.body}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <StatusPill status={post.status} />

          <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--tx3)',
            }}
          >
            <MessageSquare size={11} />
            {post.commentCount}
          </span>

          {author && (
            <>
              <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{author.name}</span>
            </>
          )}

          <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>

          <span
            style={{
              fontSize: 11,
              color: 'var(--tx3)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatRelativeTime(post.createdAt)}
          </span>

          {post.tags.length > 0 && (
            <>
              <span style={{ color: 'var(--border-2)', fontSize: 10 }}>·</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 7px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      color: 'var(--tx3)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
