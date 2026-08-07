import { usePasswordStrength } from '@/hooks/usePasswordStrength';

interface PasswordStrengthProps {
  password: string;
}

function strengthColor(score: number): string {
  if (score >= 4) return 'var(--status-shipped)';
  if (score >= 3) return 'var(--grad-1)';
  if (score >= 2) return 'var(--status-warning)';
  return 'var(--status-error)';
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, widthPercent } = usePasswordStrength(password);

  if (!password) return null;

  const color = strengthColor(score);

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {/* Strength bar */}
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--border-dark)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${widthPercent}%`,
            borderRadius: 999,
            background: color,
            transition: `width var(--dur-medium) var(--ease-out-expo), background var(--dur-medium) ease`,
          }}
        />
      </div>
      {/* Label */}
      {label && (
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
