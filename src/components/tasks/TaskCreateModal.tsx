import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { taskSchema, type TaskFormData } from '../../lib/validation';
import type { Task, RepeatSchedule } from '../../types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  editingTask?: Task | null;
}

export function TaskCreateModal({ isOpen, onClose, onSubmit, editingTask }: TaskCreateModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: editingTask?.title ?? '',
      type: editingTask?.type ?? 'habit',
      difficulty: editingTask?.difficulty ?? 'easy',
      is_positive: editingTask?.is_positive ?? true,
      priority: editingTask?.priority ?? 'normal',
      notes: editingTask?.notes ?? '',
      tags: editingTask?.tags ?? [],
      due_date: editingTask?.due_date ?? '',
    },
    mode: 'onChange',
  });

  const taskType = watch('type');
  const tags = watch('tags') ?? [];
  const [tagInput, setTagInput] = useState('');

  const onFormSubmit = (data: any) => {
    const payload: any = {
      ...data,
      notes: data.notes || null,
      is_positive: taskType === 'habit' ? data.is_positive : true,
      is_completed: false,
      is_active: true,
    };
    if (taskType === 'todo' && data.due_date) payload.due_date = data.due_date;
    if (taskType === 'daily') {
      payload.repeat_schedule = { type: 'daily' } as RepeatSchedule;
    }
    onSubmit(payload);
    reset();
    onClose();
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setValue('tags', [...tags, trimmed], { shouldValidate: true });
      setTagInput('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Title</label>
          <input
            type="text"
            {...register('title')}
            className={`input-field ${errors.title ? 'border-accent-red' : ''}`}
            autoFocus
          />
          {errors.title && <p className="text-xs text-accent-red mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Type</label>
          <div className="flex gap-2">
            {(['habit', 'daily', 'todo'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t, { shouldValidate: true })}
                className={`flex-1 p-2 rounded-lg border text-sm capitalize transition-all ${
                  taskType === t
                    ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Difficulty</label>
          <div className="flex gap-2">
            {(['trivial', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValue('difficulty', d, { shouldValidate: true })}
                className={`flex-1 p-2 rounded-lg border text-xs capitalize transition-all ${
                  watch('difficulty') === d
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {taskType === 'habit' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue('is_positive', true, { shouldValidate: true })}
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  watch('is_positive')
                    ? 'border-accent-green bg-accent-green/10 text-accent-green'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                + Positive
              </button>
              <button
                type="button"
                onClick={() => setValue('is_positive', false, { shouldValidate: true })}
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  !watch('is_positive')
                    ? 'border-accent-red bg-accent-red/10 text-accent-red'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                - Negative
              </button>
            </div>
          </div>
        )}

        {taskType === 'todo' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Due Date (optional)</label>
            <input
              type="date"
              {...register('due_date')}
              className="input-field"
            />
          </div>
        )}

        {taskType === 'todo' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Priority</label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue('priority', p, { shouldValidate: true })}
                  className={`flex-1 p-2 rounded-lg border text-xs capitalize ${
                    watch('priority') === p
                      ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                      : 'border-border bg-bg-card text-text-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-text-muted mb-1">Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag, i) => (
              <span
                key={tag}
                className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {tag}
                <button type="button" onClick={() => setValue('tags', tags.filter((_, j) => j !== i), { shouldValidate: true })} className="hover:text-white">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className="input-field flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Notes (optional)</label>
          <textarea
            {...register('notes')}
            className="input-field min-h-[80px] resize-none"
          />
          {errors.notes && <p className="text-xs text-accent-red mt-1">{errors.notes.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!isValid}>
            {editingTask ? 'Save' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
