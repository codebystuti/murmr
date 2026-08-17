import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import { Particles } from './Particles';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.14,
          delayChildren: shouldReduceMotion ? 0 : 0.2,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
      visible: {
        opacity: 1,
        y: 0,
        transition: shouldReduceMotion
          ? { duration: 0.01 }
          : { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      },
    }),
    [shouldReduceMotion],
  );

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        /* 88px clears the floating nav pill (top-4=16px + pill ~52px + buffer) */
        padding: '160px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Particles — opaque top 70%, fades to transparent at bottom so no seam with FeatureGrid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        }}
      >
        <Particles density={70} />
      </div>

      {/* Soft radial glows — atmospheric depth */}
      <div aria-hidden className="ambient-glow-1" style={{ top: '-15%', left: '-5%' }} />
      <div aria-hidden className="ambient-glow-2" style={{ bottom: '-20%', right: '-5%' }} />

      {/* Conic orb — slow rotation, right-center */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '60%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'conic-gradient(from 0deg, var(--grad-1) 0%, var(--grad-2) 25%, var(--grad-3) 50%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.18,
          animation: shouldReduceMotion ? 'none' : 'orbSpin 28s linear infinite',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Content — above global particles canvas in layout root */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 780,
        }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 13px',
              borderRadius: 999,
              border: '1px solid color-mix(in oklab, var(--grad-1) 35%, transparent)',
              background: 'color-mix(in oklab, var(--grad-1) 8%, transparent)',
              color: 'var(--text-secondary)',
              fontSize: 10,
              letterSpacing: '0.1em',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'var(--grad-1)',
                boxShadow: '0 0 8px var(--grad-1)',
                flexShrink: 0,
              }}
            />
            User feedback, done right
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px, 8vw, 92px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: 'var(--text-primary)',
            margin: '0 0 24px',
          }}
        >
          Listen to the{' '}
          <span className="grad-text-sweep">murmur.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 'clamp(17px, 2.2vw, 21px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            maxWidth: 520,
            margin: '0 0 40px',
            fontWeight: 400,
          }}
        >
          A focused public inbox for product feedback.
          Collect, prioritize, and ship — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/signup" className="cta cta-primary cta-lg">
            Start listening
            <ArrowRight size={16} className="cta-arrow" />
          </Link>

          <a href="#how-it-works" className="cta cta-secondary cta-lg">
            <Play size={16} fill="currentColor" />
            See how it works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginTop: 16,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          Free forever · No credit card required
        </motion.p>
      </motion.div>

      {/* Scroll hint */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ChevronDown size={14} />
          </motion.div>
          <div style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, var(--text-tertiary), transparent)' }} />
        </motion.div>
      )}
    </section>
  );
}
