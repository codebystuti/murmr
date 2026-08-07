interface SectionHeaderProps {
  label: string;
  headline: React.ReactNode;
  headlineStyle?: React.CSSProperties;
  className?: string;
}

export function SectionHeader({ label, headline, headlineStyle, className }: SectionHeaderProps) {
  return (
    <div className={className} style={{ textAlign: 'center', marginBottom: 'var(--section-hdr-gap)' }}>
      <p
        className="mono"
        style={{ color: 'var(--text-tertiary)', margin: '0 0 var(--section-lbl-gap)', fontSize: 11, letterSpacing: '0.1em' }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.1,
          ...headlineStyle,
        }}
      >
        {headline}
      </h2>
    </div>
  );
}
