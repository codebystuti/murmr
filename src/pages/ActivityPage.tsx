import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useUserMap } from '@/hooks/useUserMap';
import { useActivityStore } from '@/lib/activity-store';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import type { ActivityEvent } from '@/types';

const ACTION_COPY: Record<ActivityEvent['action'], string> = {
  created: 'submitted',
  upvoted: 'upvoted',
  commented: 'commented on',
  shipped: 'shipped',
  status_changed: 'updated status on',
};

const ACTION_COLOR: Record<ActivityEvent['action'], string> = {
  created: 'var(--grad-1)',
  upvoted: 'var(--grad-2)',
  commented: 'var(--grad-3)',
  shipped: 'var(--status-shipped)',
  status_changed: 'var(--status-progress)',
};

function ActivityRow({ event, index }: { event: ActivityEvent; index: number }) {
  const navigate = useNavigate();
  const userMap = useUserMap();
  const shouldReduceMotion = useReducedMotion();
  const user = userMap.get(event.userId);
  const accentColor = ACTION_COLOR[event.action];

  function handleNavigate() {
    navigate(`/app/post/${event.targetId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.2,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      role="button"
      tabIndex={0}
      aria-label={`View post: ${event.targetTitle}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--elev)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grad-1)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]"
      style={{ transition: 'all var(--dur-ui) var(--ease-out-expo)' }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: user?.avatar
            ? 'transparent'
            : `linear-gradient(135deg, ${accentColor}, color-mix(in oklab, ${accentColor} 60%, var(--grad-3)))`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-on-gradient)',
          overflow: 'hidden',
          border: `1px solid color-mix(in oklab, ${accentColor} 30%, transparent)`,
        }}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getInitials(user?.name ?? '?')
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: 'var(--tx)', margin: '0 0 2px', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>{user?.name ?? 'Someone'}</span>
          {' '}
          <span style={{ color: 'var(--tx2)' }}>{ACTION_COPY[event.action]}</span>
          {' '}
          <span
            style={{
              fontWeight: 500,
              color: 'var(--tx)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              maxWidth: '60%',
              verticalAlign: 'bottom',
            }}
          >
            {event.targetTitle}
          </span>
        </p>
        <span
          style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)' }}
        >
          {formatRelativeTime(event.timestamp)}
        </span>
      </div>

      {/* Action dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: accentColor,
          flexShrink: 0,
          marginTop: 6,
        }}
      />
    </motion.div>
  );
}

export default function ActivityPage() {
  const { data: events = [], isLoading } = useActivity(60);
  const { unseenCount, markSeen } = useActivityStore();

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <Topbar
        title="Activity"
        sub={isLoading ? 'Loading…' : `${events.length} recent events`}
        action={
          unseenCount > 0 ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 8,
                background: 'color-mix(in oklab, var(--grad-1) 12%, transparent)',
                border: '1px solid color-mix(in oklab, var(--grad-1) 30%, transparent)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--grad-1)',
              }}
            >
              <Zap size={12} />
              {unseenCount} new
            </div>
          ) : undefined
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  opacity: 1 - i * 0.08,
                }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-container)',
                background: 'var(--elev)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Zap size={20} style={{ color: 'var(--tx3)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', margin: 0, letterSpacing: '-0.01em' }}>
              No activity yet
            </h3>
            <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0, maxWidth: 280 }}>
              Activity from the community will appear here as it happens.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
            {events.map((event, i) => (
              <ActivityRow key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
