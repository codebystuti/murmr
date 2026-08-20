import { describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@/types';
import { useAuthStore } from './store';

const mockUser: User = {
  id: 'u-test-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  joinedAt: '2024-01-01T00:00:00.000Z',
  postCount: 0,
  upvoteCount: 0,
  commentCount: 0,
};

beforeEach(() => {
  // Reset in-memory state then clear localStorage so each test starts clean
  useAuthStore.setState({ user: null, isAuthenticated: false });
  localStorage.clear();
});

describe('useAuthStore', () => {
  it('starts with no user and not authenticated', () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('login sets the user and marks the store as authenticated', () => {
    useAuthStore.getState().login(mockUser);
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isAuthenticated).toBe(true);
  });

  it('logout clears the user and resets the authenticated flag', () => {
    useAuthStore.getState().login(mockUser);
    useAuthStore.getState().logout();
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('logout writes the logged-out state to localStorage via the persist middleware', () => {
    useAuthStore.getState().login(mockUser);
    useAuthStore.getState().logout();
    const raw = localStorage.getItem('murmr-auth');
    const stored = JSON.parse(raw ?? '{}') as { state?: { user: unknown; isAuthenticated: unknown } };
    expect(stored.state?.user).toBeNull();
    expect(stored.state?.isAuthenticated).toBe(false);
  });
});
