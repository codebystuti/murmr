import type { ActivityEvent, Board, ChangelogEntry, Comment, Post, User } from '@/types';
import { ADMIN_USER, BOARDS, STORAGE_KEYS, getSeedValue } from '@/lib/seed';

type Guard<T> = (value: unknown) => value is T;
type Rec = Record<string, unknown>;

const isRecord = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const hasStrings = (v: Rec, keys: string[]) => keys.every((k) => typeof v[k] === 'string');

// Only the fields the UI dereferences in ways that would throw (.includes, .map, .toLowerCase…).
export const isPost: Guard<Post> = (v): v is Post =>
  isRecord(v) &&
  hasStrings(v, ['id', 'title', 'status', 'createdAt']) &&
  typeof v.upvotes === 'number' &&
  Array.isArray(v.upvotedBy) &&
  Array.isArray(v.tags);

export const isComment: Guard<Comment> = (v): v is Comment =>
  isRecord(v) && hasStrings(v, ['id', 'postId', 'authorId', 'body', 'createdAt']);

export const isUser: Guard<User> = (v): v is User =>
  isRecord(v) && hasStrings(v, ['id', 'name', 'email']);

export const isBoard: Guard<Board> = (v): v is Board => isRecord(v) && hasStrings(v, ['id', 'slug', 'name']);

export const isActivityEvent: Guard<ActivityEvent> = (v): v is ActivityEvent =>
  isRecord(v) && hasStrings(v, ['id', 'userId', 'action', 'targetId', 'timestamp']);

export const isChangelogEntry: Guard<ChangelogEntry> = (v): v is ChangelogEntry =>
  isRecord(v) && hasStrings(v, ['id', 'title', 'type', 'publishedAt']);

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the in-memory value is still returned, so the app keeps working.
  }
}

/**
 * Reads a JSON array from localStorage without ever throwing.
 * - Missing key: returns `fallback()` (nothing is written).
 * - Unparseable JSON or not an array: warns and repairs the key from the seed data (or the fallback).
 * - An array with malformed items: warns, drops those items and saves the rest.
 */
export function readList<T>(key: string, isItem: Guard<T>, fallback: () => T[] = () => []): T[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback();
  }
  if (raw === null) return fallback();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  if (!Array.isArray(parsed)) {
    const seed = getSeedValue(key);
    const repaired = Array.isArray(seed) ? seed.filter(isItem) : fallback();
    console.warn(`[murmr] "${key}" in localStorage was corrupt and has been reset to the demo data.`);
    write(key, repaired);
    return repaired;
  }

  const valid = parsed.filter(isItem);
  if (valid.length !== parsed.length) {
    console.warn(`[murmr] Dropped ${parsed.length - valid.length} malformed item(s) from "${key}" in localStorage.`);
    write(key, valid);
  }
  return valid;
}

export function writeList<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

/** Safe readers for every collection, with the same fallbacks the API used before. */
export const storage = {
  users: () => readList(STORAGE_KEYS.USERS, isUser, () => [ADMIN_USER]),
  boards: () => readList(STORAGE_KEYS.BOARDS, isBoard, () => BOARDS),
  posts: () => readList(STORAGE_KEYS.POSTS, isPost),
  comments: () => readList(STORAGE_KEYS.COMMENTS, isComment),
  activity: () => readList(STORAGE_KEYS.ACTIVITY, isActivityEvent),
  changelog: () => readList(STORAGE_KEYS.CHANGELOG, isChangelogEntry),
};
