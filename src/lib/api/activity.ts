import type { ActivityEvent } from '@/types';
import { delay } from '@/lib/utils';
import { storage } from './storage';

export const activityApi = {
  async list(limit = 60): Promise<ActivityEvent[]> {
    await delay(100);
    return storage.activity().slice(0, limit);
  },
};
