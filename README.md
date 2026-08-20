# Murmr

Murmr is a customer feedback platform where users post ideas, upvote what matters, and follow their progress across a public roadmap and changelog. It's a full single-page application — authentication, real-time-feeling activity, optimistic interactions, a themeable app, and a cinematic marketing site — built on a mock API layer designed to swap cleanly for a real backend.

**Live demo:** https://codebystuti.github.io/murmr/

---

## Tech

React 18, TypeScript (strict mode), Vite 5. Routing with React Router 6. Server state with TanStack Query 5; client state with Zustand 4 (persisted). Forms with React Hook Form 7 + Zod 3. Styling with Tailwind CSS 3 and shadcn/ui on Radix primitives. Animation with Framer Motion 11 and GSAP 3 + ScrollTrigger; smooth scrolling with Lenis. Command palette with cmdk. Testing with Vitest 2 + React Testing Library.

There is no backend. A localStorage-backed mock API layer mirrors a real REST interface — the same async functions, artificial latency, loading states, and error handling you'd have against a server — so the full frontend, including optimistic updates and error rollback, works without one.

## File structure

```
murmr/
├── public/                     # favicon, OG image, SPA 404 redirect
├── src/
│   ├── components/
│   │   ├── layout/             # AppLayout, MarketingLayout, Sidebar, Topbar
│   │   ├── shared/             # CommandPalette, ErrorBoundary, RouteErrorFallback,
│   │   │                       # SubmitFeedbackModal, ThemeToggle, Logo
│   │   └── ui/                 # shadcn/ui primitives
│   ├── features/
│   │   ├── auth/               # Zustand auth store (+ test), login/signup components
│   │   ├── posts/              # PostCard (+ test), upvote, mutations, hooks, types
│   │   ├── comments/           # Comment CRUD components and hooks
│   │   ├── boards/             # Board hooks
│   │   ├── changelog/          # Changelog hooks
│   │   ├── activity/           # Activity feed hooks
│   │   └── users/              # User update hooks
│   ├── hooks/                  # useDebounce, usePasswordStrength, useAuth,
│   │                           # useReducedMotion, useMediaQuery, useClickOutside…
│   ├── lib/
│   │   ├── api/                # localStorage mock API — the swappable backend seam
│   │   ├── authorization.ts    # Role + ownership permission helpers
│   │   ├── activity-simulator.ts  # Tab-visibility-aware live event generator
│   │   ├── seed.ts             # Initial mock data
│   │   └── lenis.ts, queryClient.ts, theme-store.ts, ui-store.ts, utils.ts
│   ├── marketing/components/   # Hero, CinematicSection, FeatureGrid, InTheFieldSection,
│   │                           # CTAFooter, Particles, AppMockups, Nav, SectionHeader
│   ├── pages/                  # Board, PostDetail, Roadmap, Changelog, Dashboard,
│   │                           # Profile, Settings, Activity, Login, Signup, reset flow
│   ├── routes/                 # Route tree, ProtectedRoute
│   ├── styles/                 # globals.css (design tokens), gradients.css
│   └── test/                   # Vitest setup
├── DESIGN-SYSTEM.md            # Token architecture, component standards, anti-patterns
└── vite.config.ts              # Base path, manual vendor chunk splitting
```

## Features

**Feedback board** — Public post list with upvoting, status filtering (Open, Planned, In Progress, Shipped, Closed), sorting, and debounced search. Filter state lives in the URL.

**Optimistic upvoting** — Upvoting updates the count instantly, before the request resolves. On failure the count rolls back and an error toast appears. Built with TanStack Query's `onMutate`/`onError`/`onSettled`: cancel in-flight queries, snapshot the cache, apply optimistically, restore on error.

**Posts and comments** — Full CRUD with inline editing. Permissions are centralized in pure helper functions (`src/lib/authorization.ts`) gating actions on user role and resource ownership — only an author or an admin can edit or delete a post, change its status, or remove a comment.

**Roadmap** — Three columns (Planned, In Progress, Shipped). Admins change a post's status and the card animates between columns.

**Changelog** — Release timeline with type badges and scroll-revealed entries.

**Live activity feed** — A tab-visibility-aware background timer generates synthetic activity events on a randomized interval, pausing when the tab is hidden (via the Page Visibility API) and resuming when it returns. Each event invalidates the activity query cache, so the feed feels live without a WebSocket.

**Dashboard, Profile, Settings** — Stats overview, per-user post/comment/upvote tabs, and theme and role controls.

**Command palette** — `Cmd/Ctrl+K` to search and navigate from anywhere in the app.

**Cinematic landing page** — A pinned scroll scene cycling through Collect / Prioritize / Ship using CSS `position: sticky` and Framer `useScroll`; a scroll-driven product showcase; ambient particle canvases; and a full custom design system. Marketing pages are dark-only; the app is dual-theme.

## Architecture notes

**Two UI worlds** — A dark-only marketing layout and a dual-theme app layout, kept separate so their concerns never bleed together.

**Swappable API layer** — All domain data (posts, boards, comments, users, changelog, activity) flows through `src/lib/api/`, shaped like a REST client but backed by localStorage with simulated latency. Feature components and hooks never touch storage directly for domain data, so replacing the mock with real HTTP calls is a contained change confined to that folder. Session state (the auth store) and the live-activity simulator manage their own persistence deliberately, outside that seam.

**Client vs server state** — Server-shaped data is owned by TanStack Query; UI and session state (auth, theme) by Zustand. The two never mix.

**Design tokens** — Every color, spacing value, font size, radius, and duration resolves through a CSS custom property. A two-namespace architecture — `:root` for the marketing dark base and `[data-theme]` for the themed app — is documented in `DESIGN-SYSTEM.md`, along with the component-state checklist, the anti-patterns the project was built against, and the specificity guards needed for button variants that appear in both contexts.

**Lazy loading and bundle splitting** — GSAP and ScrollTrigger load dynamically only when the marketing scroll scene enters view, keeping them out of the initial bundle. Vendor libraries are split into cacheable chunks so a feature commit doesn't invalidate React, Framer, or TanStack in the browser cache.

## Responsive

Responsive to 390px across every page. Roadmap columns scroll horizontally on mobile; dashboard stats reflow to a 2×2 grid; changelog dates move above titles; the nav collapses to logo and primary CTA.

## Accessibility

Every interactive element is keyboard reachable with a visible focus ring. Menus and modals handle Escape and trap focus; forms surface inline validation and focus the first errored field on submit. Icon-only controls carry `aria-label`; decorative canvases and mockups are `aria-hidden`. Every animation respects `prefers-reduced-motion` — pinned scenes fall back to stacked content and particle loops don't run. Text contrast meets WCAG AA in both themes.

## Testing

Vitest + React Testing Library — focused unit tests on the debounce hook, password-strength scoring, PostCard rendering, signup validation, and the auth store.

```
npm run test:run # single pass
npm run test # watch mode
npm run test:coverage # coverage report
```
## Running locally
```
npm install
npm run dev
```

Production build and preview:
```
npm run build
npm run preview
```
## Roadmap

A Supabase backend for multi-user persistence and real-time sync. The API layer in `src/lib/api/` is isolated behind a REST-shaped interface specifically so this swap stays contained — feature components and hooks are backend-agnostic.
