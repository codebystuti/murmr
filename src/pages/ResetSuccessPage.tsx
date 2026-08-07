import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { AuthCard, itemVariants } from '@/features/auth/components/AuthCard';
import { Button } from '@/components/ui/button';

export default function ResetSuccessPage() {
  return (
    <AuthPageLayout>
      <AuthCard>
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'color-mix(in oklab, var(--status-shipped) 16%, transparent)',
              border: '1px solid color-mix(in oklab, var(--status-shipped) 30%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={30} style={{ color: 'var(--status-shipped)' }} />
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Password updated
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 32px', lineHeight: 1.6 }}
        >
          Your password has been updated successfully. You can now sign in with your new password.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link to="/login" style={{ display: 'block', textDecoration: 'none' }}>
            <Button variant="primary" size="md" className="cta-block">
              Sign in with new password
            </Button>
          </Link>
        </motion.div>
      </AuthCard>
    </AuthPageLayout>
  );
}
