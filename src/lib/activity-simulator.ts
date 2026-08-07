import { queryClient } from './queryClient';
import { STORAGE_KEYS } from './seed';
import { generateId } from './utils';
import { useActivityStore } from './activity-store';
import type { ActivityEvent } from '@/types';

const ACTIONS: ActivityEvent['action'][] = ['created', 'upvoted', 'commented', 'shipped'];

let timer: ReturnType<typeof setTimeout> | null = null;
let visibilityHandler: (() => void) | null = null;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pushActivity(event: ActivityEvent) {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
  const feed: ActivityEvent[] = raw ? JSON.parse(raw) : [];
  feed.unshift(event);
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(feed.slice(0, 100)));
  queryClient.invalidateQueries({ queryKey: ['activity'] });
  useActivityStore.getState().increment();
}

function schedule() {
  const delay = getRandomInt(20_000, 30_000);
  timer = setTimeout(() => {
    const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
    const postsRaw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!usersRaw || !postsRaw) {
      schedule();
      return;
    }

    const users = JSON.parse(usersRaw);
    const posts = JSON.parse(postsRaw);
    const user = users[getRandomInt(0, users.length - 1)];
    const post = posts[getRandomInt(0, Math.min(posts.length - 1, 9))];

    pushActivity({
      id: generateId('act'),
      userId: user.id,
      action: ACTIONS[getRandomInt(0, ACTIONS.length - 1)],
      targetId: post.id,
      targetTitle: post.title,
      timestamp: new Date().toISOString(),
    });

    schedule();
  }, delay);
}

export function startActivitySimulator() {
  if (timer !== null) return; // Already running

  // Page Visibility API — pause when tab hidden, resume when visible
  if (!visibilityHandler) {
    visibilityHandler = () => {
      if (document.hidden) {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      } else {
        startActivitySimulator();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  if (!document.hidden) {
    schedule();
  }
}

export function stopActivitySimulator() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
}
