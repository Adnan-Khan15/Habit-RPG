import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SignupForm } from '../components/auth/SignupForm';

export default function SignupPage() {
  const session = useAuthStore((s) => s.session);

  if (session) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-bg-primary flex items-start justify-center pt-20 px-4">
      <SignupForm />
    </div>
  );
}
