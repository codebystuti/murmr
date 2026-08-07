# UI/UX Standards for Murmr

Treat every component as a craft decision. Match the bar of Linear, Vercel, Stripe, Featurebase — not generic SaaS templates.

## Design principles (apply to every component)

1. **Spacing is the design.** Use 4/8/12/16/24/32/48/64px scale only. Generous whitespace > cramped layouts. Default to more padding, not less.
2. **Typography is hierarchy.** Establish clear scale (display / h1 / h2 / body / small / mono). Never use more than 3 sizes per screen.
3. **Color is rare.** Most UI is neutral. The gradient is a highlight, used on 1-2 elements per screen max — never walls of gradient.
4. **Contrast over decoration.** A simple element with strong contrast beats a decorated one. No drop shadows unless purposeful. No borders unless they separate meaning.
5. **One focal point per screen.** The eye should know where to land first. Everything else recedes.
6. **States are not optional.** Every interactive element needs: default, hover, active, focus-visible, disabled, loading. Every async UI needs: loading, empty, error, success.

## Brand tokens (do not modify)

Dark theme:
- Background: #08070D
- Surface: #11101A
- Surface elevated: #1A1825
- Border: #2A2638
- Text primary: #F4F2FA / secondary: #A8A2BD / tertiary: #6B6580

Brand gradient: linear-gradient(135deg, #8B5CF6 0%, #D946EF 50%, #06B6D4 100%)

Status colors (functional, never decorative):
- Open: #A8A2BD / Planned: #06B6D4 / In Progress: #D946EF / Shipped: #10B981 / Closed: #6B6580

Light theme (app only):
- Background: #FAFAFC / Surface: #FFFFFF / Border: #E5E3EE
- Text primary: #0F0E1A / secondary: #5C5870

Typography: Geist (display + body), Geist Mono (technical accents).

## Component checklist (before declaring any component done)

- [ ] Hover state defined (subtle — opacity shift, slight scale, or color tint)
- [ ] Focus state visible (gradient ring, never default browser outline)
- [ ] Active/pressed state defined
- [ ] Disabled state visually clear (opacity 0.4, cursor not-allowed)
- [ ] Loading state (skeleton, spinner, or shimmer — never blank)
- [ ] Empty state with helpful copy + CTA (never just "No data")
- [ ] Error state with recovery action
- [ ] Keyboard accessible (Tab, Enter, Esc work as expected)
- [ ] Screen reader labels on icon-only buttons
- [ ] Mobile responsive (test at 390px width)
- [ ] Works in both light and dark theme (for app components — landing is dark-only)

## Animation principles

- **Purpose over decoration.** Every animation must answer "what does this communicate?" If nothing, remove it.
- **Duration:** UI feedback 150-200ms, transitions 250-400ms, hero/cinematic 600-1200ms. Never longer.
- **Easing:** Use `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo) for premium "settling" feel. `easeOut` for entrances, `easeIn` for exits.
- **Stagger lists.** When revealing 3+ items, stagger by 50-80ms each.
- **Respect `prefers-reduced-motion`.** Reduce or skip motion when set.

## Forms

- Labels above inputs (not floating, not placeholder-only).
- Inline validation on blur, not on every keystroke.
- Errors below the field in red, never as alerts.
- Submit button reflects state: idle / loading / success.
- Password inputs have a show/hide toggle.
- Multi-step forms show progress (step indicator at top).
- Long forms get section headers, not one giant blob.

## Buttons

- Primary: gradient fill, white text, used for the single most important action per screen.
- Secondary: surface background with border, used for adjacent actions.
- Tertiary/ghost: no background, just text + hover, used for low-priority actions.
- Destructive: red text or red fill, confirmation required for irreversible actions.
- Never have two primary buttons next to each other.
- Loading buttons show spinner inside, keep width stable.

## Lists & cards

- Cards have consistent padding (16-20px).
- Lists have visible hover state on rows.
- Use dividers OR cards, never both.
- Long lists need: infinite scroll, pagination, OR virtualization. Never raw-render 100+ items.
- Empty list state shows illustration + helpful text + CTA.

## Iconography

- Use Lucide icons only.
- 16px for inline, 20px for buttons, 24px for nav.
- Pair icons with text labels for clarity (except in dense UI like toolbars).
- `aria-label` on icon-only buttons.

## Color usage rules

- Gradient: primary CTAs, key highlights, hero text, logo. Sparingly.
- Status colors: only on status indicators, never as UI accents.
- Success green: only for "shipped" status and success toasts.
- Error red: only for errors, never for "delete" actions in default state.
- Use `--text-secondary` and `--text-tertiary` to create hierarchy without color.

## Anti-patterns (never do these)

- ❌ Generic Material/Bootstrap defaults
- ❌ Drop shadow on everything
- ❌ Rainbow gradients or multiple gradient directions on one screen
- ❌ Modals that can't be closed with Esc
- ❌ Forms that lose data on validation error
- ❌ Spinners that block the whole page for >300ms (use skeleton instead)
- ❌ Three-column "feature/feature/feature" layouts (too generic)
- ❌ "Click here" links — make link text descriptive
- ❌ All-caps body text
- ❌ Tiny tap targets on mobile (<44×44px)
- ❌ Pill-shaped buttons (use 8-12px radius)
- ❌ Bright halos/glows around buttons (subtle box-shadow only)

## Visual reference

The `design-reference/` folder contains the source-of-truth visual mockups for landing and app screens. Match their spacing, layout, typography, and interaction quality precisely. When a screen has no reference (auth, settings, 404, modals), design fresh in the same visual language.

## When in doubt

Reference designs from: Linear, Vercel, Stripe, Featurebase, Productlane, Cal.com. Open the actual sites if uncertain.

Ask before deviating from this file.