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
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } });
  const password = form.watch('password', '');

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const user = await authApi.signup(data.name, data.email, data.password);
      login(user);
      toast.success('Account created! Welcome to Murmr.');
      navigate('/app');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard>
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
          Create your account
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 32px' }}
        >
          Start listening to your users in minutes
        </motion.p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'contents' }} noValidate>
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Full name
                    </FormLabel>
                    <FormControl>
                      <MurmrInput placeholder="Maya Chen" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
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

            <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Password
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

            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="cta-block"
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </motion.div>
          </form>
        </Form>

        <motion.p
          variants={itemVariants}
          style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24, marginBottom: 0 }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Sign in <ArrowRight size={16} />
          </Link>
        </motion.p>
      </AuthCard>
    </AuthPageLayout>
  );
}
