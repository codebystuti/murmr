import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { AuthCard, itemVariants } from '@/features/auth/components/AuthCard';
import { MurmrInput } from '@/features/auth/components/MurmrInput';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const user = await authApi.login(data.email, data.password);
      login(user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/app');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard>
        {/* Headline */}
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
          Welcome back
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            margin: '8px 0 32px',
          }}
        >
          Sign in to your Murmr account
        </motion.p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'contents' }}>
            {/* Email */}
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
                      <MurmrInput
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 0 }}>
                        Password
                      </FormLabel>
                      <Link
                        to="/forgot-password"
                        className="auth-forgot-link"
                        style={{ fontSize: 12 }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <MurmrInput
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="cta-block"
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </motion.div>
          </form>
        </Form>

        {/* Footer link */}
        <motion.p
          variants={itemVariants}
          style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24, marginBottom: 0 }}
        >
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Sign up <ArrowRight size={16} />
          </Link>
        </motion.p>

        {/* Demo hint */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: 32,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-dark)',
            background: 'var(--surface-hint)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}
          >
            Demo Access
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            maya@northwind.io — any password
          </p>
        </motion.div>
      </AuthCard>
    </AuthPageLayout>
  );
}
