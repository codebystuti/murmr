import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import type { Post } from '@/types';
import { PostCard } from './PostCard';

const post: Post = {
  id: 'post-1',
  title: 'Add dark mode support',
  body: 'Would love a dark mode option for long reading sessions.',
  status: 'planned',
  boardId: 'board-1',
  authorId: 'user-1',
  upvotes: 42,
  upvotedBy: [],
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  commentCount: 7,
};

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PostCard', () => {
  it('renders the post title', () => {
    render(<PostCard post={post} postId={post.id} />, { wrapper: Wrapper });
    expect(screen.getByText('Add dark mode support')).toBeInTheDocument();
  });

  it('renders the upvote count in the upvote button', () => {
    render(<PostCard post={post} postId={post.id} />, { wrapper: Wrapper });
    const button = screen.getByRole('button', { name: /upvote/i });
    expect(button).toHaveTextContent('42');
  });

  it('renders the comment count', () => {
    render(<PostCard post={post} postId={post.id} />, { wrapper: Wrapper });
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders the status pill with the correct label for the post status', () => {
    render(<PostCard post={post} postId={post.id} />, { wrapper: Wrapper });
    expect(screen.getByText('Planned')).toBeInTheDocument();
  });
});
