import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', maxWidth: 400 }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.04em',
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: '0 0 8px',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild variant="primary" size="md">
          <Link to="/">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
