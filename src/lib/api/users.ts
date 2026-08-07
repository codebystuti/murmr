import type { User } from '@/types';
import { STORAGE_KEYS, ADMIN_USER } from '@/lib/seed';
import { delay } from '@/lib/utils';

function getUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? (JSON.parse(raw) as User[]) : [ADMIN_USER];
}

export const usersApi = {
  async list(): Promise<User[]> {
    await delay(100);
    return getUsers();
  },

  async get(id: string): Promise<User | null> {
    await delay(50);
    return getUsers().find((u) => u.id === id) ?? null;
  },

  async update(id: string, data: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    await delay(400);
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found.');
    users[idx] = { ...users[idx], ...data };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[idx];
  },
};
