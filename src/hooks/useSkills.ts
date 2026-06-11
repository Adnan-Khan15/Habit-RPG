import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import { useNotificationStore } from '../store/notificationStore';

export function useSkills() {
  const user = useAuthStore((s) => s.profile);
  const addToast = useNotificationStore((s) => s.addToast);
  const profile = useCharacterStore((s) => s.profile);
  const queryClient = useQueryClient();

  const skillsQuery = useQuery({
    queryKey: ['skillDefs'],
    queryFn: async () => {
      const { data } = await supabase.from('skill_definitions').select('*').order('sort_order');
      return data ?? [];
    },
    staleTime: Infinity,
  });

  const userSkillsQuery = useQuery({
    queryKey: ['userSkills', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('user_skills').select('*').eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const learnSkill = useMutation({
    mutationFn: async (skillId: string) => {
      if (!user || !profile) throw new Error('Not authenticated');
      if ((profile as any).unspent_skill_points <= 0) throw new Error('No skill points');

      const { data: existing } = await supabase
        .from('user_skills')
        .select('current_level')
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .maybeSingle();

      const skill = (skillsQuery.data ?? []).find((s: any) => s.id === skillId);
      if (!skill) throw new Error('Skill not found');

      const currentLevel = existing?.current_level ?? 0;
      if (currentLevel >= (skill as any).max_level) throw new Error('Skill already maxed');

      if (currentLevel === 0) {
        await supabase.from('user_skills').insert({
          user_id: user.id,
          skill_id: skillId,
          current_level: 1,
        });
      } else {
        await supabase.from('user_skills')
          .update({ current_level: currentLevel + 1 })
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
      }

      await supabase.from('profiles')
        .update({ unspent_skill_points: (profile as any).unspent_skill_points - 1 })
        .eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSkills', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      addToast({ type: 'success', title: 'Skill learned!' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: err.message });
    },
  });

  const learned = new Map(
    (userSkillsQuery.data ?? []).map((s: any) => [s.skill_id, s.current_level])
  );

  return {
    allSkills: skillsQuery.data ?? [],
    learned,
    unspentPoints: (profile as any)?.unspent_skill_points ?? 0,
    learnSkill,
  };
}
