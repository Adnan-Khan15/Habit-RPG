import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { advanceQuests, type QuestEvent } from '../lib/questEngine';

export function useQuests() {
  const user = useAuthStore((s) => s.profile);
  const addToast = useNotificationStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const activeQuery = useQuery({
    queryKey: ['activeQuests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('user_quests')
        .select('*, quest:quest_id(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');
      return data ?? [];
    },
    enabled: !!user,
  });

  const availableQuery = useQuery({
    queryKey: ['availableQuests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: available } = await supabase
        .from('quests_catalogue')
        .select('*')
        .lte('required_level', user.level)
        .order('sort_order');
      const { data: active } = await supabase
        .from('user_quests')
        .select('quest_id')
        .eq('user_id', user.id);
      const existingIds = new Set((active ?? []).map((q: any) => q.quest_id));
      return (available ?? []).filter((q: any) => !existingIds.has(q.id));
    },
    enabled: !!user,
  });

  const startQuest = async (questId: string) => {
    if (!user) return;
    await supabase.from('user_quests').insert({
      user_id: user.id,
      quest_id: questId,
    });
    queryClient.invalidateQueries({ queryKey: ['activeQuests', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['availableQuests', user?.id] });
    addToast({ type: 'info', title: 'Quest started!' });
  };

  const fireEvent = async (event: QuestEvent, payload: { type?: string; amount?: number; value?: number }) => {
    if (!user) return;
    const prev = await supabase.from('user_quests').select('id').eq('user_id', user.id).eq('status', 'active');
    await advanceQuests(user.id, event, payload);
    const next = await supabase.from('user_quests').select('id').eq('user_id', user.id).eq('status', 'active');
    if (prev.data && next.data && next.data.length < prev.data.length) {
      addToast({ type: 'achievement', title: 'Quest completed! 🎉' });
    }
    queryClient.invalidateQueries({ queryKey: ['activeQuests', user?.id] });
  };

  return {
    activeQuests: activeQuery.data ?? [],
    availableQuests: availableQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    startQuest,
    fireEvent,
  };
}
