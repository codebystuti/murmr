import { lazy, Suspense } from 'react';
import HeroSection from '@/marketing/components/HeroSection';
import FeatureGrid from '@/marketing/components/FeatureGrid';
import InTheFieldSection from '@/marketing/components/InTheFieldSection';
import CTAFooter from '@/marketing/components/CTAFooter';

// CinematicSection lazy-loaded so GSAP lives in a separate chunk
const CinematicSection = lazy(() => import('@/marketing/components/CinematicSection'));

function CinematicFallback() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="animate-pulse"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--gradient)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <main style={{ position: 'relative' }}>
      <HeroSection />
      <FeatureGrid />
      <Suspense fallback={<CinematicFallback />}>
        <CinematicSection />
      </Suspense>
      <InTheFieldSection />
      <CTAFooter />
    </main>
  );
}
