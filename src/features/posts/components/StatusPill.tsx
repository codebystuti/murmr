import { STATUS_META } from '@/types';
import type { PostStatus } from '@/types';

interface StatusPillProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

/**
 * Text and dot are the status colour darkened toward --status-ink by --status-ink-mix (45% in the light
 * theme so small text reaches 4.5:1 on white; 0% in dark, where the raw colour already reads).
 * The tint behind them stays derived from the raw status colour.
 */
const inked = (color: string) =>
  `color-mix(in oklab, ${color}, var(--status-ink, #000) var(--status-ink-mix, 0%))`;

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const { label, color } = STATUS_META[status];
  const ink = inked(color);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? 4 : 6,
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 600,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        borderRadius: 999,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        color: ink,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: 999,
          background: ink,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
