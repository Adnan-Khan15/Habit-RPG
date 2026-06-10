import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const { data: users } = await supabase
    .from('profiles')
    .select('id, daily_reset_time, timezone, current_streak, last_active_date, hp, max_hp')
    .eq('daily_reset_time', currentTime);

  if (!users) return new Response('ok');

  for (const user of users) {
    const today = new Date().toISOString().slice(0, 10);

    const { data: dailies } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'daily')
      .eq('is_active', true);

    const { data: completions } = await supabase
      .from('task_completions')
      .select('task_id')
      .eq('user_id', user.id)
      .gte('completed_at', today);

    const completedToday = new Set(completions?.map((c) => c.task_id) ?? []);
    const missedDailies = (dailies ?? []).filter((d) => !completedToday.has(d.id));

    if (missedDailies.length > 0) {
      const hpLoss = missedDailies.length * 10;
      const newHp = Math.max(0, user.hp - hpLoss);
      await supabase.from('profiles').update({ hp: newHp }).eq('id', user.id);
    }

    if (user.last_active_date && user.last_active_date < today) {
      await supabase
        .from('profiles')
        .update({ current_streak: 0 })
        .eq('id', user.id);
    }

    await supabase.from('profiles').update({ last_active_date: today }).eq('id', user.id);
  }

  return new Response('ok', { status: 200 });
});
