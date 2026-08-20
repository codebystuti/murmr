/* ─────────────────────────────────────────────────────────────
   Inline CSS mockups of the Murmr app UI
   Used by CinematicSection and InTheFieldSection.
   No real data — purely decorative.

   EXCEPTION: sub-4 gap values (gap: 1/2/3), fontSize 8/9, and
   borderRadius: 14 are intentional here — they simulate dense
   app UI rendered at thumbnail scale. Do NOT normalize these.
───────────────────────────────────────────────────────────── */

const pill = (color: string, label: string) => (
  <span
    style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding: '2px 7px',
      borderRadius: 999,
      border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
      background: `color-mix(in oklab, ${color} 14%, transparent)`,
      color,
      fontFamily: 'var(--font-mono)',
    }}
  >
    {label}
  </span>
);

function PostRow({
  votes,
  title,
  status,
  statusColor,
  comments,
  age,
}: {
  votes: number;
  title: string;
  status: string;
  statusColor: string;
  comments: number;
  age: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 10,
        background: 'color-mix(in oklab, var(--text-on-gradient) 2%, transparent)',
        border: `1px solid color-mix(in oklab, var(--text-on-gradient) 5%, transparent)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          minWidth: 28,
          paddingTop: 1,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 7H1L5 1Z" fill="var(--grad-1)" opacity="0.8" />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {votes}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
          {pill(statusColor, status)}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            fontSize: 10,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>💬 {comments}</span>
          <span>·</span>
          <span>{age}</span>
        </div>
      </div>
    </div>
  );
}

export function BoardMock() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--bg-base)',
        border: `1px solid var(--border-dark)`,
        borderRadius: 14,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '10px 12px',
          borderBottom: `1px solid var(--border-dark)`,
          alignItems: 'center',
        }}
      >
        {['All', 'Planned', 'In Progress'].map((f, i) => (
          <span
            key={f}
            style={{
              fontSize: 10,
              fontWeight: i === 0 ? 700 : 500,
              padding: '3px 9px',
              borderRadius: 999,
              background: i === 0 ? 'linear-gradient(135deg, var(--grad-1), var(--grad-2))' : 'transparent',
              color: i === 0 ? 'var(--text-on-gradient)' : 'var(--text-tertiary)',
              border: i === 0 ? 'none' : `1px solid var(--border-dark)`,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.03em',
            }}
          >
            {f}
          </span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
              color: 'var(--text-on-gradient)',
              fontWeight: 600,
            }}
          >
            + Submit
          </span>
        </div>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 12px' }}>
        <PostRow votes={42} title="Dark mode support" status="Planned" statusColor="var(--status-planned)" comments={12} age="2d" />
        <PostRow votes={38} title="Keyboard shortcuts" status="In Progress" statusColor="var(--status-progress)" comments={8} age="5d" />
        <PostRow votes={27} title="Export to CSV" status="Open" statusColor="var(--status-open)" comments={5} age="1w" />
        <PostRow votes={19} title="Webhook notifications" status="Open" statusColor="var(--status-open)" comments={3} age="2w" />
      </div>
    </div>
  );
}

function RoadmapCard({ title, votes, comments }: { title: string; votes: number; comments: number }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        borderRadius: 8,
        background: 'color-mix(in oklab, var(--text-on-gradient) 3%, transparent)',
        border: `1px solid color-mix(in oklab, var(--text-on-gradient) 6%, transparent)`,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
        {title}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 8,
          fontSize: 10,
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>↑{votes}</span>
        <span>💬 {comments}</span>
      </div>
    </div>
  );
}

export function RoadmapMock() {
  const cols = [
    { label: 'Planned', color: 'var(--status-planned)', cards: [{ title: 'Dark mode support', votes: 42, comments: 12 }, { title: 'CSV export', votes: 27, comments: 5 }] },
    { label: 'In Progress', color: 'var(--status-progress)', cards: [{ title: 'Keyboard shortcuts', votes: 38, comments: 8 }, { title: 'OAuth providers', votes: 31, comments: 3 }] },
    { label: 'Shipped', color: 'var(--status-shipped)', cards: [{ title: 'File uploads', votes: 24, comments: 6 }, { title: 'Comment threads', votes: 18, comments: 4 }] },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--bg-base)',
        border: `1px solid var(--border-dark)`,
        borderRadius: 14,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid var(--border-dark)` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Roadmap</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
          4 in progress · 8 shipped
        </span>
      </div>

      {/* Columns */}
      <div style={{ display: 'flex', gap: 10, padding: 12 }}>
        {cols.map((col) => (
          <div key={col.label} style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
                paddingBottom: 7,
                borderBottom: `2px solid ${col.color}`,
              }}
            >
              <span
                style={{ width: 6, height: 6, borderRadius: 999, background: col.color, flexShrink: 0 }}
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                {col.label}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {col.cards.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {col.cards.map((c) => (
                <RoadmapCard key={c.title} {...c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChangelogMock() {
  const entries = [
    { version: 'v2.3.0', age: '3 days ago', type: 'NEW', typeColor: 'var(--status-shipped)', title: 'Dark mode shipped', body: 'Your most requested feature is live. Toggle in Settings.' },
    { version: 'v2.2.0', age: '2 weeks ago', type: 'FIX', typeColor: 'var(--status-planned)', title: 'Vote count accuracy', body: 'Real-time upvote counts across all boards.' },
    { version: 'v2.1.0', age: '1 month ago', type: 'IMPROVEMENT', typeColor: 'var(--status-progress)', title: 'One-click upvoting', body: 'Faster voting, directly from the feedback board.' },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--bg-base)',
        border: `1px solid var(--border-dark)`,
        borderRadius: 14,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid var(--border-dark)` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Changelog</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
          12 updates this quarter
        </span>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: 12, gap: 0 }}>
        {entries.map((entry, i) => (
          <div key={entry.version} style={{ display: 'flex', gap: 10 }}>
            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: entry.typeColor,
                  flexShrink: 0,
                  marginTop: 12,
                  boxShadow: `0 0 8px color-mix(in oklab, ${entry.typeColor} 50%, transparent)`,
                }}
              />
              {i < entries.length - 1 && (
                <div style={{ width: 1, flex: 1, background: 'var(--border-dark)', margin: '3px 0' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: i < entries.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {pill(entry.typeColor, entry.type)}
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {entry.version} · {entry.age}
                </span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                {entry.title}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {entry.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardMock() {
  const stats = [
    { label: 'Posts', value: '127', color: 'var(--grad-1)' },
    { label: 'Votes', value: '891', color: 'var(--grad-2)' },
    { label: 'Members', value: '43', color: 'var(--grad-3)' },
    { label: 'Shipped', value: '12', color: 'var(--status-shipped)' },
  ];

  const trending = [
    { title: 'Dark mode support', votes: 42 },
    { title: 'Keyboard shortcuts', votes: 38 },
    { title: 'Export to CSV', votes: 27 },
    { title: 'Webhook notifications', votes: 21 },
    { title: 'OAuth providers', votes: 17 },
  ];

  const activity = [
    { user: 'Alex', action: 'upvoted', target: 'Dark mode support', color: 'var(--grad-2)' },
    { user: 'Taylor', action: 'commented on', target: 'Keyboard shortcuts', color: 'var(--grad-3)' },
    { user: 'Jamie', action: 'submitted', target: 'Webhook support', color: 'var(--grad-1)' },
    { user: 'Sam', action: 'upvoted', target: 'OAuth providers', color: 'var(--grad-2)' },
    { user: 'Riley', action: 'shipped', target: 'CSV export', color: 'var(--status-shipped)' },
    { user: 'Morgan', action: 'commented on', target: 'Two-factor auth', color: 'var(--grad-3)' },
    { user: 'Quinn', action: 'submitted', target: 'Slack integration', color: 'var(--grad-1)' },
    { user: 'Dana', action: 'upvoted', target: 'Bulk status update', color: 'var(--grad-2)' },
    { user: 'Avery', action: 'commented on', target: 'Export to CSV', color: 'var(--grad-3)' },
    { user: 'Jordan', action: 'submitted', target: 'Priority inbox', color: 'var(--grad-1)' },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--bg-base)',
        border: `1px solid var(--border-dark)`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
        width: '100%',
      }}
    >
      {/* Topbar */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid var(--border-dark)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Good afternoon, Aria
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            13 new posts this week
          </p>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--grad-1), var(--grad-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-on-gradient)',
          }}
        >
          A
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '10px 12px', flexShrink: 0 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: '8px 10px',
              borderRadius: 9,
              background: 'color-mix(in oklab, var(--text-on-gradient) 3%, transparent)',
              border: `1px solid color-mix(in oklab, var(--text-on-gradient) 5%, transparent)`,
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {s.value}
            </p>
            <p style={{ fontSize: 9, color: 'var(--text-tertiary)', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Trending + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 12px 12px' }}>
        {/* Trending */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Trending
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trending.map((t, i) => (
              <div
                key={t.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 7px',
                  borderRadius: 7,
                  background: 'color-mix(in oklab, var(--text-on-gradient) 2%, transparent)',
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--grad-1)', fontFamily: 'var(--font-mono)', minWidth: 16 }}>
                  #{i + 1}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  ↑{t.votes}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Activity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activity.map((a) => (
              <div key={a.target} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px' }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: a.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 700,
                    color: 'var(--text-on-gradient)',
                    flexShrink: 0,
                  }}
                >
                  {a.user[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{a.user}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}> {a.action} </span>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '60%', verticalAlign: 'bottom' }}>
                    {a.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
