import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

export interface MurmrInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const MurmrInput = React.forwardRef<HTMLInputElement, MurmrInputProps>(
  function MurmrInput({ className, type, ...props }, ref) {
    const isPasswordType = type === 'password';
    const [showPassword, setShowPassword] = React.useState(false);

    const radius = 100;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const gradientRef = React.useRef<HTMLDivElement | null>(null);
    const posRef = React.useRef({ x: 0, y: 0 });

    useGSAP(
      () => {
        gsap.set(gradientRef.current, {
          background: `radial-gradient(0px circle at 0px 0px, color-mix(in oklab, var(--grad-1) 55%, transparent), color-mix(in oklab, var(--grad-2) 25%, transparent) 40%, transparent 80%)`,
        });
      },
      { scope: containerRef },
    );

    function handleMouseMove(e: React.MouseEvent) {
      if (!containerRef.current) return;
      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      posRef.current = { x, y };
      gsap.to(gradientRef.current, {
        background: `radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, var(--grad-1) 55%, transparent), color-mix(in oklab, var(--grad-2) 25%, transparent) 40%, transparent 80%)`,
        duration: 0.1,
      });
    }

    function handleMouseEnter(e: React.MouseEvent) {
      if (!containerRef.current) return;
      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      posRef.current = { x, y };
      gsap.set(gradientRef.current, {
        background: `radial-gradient(0px circle at ${x}px ${y}px, color-mix(in oklab, var(--grad-1) 55%, transparent), color-mix(in oklab, var(--grad-2) 25%, transparent) 40%, transparent 80%)`,
      });
      gsap.to(gradientRef.current, {
        background: `radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, var(--grad-1) 55%, transparent), color-mix(in oklab, var(--grad-2) 25%, transparent) 40%, transparent 80%)`,
        duration: 0.3,
      });
    }

    function handleMouseLeave() {
      const { x, y } = posRef.current;
      gsap.to(gradientRef.current, {
        background: `radial-gradient(0px circle at ${x}px ${y}px, color-mix(in oklab, var(--grad-1) 55%, transparent), color-mix(in oklab, var(--grad-2) 25%, transparent) 40%, transparent 80%)`,
        duration: 0.3,
      });
    }

    return (
      <div
        ref={containerRef}
        style={{ borderRadius: 12, padding: 1, position: 'relative', transition: 'opacity var(--dur-ui)' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* GSAP-controlled glow layer */}
        <div
          ref={gradientRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            pointerEvents: 'none',
          }}
        />
        <input
          ref={ref}
          type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
          className={cn('murmr-input', className)}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'block',
            width: '100%',
            height: 44,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-dark)',
            borderRadius: 10,
            padding: isPasswordType ? '0 44px 0 14px' : '0 14px',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color var(--dur-ui), box-shadow var(--dur-ui), background var(--dur-ui)',
          }}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((p) => !p)}
            className="murmr-pw-toggle"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  },
);

MurmrInput.displayName = 'MurmrInput';
