import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCharacter } from '../hooks/useCharacter';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { MobileTabBar } from '../components/layout/MobileTabBar';
import { ToastContainer } from '../components/ui/Toast';
import { LevelUpOverlay } from '../components/ui/LevelUpOverlay';
import { PWAInstallBanner } from '../components/ui/PWAInstallBanner';

export function DashboardLayout() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  useCharacter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="animate-pulse text-accent-gold text-lg font-display">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
      <ToastContainer />
      <LevelUpOverlay />
      <PWAInstallBanner />
    </div>
  );
}
