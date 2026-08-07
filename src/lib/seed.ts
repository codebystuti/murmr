import { faker } from '@faker-js/faker';
import type { User, Board, Post, Comment, ChangelogEntry, ActivityEvent, PostStatus } from '@/types';
import { generateId } from './utils';

faker.seed(42);

const STORAGE_KEYS = {
  SEEDED: 'murmr:seeded',
  USERS: 'murmr:users',
  BOARDS: 'murmr:boards',
  POSTS: 'murmr:posts',
  COMMENTS: 'murmr:comments',
  CHANGELOG: 'murmr:changelog',
  ACTIVITY: 'murmr:activity',
} as const;

// ── Hardcoded admin ──────────────────────────────────────────────
export const ADMIN_USER: User = {
  id: 'user_admin',
  name: 'Maya Chen',
  email: 'maya@northwind.io',
  role: 'admin',
  joinedAt: '2024-08-01T00:00:00.000Z',
  postCount: 42,
  upvoteCount: 318,
  commentCount: 127,
};

// ── Boards (hardcoded, 3 total) ──────────────────────────────────
const BOARDS: Board[] = [
  {
    id: 'board_features',
    name: 'Feature Requests',
    slug: 'feature-requests',
    description: 'Suggest and vote on new features',
  },
  {
    id: 'board_bugs',
    name: 'Bug Reports',
    slug: 'bug-reports',
    description: 'Report issues and track fixes',
  },
  {
    id: 'board_general',
    name: 'General Feedback',
    slug: 'general-feedback',
    description: 'General feedback and suggestions',
  },
];

function generateUsers(): User[] {
  const users: User[] = [ADMIN_USER];
  for (let i = 0; i < 20; i++) {
    users.push({
      id: generateId('user'),
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      avatar: faker.image.avatarGitHub(),
      role: 'user',
      joinedAt: faker.date.past({ years: 2 }).toISOString(),
      postCount: faker.number.int({ min: 0, max: 30 }),
      upvoteCount: faker.number.int({ min: 0, max: 200 }),
      commentCount: faker.number.int({ min: 0, max: 80 }),
    });
  }
  return users;
}

const POST_TEMPLATES = [
  { title: 'Slack thread sync — pull replies into Murmr posts', boardSlug: 'feature-requests', status: 'progress' as PostStatus, upvotes: 284, tags: ['integration', 'slack', 'triage'] },
  { title: 'Roadmap embeds with custom theming', boardSlug: 'feature-requests', status: 'planned' as PostStatus, upvotes: 201, tags: ['embed', 'customization'] },
  { title: 'Changelog email digests, weekly', boardSlug: 'feature-requests', status: 'planned' as PostStatus, upvotes: 156, tags: ['email', 'changelog'] },
  { title: 'Bulk-merge duplicate posts with AI', boardSlug: 'feature-requests', status: 'open' as PostStatus, upvotes: 92, tags: ['ai', 'moderation'] },
  { title: 'API: webhook on status change', boardSlug: 'feature-requests', status: 'shipped' as PostStatus, upvotes: 44, tags: ['api', 'webhook'] },
  { title: 'GitHub issue linking', boardSlug: 'feature-requests', status: 'planned' as PostStatus, upvotes: 78, tags: ['integration', 'github'] },
  { title: 'Customer segments in scoring', boardSlug: 'feature-requests', status: 'open' as PostStatus, upvotes: 52, tags: ['prioritization'] },
  { title: 'AI duplicate clustering', boardSlug: 'feature-requests', status: 'progress' as PostStatus, upvotes: 132, tags: ['ai'] },
];

