import type { User } from '@/types';
import { STORAGE_KEYS } from '@/lib/seed';
import { delay } from '@/lib/utils';
import { storage } from './storage';

const getUsers = storage.users;

export const usersApi = {
  async list(): Promise<User[]> {
    await delay(100);
    return getUsers();
  },

  async get(id: string): Promise<User | null> {
    await delay(50);
    return getUsers().find((u) => u.id === id) ?? null;
  },

  async update(id: string, data: Partial<Pick<User, 'name' | 'avatar' | 'role'>>): Promise<User> {
    await delay(400);
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found.');
    users[idx] = { ...users[idx], ...data };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[idx];
  },
};
