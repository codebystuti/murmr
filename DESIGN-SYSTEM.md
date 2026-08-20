# Murmr Design System

The visual and interaction standards Murmr is built against. The bar is Linear, Vercel, Stripe, Featurebase — not generic SaaS templates.

## Design principles

**Spacing is the design.** A strict 4/8/12/16/24/32/48/64px scale, no exceptions. Generous whitespace over cramped layouts — default to more padding, not less.

**Typography is hierarchy.** A defined scale (display, h1, h2, body, small, mono) with no more than three sizes on any single screen.

**Color is rare.** Most of the UI is neutral. The brand gradient appears on one or two elements per screen at most — never as a background wash.

**Contrast over decoration.** A simple element with strong contrast beats a decorated one. Shadows only where they communicate elevation. Borders only where they separate meaning.

**One focal point per screen.** The eye should know where to land first. Everything else recedes.

**States are not optional.** Every interactive element has default, hover, active, focus-visible, disabled, and loading states. Every async surface has loading, empty, error, and success states.

## Tokens

Every value in the codebase resolves through a CSS custom property. No hardcoded colors, spacing, font sizes, radii, or durations appear outside `:root`.

### Two token namespaces

**`:root`** — shared tokens available everywhere. These are the marketing dark theme values and all structural tokens (sizing, spacing, duration, easing, typography). They do not change with the theme toggle.

**`[data-theme]`** — app-only tokens toggled by setting `data-theme="dark"` or `data-theme="light"` on `<html>`. These use short aliases (`--bg`, `--surface`, `--elev`, `--border`, `--tx`, `--tx2`, `--tx3`, `--shadow`) and resolve to either the dark or light palette. The marketing site is under `[data-theme="dark"]` at page load but is styled via `:root` tokens, not the aliased set.

### Surfaces (`:root`)

`--bg-base`, `--bg-surface`, `--bg-elevated`, `--border-dark`, `--border-strong` — the dark marketing palette, always active.

### Surfaces (`[data-theme]`)

`--bg`, `--surface`, `--elev`, `--border`, `--border-2`, `--shadow` — theme-switched versions used by app components. These are the tokens to use inside `AppLayout`; avoid them in marketing components.

### Text

`--text-primary`, `--text-secondary`, `--text-tertiary` — the `:root` text scale. `--tx`, `--tx2`, `--tx3` — the `[data-theme]` equivalents for app components. Build hierarchy with these rather than with color.

Contrast ratios against each theme's base background (WCAG AA requires 4.5:1 for text ≤ 18px):

| Token | Dark value | Dark ratio | Light value | Light ratio |
|---|---|---|---|---|
| primary / `--tx` | `#F4F2FA` | 19.7:1 | `#0F0E1A` | 18.5:1 |
| secondary / `--tx2` | `#A8A2BD` | 8.2:1 | `#5C5870` | 6.5:1 |
| tertiary / `--tx3` | `#9790AC` | 6.6:1 | `#72698A` | 4.9:1 |

The tertiary token was raised in both themes (from `#6B6580` / `#8C879F`) to meet WCAG AA. Use `--text-tertiary` / `--tx3` for timestamps, metadata, helper text, and secondary counts — not for anything that carries primary meaning.

`--text-on-gradient` — the text color for content placed directly on a gradient surface (buttons, badges). Stays light regardless of theme because gradient surfaces are always dark.

`--surface-hint` — 2% of `--text-on-gradient` mixed into transparent. Used as the default secondary CTA background on the marketing site, where it appears as a nearly transparent dark fill against the dark page. See the Buttons section for why this differs in the app.

### Brand gradient

Three stops: `--grad-1` (violet), `--grad-2` (magenta), `--grad-3` (cyan). Composed as `--gradient` (full gradient) or `--gradient-soft` (30% opacity version for background uses). Components reference the individual stops when they need to apply gradient-derived tints without the full gradient.

### Status colors

`--status-open`, `--status-planned`, `--status-progress`, `--status-shipped`, `--status-closed`, `--status-error`, `--status-warning`. Functional only — never used as decorative accents or for general UI color. Error and warning are not interchangeable.

### Structural tokens

`--radius-container: 14px` — the radius for panels, modals, and large card frames. Individual interactive elements use their own radii via `--cta-radius`.

### Duration scale

Seven named tiers, each used for a specific class of interaction:

- `--dur-micro` — the smallest perceptible response, used for press/release transforms
- `--dur-ui` — standard UI state feedback: hover, focus, color transitions
- `--dur-fast` — slightly more deliberate feedback; used in theme color transitions
- `--dur-medium` — panel transitions, expanding elements
- `--dur-base` — entrance animations, shimmer sweeps
- `--dur-slow` — secondary cinematic elements
- `--dur-cinematic` — primary scroll-reveal sequences and hero animations

Values are in `:root`. The names are the source of truth; do not reference the raw millisecond values in component code.

### Easing

