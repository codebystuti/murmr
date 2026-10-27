import type { Post, PostStatus } from '@/types';
import { STORAGE_KEYS } from '@/lib/seed';
import { delay, generateId } from '@/lib/utils';
import { storage, writeList } from './storage';

const getPosts = storage.posts;

function savePosts(posts: Post[]) {
  writeList(STORAGE_KEYS.POSTS, posts);
}

export const postsApi = {
  async list(boardId?: string): Promise<Post[]> {
    await delay(300);
    const posts = getPosts();
    return boardId ? posts.filter((p) => p.boardId === boardId) : posts;
  },

  async get(id: string): Promise<Post> {
    await delay(200);
    const post = getPosts().find((p) => p.id === id);
    if (!post) throw new Error('Post not found.');
    return post;
  },

  async create(data: { title: string; body: string; boardId: string; authorId: string; tags: string[] }): Promise<Post> {
    await delay(500);
    const post: Post = {
      id: generateId('post'),
      ...data,
      status: 'open',
      upvotes: 0,
      upvotedBy: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePosts([post, ...getPosts()]);
    return post;
  },

  async update(id: string, data: Partial<Pick<Post, 'title' | 'body' | 'status' | 'tags'>>): Promise<Post> {
    await delay(400);
    const posts = getPosts();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Post not found.');
    posts[idx] = { ...posts[idx], ...data, updatedAt: new Date().toISOString() };
    savePosts(posts);
    return posts[idx];
  },

  async remove(id: string): Promise<void> {
    await delay(400);
    savePosts(getPosts().filter((p) => p.id !== id));
    if (localStorage.getItem(STORAGE_KEYS.COMMENTS) !== null) {
      writeList(STORAGE_KEYS.COMMENTS, storage.comments().filter((c) => c.postId !== id));
    }
  },

  async toggleUpvote(postId: string, userId: string): Promise<Post> {
    await delay(200);
    const posts = getPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error('Post not found.');
    const post = posts[idx];
    const hasVoted = post.upvotedBy.includes(userId);
    posts[idx] = {
      ...post,
      upvotes: hasVoted ? post.upvotes - 1 : post.upvotes + 1,
      upvotedBy: hasVoted
        ? post.upvotedBy.filter((id) => id !== userId)
        : [...post.upvotedBy, userId],
    };
    savePosts(posts);
    return posts[idx];
  },

  async updateStatus(id: string, status: PostStatus): Promise<Post> {
    return postsApi.update(id, { status });
  },
};
