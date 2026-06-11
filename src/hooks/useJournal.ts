import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface JournalEntry {
  id: string;
  entry_date: string;
  mood: number;
  note: string | null;
}

export function useJournal() {
  const user = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['journal', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(30);
      return (data as JournalEntry[]) ?? [];
    },
    enabled: !!user,
  });

  const saveEntry = useMutation({
    mutationFn: async ({ mood, note }: { mood: number; note?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('journal_entries').upsert({
        user_id: user.id,
        entry_date: today,
        mood,
        note: note || null,
      }, { onConflict: 'user_id, entry_date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', user?.id] });
    },
  });

  const today = query.data?.find(
    (e) => e.entry_date === new Date().toISOString().split('T')[0]
  );

  return {
    entries: query.data ?? [],
    todayEntry: today ?? null,
    saveEntry,
    isLoading: query.isLoading,
  };
}
