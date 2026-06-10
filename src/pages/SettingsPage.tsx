import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const [resetTime, setResetTime] = useState(profile?.daily_reset_time ?? '00:00');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveResetTime = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ daily_reset_time: resetTime, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      .eq('id', profile.id);
    setSaving(false);
  };

  const handleExportData = async () => {
    if (!profile) return;
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', profile.id);
    const { data: completions } = await supabase.from('task_completions').select('*').eq('user_id', profile.id);
    const exportData = { profile, tasks, completions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-rpg-data-${profile.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-display text-accent-gold">Settings</h2>

      <section className="card space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase">Daily Reset</h3>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={resetTime}
            onChange={(e) => setResetTime(e.target.value)}
            className="input-field w-auto"
          />
          <Button size="sm" onClick={handleSaveResetTime} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </section>

      <section className="card space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase">Accessibility</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-bg-card accent-accent-gold"
          />
          <span className="text-sm text-text-primary">Reduced motion (disable animations)</span>
        </label>
      </section>

      <section className="card space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase">Data</h3>
        <Button variant="ghost" className="w-full border border-border" onClick={handleExportData}>
          Export All Data (JSON)
        </Button>
      </section>

      <section className="card space-y-4 border-accent-red/30">
        <h3 className="text-sm font-semibold text-accent-red uppercase">Danger Zone</h3>
        <Button variant="danger" className="w-full" onClick={signOut}>
          Sign Out
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={async () => {
            if (confirm('Are you sure? This cannot be undone.')) {
              await supabase.rpc('delete_user');
              await signOut();
            }
          }}
        >
          Delete Account
        </Button>
      </section>
    </div>
  );
}
