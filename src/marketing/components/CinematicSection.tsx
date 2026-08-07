import { useRef, useLayoutEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { initLenis } from '@/lib/lenis';
import { BoardMock, RoadmapMock, ChangelogMock } from './AppMockups';
import { SectionHeader } from './SectionHeader';

const STAGES = [
  {
    step: '01',
    label: 'Collect',
    heading: 'Feedback from every channel, organized automatically.',
    body: 'A public board at your domain captures everything. Users vote, comment, and submit — you get a single ranked queue instead of a dozen scattered threads.',
    Mock: BoardMock,
  },
  {
    step: '02',
    label: 'Prioritize',
    heading: 'Surface the signals that actually matter.',
    body: 'Upvotes drive ranking. Filters surface segments. Move posts through your roadmap columns and watch the priorities align with what your users need most.',
    Mock: RoadmapMock,
  },
  {
    step: '03',
    label: 'Ship',
    heading: 'Close the loop. Keep every voice informed.',
    body: 'Publish a changelog entry, move a post to Shipped, and every upvoter is automatically notified. Transparency earns trust.',
    Mock: ChangelogMock,
  },
] as const;

function BrowserChrome() {
  return (
    <div
      style={{
        padding: '9px 14px',
        borderBottom: `1px solid color-mix(in oklab, var(--text-on-gradient) 7%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: `color-mix(in oklab, var(--text-on-gradient) 3%, transparent)`,
        flexShrink: 0,
      }}
    >
      {/* Traffic light dots — browser chrome colors, no token equivalent */}
      {(['#EF4444', '#FBBF24', '#34D399'] as const).map((c) => (
        <div key={c} style={{ width: 8, height: 8, borderRadius: 999, background: c, opacity: 0.8 }} />
      ))}
      <div
        style={{
          marginLeft: 8,
          flex: 1,
          maxWidth: 240,
          height: 18,
          borderRadius: 5,
          background: `color-mix(in oklab, var(--text-on-gradient) 4%, transparent)`,
          border: `1px solid color-mix(in oklab, var(--text-on-gradient) 6%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
        }}
      >
        <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          app.murmr.dev
        </span>
      </div>
    </div>
  );
}

function StageContent({ stageIndex }: { stageIndex: number }) {
  const { step, label, heading, body, Mock } = STAGES[stageIndex];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 42%) minmax(0, 58%)',
        gap: 48,
        alignItems: 'center',
        width: 'min(1100px, 92vw)',
        padding: '0 24px',
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--grad-1)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            margin: '0 0 14px',
          }}
        >
          {step} — {label.toUpperCase()}
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 2.8vw, 38px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: '0 0 16px',
            lineHeight: 1.15,
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: 360,
          }}
        >
          {body}
        </p>
      </div>

      <div
        className="glass"
        style={{
          borderRadius: 'var(--radius-container)',
          overflow: 'hidden',
          boxShadow:
            `0 30px 100px -30px color-mix(in oklab, var(--grad-1) 45%, transparent), 0 24px 64px -16px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in oklab, var(--text-on-gradient) 5%, transparent)`,
        }}
      >
        <BrowserChrome />
        <div style={{ padding: 12 }}>
          <Mock />
        </div>
      </div>
    </div>
  );
}

