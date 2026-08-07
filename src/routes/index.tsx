import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
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

function PageFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
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
      <Routes>
        {/* Marketing / auth routes */}
        <Route element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-success" element={<ResetSuccessPage />} />
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
