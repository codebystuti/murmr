import { Rocket } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { useChangelog } from '@/features/changelog/hooks/useChangelog';
import { useEnterReveal, enterDelay } from '@/hooks/useEnterReveal';
import type { ChangelogEntry } from '@/types';

const TYPE_META: Record<ChangelogEntry['type'], { label: string; bg: string; color: string }> = {
  new: {
    label: 'New',
    bg: 'color-mix(in oklab, var(--status-planned) 14%, transparent)',
    color: 'var(--status-planned)',
  },
  improved: {
    label: 'Improved',
    bg: 'color-mix(in oklab, var(--grad-1) 14%, transparent)',
    color: 'var(--grad-1)',
  },
  fixed: {
    label: 'Fixed',
    bg: 'color-mix(in oklab, var(--status-shipped) 14%, transparent)',
    color: 'var(--status-shipped)',
  },
};

function formatDate(iso: string): string {
  // Short month keeps every date on one line in the 120px date column ("Sep 28, 2026").
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ChangelogSkeleton() {
  return (
    <div style={{ padding: '32px 48px', maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 32, marginBottom: 48, opacity: 1 - i * 0.25 }}
        >
          <div className="hidden md:block" style={{ width: 120, flexShrink: 0 }}>
            <div className="animate-pulse" style={{ height: 12, width: 90, borderRadius: 4, background: 'var(--elev)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="animate-pulse" style={{ height: 10, width: 60, borderRadius: 999, background: 'var(--elev)', marginBottom: 12 }} />
            <div className="animate-pulse" style={{ height: 20, width: '70%', borderRadius: 6, background: 'var(--elev)', marginBottom: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="animate-pulse" style={{ height: 13, width: '100%', borderRadius: 4, background: 'var(--elev)' }} />
              <div className="animate-pulse" style={{ height: 13, width: '85%', borderRadius: 4, background: 'var(--elev)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChangelogItem({ entry, index }: { entry: ChangelogEntry; index: number }) {
  const typeMeta = TYPE_META[entry.type];

  return (
    <div
      className="murmr-enter"
      style={{ display: 'flex', gap: 32, marginBottom: 48, '--enter-delay': enterDelay(index) } as React.CSSProperties}
    >
      {/* Date column — hidden on mobile, shown on md+ */}
      <div
        className="hidden md:block"
        style={{
          width: 120,
          flexShrink: 0,
          paddingTop: 2,
          textAlign: 'right',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'var(--tx3)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
          }}
        >
          {formatDate(entry.publishedAt)}
        </span>
      </div>

      {/* Timeline spine */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: typeMeta.color,
            marginTop: 4,
            flexShrink: 0,
            boxShadow: `0 0 0 3px color-mix(in oklab, ${typeMeta.color} 20%, transparent)`,
          }}
        />
        <div
          style={{
            width: 1,
            flex: 1,
            background: 'var(--border)',
            marginTop: 6,
            minHeight: 40,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
        {/* Date label — shown on mobile only */}
        <div
          className="md:hidden"
          style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}
        >
          {formatDate(entry.publishedAt)}
        </div>
        {/* Type badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 6,
            background: typeMeta.bg,
            color: typeMeta.color,
            marginBottom: 8,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {typeMeta.label}
        </span>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--tx)',
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
            lineHeight: 1.25,
            fontFamily: 'var(--font-display)',
          }}
        >
          {entry.title}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: 'var(--tx2)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {entry.body}
        </p>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const { data: entries = [], isLoading, error } = useChangelog();
  const revealRef = useEnterReveal<HTMLDivElement>(!isLoading);

  return (
    <div ref={revealRef} className="flex flex-col overflow-hidden" style={{ flex: 1, background: 'var(--bg)' }}>
      <Topbar
        title="Changelog"
        sub={isLoading ? 'Loading…' : `${entries.length} releases`}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <ChangelogSkeleton />
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
            <p style={{ color: 'var(--tx3)', fontSize: 14 }}>Failed to load changelog.</p>
          </div>
        ) : entries.length === 0 ? (
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
              <Rocket size={20} style={{ color: 'var(--tx3)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', margin: 0, letterSpacing: '-0.01em' }}>
              No changelog entries yet
            </h3>
            <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0, maxWidth: 280 }}>
              Shipped updates will appear here. Check back soon.
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: '32px 48px',
              maxWidth: 720,
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {entries.map((entry, i) => (
              <ChangelogItem key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
