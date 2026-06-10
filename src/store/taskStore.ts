import { create } from 'zustand';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  activeTab: 'habit' | 'daily' | 'todo';
  isCreateModalOpen: boolean;
  editingTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setActiveTab: (tab: Task['type']) => void;
  setCreateModalOpen: (open: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  addTaskOptimistic: (task: Task) => void;
  updateTaskOptimistic: (id: string, updates: Partial<Task>) => void;
  removeTaskOptimistic: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  activeTab: 'habit',
  isCreateModalOpen: false,
  editingTask: null,
  setTasks: (tasks) => set({ tasks }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setEditingTask: (editingTask) => set({ editingTask }),
  addTaskOptimistic: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTaskOptimistic: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTaskOptimistic: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));
