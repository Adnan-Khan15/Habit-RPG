import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ACHIEVEMENT_CONDITIONS: Record<string, (profile: any, context: any) => boolean> = {
  first_blood: (_, ctx) => ctx.totalTasksCompleted >= 1,
  task_master: (_, ctx) => ctx.totalTasksCompleted >= 500,
  creature_of_habit: (profile, _) => profile.current_streak >= 7,
  on_fire: (profile, _) => profile.longest_streak >= 30,
  century: (profile, _) => profile.longest_streak >= 100,
  max_level: (profile, _) => profile.level >= 50,
  social_butterfly: (_, ctx) => ctx.friendsCount >= 5,
  top_10: (_, ctx) => ctx.leaderboardRank !== undefined && ctx.leaderboardRank <= 10,
  shopaholic: (_, ctx) => (ctx.ownedItemCount ?? 0) >= 5,
  collector: (_, ctx) => (ctx.ownedItemCount ?? 0) >= 10,
};

serve(async (req) => {
  const { user_id } = await req.json();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (!profile) return new Response('User not found', { status: 404 });

  const { data: completions } = await supabase
    .from('task_completions')
    .select('id')
    .eq('user_id', user_id);

  const { data: friends } = await supabase
    .from('friendships')
    .select('id')
    .or(`requester_id.eq.${user_id},addressee_id.eq.${user_id}`)
    .eq('status', 'accepted');

  const { data: inventory } = await supabase
    .from('inventory')
    .select('id')
    .eq('user_id', user_id);

  const { data: existingAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_key')
    .eq('user_id', user_id);

  const existing = new Set(existingAchievements?.map((a) => a.achievement_key) ?? []);

  const context = {
    totalTasksCompleted: completions?.length ?? 0,
    friendsCount: friends?.length ?? 0,
    ownedItemCount: inventory?.length ?? 0,
  };

  const newlyUnlocked: string[] = [];

  for (const [key, check] of Object.entries(ACHIEVEMENT_CONDITIONS)) {
    if (!existing.has(key) && check(profile, context)) {
      newlyUnlocked.push(key);
    }
  }

  for (const key of newlyUnlocked) {
    await supabase.from('user_achievements').insert([
      { user_id, achievement_key: key },
    ]);
  }

  return new Response(JSON.stringify({ newlyUnlocked }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
