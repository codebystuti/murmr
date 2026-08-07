import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { AuthCard, itemVariants } from '@/features/auth/components/AuthCard';
import { MurmrInput } from '@/features/auth/components/MurmrInput';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const password = form.watch('password', '');

  async function onSubmit(data: FormData) {
    if (!token) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      navigate('/reset-success');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard>
        {!token ? (
          <>
            <motion.div
              variants={itemVariants}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
            >
              <AlertCircle size={48} style={{ color: 'var(--status-error)' }} />
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
              Invalid reset link
            </motion.h2>

            <motion.p
              variants={itemVariants}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 28px' }}
            >
              This reset link is invalid or has expired.
            </motion.p>

            <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--grad-1)', textDecoration: 'none', fontWeight: 500 }}>
                Request a new reset link →
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
              Set new password
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 32px' }}
            >
              Choose a strong password for your account
            </motion.p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'contents' }}>
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          New password
                        </FormLabel>
                        <FormControl>
                          <MurmrInput type="password" placeholder="Min. 8 characters" autoComplete="new-password" {...field} />
                        </FormControl>
                        <PasswordStrength password={password} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Confirm password
                        </FormLabel>
                        <FormControl>
                          <MurmrInput type="password" placeholder="Repeat password" autoComplete="new-password" {...field} />
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
                    {loading ? 'Updating…' : 'Update password'}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
