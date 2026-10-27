import { Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { startActivitySimulator, stopActivitySimulator } from '@/lib/activity-simulator';
import { preloadAppPages } from '@/routes/appPages';
import { activityApi, boardsApi, changelogApi, commentsApi, postsApi, usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { mainThreadMotion } from '@/lib/motion';

function ContentFallback() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div
        className="animate-pulse"
        style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)', opacity: 0.6 }}
      />
    </div>
  );
}

export default function AppLayout() {
  const qc = useQueryClient();
  const userId = useAuth().user?.id;

  useEffect(() => {
    startActivitySimulator();
    return () => stopActivitySimulator();
  }, []);

  // Warm every tab's code and data so switching tabs never shows a fallback or skeleton.
  useEffect(() => {
    preloadAppPages();
    void qc.prefetchQuery({ queryKey: ['users'], queryFn: usersApi.list, staleTime: 5 * 60 * 1000 });
    void qc.prefetchQuery({ queryKey: ['boards'], queryFn: boardsApi.list, staleTime: Infinity });
    void qc.prefetchQuery({ queryKey: ['posts', 'all'], queryFn: () => postsApi.list(undefined), staleTime: 30_000 });
    void qc.prefetchQuery({ queryKey: ['changelog'], queryFn: changelogApi.list, staleTime: 5 * 60 * 1000 });
    void qc.prefetchQuery({ queryKey: ['activity', 60], queryFn: () => activityApi.list(60) });
    void qc.prefetchQuery({ queryKey: ['activity', 10], queryFn: () => activityApi.list(10) });
  }, [qc]);

  useEffect(() => {
    if (!userId) return;
    void qc.prefetchQuery({ queryKey: ['comments', 'author', userId], queryFn: () => commentsApi.listByAuthor(userId), staleTime: 30_000 });
  }, [qc, userId]);

  return (
    <MotionConfig {...mainThreadMotion}>
      {/* 100dvh keeps scroll areas clear of iOS Safari's toolbar; 100vh is the fallback. */}
      <div
        className="murmr-app h-[100vh] supports-[height:100dvh]:h-[100dvh]"
        style={{
          display: 'flex',
          overflow: 'hidden',
          background: 'var(--bg)',
          color: 'var(--tx)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
          <Suspense fallback={<ContentFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}
