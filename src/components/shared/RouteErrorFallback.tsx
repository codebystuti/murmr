import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteErrorFallback({ error }: { error?: unknown }) {
  const isDev = import.meta.env.DEV;
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : null;
  const stack = error instanceof Error ? error.stack : null;

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
          This page ran into a problem. Reload to try again, or go somewhere safe.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="default" size="sm" asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>

      {/* Error detail — visible in dev builds only; stripped by Vite dead-code elimination in production */}
      {isDev && error != null && (
        <details
          style={{
            maxWidth: 640,
            width: '100%',
            textAlign: 'left',
            marginTop: 8,
          }}
        >
          <summary
            style={{
              fontSize: 12,
              color: 'var(--tx3)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              userSelect: 'none',
            }}
          >
            Error detail (dev only)
          </summary>
          <pre
            style={{
              fontSize: 11,
              color: 'var(--status-error)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              marginTop: 8,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
            }}
          >
            {message ?? String(error)}
            {stack ? `\n\n${stack}` : null}
          </pre>
        </details>
      )}
    </div>
  );
}
