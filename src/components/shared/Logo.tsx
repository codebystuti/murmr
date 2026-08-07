import { useId, useEffect } from 'react';
import { motion, useReducedMotion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoIconProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function LogoIcon({ size = 28, animate = true, className }: LogoIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `logo-grad-${uid}`;
  const shouldReduceMotion = useReducedMotion();
  const playAnimation = animate && !shouldReduceMotion;

  // Always call hooks unconditionally (Rules of Hooks)
  const ctrl0 = useAnimation();
  const ctrl1 = useAnimation();
  const ctrl2 = useAnimation();

  useEffect(() => {
    if (!playAnimation) return;

    const ctrls = [ctrl0, ctrl1, ctrl2];
    const delays = [0, 0.15, 0.3];

    const runDraw = () => {
      ctrls.forEach((ctrl, i) => {
        ctrl.set({ pathLength: 0 });
        void ctrl.start({ pathLength: 1 }, { duration: 1.6, delay: delays[i], ease: 'easeOut' });
      });
    };

    runDraw();
    const id = setInterval(runDraw, 8000);
    return () => clearInterval(id);
  // ctrl0/1/2 are stable AnimationControls instances — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playAnimation]);

  const pathAnimate = (ctrl: ReturnType<typeof useAnimation>) =>
    playAnimation ? ctrl : ({ pathLength: 1 } as const);

  return (
    <svg
      width={size}
      height={Math.round(size * 0.78)}
      viewBox="0 0 36 28"
      fill="none"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--grad-1)" />
          <stop offset="50%" stopColor="var(--grad-2)" />
          <stop offset="100%" stopColor="var(--grad-3)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M2 14 Q 9 4, 16 14 T 30 14"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: playAnimation ? 0 : 1 }}
        animate={pathAnimate(ctrl0)}
      />
      <motion.path
        d="M2 20 Q 11 12, 18 20 T 32 20"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
        initial={{ pathLength: playAnimation ? 0 : 1 }}
        animate={pathAnimate(ctrl1)}
      />
      <motion.path
        d="M4 26 Q 12 20, 20 26 T 34 26"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity={0.45}
        initial={{ pathLength: playAnimation ? 0 : 1 }}
        animate={pathAnimate(ctrl2)}
      />
    </svg>
  );
}

interface WordmarkProps {
  size?: number;
  showIcon?: boolean;
  dark?: boolean;
  className?: string;
}

export function Wordmark({ size = 22, showIcon = true, dark = true, className }: WordmarkProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      {showIcon && <LogoIcon size={size + 6} />}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: size,
          letterSpacing: '-0.02em',
          color: dark ? 'var(--text-primary)' : 'var(--tx)',
        }}
      >
        murmr
      </span>
    </div>
  );
}

export function AnimatedWordmark({ size = 120 }: { size?: number }) {
  return (
    <span
      className="grad-text-sweep"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}
    >
      murmr
    </span>
  );
}
