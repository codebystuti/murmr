import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readList, isPost, isUser, storage } from './storage';
import { STORAGE_KEYS, getSeedValue, ADMIN_USER, BOARDS } from '@/lib/seed';

const POST = {
  id: 'post_1',
  title: 'Dark mode',
  body: '',
  status: 'open',
  boardId: 'b1',
  authorId: 'u1',
  upvotes: 3,
  upvotedBy: ['u1'],
  tags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  commentCount: 0,
};

describe('readList', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('returns the stored items when the data is valid, without warning or rewriting', () => {
    const raw = JSON.stringify([POST]);
    localStorage.setItem(STORAGE_KEYS.POSTS, raw);
    expect(readList(STORAGE_KEYS.POSTS, isPost)).toEqual([POST]);
    expect(warn).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEYS.POSTS)).toBe(raw);
  });

  it('returns the fallback for a missing key and writes nothing', () => {
    expect(readList(STORAGE_KEYS.POSTS, isPost)).toEqual([]);
    expect(readList(STORAGE_KEYS.USERS, isUser, () => [ADMIN_USER])).toEqual([ADMIN_USER]);
    expect(localStorage.getItem(STORAGE_KEYS.POSTS)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('repairs unparseable JSON from the seed data and warns', () => {
    localStorage.setItem(STORAGE_KEYS.POSTS, '{not json');
    const seedPosts = getSeedValue(STORAGE_KEYS.POSTS) as unknown[];
    const result = readList(STORAGE_KEYS.POSTS, isPost);
    expect(seedPosts.length).toBeGreaterThan(0);
    expect(result).toHaveLength(seedPosts.length);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)!)).toHaveLength(seedPosts.length);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('repairs valid JSON that is not an array', () => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify({ oops: true }));
    const result = storage.comments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe((getSeedValue(STORAGE_KEYS.COMMENTS) as unknown[]).length);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('falls back when there is no seed for the key', () => {
    localStorage.setItem('murmr:unknown', 'null');
    expect(readList('murmr:unknown', isPost, () => [])).toEqual([]);
    expect(localStorage.getItem('murmr:unknown')).toBe('[]');
  });

  it('drops malformed items, keeps the rest and saves the cleaned list', () => {
    localStorage.setItem(
      STORAGE_KEYS.POSTS,
      JSON.stringify([POST, null, 'x', { ...POST, id: 'post_2', upvotedBy: 'nope' }, { id: 'post_3' }]),
    );
    expect(readList(STORAGE_KEYS.POSTS, isPost)).toEqual([POST]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)!)).toEqual([POST]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('never throws when localStorage itself throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(storage.boards()).toEqual(BOARDS);
    spy.mockRestore();
  });

  it('returns a copy of the seed, so callers can mutate the result safely', () => {
    localStorage.setItem(STORAGE_KEYS.POSTS, 'corrupt');
    const first = storage.posts();
    first[0].upvotes = -999;
    localStorage.setItem(STORAGE_KEYS.POSTS, 'corrupt');
    expect(storage.posts()[0].upvotes).not.toBe(-999);
  });
});