export default function CinematicSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (reduceMotion || !sectionRef.current) return;

    let killed = false;
    let gsapCtx: { revert: () => void } | undefined;
    let cleanupExtras: (() => void) | undefined;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed) return;

        gsap.registerPlugin(ScrollTrigger);

        let scrollBridge: (() => void) | undefined;
        let lenisRef: ReturnType<typeof initLenis> | undefined;
        try {
          lenisRef = initLenis();
          scrollBridge = () => ScrollTrigger.update();
          lenisRef.on('scroll', scrollBridge);
        } catch {
          // Lenis not ready — ScrollTrigger falls back to native scroll
        }

        const stages = stageRefs.current;
        const [s0, s1, s2] = stages;
        if (!s0 || !s1 || !s2) return;
        const dots = dotRefs.current;

        const setDot = (stg: number) => {
          dots.forEach((d, i) => {
            if (!d) return;
            d.style.background =
              i === stg
                ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'
                : 'var(--border-dark)';
            d.style.width = i === stg ? '20px' : '6px';
          });
        };

        gsapCtx = gsap.context(() => {
          // Stage 1 visible immediately — no blank screen on pin engage
          gsap.set(s0, { opacity: 1 });
          gsap.set([s1, s2], { opacity: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=200%',
              pin: true,
              pinSpacing: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const p = self.progress;
                setDot(p < 0.35 ? 0 : p < 0.65 ? 1 : 2);
              },
            },
          });

          // 2% crossfade windows with scrub:true — stages are fully opaque or fully invisible at any scroll position
          // Stage 1: hold 0–0.32, exit crossfade 0.32→0.34
          tl.to(s0, { opacity: 0, ease: 'linear', duration: 0.02 }, 0.32);

          // Stage 2: enter crossfade 0.34→0.36, hold 0.36–0.64, exit crossfade 0.64→0.66
          tl.to(s1, { opacity: 1, ease: 'linear', duration: 0.02 }, 0.34);
          tl.to(s1, { opacity: 0, ease: 'linear', duration: 0.02 }, 0.64);

          // Stage 3: enter crossfade 0.66→0.68, hold 0.68–1.0
          tl.to(s2, { opacity: 1, ease: 'linear', duration: 0.02 }, 0.66);
          // Extend timeline to exactly 1.0 so scrub maps correctly
          tl.set(s2, { opacity: 1 }, 0.9999);
        }, sectionRef);

        document.fonts.ready.then(() => {
          if (!killed) ScrollTrigger.refresh();
        });

        let resizeTimer: ReturnType<typeof setTimeout>;
        const onResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
        };
        window.addEventListener('resize', onResize);

        cleanupExtras = () => {
          if (lenisRef && scrollBridge) {
            try { lenisRef.off('scroll', scrollBridge); } catch { /* ignore */ }
          }
          clearTimeout(resizeTimer);
          window.removeEventListener('resize', onResize);
        };
      },
    );

    return () => {
      killed = true;
      gsapCtx?.revert();
      cleanupExtras?.();
    };
  }, [reduceMotion]);

  /* ── REDUCED MOTION: static stacked layout ─────────────────── */
  if (reduceMotion) {
    return (
      <section className="landing-section" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div className="container-marketing">
          <SectionHeader
            label="The workflow"
            headline={<>From first idea to <span className="grad-text">shipped feature.</span></>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {STAGES.map((s) => (
              <div
                key={s.step}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}
              >
                <div>
                  <p style={{ fontSize: 11, color: 'var(--grad-1)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 10px' }}>
                    {s.step} — {s.label.toUpperCase()}
                  </p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.2 }}>
                    {s.heading}
                  </h3>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {s.body}
                  </p>
                </div>
                <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
                  <s.Mock />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── ANIMATED: single pinned 100vh section ──────────────────── */
  return (
    <div
      ref={sectionRef}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        transform: 'translateZ(0)',
      }}
    >
      {/* Section header — 11vh clears the floating nav pill at any viewport height */}
      <div
        style={{
          position: 'absolute',
          top: '11vh',
          left: 0,
          right: 0,
          padding: '0 24px',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <SectionHeader
          label="The workflow"
          headline={<>From first idea to <span className="grad-text">shipped feature.</span></>}
        />
      </div>

      {/* Stage band — top: 26vh sits just below the header at any viewport height */}
      <div
        style={{
          position: 'absolute',
          top: '26vh',
          bottom: '12vh',
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient glow behind mockups */}
        <div
          aria-hidden
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(600px 400px at 45% 50%, color-mix(in oklab, var(--grad-3) 18%, transparent), transparent 65%),
              radial-gradient(700px 450px at 65% 45%, color-mix(in oklab, var(--grad-1) 16%, transparent), transparent 65%)
            `,
            filter: 'blur(40px)',
          }}
        />

        {STAGES.map((stage, i) => (
          <div
            key={stage.step}
            ref={(el) => { stageRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              willChange: 'opacity',
              opacity: i === 0 ? 1 : 0,
            }}
          >
            <StageContent stageIndex={i} />
          </div>
        ))}
      </div>

      {/* Progress dots — 4vh from bottom, clear of the mockup */}
      <div
        style={{
          position: 'absolute',
          bottom: '4vh',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            style={{
              height: 6,
              width: i === 0 ? 20 : 6,
              borderRadius: 999,
              background: i === 0 ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))' : 'var(--border-dark)',
              transition: 'width var(--dur-medium) var(--ease-out-expo), background var(--dur-medium)',
              flexShrink: 0,
            }}
          />
        ))}
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            marginLeft: 8,
          }}
        >
          scroll to advance
        </span>
      </div>
    </div>
  );
}
