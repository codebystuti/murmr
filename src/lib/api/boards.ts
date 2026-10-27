import type { Board } from '@/types';
import { delay } from '@/lib/utils';
import { storage } from './storage';

export const boardsApi = {
  async list(): Promise<Board[]> {
    await delay(200);
    return storage.boards();
  },

  async get(id: string): Promise<Board> {
    await delay(150);
    const board = storage.boards().find((b) => b.id === id || b.slug === id);
    if (!board) throw new Error('Board not found.');
    return board;
  },
};
