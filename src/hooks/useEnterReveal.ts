import { useLayoutEffect, useRef } from 'react';

const ENTER_DURATION_MS = 1200;
const ENTER_STAGGER_MS = 80;
const ENTER_MAX_DELAY_MS = 960;
// easeOut (quad) for entrances: the fade is spread across the duration instead of front-loaded
// (easeOutExpo finishes ~90% in the first fifth, which reads as a pop).
const ENTER_EASING = 'cubic-bezier(0.5, 1, 0.89, 1)';

/** Stagger delay for the `--enter-delay` custom property on a `.murmr-enter` element. */
export function enterDelay(index: number, baseMs = 0): string {
  return `${Math.min(baseMs + index * ENTER_STAGGER_MS, ENTER_MAX_DELAY_MS)}ms`;
}

/**
 * Fades in every element matching `selector` under the returned ref, once, when `ready` first becomes true.
 * A new `resetKey` (e.g. a route param on a page that stays mounted) plays it again for the new content.
 * Uses element.animate() rather than CSS animations or framer-motion:
 * - script animations are not restarted when React moves a node (re-sorts, filters, live updates);
 * - fill `backwards` ends exactly on the element's own opacity (1), so there is no end-of-fade handoff;
 * - elements mounted later are never queried, so they simply appear.
 */
export function useEnterReveal<T extends HTMLElement>(ready: boolean, resetKey?: unknown, selector = '.murmr-enter') {
  const rootRef = useRef<T>(null);
  const played = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!ready || played.current || !root) return;
    played.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => { played.current = false; };
    }

    const animations = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: ENTER_DURATION_MS,
        delay: parseFloat(el.style.getPropertyValue('--enter-delay')) || 0,
        easing: ENTER_EASING,
        fill: 'backwards',
      }),
    );
    return () => {
      animations.forEach((a) => a.cancel());
      played.current = false;
    };
  }, [ready, resetKey, selector]);

  return rootRef;
}
