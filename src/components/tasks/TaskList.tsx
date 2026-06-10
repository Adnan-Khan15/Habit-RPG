import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { TaskCreateModal } from './TaskCreateModal';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useCharacterStore } from '../../store/characterStore';
import { useTasks } from '../../hooks/useTasks';
import { calculateRewards } from '../../lib/xpFormulas';
import { Button } from '../ui/Button';
import type { Task, TaskType } from '../../types';

const tabs: { key: TaskType; label: string; icon: string }[] = [
  { key: 'habit', label: 'Habits', icon: '🔄' },
  { key: 'daily', label: 'Dailies', icon: '📅' },
  { key: 'todo', label: 'To-Dos', icon: '📌' },
];

export function TaskList() {
  const { activeTab, setActiveTab, isCreateModalOpen, setCreateModalOpen, editingTask, setEditingTask } = useTaskStore();
  const { tasks, isLoading, createTask, updateTask, deleteTask, completeTask } = useTasks(activeTab);
  const profile = useAuthStore((s) => s.profile);
  const addXp = useCharacterStore((s) => s.addXp);
  const addGold = useCharacterStore((s) => s.addGold);
  const takeDamage = useCharacterStore((s) => s.takeDamage);
  const addToast = useNotificationStore((s) => s.addToast);

  const handleComplete = useCallback(
    async (task: Task) => {
      if (!profile) return;

      const st = useCharacterStore.getState();
      const hasBoost = st.xpBoostUntil ? Date.now() < new Date(st.xpBoostUntil).getTime() : false;
      const rewards = calculateRewards(task.difficulty, 0, hasBoost);

      addXp(rewards.xp);
      addGold(rewards.gold);

      await completeTask.mutateAsync({
        taskId: task.id,
        xpEarned: rewards.xp,
        goldEarned: rewards.gold,
        streakCount: 0,
      });
    },
    [profile, completeTask, addXp, addGold]
  );

  const handleCreateSubmit = async (data: any) => {
    await createTask.mutateAsync(data);
    addToast({ type: 'success', title: 'Task created!' });
  };

  const handleEditSubmit = async (data: any) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...data });
      setEditingTask(null);
      addToast({ type: 'success', title: 'Task updated!' });
    }
  };

  const handleDelete = async (task: Task) => {
    await deleteTask.mutateAsync(task.id);
    addToast({ type: 'info', title: 'Task deleted' });
  };

  const handleToggleNegative = async (task: Task) => {
    if (!profile) return;
    takeDamage(5);
    addToast({ type: 'info', title: `-5 HP from "${task.title}"` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text-muted">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-bg-card rounded-lg p-1 border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-accent-purple/20 text-accent-purple'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          + New Task
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-text-muted"
            >
              <p className="text-lg mb-2">No {activeTab}s yet</p>
              <p className="text-sm">Create your first {activeTab} to start earning XP!</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onToggleNegative={handleToggleNegative}
                onEdit={setEditingTask}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </AnimatePresence>

      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <TaskCreateModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSubmit}
        editingTask={editingTask}
      />
    </div>
  );
}
