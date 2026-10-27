import type { Comment } from '@/types';
import { STORAGE_KEYS } from '@/lib/seed';
import { delay, generateId } from '@/lib/utils';
import { storage, writeList } from './storage';

const getComments = storage.comments;

function saveComments(comments: Comment[]) {
  writeList(STORAGE_KEYS.COMMENTS, comments);
}

function incrementPostCommentCount(postId: string, delta: 1 | -1) {
  if (localStorage.getItem(STORAGE_KEYS.POSTS) === null) return;
  const posts = storage.posts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    posts[idx].commentCount = Math.max(0, (posts[idx].commentCount ?? 0) + delta);
    writeList(STORAGE_KEYS.POSTS, posts);
  }
}

export const commentsApi = {
  async listByAuthor(authorId: string): Promise<Comment[]> {
    await delay(200);
    return getComments()
      .filter((c) => c.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async listByPost(postId: string): Promise<Comment[]> {
    await delay(200);
    return getComments()
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async create(data: { postId: string; authorId: string; body: string }): Promise<Comment> {
    await delay(400);
    const comment: Comment = {
      id: generateId('comment'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveComments([...getComments(), comment]);
    incrementPostCommentCount(data.postId, 1);
    return comment;
  },

  async update(id: string, body: string): Promise<Comment> {
    await delay(300);
    const comments = getComments();
    const idx = comments.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Comment not found.');
    comments[idx] = { ...comments[idx], body, updatedAt: new Date().toISOString() };
    saveComments(comments);
    return comments[idx];
  },

  async remove(id: string, postId: string): Promise<void> {
    await delay(300);
    saveComments(getComments().filter((c) => c.id !== id));
    incrementPostCommentCount(postId, -1);
  },
};
