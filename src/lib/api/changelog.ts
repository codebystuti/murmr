import type { ChangelogEntry } from '@/types';
import { delay } from '@/lib/utils';
import { storage } from './storage';

export const changelogApi = {
  async list(): Promise<ChangelogEntry[]> {
    await delay(200);
    return storage.changelog().sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  },
};
