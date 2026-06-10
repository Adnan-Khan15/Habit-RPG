import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

export function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          username: email.split('@')[0],
          display_name: null,
          character_class: 'warrior',
          referral_code: crypto.randomUUID().slice(0, 8),
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      navigate('/onboarding');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 card">
      <h2 className="text-2xl font-display text-accent-gold text-center mb-6">Create Your Hero</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-sm text-accent-red">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="ghost" className="w-full border border-border" onClick={handleGoogleLogin}>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-text-muted mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
