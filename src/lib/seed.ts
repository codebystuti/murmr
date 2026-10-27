import seedData from './seed-data.json';
import type { User, Board } from '@/types';

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

/**
 * Wipes and regenerates the demo data. Pass the signed-in user to keep their account in the
 * fresh users table (as it is now), so names, roles and logins stay consistent after a reset.
 */
export function resetSeed(keepUser?: User | null) {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  initSeed();
  if (keepUser) {
    const users = (seedData.users as User[]).filter((u) => u.id !== keepUser.id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, keepUser]));
  }
}

const SEED_BY_KEY: Record<string, unknown> = {
  [STORAGE_KEYS.USERS]: seedData.users,
  [STORAGE_KEYS.BOARDS]: seedData.boards,
  [STORAGE_KEYS.POSTS]: seedData.posts,
  [STORAGE_KEYS.COMMENTS]: seedData.comments,
  [STORAGE_KEYS.CHANGELOG]: seedData.changelog,
  [STORAGE_KEYS.ACTIVITY]: seedData.activity,
};

/** A fresh copy of the seed value for a storage key (callers may mutate it), or undefined. */
export function getSeedValue(key: string): unknown {
  const value = SEED_BY_KEY[key];
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export { STORAGE_KEYS, BOARDS };
