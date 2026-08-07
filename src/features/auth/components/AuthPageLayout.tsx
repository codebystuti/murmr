interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 60px',
        isolation: 'isolate',
      }}
    >
      {/* Fixed ambient glows */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Violet top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: 700,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, color-mix(in oklab, var(--grad-1) 15%, transparent) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Magenta bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: 600,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, color-mix(in oklab, var(--grad-2) 10%, transparent) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Film grain noise */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.04,
          willChange: 'transform',
          transform: 'translateZ(0)',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* Centered card content */}
      <div style={{ position: 'relative', zIndex: 5, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
