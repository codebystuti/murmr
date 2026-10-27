import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initSeed, STORAGE_KEYS } from './seed';
import { startActivitySimulator, stopActivitySimulator } from './activity-simulator';
import { useActivityStore } from './activity-store';

const activityCount = () => (JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) ?? '[]') as unknown[]).length;

describe('activity simulator', () => {
  beforeEach(() => {
    localStorage.clear();
    initSeed();
    useActivityStore.setState({ unseenCount: 0 });
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Deterministic ticks: the last action ('commented') always writes, so every tick produces an event.
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
  });
  afterEach(() => {
    stopActivitySimulator();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps running after a tick throws', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota exceeded');
    });
    startActivitySimulator();
    vi.advanceTimersByTime(30_000); // first tick: its first write throws
    expect(console.warn).toHaveBeenCalledWith('[murmr] Activity simulator tick failed:', expect.any(Error));
    setItem.mockRestore();

    const before = useActivityStore.getState().unseenCount;
    vi.advanceTimersByTime(30_000 * 3);
    expect(useActivityStore.getState().unseenCount).toBe(before + 3);
  });

  it('keeps running when stored data is corrupt, repairing it', () => {
    localStorage.setItem(STORAGE_KEYS.POSTS, '{oops');
    startActivitySimulator();
    vi.advanceTimersByTime(30_000 * 2);
    expect(Array.isArray(JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)!))).toBe(true);
    expect(useActivityStore.getState().unseenCount).toBe(2);
    expect(activityCount()).toBeGreaterThan(0);
  });
});
