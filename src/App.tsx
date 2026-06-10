import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSupabase } from './hooks/useSupabase';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { DashboardLayout } from './pages/DashboardLayout';
import TasksPage from './pages/TasksPage';
import CharacterPage from './pages/CharacterPage';
import StorePage from './pages/StorePage';
import SocialPage from './pages/SocialPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function AppRoutes() {
  useSupabase();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/tasks" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="character" element={<CharacterPage />} />
        <Route path="store" element={<StorePage />} />
        <Route path="social" element={<SocialPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard/tasks" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
