import { useMemo } from 'react';

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

const LABELS: Record<StrengthLevel, string> = {
  0: '',
  1: 'Very weak',
  2: 'Weak',
  3: 'Good',
  4: 'Strong',
};

export function usePasswordStrength(password: string) {
  const score = useMemo((): StrengthLevel => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(4, s) as StrengthLevel;
  }, [password]);

  return {
    score,
    label: LABELS[score],
    widthPercent: score * 25,
  };
}
