import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function GradDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop style={{ stopColor: 'var(--grad-1)' }} />
        <stop offset="0.5" style={{ stopColor: 'var(--grad-2)' }} />
        <stop offset="1" style={{ stopColor: 'var(--grad-3)' }} />
      </linearGradient>
    </defs>
  );
}

export function SoundwaveIcon({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = `sw-${uid}`;
  const reduce = useReducedMotion();

  const loop = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { pathLength: [0, 1, 1, 0] as number[] },
          transition: { duration: 4, delay, repeat: Infinity, ease: 'easeInOut' as const },
        };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <GradDefs id={id} />
      <motion.path
        d="M5 24 Q14 8 24 24 T 43 24"
        stroke={`url(#${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: reduce ? 1 : 0 }}
        {...loop(0)}
      />
      <motion.path
        d="M5 33 Q16 18 24 33 T 43 33"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
        initial={{ pathLength: reduce ? 1 : 0 }}
        {...loop(0.4)}
      />
    </svg>
  );
}

export function PriorityBarsIcon({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = `pb-${uid}`;
  const reduce = useReducedMotion();

  const bars = [
    { x: 8,  baseH: 24, delay: 0,   opacity: 0.85 },
    { x: 20, baseH: 20, delay: 0.3, opacity: 0.65 },
    { x: 32, baseH: 16, delay: 0.6, opacity: 0.4  },
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <GradDefs id={id} />
      {bars.map(({ x, baseH, delay, opacity }) => (
        <motion.rect
          key={x}
          x={x}
          y={48 - baseH - 12}
          rx={3}
          width={8}
          fill={`url(#${id})`}
          opacity={opacity}
          initial={{ height: baseH }}
          {...(reduce
            ? { height: baseH }
            : {
                animate: { height: [baseH, baseH + 8, baseH] as number[] },
                transition: {
                  duration: 3,
                  delay,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                },
              })}
        />
      ))}
    </svg>
  );
}

export function StoryLinesIcon({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = `sl-${uid}`;
  const reduce = useReducedMotion();

  const dots = [
    { cy: 12, delay: 0 },
    { cy: 24, delay: 0.4 },
    { cy: 36, delay: 0.8 },
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <GradDefs id={id} />
      {/* Spine */}
      <line x1="12" y1="6" x2="12" y2="42" stroke={`url(#${id})`} strokeWidth="1.5" opacity={0.35} />
      {dots.map(({ cy, delay }) => (
        <g key={cy}>
          <motion.circle
            cx={12}
            cy={cy}
            r={3.5}
            fill={`url(#${id})`}
            initial={{ scale: 1 }}
            {...(reduce
              ? {}
              : {
                  animate: { scale: [1, 1.35, 1] as number[] },
                  transition: {
                    duration: 2.4,
                    delay,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                  },
                })}
            style={{ transformOrigin: `12px ${cy}px` }}
          />
          <rect
            x={22}
            y={cy - 2.5}
            rx={2}
            width={20}
            height={5}
            fill={`url(#${id})`}
            opacity={0.35}
          />
        </g>
      ))}
    </svg>
  );
}
