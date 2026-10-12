import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Landing page lazy — rich animations, own chunk
const LandingPage = lazy(() => import('@/pages/LandingPage'));

// Auth pages imported directly — no lazy loading (critical path, tiny bundles)
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ResetSuccessPage from '@/pages/ResetSuccessPage';

// App pages lazy — only loaded after login
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BoardPage = lazy(() => import('@/pages/BoardPage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const RoadmapPage = lazy(() => import('@/pages/RoadmapPage'));
const ChangelogPage = lazy(() => import('@/pages/ChangelogPage'));
const ActivityPage = lazy(() => import('@/pages/ActivityPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        className="animate-pulse"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--gradient)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      {/* Top-level boundary: catches anything the per-section boundaries miss */}
      <ErrorBoundary>
        <Routes>
          {/* Marketing / auth routes — boundary isolates landing/auth crashes from the app */}
          <Route element={<ErrorBoundary><MarketingLayout /></ErrorBoundary>}>
            <Route index element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
            <Route path="/reset-success" element={<GuestRoute><ResetSuccessPage /></GuestRoute>} />
          </Route>

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/app" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="/app/board" element={<ErrorBoundary><BoardPage /></ErrorBoundary>} />
          <Route path="/app/post/:postId" element={<ErrorBoundary><PostDetailPage /></ErrorBoundary>} />
          <Route path="/app/roadmap" element={<ErrorBoundary><RoadmapPage /></ErrorBoundary>} />
          <Route path="/app/changelog" element={<ErrorBoundary><ChangelogPage /></ErrorBoundary>} />
          <Route path="/app/activity" element={<ErrorBoundary><ActivityPage /></ErrorBoundary>} />
          <Route path="/app/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
          <Route path="/app/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}
