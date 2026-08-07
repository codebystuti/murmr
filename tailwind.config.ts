import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Marketing dark tokens
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        // App theme tokens (switch via data-theme)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        elev: 'var(--elev)',
        border: 'var(--border)',
        'border-2': 'var(--border-2)',
        tx: 'var(--tx)',
        tx2: 'var(--tx2)',
        tx3: 'var(--tx3)',
        // Brand gradient stops
        grad1: 'var(--grad-1)',
        grad2: 'var(--grad-2)',
        grad3: 'var(--grad-3)',
        // Status
        'status-open': 'var(--status-open)',
        'status-planned': 'var(--status-planned)',
        'status-progress': 'var(--status-progress)',
        'status-shipped': 'var(--status-shipped)',
        'status-closed': 'var(--status-closed)',
      },
      fontFamily: {
        display: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'var(--gradient)',
        'brand-gradient-soft': 'var(--gradient-soft)',
      },
      boxShadow: {
        app: 'var(--shadow)',
      },
      animation: {
        'gradient-sweep': 'gradientSweep 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 8s ease-in-out infinite',
        'orb-float': 'orbFloat 18s ease-in-out infinite',
        'orb-spin': 'orbSpin 60s linear infinite',
        'wave-pulse': 'wavePulse 4s ease-in-out infinite',
      },
      keyframes: {
        gradientSweep: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-30px) translateX(-10px)' },
        },
        orbSpin: {
          '0%': { rotate: '0deg' },
          '100%': { rotate: '360deg' },
        },
        wavePulse: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(0.96)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
