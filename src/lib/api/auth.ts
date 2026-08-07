import type { User } from '@/types';
import { STORAGE_KEYS, ADMIN_USER } from '@/lib/seed';
import { delay, generateId } from '@/lib/utils';

function getUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? (JSON.parse(raw) as User[]) : [ADMIN_USER];
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export const authApi = {
  async login(email: string, _password: string): Promise<User> {
    await delay(600);
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account found with that email.');
    return user;
  },

  async signup(name: string, email: string, _password: string): Promise<User> {
    await delay(800);
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with that email already exists.');
    }
    const newUser: User = {
      id: generateId('user'),
      name,
      email: email.toLowerCase(),
      role: 'user',
      joinedAt: new Date().toISOString(),
      postCount: 0,
      upvoteCount: 0,
      commentCount: 0,
    };
    saveUsers([...users, newUser]);
    return newUser;
  },

  async forgotPassword(_email: string): Promise<void> {
    await delay(800);
    // Mock: always succeeds
  },

  async resetPassword(token: string, _password: string): Promise<void> {
    await delay(700);
    if (token !== 'demo-reset-token') {
      throw new Error('Invalid or expired reset link.');
    }
  },
};
