export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  joinedAt: string;
  postCount: number;
  upvoteCount: number;
  commentCount: number;
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type PostStatus = 'open' | 'planned' | 'progress' | 'shipped' | 'closed';

export interface Post {
  id: string;
  title: string;
  body: string;
  status: PostStatus;
  boardId: string;
  authorId: string;
  upvotes: number;
  upvotedBy: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangelogEntry {
  id: string;
  title: string;
  body: string;
  type: 'new' | 'improved' | 'fixed';
  publishedAt: string;
  postIds: string[];
}

export type ActivityAction =
  | 'created'
  | 'upvoted'
  | 'commented'
  | 'shipped'
  | 'status_changed';

export interface ActivityEvent {
  id: string;
  userId: string;
  action: ActivityAction;
  targetId: string;
  targetTitle: string;
  timestamp: string;
}

export const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  open:     { label: 'Open',        color: 'var(--status-open)' },
  planned:  { label: 'Planned',     color: 'var(--status-planned)' },
  progress: { label: 'In progress', color: 'var(--status-progress)' },
  shipped:  { label: 'Shipped',     color: 'var(--status-shipped)' },
  closed:   { label: 'Closed',      color: 'var(--status-closed)' },
};