function generatePosts(users: User[], boards: Board[]): Post[] {
  const posts: Post[] = [];
  const boardMap = Object.fromEntries(boards.map((b) => [b.slug, b.id]));

  // Seeded template posts
  POST_TEMPLATES.forEach((tpl) => {
    const author = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const upvoterIds = users
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(tpl.upvotes, users.length))
      .map((u) => u.id);

    posts.push({
      id: generateId('post'),
      title: tpl.title,
      body: faker.lorem.paragraphs(2),
      status: tpl.status,
      boardId: boardMap[tpl.boardSlug] ?? boards[0].id,
      authorId: author.id,
      upvotes: tpl.upvotes,
      upvotedBy: upvoterIds,
      tags: tpl.tags,
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
      updatedAt: faker.date.recent({ days: 10 }).toISOString(),
      commentCount: faker.number.int({ min: 0, max: 15 }),
    });
  });

  // Extra random posts
  for (let i = 0; i < 30; i++) {
    const author = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const board = boards[faker.number.int({ min: 0, max: boards.length - 1 })];
    const upvotes = faker.number.int({ min: 1, max: 120 });
    const statuses: PostStatus[] = ['open', 'planned', 'progress', 'shipped', 'closed'];

    posts.push({
      id: generateId('post'),
      title: faker.hacker.phrase(),
      body: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      status: statuses[faker.number.int({ min: 0, max: 4 })],
      boardId: board.id,
      authorId: author.id,
      upvotes,
      upvotedBy: users.slice(0, upvotes % users.length).map((u) => u.id),
      tags: [faker.hacker.noun(), faker.hacker.verb()],
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      updatedAt: faker.date.recent({ days: 20 }).toISOString(),
      commentCount: faker.number.int({ min: 0, max: 20 }),
    });
  }

  return posts;
}

function generateComments(users: User[], posts: Post[]): Comment[] {
  const comments: Comment[] = [];
  posts.forEach((post) => {
    const count = post.commentCount;
    for (let i = 0; i < count; i++) {
      const author = users[faker.number.int({ min: 0, max: users.length - 1 })];
      comments.push({
        id: generateId('comment'),
        postId: post.id,
        authorId: author.id,
        body: faker.lorem.sentences(faker.number.int({ min: 1, max: 4 })),
        createdAt: faker.date.recent({ days: 25 }).toISOString(),
        updatedAt: faker.date.recent({ days: 5 }).toISOString(),
      });
    }
  });
  return comments;
}

function generateChangelog(posts: Post[]): ChangelogEntry[] {
  const shipped = posts.filter((p) => p.status === 'shipped');
  const entries: ChangelogEntry[] = [
    {
      id: generateId('cl'),
      title: 'Faster board search',
      body: 'Server-side fuzzy matching cuts query time by 4×. Search across titles, descriptions, comments, and tags.',
      type: 'improved',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      postIds: shipped.slice(0, 1).map((p) => p.id),
    },
    {
      id: generateId('cl'),
      title: 'Public roadmap embeds',
      body: 'Drop your roadmap into Notion, docs, or your help center with a single iframe. Five themes, dark mode supported.',
      type: 'new',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      postIds: shipped.slice(1, 2).map((p) => p.id),
    },
    {
      id: generateId('cl'),
      title: 'Email notification batching',
      body: 'Hourly digests for active threads instead of one notification per comment.',
      type: 'fixed',
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      postIds: [],
    },
    {
      id: generateId('cl'),
      title: 'Saved filters on the board',
      body: 'Pin a filter combo. Comes back next session. Works across browsers.',
      type: 'new',
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      postIds: shipped.slice(2, 3).map((p) => p.id),
    },
  ];
  return entries;
}

function generateActivity(users: User[], posts: Post[]): ActivityEvent[] {
  const actions: ActivityEvent['action'][] = ['created', 'upvoted', 'commented', 'shipped'];
  return Array.from({ length: 40 }, () => {
    const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const post = posts[faker.number.int({ min: 0, max: Math.min(posts.length - 1, 9) })];
    return {
      id: generateId('act'),
      userId: user.id,
      action: actions[faker.number.int({ min: 0, max: actions.length - 1 })],
      targetId: post.id,
      targetTitle: post.title,
      timestamp: faker.date.recent({ days: 7 }).toISOString(),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function initSeed() {
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

  const users = generateUsers();
  const posts = generatePosts(users, BOARDS);
  const comments = generateComments(users, posts);
  const changelog = generateChangelog(posts);
  const activity = generateActivity(users, posts);

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(BOARDS));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  localStorage.setItem(STORAGE_KEYS.CHANGELOG, JSON.stringify(changelog));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activity));
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}

export function resetSeed() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  initSeed();
}

export { STORAGE_KEYS, BOARDS };
