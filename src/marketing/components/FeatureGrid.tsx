import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { SoundwaveIcon, PriorityBarsIcon, StoryLinesIcon } from './FeatureIcons';
import { SectionHeader } from './SectionHeader';

const FEATURES = [
  {
    icon: <SoundwaveIcon size={40} />,
    title: 'Collect everything',
    description:
      'A public feedback board that lives at your domain. Every idea, every request — in one searchable home. No Slack thread required.',
    glowColor:
      'linear-gradient(135deg, color-mix(in oklab, var(--grad-1) 18%, transparent), color-mix(in oklab, var(--grad-2) 18%, transparent), color-mix(in oklab, var(--grad-3) 18%, transparent))',
  },
  {
    icon: <PriorityBarsIcon size={40} />,
    title: 'Surface what matters',
    description:
      'Upvotes, trends, and smart grouping surface the signals worth acting on. Stop reading noise — ship what your users actually need.',
    glowColor:
      'linear-gradient(135deg, color-mix(in oklab, var(--grad-2) 18%, transparent), color-mix(in oklab, var(--grad-1) 18%, transparent), color-mix(in oklab, var(--grad-3) 18%, transparent))',
  },
  {
    icon: <StoryLinesIcon size={40} />,
    title: 'Close the loop',
    description:
      'Publish your changelog, move posts through the roadmap, and notify every voter automatically. Feedback deserves a follow-through.',
    glowColor:
      'linear-gradient(135deg, color-mix(in oklab, var(--grad-3) 18%, transparent), color-mix(in oklab, var(--grad-1) 18%, transparent), color-mix(in oklab, var(--grad-2) 18%, transparent))',
  },
] as const;

function TiltCard({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rx = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const ry = useTransform(sx, [-0.5, 0.5], [-6, 6]);

  if (shouldReduceMotion) {
    return (
      <div tabIndex={0} aria-label={ariaLabel} className="feature-tilt-card" style={{ height: '100%' }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      tabIndex={0}
      aria-label={ariaLabel}
      className="feature-tilt-card"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

export default function FeatureGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="landing-section"
      style={{ paddingLeft: 24, paddingRight: 24 }}
    >
      <div className="container-marketing">
        <SectionHeader
          label="How it works"
          headline={<>Built to turn feedback <span className="grad-text">into traction.</span></>}
          headlineStyle={{ fontSize: 'clamp(30px, 4.5vw, 48px)' }}
        />

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            alignItems: 'stretch',
          }}
        >
          {FEATURES.map(({ icon, title, description, glowColor }, i) => (
            <motion.div
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.9,
                delay: reduceMotion ? 0 : i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ height: '100%' }}
            >
              <TiltCard ariaLabel={`Feature: ${title}`}>
                {/* Card: glass + gradient-border + Tailwind group for inner glow */}
                <div
                  className="glass gradient-border feature-card-body"
                  style={{
                    position: 'relative',
                    height: '100%',
                    overflow: 'hidden',
                    borderRadius: 16,
                    padding: '24px 24px',
                    border: 'none',
                  }}
                >
                  {/* Inner hover glow — revealed via CSS .feature-card-body:hover */}
                  <div
                    aria-hidden
                    className="feature-inner-glow"
                    style={{
                      position: 'absolute',
                      inset: -1,
                      background: glowColor,
                      filter: 'blur(24px)',
                      opacity: 0,
                      transition: 'opacity var(--dur-base)',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />

                  {/* Card content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: 24 }}>{icon}</div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                        margin: '0 0 8px',
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
