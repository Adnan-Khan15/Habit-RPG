import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface LeaderboardEntry extends Profile {
  rank: number;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('xp', { ascending: false })
        .limit(100);

      if (data) {
        const ranked = (data as Profile[]).map((p, i) => ({
          ...p,
          rank: i + 1,
        }));
        setEntries(ranked);
      }
      setIsLoading(false);
    }

    fetchLeaderboard();

    const subscription = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'is_public=eq.true' },
        (payload) => {
          setEntries((prev) => {
            const updated = payload.new as Profile;
            const existing = prev.find((e) => e.id === updated.id);
            if (existing) {
              return prev
                .map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
                .sort((a, b) => b.xp - a.xp)
                .map((e, i) => ({ ...e, rank: i + 1 }));
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { entries, isLoading };
}
