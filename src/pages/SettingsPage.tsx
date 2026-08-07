import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Sun, Moon, RefreshCw, Loader2, ShieldCheck, User as UserIcon, ArrowUpRight } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/lib/theme-store';
import { resetSeed } from '@/lib/seed';
import { toast } from 'sonner';

type Theme = 'light' | 'dark';

// ── Section wrapper ────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--tx2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── Row inside a section ───────────────────────────────────────────
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      className="border-b border-[var(--border)] last:border-b-0"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 24px' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', lineHeight: 1.35 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ── Theme toggle pill ──────────────────────────────────────────────
function ThemeSelector({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div
      role="group"
      aria-label="Select theme"
      style={{
        display: 'inline-flex',
        gap: 4,
        background: 'var(--elev)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 4,
      }}
    >
      {([
        { value: 'light', label: 'Light', Icon: Sun },
        { value: 'dark', label: 'Dark', Icon: Moon },
      ] as { value: Theme; label: string; Icon: React.ElementType }[]).map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={`${active ? 'text-[var(--tx)] shadow-[0_1px_3px_rgba(0,0,0,0.2)]' : 'text-[var(--tx3)] hover:text-[var(--tx2)]'} active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 12px',
              borderRadius: 7,
              border: 'none',
              background: active ? 'var(--surface)' : 'transparent',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all var(--dur-ui)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Role toggle ────────────────────────────────────────────────────
function RoleToggle({ role, onToggle }: { role: string; onToggle: () => void }) {
  const isAdmin = role === 'admin';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: isAdmin
            ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))'
            : 'var(--elev)',
          color: isAdmin ? 'var(--text-on-gradient)' : 'var(--tx2)',
          letterSpacing: '0.02em',
        }}
      >
        {isAdmin ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
        {isAdmin ? 'Admin' : 'User'}
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={onToggle}
      >
        Switch to {isAdmin ? 'User' : 'Admin'}
      </Button>
    </div>
  );
}

// ── Info row (read-only) ───────────────────────────────────────────
function InfoValue({ value }: { value: string }) {
  return (
    <span
      style={{
        fontSize: 13,
        color: 'var(--tx2)',
        fontFamily: 'var(--font-mono)',
        background: 'var(--elev)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '4px 10px',
      }}
    >
      {value}
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useThemeStore();
  const qc = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  if (!user) return null;

  function handleRoleToggle() {
    if (!user) return;
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    updateUser({ role: nextRole });
    toast.success(`Switched to ${nextRole} role`);
  }

  async function handleReset() {
    setResetting(true);
    await new Promise((r) => setTimeout(r, 600));
    resetSeed();
    qc.invalidateQueries();
    if (isMountedRef.current) {
      setResetting(false);
      setConfirmReset(false);
    }
    toast.success('Demo data reset', { description: 'All posts, comments, and activity have been regenerated.' });
  }

  const sections = [
    {
      title: 'Appearance',
      rows: [
        {
          label: 'Theme',
          description: 'Choose between light and dark interface.',
          control: <ThemeSelector theme={theme} setTheme={setTheme} />,
        },
      ],
    },
    {
      title: 'Account',
      rows: [
        {
          label: 'Name',
          description: 'Your display name across Murmr.',
          control: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoValue value={user.name} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/profile')}
              >
                Edit <ArrowUpRight size={13} />
              </Button>
            </div>
          ),
        },
        {
          label: 'Email',
          description: 'Your login email address.',
          control: <InfoValue value={user.email} />,
        },
        {
          label: 'Role',
          description: 'Toggle between user and admin to preview different permission levels.',
          control: <RoleToggle role={user.role} onToggle={handleRoleToggle} />,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <Topbar title="Settings" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '24px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, delay: shouldReduceMotion ? 0 : si * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Section title={section.title}>
                {section.rows.map((row) => (
                  <SettingRow
                    key={row.label}
                    label={row.label}
                    description={row.description}
                  >
                    {row.control}
                  </SettingRow>
                ))}
              </Section>
            </motion.div>
          ))}

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, delay: shouldReduceMotion ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: 'color-mix(in oklab, var(--status-error) 5%, var(--surface))',
                border: '1px solid color-mix(in oklab, var(--status-error) 25%, var(--border))',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 24px', borderBottom: '1px solid color-mix(in oklab, var(--status-error) 20%, var(--border))' }}>
                <h2 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'color-mix(in oklab, var(--status-error) 80%, var(--tx2))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Danger zone
                </h2>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>Reset demo data</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
                    Wipes all posts, comments, and activity, then regenerates fresh seed data. Cannot be undone.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: '1px solid color-mix(in oklab, var(--status-error) 35%, var(--border))',
                        background: 'color-mix(in oklab, var(--status-error) 8%, transparent)',
                        color: 'var(--status-error)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--dur-ui)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <RefreshCw size={13} />
                      Reset data
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--tx2)' }}>Are you sure?</span>
                      <button
                        type="button"
                        disabled={resetting}
                        onClick={handleReset}
                        className="active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: 'var(--status-error)',
                          color: 'var(--text-on-gradient)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: resetting ? 'not-allowed' : 'pointer',
                          opacity: resetting ? 0.7 : 1,
                          transition: 'all var(--dur-ui)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {resetting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        {resetting ? 'Resetting…' : 'Yes, reset'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)]"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--tx2)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all var(--dur-ui)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer version info */}
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <span style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
              Murmr · Portfolio demo · v0.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