`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — used for all entrances. The fast deceleration reads as settling rather than stopping. Standard `ease-out` works for exits; `ease-in` for elements leaving the viewport.

## Component requirements

No component ships without all of these:

- Hover state — subtle: opacity shift, slight scale, or color tint
- Focus-visible state — gradient ring, never the browser default outline
- Active state — a small scale-down so presses register
- Disabled state — 40% opacity, `cursor: not-allowed`
- Loading state — skeleton, spinner, or shimmer; never blank
- Empty state — helpful copy plus a next action, never just "No data"
- Error state — with a recovery action
- Keyboard accessible — Tab, Enter, and Escape behave as expected
- Screen reader labels on icon-only controls
- Responsive to 390px
- Works in both themes for app components; the marketing site is dark-only

## Animation

**Purpose over decoration.** Every animation should answer "what does this communicate?" If nothing, it goes.

**Duration by token name.** UI feedback uses `--dur-micro` and `--dur-ui`. Element transitions use `--dur-medium`. Scroll-driven reveals use `--dur-base` through `--dur-cinematic`. Never reference a raw millisecond value in a component — always use the token.

**Easing.** Use `--ease-out-expo` for entrances. Standard `ease-out` for exits.

**Stagger lists.** Three or more items reveal with 50–80ms between each for component-level lists. Cinematic sequences may use longer intervals.

**Transform and opacity only.** Scroll-driven and scroll-pinned animations never touch layout properties — no `width`, `height`, `top`, `left`, `margin`, or `padding` inside an animation loop. Violating this causes layout thrashing.

**Respect `prefers-reduced-motion`.** Every animated component checks it. Motion is reduced or removed entirely when the preference is set — never just shortened.

## Buttons

One class system, applied everywhere. `class="cta"` is the base. Size, variant, and modifier classes compose onto it.

### Class structure

```
<element class="cta [size] [variant] [modifier]">
```

All values resolve through `--cta-*` tokens. A button in the nav and a submit in an auth form share the same base; only the size and variant differ.

### Sizes

Four sizes: `cta-sm` (compact controls and navigation), `cta-md` (the default for app UI), `cta-lg` (hero and footer CTAs), `cta-icon` (square icon-only controls, 36×36px). Sizes differ only in padding and font size — radius, gap, weight, and transition are shared by all.

### Radius

All buttons use `--cta-radius: 999px`, producing a pill shape at every size. This is the convention — not an inconsistency. The `block` modifier overrides radius to `10px` for full-width auth submits, where a pill on a constrained column reads as oversized.

### Variants

**`cta-primary`** — gradient fill with a shimmer on hover. The single most important action on a screen. Never two adjacent.

**`cta-secondary`** — outlined with a transparent or surface fill. Adjacent to primary, never competing with it.

**`cta-ghost`** — transparent background, no border at rest. For low-emphasis actions.

**`cta-destructive`** — red tint, used only when confirming an irreversible action. Not the initial state of a delete control.

**`cta-link`** — inline text in monospace, no padding. For contextual actions inside prose or small UI.

### Block modifier

`cta-block` stretches the button to full width and centers its content. Used only on auth submit buttons. It overrides `width` and `border-radius` — nothing else.

### Theme exception: `cta-secondary`

The secondary variant behaves differently in the app than on the marketing site. This is deliberate.

On the marketing site (dark-only), the secondary button uses `--surface-hint` — a 2% transparent fill that lets the dark atmospheric background show through. This is its intended appearance.

In the app, `[data-theme] .cta-secondary` overrides this with `--surface` and `--border`. The reason: on the light theme's `#FAFAFC` page background, a 2% transparent fill is indistinguishable from the surface — the button disappears. Using the theme surface token ensures the button is visible on both light and dark app backgrounds.

The marketing site reclaims the correct dark appearance via `html .marketing-root .cta-secondary`, which uses specificity `(0,2,1)` to structurally beat the `[data-theme]` rule at `(0,2,0)`. The same guard exists for `cta-ghost`. Both are intentional exceptions and both are documented here.

Any future `[data-theme]` scope on a CTA variant that can appear on the marketing site needs the same guard — add it to `html .marketing-root` and document the reason.

## Forms

Labels above inputs — not floating, not placeholder-only. Validate on blur, not on every keystroke. Errors appear below the field, never as alerts. Submit buttons reflect state: idle, loading, success. Password inputs have a show/hide toggle. Multi-step forms show a step indicator. Long forms use section headers.

## Lists and cards

Consistent card padding within a given context. Visible hover state on interactive rows. Dividers or cards, never both on the same list. Long lists need pagination, infinite scroll, or virtualization — never raw-render 100+ items. Empty states get an illustration or icon, a heading, and a next action.

## Iconography

Lucide only. 16px inline, 20px in buttons, 24px in navigation. Icons pair with text labels except in dense toolbars. Icon-only controls carry an `aria-label`.

## Color usage

The gradient is applied to primary CTAs, key highlights, hero text, and the logo — sparingly, never as a background wash. Status colors appear only on status indicators, never as UI accents. Green is only for shipped status and success confirmations. Red is only for error states and destructive confirmation — never on a delete control at rest.

Build hierarchy with text tokens rather than color.

## Anti-patterns

- Generic Material or Bootstrap defaults
- Drop shadows applied indiscriminately
- Multiple gradient directions on one screen
- Modals that do not close on Escape
- Forms that lose data on a validation error
- Full-page blocking spinners past 300ms — use a skeleton instead
- Three-column feature grids as a default layout choice
- "Click here" links — link text describes the destination
- All-caps body text
- Tap targets under 44×44px on mobile
- Glows or halos around buttons — a subtle shadow is permitted; a bright radial glow is not
- Direct DOM style mutation for hover and focus states — use CSS pseudo-classes and utility classes
- Hardcoded color, spacing, duration, or radius values in component code — everything resolves through a token in `:root`
- Animating layout properties (`width`, `height`, `top`, `margin`) in scroll-driven or scroll-pinned sequences
- Theme-scoped selectors (`[data-theme] .component`) on any component that appears on the marketing site, without a documented reason and without a corresponding `html .marketing-root` guard

## Reference points

Linear, Vercel, Stripe, Featurebase, Productlane, Cal.com.
