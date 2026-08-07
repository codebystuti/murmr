import Lenis from 'lenis';

let instance: Lenis | null = null;

export function initLenis(): Lenis {
  if (instance) return instance;
  instance = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(time: number) {
    if (!instance) return;
    instance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return instance;
}

export function destroyLenis() {
  instance?.destroy();
  instance = null;
}
