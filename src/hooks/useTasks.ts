import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Task, TaskCompletion } from '../types';
import { useTaskStore } from '../store/taskStore';

export function useTasks(type?: Task['type']) {
  const user = useAuthStore((s) => s.profile);
  const setTasks = useTaskStore((s) => s.setTasks);
  const addTaskOptimistic = useTaskStore((s) => s.addTaskOptimistic);
  const removeTaskOptimistic = useTaskStore((s) => s.removeTaskOptimistic);
  const queryClient = useQueryClient();

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
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
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
      const { error } = await supabase.from('tasks').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      removeTaskOptimistic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
      const { error } = await supabase.from('task_completions').insert([
        {
          user_id: user.id,
          task_id: taskId,
          xp_earned: xpEarned,
          gold_earned: goldEarned,
          streak_count: streakCount,
        } as Omit<TaskCompletion, 'id' | 'completed_at'>,
      ]);
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          xp: user.xp + xpEarned,
          gold: user.gold + goldEarned,
          total_tasks_completed: user.total_tasks_completed + 1,
        })
        .eq('id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
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
