import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Task, TaskType, Difficulty, TaskPriority, RepeatSchedule } from '../../types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  editingTask?: Task | null;
}

export function TaskCreateModal({ isOpen, onClose, onSubmit, editingTask }: TaskCreateModalProps) {
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [type, setType] = useState<TaskType>(editingTask?.type ?? 'habit');
  const [difficulty, setDifficulty] = useState<Difficulty>(editingTask?.difficulty ?? 'easy');
  const [isPositive, setIsPositive] = useState(editingTask?.is_positive ?? true);
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority ?? 'normal');
  const [dueDate, setDueDate] = useState(editingTask?.due_date ?? '');
  const [notes, setNotes] = useState(editingTask?.notes ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editingTask?.tags ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title,
      type,
      difficulty,
      is_positive: type === 'habit' ? isPositive : true,
      priority,
      notes: notes || null,
      tags,
      is_completed: false,
      is_active: true,
    };
    if (type === 'todo' && dueDate) payload.due_date = dueDate;
    if (type === 'daily') {
      payload.repeat_schedule = { type: 'daily' } as RepeatSchedule;
    }
    onSubmit(payload);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Type</label>
          <div className="flex gap-2">
            {(['habit', 'daily', 'todo'] as TaskType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 p-2 rounded-lg border text-sm capitalize transition-all ${
                  type === t
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
            {(['trivial', 'easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 p-2 rounded-lg border text-xs capitalize transition-all ${
                  difficulty === d
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {type === 'habit' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPositive(true)}
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  isPositive
                    ? 'border-accent-green bg-accent-green/10 text-accent-green'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                + Positive
              </button>
              <button
                type="button"
                onClick={() => setIsPositive(false)}
                className={`flex-1 p-2 rounded-lg border text-sm ${
                  !isPositive
                    ? 'border-accent-red bg-accent-red/10 text-accent-red'
                    : 'border-border bg-bg-card text-text-muted'
                }`}
              >
                - Negative
              </button>
            </div>
          </div>
        )}

        {type === 'todo' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {type === 'todo' && (
          <div>
            <label className="block text-sm text-text-muted mb-1">Priority</label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 p-2 rounded-lg border text-xs capitalize ${
                    priority === p
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
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-white">
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
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  setTags([...tags, tagInput.trim()]);
                  setTagInput('');
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!title.trim()}>
            {editingTask ? 'Save' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
