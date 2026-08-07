import { STATUS_META } from '@/types';
import type { PostStatus } from '@/types';

interface StatusPillProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const { label, color } = STATUS_META[status];
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
        color,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: 999,
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
