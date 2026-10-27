export const loadDashboardPage = () => import('@/pages/DashboardPage');
export const loadBoardPage = () => import('@/pages/BoardPage');
export const loadPostDetailPage = () => import('@/pages/PostDetailPage');
export const loadRoadmapPage = () => import('@/pages/RoadmapPage');
export const loadChangelogPage = () => import('@/pages/ChangelogPage');
export const loadActivityPage = () => import('@/pages/ActivityPage');
export const loadProfilePage = () => import('@/pages/ProfilePage');
export const loadSettingsPage = () => import('@/pages/SettingsPage');

export function preloadAppPages() {
  [
    loadDashboardPage,
    loadBoardPage,
    loadPostDetailPage,
    loadRoadmapPage,
    loadChangelogPage,
    loadActivityPage,
    loadProfilePage,
    loadSettingsPage,
  ].forEach((load) => void load());
}
