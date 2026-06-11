import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface DayStats {
  date: string;
  count: number;
  xp: number;
  gold: number;
}

export function useTaskHistory(range: '7d' | '30d' | '90d' = '7d') {
  const user = useAuthStore((s) => s.profile);

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  return useQuery({
    queryKey: ['taskHistory', user?.id, range],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('task_completions')
        .select('completed_at, xp_earned, gold_earned')
        .eq('user_id', user.id)
        .gte('completed_at', since)
        .order('completed_at', { ascending: true });

      if (!data) return [];

      const dayMap = new Map<string, DayStats>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        dayMap.set(d, { date: d, count: 0, xp: 0, gold: 0 });
      }

      for (const row of data) {
        const d = new Date(row.completed_at).toISOString().split('T')[0];
        const existing = dayMap.get(d);
        if (existing) {
          existing.count++;
          existing.xp += row.xp_earned ?? 0;
          existing.gold += row.gold_earned ?? 0;
        }
      }

      return Array.from(dayMap.values());
    },
    enabled: !!user,
  });
}
