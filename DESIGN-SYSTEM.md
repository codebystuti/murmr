# Murmr Design System

The visual and interaction standards Murmr is built against. Written before implementation and used as the reference throughout — every component was checked against the checklists below before being considered done.

The bar is Linear, Vercel, Stripe, Featurebase. Not generic SaaS templates.

## Design principles

**Spacing is the design.** A strict 4/8/12/16/24/32/48/64px scale, no exceptions. Generous whitespace over cramped layouts — default to more padding, not less.

**Typography is hierarchy.** A defined scale (display, h1, h2, body, small, mono) with no more than three sizes on any single screen.

**Color is rare.** Most of the UI is neutral. The brand gradient appears on one or two elements per screen at most — never as a background wash.

**Contrast over decoration.** A simple element with strong contrast beats a decorated one. Shadows only where they communicate elevation. Borders only where they separate meaning.

**One focal point per screen.** The eye should know where to land first. Everything else recedes.

**States are not optional.** Every interactive element has default, hover, active, focus-visible, disabled, and loading states. Every async surface has loading, empty, error, and success states.

## Tokens

Every value in the codebase resolves through a CSS custom property. No hardcoded colors, spacing, font sizes, radii, or durations outside `:root`.

**Surfaces (dark)** — base, surface, surface-elevated, border, border-strong

**Text** — primary, secondary, tertiary. Hierarchy is built with these rather than with color.

**Brand gradient** — a three-stop violet → magenta → cyan gradient at 135°, exposed as three individual stop tokens so components can reference them independently.

**Status colors** — Open, Planned, In Progress, Shipped, Closed. Functional only; never used as decorative accents.

**Light theme** — app surfaces only. The marketing site is dark-only by design.

**Typography** — Geist for display and body, Geist Mono for technical accents like timestamps, counts, and labels.

**Durations** — micro (100ms), ui (150ms), fast (200ms), medium (300ms), base (600ms), slow (900ms), cinematic (1200ms).

**Easing** — `cubic-bezier(0.16, 1, 0.3, 1)` for entrances. It decelerates in a way that reads as settling rather than stopping.

## Component checklist

No component ships without all of these:

- Hover state — subtle: opacity shift, slight scale, or color tint
- Focus-visible state — gradient ring, never the browser default outline
- Active state — a small scale-down so presses register
- Disabled state — reduced opacity, `cursor: not-allowed`
- Loading state — skeleton, spinner, or shimmer; never blank
- Empty state — helpful copy plus a next action, never just "No data"
- Error state — with a recovery action
- Keyboard accessible — Tab, Enter, and Escape behave as expected
- Screen reader labels on icon-only controls
- Responsive to 390px
- Works in both themes (app components; the landing is dark-only)

## Animation

**Purpose over decoration.** Every animation should answer "what does this communicate?" If nothing, it goes.

**Duration by tier.** UI feedback 100–200ms. Transitions 250–400ms. Cinematic reveals 600–1200ms. Nothing longer.

**Stagger lists.** Three or more items reveal with 50–80ms between each.

**Transform and opacity only.** Scroll-driven animation never touches layout properties — no width, height, top, or margin in an animation loop.

**Respect `prefers-reduced-motion`.** Every animated component checks it. Motion is reduced or removed entirely, never just shortened.

## Buttons

One system, applied everywhere. All values resolve through shared tokens, so a button in the nav and a submit in an auth form are dimensionally identical.

**Sizes** — sm for compact controls, md as the default, lg for hero and footer CTAs. Sizes differ only in padding and font size; everything else is shared.

**Variants** — primary (gradient fill), secondary (outlined, same silhouette), link (inline text).

**Modifier** — block, for full-width form submits. Overrides width and radius only.

Rules: never two primary buttons adjacent. Loading buttons keep their width stable with the spinner inside. Destructive actions require confirmation.

## Forms

- Labels above inputs — not floating, not placeholder-only
- Validate on blur, not on every keystroke
- Errors below the field, never as alerts
- Submit buttons reflect state: idle, loading, success
- Password inputs have a show/hide toggle
- Multi-step forms show a progress indicator
- Long forms use section headers

## Lists and cards

- Consistent card padding within a given context
- Visible hover state on interactive rows
- Dividers or cards, never both
- Long lists need pagination, infinite scroll, or virtualization — never raw-render 100+ items
- Empty states get an icon, a heading, and a next action

## Iconography

Lucide only. 16px inline, 20px in buttons, 24px in navigation. Icons pair with text labels except in dense toolbars. Icon-only controls carry an `aria-label`.

## Color usage

- Gradient: primary CTAs, key highlights, hero text, logo — sparingly
- Status colors: only on status indicators
- Green: only for shipped status and success confirmations
- Red: only for errors and destructive confirmation, never for a delete control at rest
- Build hierarchy with text tokens, not with color

## Anti-patterns

- Generic Material or Bootstrap defaults
- Drop shadows applied indiscriminately
- Multiple gradient directions on one screen
- Modals that don't close on Escape
- Forms that lose data on validation error
- Full-page blocking spinners past 300ms — use a skeleton
- Three-column feature grids as a default layout choice
- "Click here" links — link text describes the destination
- All-caps body text
- Tap targets under 44×44px on mobile
- Glows or halos around buttons — subtle shadow only
- Direct DOM style mutation for hover and focus states — use CSS pseudo-classes

## Reference points

Linear, Vercel, Stripe, Featurebase, Productlane, Cal.com.