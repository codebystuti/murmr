import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePasswordStrength } from './usePasswordStrength';

function score(pw: string) {
  return renderHook(() => usePasswordStrength(pw)).result.current.score;
}

describe('usePasswordStrength', () => {
  it('scores an empty string as 0', () => {
    expect(score('')).toBe(0);
  });

  it('scores a single lowercase letter above zero — regression guard for the no-lowercase bug', () => {
    // Before the fix, 'a' scored 0 because there was no /[a-z]/ check.
    expect(score('a')).toBeGreaterThan(0);
  });

  it('increases score strictly as more character classes and length are added', () => {
    const s1 = score('a');         // lowercase only → 1
    const s2 = score('abcdefgh'); // + length ≥ 8 → 2
    const s3 = score('Abcdefgh'); // + uppercase → 3
    const s4 = score('Abcdef1!'); // + digit + special (≥5 checks) → capped at 4
    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
    expect(s3).toBeLessThan(s4);
  });

  it('caps at the maximum score of 4', () => {
    // All criteria met: lowercase, ≥8, ≥12, uppercase, digit, special = 6 checks → cap at 4
    expect(score('Abcdefgh1!@#Long')).toBe(4);
  });
});
