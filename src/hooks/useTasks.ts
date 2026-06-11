import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useConnectivityStore } from '../store/connectivityStore';
import { useNotificationStore } from '../store/notificationStore';
import { addToQueue, processQueue } from '../lib/offlineQueue';
import type { Task, TaskCompletion, Profile } from '../types';
import { useTaskStore } from '../store/taskStore';
import { claimMilestoneRewards } from './useCharacter';
import { addXpToLevel, calculateMaxHp } from '../lib/xpFormulas';
import { checkAchievements } from '../lib/achievementChecker';
import { soundEffects } from '../lib/audio';

const SOUND_KEY = 'habit_rpg_sound_enabled';
function playSound(name: keyof typeof soundEffects) {
  if (typeof window !== 'undefined' && localStorage.getItem(SOUND_KEY) !== 'false') {
    try { soundEffects[name](); } catch {}
  }
}

export function useTasks(type?: Task['type']) {
  const user = useAuthStore((s) => s.profile);
  const setTasks = useTaskStore((s) => s.setTasks);
  const addTaskOptimistic = useTaskStore((s) => s.addTaskOptimistic);
  const removeTaskOptimistic = useTaskStore((s) => s.removeTaskOptimistic);
  const setOnline = useConnectivityStore((s) => s.setOnline);
  const refreshPendingCount = useConnectivityStore((s) => s.refreshPendingCount);
  const addToast = useNotificationStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      addToast({ type: 'success', title: 'Back online — syncing...' });
      const currentUser = userRef.current;
      if (!currentUser) return;
      await processQueue(async (item) => {
        try {
          if (item.type === 'complete_task') {
            const { taskId, xpEarned, goldEarned, streakCount } = item.payload as any;
            await supabase.from('task_completions').insert([{
              user_id: currentUser.id, task_id: taskId, xp_earned: xpEarned, gold_earned: goldEarned, streak_count: streakCount,
            } as any]);
          } else if (item.type === 'create_task') {
            await supabase.from('tasks').insert({ ...item.payload, user_id: currentUser.id });
          } else if (item.type === 'update_task') {
            const { id, ...updates } = item.payload as any;
            await supabase.from('tasks').update(updates).eq('id', id);
          } else if (item.type === 'delete_task') {
            await supabase.from('tasks').update({ is_active: false }).eq('id', (item.payload as any).id);
          }
          return true;
        } catch {
          return false;
        }
      });
      await refreshPendingCount();
      queryClient.invalidateQueries({ queryKey: ['tasks', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
    };
    const handleOffline = () => {
      setOnline(false);
      addToast({ type: 'info', title: 'You\'re offline — changes will sync when reconnected' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const query = useQuery({
    queryKey: ['tasks', user?.id, type],
    queryFn: async () => {
      if (!user) return [];
      let q = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (type) q = q.eq('type', type);
      const { data } = await q;
      const tasks = (data as Task[]) ?? [];
      setTasks(tasks);
      return tasks;
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      if (!navigator.onLine) {
        await addToQueue({ type: 'create_task', payload: task });
        addToast({ type: 'info', title: 'Task saved offline — will sync when connected' });
        return { ...task, id: 'offline_' + crypto.randomUUID(), user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Task;
      }
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onMutate: async (newTask) => {
      const tempId = crypto.randomUUID();
      addTaskOptimistic({
        ...newTask,
        id: tempId,
        user_id: user?.id ?? '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      refreshPendingCount();
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      if (!navigator.onLine) {
        await addToQueue({ type: 'update_task', payload: { id, ...updates } });
        addToast({ type: 'info', title: 'Update saved offline' });
        return { id, ...updates } as Task;
      }
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        await addToQueue({ type: 'delete_task', payload: { id } });
        addToast({ type: 'info', title: 'Delete saved offline' });
        return;
      }
      const { error } = await supabase.from('tasks').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      removeTaskOptimistic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      refreshPendingCount();
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({
      taskId,
      xpEarned,
      goldEarned,
      streakCount,
    }: {
      taskId: string;
      xpEarned: number;
      goldEarned: number;
      streakCount: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      if (!navigator.onLine) {
        await addToQueue({ type: 'complete_task', payload: { taskId, xpEarned, goldEarned, streakCount } });
        addToast({ type: 'info', title: 'Completion saved offline — XP will sync' });
        return;
      }

      const { error: completionError } = await supabase.from('task_completions').insert([
        {
          user_id: user.id,
          task_id: taskId,
          xp_earned: xpEarned,
          gold_earned: goldEarned,
          streak_count: streakCount,
        } as Omit<TaskCompletion, 'id' | 'completed_at'>,
      ]);
      if (completionError) throw completionError;

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (currentProfile) {
        const p = currentProfile as Profile;
        const { level, xp } = addXpToLevel(p.level, p.xp, xpEarned);
        await supabase
          .from('profiles')
          .update({
            xp,
            level,
            gold: p.gold + goldEarned,
            max_hp: calculateMaxHp(level),
            total_tasks_completed: p.total_tasks_completed + 1,
          })
          .eq('id', user.id);
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });

      // Check for newly unlocked milestone rewards
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (freshProfile) {
        const claimed = await claimMilestoneRewards(freshProfile as Profile);
        if (claimed.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
          playSound('achievement');
        }

        // Check referral reward (first task completion for referred users)
        const fp = freshProfile as Profile;
        if (fp.referred_by && fp.total_tasks_completed === 1) {
          const { data: existingReferral } = await supabase
            .from('referral_rewards')
            .select('id')
            .eq('referred_id', user!.id)
            .maybeSingle();
          if (!existingReferral) {
            await supabase.from('referral_rewards').insert({
              referrer_id: fp.referred_by,
              referred_id: user!.id,
            });
            await supabase
              .from('profiles')
              .update({ gold: fp.gold + 100 })
              .eq('id', user!.id);
            await supabase.from('inventory').upsert(
              { user_id: user!.id, item_id: 'hp_potion', quantity: 1, acquired_via: 'referral' },
              { onConflict: 'user_id, item_id', ignoreDuplicates: true }
            );
            addToast({ type: 'success', title: '🎉 Referral reward! +100 gold + HP Potion' });
            playSound('coin');
          }
        }

        // Update weekly challenge progress
        const today = new Date().toISOString().split('T')[0];
        const { data: activeChallenge } = await supabase
          .from('weekly_challenges')
          .select('id, objective_type')
          .lte('starts_at', today)
          .gte('ends_at', today)
          .maybeSingle();
        if (activeChallenge) {
          const { data: prog } = await supabase
            .from('user_challenge_progress')
            .select('id, progress, completed')
            .eq('user_id', user!.id)
            .eq('challenge_id', activeChallenge.id)
            .maybeSingle();
          if (prog && !(prog as any).completed) {
            const newProgress = (prog as any).progress + 1;
            const completed = newProgress >= 50; // FIXME: get objective_count
            await supabase.from('user_challenge_progress').update({
              progress: newProgress,
              completed,
            }).eq('id', (prog as any).id);
          } else if (!prog) {
            await supabase.from('user_challenge_progress').insert({
              user_id: user!.id,
              challenge_id: activeChallenge.id,
              progress: 1,
            });
          }
          queryClient.invalidateQueries({ queryKey: ['weeklyChallenge', user?.id] });
        }

        // Check achievements
        const [achievementsRes, inventoryRes] = await Promise.all([
          supabase.from('user_achievements').select('*').eq('user_id', user!.id),
          supabase.from('inventory').select('id').eq('user_id', user!.id),
        ]);
        const result = checkAchievements(
          freshProfile as Profile,
          (achievementsRes.data ?? []) as any,
          { ownedItemCount: (inventoryRes.data ?? []).length }
        );
        if (result.newlyUnlocked.length > 0) {
          await supabase.from('user_achievements').insert(
            result.newlyUnlocked.map((key) => ({ user_id: user!.id, achievement_key: key }))
          );
          queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
          playSound('achievement');
        }

        // Check for level up sound
        const oldLevel = user?.level ?? 0;
        const newLevel = (freshProfile as Profile).level;
        if (newLevel > oldLevel) {
          playSound('levelUp');
        }
      }
      playSound('taskComplete');
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
}
