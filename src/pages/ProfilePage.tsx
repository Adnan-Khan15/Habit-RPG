import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { ACHIEVEMENTS } from '../lib/xpFormulas';
import { useQuery } from '@tanstack/react-query';
import type { UserAchievement } from '../types';

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: achievements } = useQuery({
    queryKey: ['achievements', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.id);
      return (data as UserAchievement[]) ?? [];
    },
    enabled: !!profile,
  });

  const handleAvatarUpload = async () => {
    if (!profile || !avatarFile) return;
    setUploading(true);
    const ext = avatarFile.name.split('.').pop();
    const path = `${profile.id}/avatar.${ext}`;

    await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);

    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id);
    setUploading(false);
    setAvatarFile(null);
  };

  if (!profile) return null;

  const achievementList = Object.values(ACHIEVEMENTS);
  const unlockedKeys = new Set(achievements?.map((a) => a.achievement_key) ?? []);

  return (
    <div className="space-y-6 max-w-lg">
      <div className="card flex flex-col items-center gap-4">
        <Avatar src={profile.avatar_url} name={profile.display_name || profile.username} size="lg" />

        <div className="text-center">
          <h2 className="text-xl font-display text-text-primary">{profile.display_name || profile.username}</h2>
          <p className="text-sm text-text-muted">@{profile.username}</p>
        </div>

        <div className="flex gap-2">
          <Badge label={profile.character_class} />
          <Badge label={`Lv.${profile.level}`} variant="rarity" rarity={profile.level >= 30 ? 'legendary' : profile.level >= 20 ? 'epic' : profile.level >= 10 ? 'rare' : 'common'} />
        </div>

        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
          <span className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Change Avatar
          </span>
        </label>
        {avatarFile && (
          <Button size="sm" onClick={handleAvatarUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Avatar'}
          </Button>
        )}
      </div>

      <div className="card grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xl font-bold text-accent-gold mono">{profile.total_tasks_completed}</p>
          <p className="text-xs text-text-muted">Tasks Done</p>
        </div>
        <div>
          <p className="text-xl font-bold text-accent-green mono">{profile.longest_streak}</p>
          <p className="text-xs text-text-muted">Best Streak</p>
        </div>
        <div>
          <p className="text-xl font-bold text-accent-purple mono">{profile.xp.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Total XP</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase">Achievements</h3>
        <div className="grid grid-cols-2 gap-2">
          {achievementList.map((ach) => {
            const unlocked = unlockedKeys.has(ach.key);
            return (
              <div
                key={ach.key}
                className={`card flex items-center gap-3 ${unlocked ? '' : 'opacity-40 grayscale'}`}
              >
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{ach.name}</p>
                  <p className="text-xs text-text-muted">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
