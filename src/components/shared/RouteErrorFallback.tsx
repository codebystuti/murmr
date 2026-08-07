import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteErrorFallback({ error }: { error?: unknown }) {
  const navigate = useNavigate();

  if (error) console.error('Route error:', error);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 48,
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <AlertTriangle size={40} style={{ color: 'var(--status-error)' }} />
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--tx)',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
            fontFamily: 'var(--font-display)',
          }}
        >
          Something went wrong.
        </h2>
        <p style={{ fontSize: 14, color: 'var(--tx2)', margin: 0 }}>
          You can go back or reload this page.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="default" size="sm" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  );
}
