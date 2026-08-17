import { motion, useReducedMotion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.20,
    },
  },
};

export const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  const prefersReduced = useReducedMotion();

  const outerInitial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 };
  const outerAnimate = { opacity: 1, y: 0 };
  const outerTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  const innerInitial = prefersReduced ? 'visible' : 'hidden';

  return (
    <motion.div
      initial={outerInitial}
      animate={outerAnimate}
      transition={outerTransition}
      style={{ position: 'relative', width: '100%', maxWidth: 440 }}
    >
      {/* Ambient glow behind card */}
      <div
        className="auth-card-glow"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background:
            'radial-gradient(ellipse at center, color-mix(in oklab, var(--grad-1) 18%, transparent), color-mix(in oklab, var(--grad-2) 10%, transparent) 40%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.8,
          transform: 'scale(1.1)',
          borderRadius: 16,
          pointerEvents: 'none',
        }}
      />

      {/* Glass card */}
      <div
        style={{
          background: 'color-mix(in oklab, var(--bg-surface) 55%, transparent)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid var(--border-dark)',
          borderRadius: 16,
          padding: 40,
          width: '100%',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial={innerInitial}
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
