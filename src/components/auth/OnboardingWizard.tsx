import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import type { CharacterClass } from '../../types';

const classes: { value: CharacterClass; label: string; icon: string; desc: string }[] = [
  { value: 'warrior', label: 'Warrior', icon: '⚔️', desc: 'Sturdy and relentless' },
  { value: 'mage', label: 'Mage', icon: '🔮', desc: 'Wise and arcane' },
  { value: 'rogue', label: 'Rogue', icon: '🗡️', desc: 'Swift and cunning' },
];

const SUGGESTED_HABITS = [
  'Drink water 💧',
  'Exercise 🏃',
  'Read 30 minutes 📖',
  'Meditate 🧘',
  'No social media 📵',
  'Write in journal ✍️',
  'Take vitamins 💊',
  'Walk 10k steps 👣',
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [characterClass, setCharacterClass] = useState<CharacterClass>('warrior');
  const [displayName, setDisplayName] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setError('Not signed in. Please go back and sign up again.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          character_class: characterClass,
          display_name: displayName || null,
        })
        .eq('id', session.user.id);
      if (profileError) throw profileError;

      const { error: taskError } = await supabase.from('tasks').insert(
        selectedHabits.map((title) => ({
          user_id: session.user.id,
          title,
          type: 'habit',
          difficulty: 'easy',
          is_positive: true,
          is_active: true,
        }))
      );
      if (taskError) throw taskError;

      setSaving(false);
      navigate('/dashboard/tasks');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-6">
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i <= step ? 'bg-accent-gold' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="card">
          <h2 className="text-xl font-display text-accent-gold mb-2">Choose Your Class</h2>
          <p className="text-sm text-text-muted mb-4">This affects your starting look only — no gameplay advantage.</p>
          <div className="grid grid-cols-3 gap-3">
            {classes.map((c) => (
              <button
                key={c.value}
                onClick={() => setCharacterClass(c.value)}
                className={`p-4 rounded-lg border text-center transition-all ${
                  characterClass === c.value
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-border bg-bg-card hover:border-text-muted'
                }`}
              >
                <div className="text-3xl mb-2">{c.icon}</div>
                <div className="text-sm font-semibold text-text-primary">{c.label}</div>
                <div className="text-xs text-text-muted mt-1">{c.desc}</div>
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={() => setStep(1)}>
            Next
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2 className="text-xl font-display text-accent-gold mb-2">Name Your Hero</h2>
          <p className="text-sm text-text-muted mb-4">Choose a display name (max 20 characters).</p>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
            placeholder="Enter your hero name..."
            className="input-field mb-4"
            maxLength={20}
          />
          <p className="text-xs text-text-muted mb-4">{displayName.length}/20</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="text-xl font-display text-accent-gold mb-2">Set Your First Habits</h2>
          <p className="text-sm text-text-muted mb-4">Pick at least 3 to get started.</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SUGGESTED_HABITS.map((h) => {
              const selected = selectedHabits.includes(h);
              return (
                <button
                  key={h}
                  onClick={() =>
                    setSelectedHabits((prev) =>
                      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
                    )
                  }
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    selected
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-border bg-bg-card hover:border-text-muted'
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
          {error && (
            <p className="text-sm text-accent-red text-center mb-3">{error}</p>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={selectedHabits.length < 3 || saving}
              onClick={handleComplete}
            >
              {saving ? 'Creating...' : 'Start Your Journey'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
