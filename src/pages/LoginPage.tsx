import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';

export default function LoginPage() {
  const session = useAuthStore((s) => s.session);

  if (session) return <Navigate to="/dashboard/tasks" replace />;

  return (
    <div className="min-h-screen bg-bg-primary flex items-start justify-center pt-20 px-4">
      <LoginForm />
    </div>
  );
}
