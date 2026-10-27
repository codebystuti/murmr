import { useLayoutEffect, useRef } from 'react';

const INSERT_DURATION_MS = 400;
const INSERT_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Lets a list row that arrives after the page is on screen (live activity, new comments) grow in
 * instead of popping in and shoving every row below it down in one frame. Attach the returned ref
 * to a wrapper around the row and pass `animate` = true only for rows that mounted after the
 * initial render (rows present at first paint are handled by useEnterReveal).
 * Height and opacity run on the main thread, so it never hits the framer-motion WAAPI handoff blink.
 */
export function useInsertAnimation<T extends HTMLElement>(animate: boolean) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const height = el.getBoundingClientRect().height;
    const previousOverflow = el.style.overflow;
    el.style.overflow = 'hidden';
    const animation = el.animate(
      [
        { height: '0px', opacity: 0 },
        { height: `${height}px`, opacity: 1 },
      ],
      { duration: INSERT_DURATION_MS, easing: INSERT_EASING },
    );
    const restore = () => { el.style.overflow = previousOverflow; };
    animation.onfinish = restore;
    animation.oncancel = restore;
    return () => animation.cancel();
    // Only on mount: rows that later re-render must not replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
