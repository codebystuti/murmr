import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns the initial value immediately without waiting', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update the returned value during rapid changes before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'ab' });
    rerender({ v: 'abc' });
    // No time has elapsed — debounced value still reflects the initial
    expect(result.current).toBe('a');
  });

  it('settles to the latest value after the full delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'ab' });
    rerender({ v: 'abc' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('abc');
  });

  it('resets the delay when the value changes again before the timer fires', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } },
    );
    rerender({ v: 'ab' });
    act(() => { vi.advanceTimersByTime(200); }); // 200ms in — timer not done
    rerender({ v: 'abc' });
    act(() => { vi.advanceTimersByTime(200); }); // only 200ms since 'abc' — still not done
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(100); }); // 300ms since 'abc' — fires
    expect(result.current).toBe('abc');
  });
});
