import type { Board } from '@/types';
import { BOARDS, STORAGE_KEYS } from '@/lib/seed';
import { delay } from '@/lib/utils';

function getBoards(): Board[] {
  const raw = localStorage.getItem(STORAGE_KEYS.BOARDS);
  return raw ? (JSON.parse(raw) as Board[]) : BOARDS;
}

export const boardsApi = {
  async list(): Promise<Board[]> {
    await delay(200);
    return getBoards();
  },

  async get(id: string): Promise<Board> {
    await delay(150);
    const board = getBoards().find((b) => b.id === id || b.slug === id);
    if (!board) throw new Error('Board not found.');
    return board;
  },
};
