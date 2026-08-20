import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Users,
  ChevronUp,
  Plus,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { SubmitFeedbackModal } from '@/components/shared/SubmitFeedbackModal';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/features/posts/components/StatusPill';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useUserMap } from '@/hooks/useUserMap';
import { useAuth } from '@/hooks/useAuth';
import { useActivityStore } from '@/lib/activity-store';
import { formatRelativeTime, formatNumber, getInitials } from '@/lib/utils';
import type { ActivityEvent } from '@/types';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

const ACTION_COPY: Record<ActivityEvent['action'], string> = {
  created: 'submitted',
  upvoted: 'upvoted',
  commented: 'commented on',
  shipped: 'shipped',
  status_changed: 'updated',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor: string;
  index: number;
  onClick?: () => void;
}

function StatCard({ label, value, icon, accentColor, index, onClick }: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      disabled={!onClick}
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl text-left w-full ${onClick ? 'cursor-pointer hover:border-[var(--border-2)] hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]' : ''}`}
      style={{
        padding: '16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all var(--dur-ui) var(--ease-out-expo)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx2)', letterSpacing: '0.01em' }}>
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `color-mix(in oklab, ${accentColor} 14%, transparent)`,
            border: `1px solid color-mix(in oklab, ${accentColor} 25%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--tx)',
          letterSpacing: '-0.03em',
          fontFamily: 'var(--font-display)',
          lineHeight: 1,
        }}
      >
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
    </motion.button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [submitOpen, setSubmitOpen] = useState(false);
  const { data: allPosts = [], isLoading: postsLoading } = usePosts();
  const { data: recentActivity = [], isLoading: actLoading } = useActivity(10);
  const userMap = useUserMap();
  const { markSeen } = useActivityStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const stats = useMemo(() => {
    const totalPosts = allPosts.length;
    const totalUpvotes = allPosts.reduce((sum, p) => sum + p.upvotes, 0);
    const shippedCount = allPosts.filter((p) => p.status === 'shipped').length;
    const contributors = new Set(allPosts.map((p) => p.authorId)).size;
    return { totalPosts, totalUpvotes, shippedCount, contributors };
  }, [allPosts]);

  const trendingPosts = useMemo(
    () => [...allPosts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5),
    [allPosts],
  );

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <Topbar
        title={user ? getGreeting(user.name) : 'Dashboard'}
        sub={today}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSubmitOpen(true)}
          >
            <Plus size={14} />
            New post
          </Button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px' }}>
        {/* Stat cards — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
          {postsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 100, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}
              />
            ))
          ) : (
            <>
              <StatCard label="Total posts" value={stats.totalPosts} icon={<TrendingUp size={15} />} accentColor="var(--grad-1)" index={0} onClick={() => navigate('/app/board')} />
              <StatCard label="Total upvotes" value={stats.totalUpvotes} icon={<ChevronUp size={15} />} accentColor="var(--grad-2)" index={1} onClick={() => navigate('/app/board')} />
              <StatCard label="Contributors" value={stats.contributors} icon={<Users size={15} />} accentColor="var(--grad-3)" index={2} onClick={() => navigate('/app/board')} />
              <StatCard label="Shipped" value={stats.shippedCount} icon={<CheckCircle2 size={15} />} accentColor="var(--status-shipped)" index={3} onClick={() => navigate('/app/changelog')} />
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Trending posts */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--tx)',
                margin: '0 0 12px',
                letterSpacing: '-0.01em',
              }}
            >
              Trending
            </h2>

            {postsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{ height: 68, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', opacity: 1 - i * 0.12 }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trendingPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0.01 : 0.5,
                      delay: shouldReduceMotion ? 0 : i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View post: ${post.title}`}
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/app/post/${post.id}`);
                      }
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--elev)] hover:border-[var(--border-2)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      transition: 'all var(--dur-ui) var(--ease-out-expo)',
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 7,
                        background: 'var(--elev)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--tx3)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--tx)',
                          lineHeight: 1.35,
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {post.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusPill status={post.status} size="sm" />
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
                          <ChevronUp size={11} />
                          {formatNumber(post.upvotes)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx3)' }}>
                          <MessageSquare size={10} />
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed — hidden on mobile, sidebar on desktop */}
          {isDesktop && <div style={{ width: 300, flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', margin: 0, letterSpacing: '-0.01em' }}>
                Live activity
              </h2>
              <button
                type="button"
                onClick={() => { markSeen(); navigate('/app/activity'); }}
                className="text-[var(--tx3)] hover:text-[var(--tx)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded"
                style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', transition: 'color var(--dur-ui)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                View all
                <ArrowRight size={12} />
              </button>
            </div>

            {actLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ height: 48, borderRadius: 10, background: 'var(--surface)', opacity: 1 - i * 0.12 }} />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 8px', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'color-mix(in oklab, var(--grad-1) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--grad-1) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grad-1)' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', margin: '0 0 2px' }}>No activity yet</p>
                  <p style={{ fontSize: 12, color: 'var(--tx3)', margin: 0 }}>New events will appear here.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentActivity.map((event) => {
                  const actor = userMap.get(event.userId);
                  return (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`View post: ${event.targetTitle}`}
                      onClick={() => navigate(`/app/post/${event.targetId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/app/post/${event.targetId}`);
                        }
                      }}
                      className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                      style={{ transition: 'all var(--dur-ui)' }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          background: actor?.avatar ? 'transparent' : 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--text-on-gradient)',
                          overflow: 'hidden',
                        }}
                      >
                        {actor?.avatar ? (
                          <img src={actor.avatar} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(actor?.name ?? '?')
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: 'var(--tx2)', margin: 0, lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600, color: 'var(--tx)' }}>{actor?.name?.split(' ')[0] ?? '…'}</span>
                          {' '}{ACTION_COPY[event.action]}{' '}
                          <span style={{ color: 'var(--tx)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '55%', verticalAlign: 'bottom' }}>
                            {event.targetTitle}
                          </span>
                        </p>
                        <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}>
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setSubmitOpen(true)}
        aria-label="New post"
        initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 1 : 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.4, type: 'spring', stiffness: 300, damping: 24 }}
        whileTap={{ scale: 0.93 }}
        className="sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] shadow-[0_8px_24px_color-mix(in_oklab,var(--grad-1)_40%,transparent)]"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 16,
          border: 'none',
          background: 'var(--gradient)',
          color: 'var(--text-on-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 30,
        }}
      >
        <Plus size={22} />
      </motion.button>

      <SubmitFeedbackModal open={submitOpen} onOpenChange={setSubmitOpen} />
    </div>
  );
}
