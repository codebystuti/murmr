import type { ActivityEvent } from '@/types';
import { STORAGE_KEYS } from '@/lib/seed';
import { delay } from '@/lib/utils';

export const activityApi = {
  async list(limit = 60): Promise<ActivityEvent[]> {
    await delay(100);
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    const events: ActivityEvent[] = raw ? JSON.parse(raw) : [];
    return events.slice(0, limit);
  },
};
