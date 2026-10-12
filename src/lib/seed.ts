import seedData from './seed-data.json';
import type { User, Board, Post, Comment, ChangelogEntry, ActivityEvent } from '@/types';

const STORAGE_KEYS = {
  SEEDED: 'murmr:seeded',
  USERS: 'murmr:users',
  BOARDS: 'murmr:boards',
  POSTS: 'murmr:posts',
  COMMENTS: 'murmr:comments',
  CHANGELOG: 'murmr:changelog',
  ACTIVITY: 'murmr:activity',
} as const;

export const ADMIN_USER: User = seedData.users[0] as User;
const BOARDS: Board[] = seedData.boards as Board[];

export function initSeed() {
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedData.users));
  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(seedData.boards));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(seedData.posts));
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(seedData.comments));
  localStorage.setItem(STORAGE_KEYS.CHANGELOG, JSON.stringify(seedData.changelog));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(seedData.activity));
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}

export function resetSeed() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  initSeed();
}

export { STORAGE_KEYS, BOARDS };
