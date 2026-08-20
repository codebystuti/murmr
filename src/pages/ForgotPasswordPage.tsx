import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { AuthCard, itemVariants } from '@/features/auth/components/AuthCard';
import { MurmrInput } from '@/features/auth/components/MurmrInput';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFound, setEmailFound] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const { found } = await authApi.forgotPassword(data.email);
      setEmailFound(found);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard>
        {sent ? (
          <>
            <motion.div
              variants={itemVariants}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'color-mix(in oklab, var(--status-shipped) 16%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--status-shipped) 30%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={26} style={{ color: 'var(--status-shipped)' }} />
              </div>
            </motion.div>

            <motion.h2
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
              Check your inbox
            </motion.h2>

            <motion.p
              variants={itemVariants}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 24px', lineHeight: 1.6 }}
            >
              We&apos;ve sent a password reset link to your email address.
            </motion.p>

            {emailFound && (
              <motion.div
                variants={itemVariants}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-dark)',
                  background: 'var(--surface-hint)',
                  marginBottom: 24,
                }}
              >
                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', margin: '0 0 6px' }}>
                  Demo — Test the reset flow
                </p>
                <Link
                  to="/reset-password?token=demo-reset-token"
                  style={{ fontSize: 13, color: 'var(--grad-1)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Click here to open the reset page
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </motion.div>
          </>
        ) : (
          <>
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
              Forgot password?
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 32px' }}
            >
              Enter your email and we&apos;ll send you a reset link
            </motion.p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'contents' }}>
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Email
                        </FormLabel>
                        <FormControl>
                          <MurmrInput type="email" placeholder="you@company.com" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading}
                    className="cta-block"
                  >
                    {loading && <Loader2 className="animate-spin h-4 w-4" />}
                    {loading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.div
              variants={itemVariants}
              style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24, marginBottom: 0 }}
            >
              <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </motion.div>
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
