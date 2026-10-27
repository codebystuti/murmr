import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './utils';

const NOW = new Date('2026-06-15T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  it('returns an empty string for missing or invalid dates instead of "NaNmo"', () => {
    expect(formatRelativeTime('', NOW)).toBe('');
    expect(formatRelativeTime(undefined, NOW)).toBe('');
    expect(formatRelativeTime(null, NOW)).toBe('');
    expect(formatRelativeTime('not a date', NOW)).toBe('');
  });

  it('reads "just now" under a minute and for future dates', () => {
    expect(formatRelativeTime(ago(0), NOW)).toBe('just now');
    expect(formatRelativeTime(ago(59 * SEC), NOW)).toBe('just now');
    expect(formatRelativeTime(ago(-5 * DAY), NOW)).toBe('just now');
  });

  it('uses minutes, hours, days and weeks', () => {
    expect(formatRelativeTime(ago(MIN), NOW)).toBe('1m');
    expect(formatRelativeTime(ago(59 * MIN), NOW)).toBe('59m');
    expect(formatRelativeTime(ago(HOUR), NOW)).toBe('1h');
    expect(formatRelativeTime(ago(23 * HOUR), NOW)).toBe('23h');
    expect(formatRelativeTime(ago(DAY), NOW)).toBe('1d');
    expect(formatRelativeTime(ago(6 * DAY), NOW)).toBe('6d');
    expect(formatRelativeTime(ago(7 * DAY), NOW)).toBe('1w');
    expect(formatRelativeTime(ago(27 * DAY), NOW)).toBe('3w');
  });

  it('uses months from four weeks, never "0mo"', () => {
    expect(formatRelativeTime(ago(28 * DAY), NOW)).toBe('1mo');
    expect(formatRelativeTime(ago(60 * DAY), NOW)).toBe('2mo');
    expect(formatRelativeTime(ago(364 * DAY), NOW)).toBe('12mo');
  });

  it('uses years from a year on', () => {
    expect(formatRelativeTime(ago(365 * DAY), NOW)).toBe('1y');
    expect(formatRelativeTime(ago(800 * DAY), NOW)).toBe('2y');
  });

  it('defaults "now" to the current time', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });
});
