import { queryClient } from './queryClient';
import { STORAGE_KEYS } from './seed';
import { generateId } from './utils';
import { useActivityStore } from './activity-store';
import { useAuthStore } from '@/features/auth/store';
import type { ActivityEvent, Post, Comment } from '@/types';

const ACTIONS: ActivityEvent['action'][] = ['upvoted', 'commented'];

let timer: ReturnType<typeof setTimeout> | null = null;
let visibilityHandler: (() => void) | null = null;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COMMENT_TEMPLATES = [
  'This would be a great addition to the platform.',
  'We need this — our team has been asking for it.',
  'Any timeline on when this might ship?',
  'Totally agree, this is a must-have.',
  '+1, this would save us a lot of time.',
  'Would love to see this prioritized.',
  'This aligns well with our workflow.',
  'Great idea — our users would benefit from this too.',
  'Is there a workaround in the meantime?',
  'Excited to see progress on this.',
  'This is exactly what we need.',
  'Has there been any movement on this recently?',
];

function pushActivity(event: ActivityEvent) {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
  const feed: ActivityEvent[] = raw ? JSON.parse(raw) : [];
  feed.unshift(event);
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(feed.slice(0, 100)));
  queryClient.invalidateQueries({ queryKey: ['activity'] });
  useActivityStore.getState().increment();
}

function addComment(userId: string, post: Post) {
  const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const comments: Comment[] = raw ? JSON.parse(raw) : [];

  const comment: Comment = {
    id: generateId('comment'),
    postId: post.id,
    authorId: userId,
    body: COMMENT_TEMPLATES[getRandomInt(0, COMMENT_TEMPLATES.length - 1)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  comments.push(comment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

  const postsRaw = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (postsRaw) {
    const posts: Post[] = JSON.parse(postsRaw);
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx !== -1) {
      posts[idx].commentCount = (posts[idx].commentCount ?? 0) + 1;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  }

  queryClient.invalidateQueries({ queryKey: ['comments'] });
  queryClient.invalidateQueries({ queryKey: ['posts'] });
}

function addUpvote(userId: string, post: Post): boolean {
  const postsRaw = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (!postsRaw) return false;

  const posts: Post[] = JSON.parse(postsRaw);
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx === -1) return false;

  if (posts[idx].upvotedBy.includes(userId)) return false;

  posts[idx].upvotedBy.push(userId);
  posts[idx].upvotes += 1;
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  queryClient.invalidateQueries({ queryKey: ['posts'] });
  return true;
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
    const currentUserId = useAuthStore.getState().user?.id;
    const otherUsers = users.filter((u: { id: string }) => u.id !== currentUserId);
    if (otherUsers.length === 0 || posts.length === 0) { schedule(); return; }

    const user = otherUsers[getRandomInt(0, otherUsers.length - 1)];
    const post = posts[getRandomInt(0, Math.min(posts.length - 1, 9))];
    const action = ACTIONS[getRandomInt(0, ACTIONS.length - 1)];

    if (action === 'commented') {
      addComment(user.id, post);
    } else if (action === 'upvoted') {
      if (!addUpvote(user.id, post)) { schedule(); return; }
    }

    pushActivity({
      id: generateId('act'),
      userId: user.id,
      action,
      targetId: post.id,
      targetTitle: post.title,
      timestamp: new Date().toISOString(),
    });

    schedule();
  }, delay);
}

export function startActivitySimulator() {
  if (timer !== null) return;

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
