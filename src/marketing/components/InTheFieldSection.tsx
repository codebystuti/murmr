import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { DashboardMock } from './AppMockups';
import { SectionHeader } from './SectionHeader';

function Quote() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p
        style={{
          fontSize: 'clamp(18px, 2.2vw, 24px)',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          margin: 0,
          maxWidth: 620,
          textAlign: 'center',
        }}
      >
        "We used to drown in Slack threads. Murmr turned that chaos into a ranked queue — our
        roadmap finally reflects what users actually need."
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-on-gradient)',
            flexShrink: 0,
          }}
        >
          J
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Jordan M.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            Product Lead · illustrative quote
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InTheFieldSection() {
  const shouldReduceMotion = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // Lower stiffness trails further behind scroll, softening reversal on scroll-up.
  const smooth = useSpring(scrollYProgress, { stiffness: 40, damping: 22, restDelta: 0.0005 });

  // Scale completes at 0.40, opacity at 0.32 — dashboard fully present by 0.40.
  // Crossfade starts at 0.58: 18% hold where dashboard sits at full size before anything changes.
  const dashScale   = useTransform(smooth, [0, 0.40], [0.55, 1.0]);
  const dashOpacity = useTransform(
    smooth,
    [0,   0.32, 0.58, 0.78],
    [0.3, 1.0,  1.0,  0],
  );

  // Quote: 20% crossfade window (0.58→0.78), starting after the dashboard hold.
  const quoteOpacity = useTransform(smooth, [0.58, 0.78], [0, 1]);

  /* ── REDUCED MOTION: static layout ──────────────────────────── */
  if (shouldReduceMotion) {
    return (
      <section
        className="landing-section"
        style={{ paddingLeft: 24, paddingRight: 24, overflow: 'hidden' }}
      >
        <div className="container-marketing">
          <SectionHeader
            label="In the field"
            headline={<>Your dashboard. <span className="grad-text">Always in sync.</span></>}
          />
          <div
            style={{
              borderRadius: 'var(--radius-container)',
              overflow: 'hidden',
              border: `1px solid color-mix(in oklab, var(--text-on-gradient) 7%, transparent)`,
              boxShadow: '0 32px 80px -20px rgba(0,0,0,0.5)',
              maxWidth: 1120,
              margin: '0 auto 48px',
            }}
          >
            <DashboardMock />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Quote />
          </div>
        </div>
      </section>
    );
  }

  /* ── ANIMATED: CSS sticky 240vh section ──────────────────────── */
  return (
    <div ref={outerRef} style={{ position: 'relative', height: '240vh', paddingTop: 'var(--section-v)' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '90px 24px 24px',
        }}
      >
        <SectionHeader
          label="In the field"
          headline={<>Your dashboard. <span className="grad-text">Always in sync.</span></>}
        />

        {/* Stage: single region shared by dashboard and quote — both absolutely fill it */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>

          {/* Dashboard: fills stage, scales from center so growth is obvious */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scale: dashScale,
              opacity: dashOpacity,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 1120,
                borderRadius: 'var(--radius-container)',
                overflow: 'hidden',
                border: `1px solid color-mix(in oklab, var(--text-on-gradient) 10%, transparent)`,
                boxShadow: `0 30px 100px -30px color-mix(in oklab, var(--grad-1) 35%, transparent), 0 20px 60px -20px rgba(0,0,0,0.5)`,
              }}
            >
              <DashboardMock />
            </div>
          </motion.div>

          {/* Quote: same centering method as dashboard — centers coincide exactly */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: quoteOpacity,
              padding: '0 32px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: 680 }}>
              <Quote />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
