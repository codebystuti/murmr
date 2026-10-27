import { queryClient, TOGGLE_UPVOTE_KEY } from './queryClient';
import { STORAGE_KEYS } from './seed';
import { storage, writeList } from './api/storage';
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
  const feed = storage.activity();
  feed.unshift(event);
  writeList(STORAGE_KEYS.ACTIVITY, feed.slice(0, 100));
  queryClient.invalidateQueries({ queryKey: ['activity'] });
  useActivityStore.getState().increment();
}

/**
 * Refreshes post data after a simulated change. The open post page reads ['post', id], so that is
 * refreshed too. While the user's own upvote is in flight the caches are only marked stale: a refetch
 * landing before the vote is saved would briefly show the old count, and the vote's onSettled
 * refetches them anyway.
 */
function invalidatePosts() {
  const refetchType = queryClient.isMutating({ mutationKey: TOGGLE_UPVOTE_KEY }) > 0 ? 'none' : 'active';
  queryClient.invalidateQueries({ queryKey: ['posts'], refetchType });
  queryClient.invalidateQueries({ queryKey: ['post'], refetchType });
}

function addComment(userId: string, post: Post) {
  const comments = storage.comments();

  const comment: Comment = {
    id: generateId('comment'),
    postId: post.id,
    authorId: userId,
    body: COMMENT_TEMPLATES[getRandomInt(0, COMMENT_TEMPLATES.length - 1)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  comments.push(comment);
  writeList(STORAGE_KEYS.COMMENTS, comments);

  const posts = storage.posts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx !== -1) {
    posts[idx].commentCount = (posts[idx].commentCount ?? 0) + 1;
    writeList(STORAGE_KEYS.POSTS, posts);
  }

  queryClient.invalidateQueries({ queryKey: ['comments'] });
  invalidatePosts();
}

function addUpvote(userId: string, post: Post): boolean {
  const posts = storage.posts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx === -1) return false;

  if (posts[idx].upvotedBy.includes(userId)) return false;

  posts[idx].upvotedBy.push(userId);
  posts[idx].upvotes += 1;
  writeList(STORAGE_KEYS.POSTS, posts);
  invalidatePosts();
  return true;
}

/** One simulated event. Returns without doing anything when there is nothing to act on. */
function tick() {
  const users = storage.users();
  const posts = storage.posts();
  const currentUserId = useAuthStore.getState().user?.id;
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  if (otherUsers.length === 0 || posts.length === 0) return;

  const user = otherUsers[getRandomInt(0, otherUsers.length - 1)];
  const post = posts[getRandomInt(0, Math.min(posts.length - 1, 9))];
  const action = ACTIONS[getRandomInt(0, ACTIONS.length - 1)];

  if (action === 'commented') {
    addComment(user.id, post);
  } else if (action === 'upvoted') {
    if (!addUpvote(user.id, post)) return;
  }

  pushActivity({
    id: generateId('act'),
    userId: user.id,
    action,
    targetId: post.id,
    targetTitle: post.title,
    timestamp: new Date().toISOString(),
  });
}

function schedule() {
  const delay = getRandomInt(20_000, 30_000);
  timer = setTimeout(() => {
    // Always reschedule, even if this tick throws, so one bad event can't end the feed.
    try {
      tick();
    } catch (err) {
      console.warn('[murmr] Activity simulator tick failed:', err);
    } finally {
      // Paused while the tab was hidden (the handler cleared the timer): don't restart here.
      if (timer !== null) schedule();
    }
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
