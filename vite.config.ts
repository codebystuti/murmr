import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/murmr/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;

          // TanStack Query (data fetching + devtools)
          if (id.includes('/@tanstack/')) return 'query';

          // Framer Motion (animation runtime — large, changes rarely)
          if (id.includes('/framer-motion/')) return 'animation';

          // React Router
          if (id.includes('/react-router')) return 'router';

          // Forms: RHF + resolvers + Zod validation + Zustand state
          if (
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/') ||
            id.includes('/zod/') ||
            id.includes('/zustand/')
          ) return 'forms';

          // Core React (regex avoids matching @gsap/react or react-router-dom)
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';

          // UI primitives: Radix, Lucide, cmdk, Sonner, CVA utilities
          if (
            id.includes('/@radix-ui/') ||
            id.includes('/lucide-react/') ||
            id.includes('/cmdk/') ||
            id.includes('/sonner/') ||
            id.includes('/class-variance-authority/') ||
            id.includes('/clsx/') ||
            id.includes('/tailwind-merge/')
          ) return 'ui';

          // gsap, @gsap/react, lenis, @faker-js/faker, date-fns → stay in index chunk.
          // A catch-all 'vendor' group disables cross-chunk tree-shaking for these packages,
          // which inflates the bundle (faker alone is ~1.7 MB before shaking). Let Rollup
          // handle them naturally: statically-imported ones stay in index, dynamic imports
          // (gsap/ScrollTrigger) keep their own lazy chunk.
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
