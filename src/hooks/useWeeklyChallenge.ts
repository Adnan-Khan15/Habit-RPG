import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import { useNotificationStore } from '../store/notificationStore';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  objective_type: string;
  objective_count: number;
  reward_xp: number;
  reward_gold: number;
  reward_item_id: string | null;
  starts_at: string;
  ends_at: string;
}

export function useWeeklyChallenge() {
  const user = useAuthStore((s) => s.profile);
  const addGold = useCharacterStore((s) => s.addGold);
  const addXp = useCharacterStore((s) => s.addXp);
  const addToast = useNotificationStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const challengeQuery = useQuery({
    queryKey: ['weeklyChallenge', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data: challenges } = await supabase
        .from('weekly_challenges')
        .select('*')
        .lte('starts_at', today)
        .gte('ends_at', today)
        .single();
      if (!challenges) return null;
      const challenge = challenges as WeeklyChallenge;

      const { data: progress } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .maybeSingle();

      return {
        challenge,
        progress: progress as { progress: number; completed: boolean; claimed: boolean } ?? { progress: 0, completed: false, claimed: false },
      };
    },
    enabled: !!user,
  });

  const claimReward = useMutation({
    mutationFn: async () => {
      if (!user || !challengeQuery.data) throw new Error('No active challenge');
      const { challenge, progress } = challengeQuery.data;
      if (!progress.completed || progress.claimed) throw new Error('Already claimed');

      await supabase
        .from('user_challenge_progress')
        .update({ claimed: true })
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id);

      await supabase
        .from('profiles')
        .update({ gold: (user.gold ?? 0) + challenge.reward_gold })
        .eq('id', user.id);

      addGold(challenge.reward_gold);
      addXp(challenge.reward_xp);

      if (challenge.reward_item_id) {
        await supabase.from('inventory').upsert(
          { user_id: user.id, item_id: challenge.reward_item_id, quantity: 1, acquired_via: 'reward' },
          { onConflict: 'user_id, item_id', ignoreDuplicates: true }
        );
      }
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Challenge reward claimed!' });
      queryClient.invalidateQueries({ queryKey: ['weeklyChallenge', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
    },
  });

  return {
    challenge: challengeQuery.data?.challenge ?? null,
    progress: challengeQuery.data?.progress ?? null,
    isLoading: challengeQuery.isLoading,
    claimReward,
  };
}
