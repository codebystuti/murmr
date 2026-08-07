import type { ChangelogEntry } from '@/types';
import { STORAGE_KEYS } from '@/lib/seed';
import { delay } from '@/lib/utils';

export const changelogApi = {
  async list(): Promise<ChangelogEntry[]> {
    await delay(200);
    const raw = localStorage.getItem(STORAGE_KEYS.CHANGELOG);
    const entries: ChangelogEntry[] = raw ? JSON.parse(raw) : [];
    return entries.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  },
};
