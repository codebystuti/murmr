import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Wordmark } from '@/components/shared/Logo';
import { SectionHeader } from './SectionHeader';
import { Particles } from './Particles';

export default function CTAFooter() {
  return (
    <footer
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'var(--section-v)',
        paddingBottom: 64,
      }}
    >
      {/* Ambient radial washes — both centered low, transparent well before the top edge */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 50% at 50% 120%, color-mix(in oklab, var(--grad-1) 16%, transparent) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 40% at 55% 130%, color-mix(in oklab, var(--grad-2) 12%, transparent) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Particles — transparent at top, opaque from 30% down so no seam with InTheField */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
        }}
      >
        <Particles density={45} />
      </div>

      <div
        className="container-marketing"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <SectionHeader
          label="Ready to start"
          headline={<>Ship what users <span className="grad-text">actually want.</span></>}
          headlineStyle={{ fontSize: 'clamp(36px, 6vw, 72px)', letterSpacing: '-0.04em', lineHeight: 1.05, maxWidth: 700 }}
        />

        {/* Subhead */}
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 460,
            margin: '0 0 40px',
          }}
        >
          From first feedback to shipped update, Murmr connects the dots — and keeps every
          voice in the loop.
        </p>

        {/* CTA */}
        <Link to="/signup" className="cta cta-primary cta-lg" style={{ marginBottom: 16 }}>
          Start listening
          <ArrowRight size={18} className="cta-arrow" />
        </Link>

        <p
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            margin: '0 0 80px',
          }}
        >
          Free forever · No credit card required
        </p>

        {/* Footer strip */}
        <div
          style={{
            width: '100%',
            paddingTop: 32,
            borderTop: '1px solid var(--border-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Wordmark size={18} />
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              margin: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            © 2026 Murmr · Built with care
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms'].map((l) => (
              <a
                key={l}
                href="#"
                className="nav-link"
                style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
