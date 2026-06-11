import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Task, Difficulty } from '../../types';
import { HabitStreakBadge } from './HabitStreakBadge';

interface TaskCardProps {
  task: Task;
  streak?: number;
  onComplete: (task: Task) => void;
  onToggleNegative: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  trivial: 'text-gray-400',
  easy: 'text-accent-green',
  medium: 'text-accent-gold',
  hard: 'text-accent-red',
};

const typeIcons = { habit: '🔄', daily: '📅', todo: '📌' };

export function TaskCard({ task, streak = 0, onComplete, onToggleNegative, onEdit, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const swipeRef = useRef({ startX: 0, startY: 0, isDragging: false });

  const handlePointerDown = (e: React.PointerEvent) => {
    swipeRef.current = { startX: e.clientX, startY: e.clientY, isDragging: true };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!swipeRef.current.isDragging) return;
    const deltaX = e.clientX - swipeRef.current.startX;
    const deltaY = e.clientY - swipeRef.current.startY;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setSwipeOffset(0);
      return;
    }
    setSwipeOffset(Math.max(-150, Math.min(150, deltaX)));
  };

  const handlePointerUp = () => {
    swipeRef.current.isDragging = false;
    if (swipeOffset > 80) {
      handleComplete();
    } else if (swipeOffset < -80) {
      setShowDeleteConfirm(true);
    }
    setSwipeOffset(0);
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => setIsCompleting(false), 300);
    onComplete(task);
  };

  const handleDelete = () => {
    onDelete(task);
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { swipeRef.current.isDragging = false; setSwipeOffset(0); }}
      style={{ transform: `translateX(${swipeOffset}px)`, transition: swipeRef.current.isDragging ? 'none' : 'transform 0.2s ease' }}
      className={`card-hover flex items-center gap-3 group touch-none select-none ${
        task.type === 'daily' && !task.is_completed
          ? 'border-l-accent-red border-l-2'
          : ''
      } ${task.is_completed ? 'opacity-50' : ''}`}
    >
      <button
        onClick={handleComplete}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleting ? 'animate-scale-bounce border-accent-green bg-accent-green' : 'border-text-muted hover:border-accent-green'
        }`}
      >
        {isCompleting && (
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{typeIcons[task.type]}</span>
          <span
            className={`text-sm font-medium text-text-primary truncate ${
              task.is_completed ? 'line-through' : ''
            }`}
            onClick={() => onEdit(task)}
          >
            {task.title}
          </span>
          <span className={`text-xs font-bold ${difficultyColors[task.difficulty]}`}>
            {task.difficulty[0].toUpperCase()}
          </span>
          {task.type === 'habit' && !task.is_positive && (
            <button
              onClick={() => onToggleNegative(task)}
              className="text-xs text-accent-red hover:bg-accent-red/10 px-1.5 py-0.5 rounded"
              title="Negative habit"
            >
              -
            </button>
          )}
          {task.type === 'habit' && streak > 0 && (
            <HabitStreakBadge streak={streak} />
          )}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-white/5 text-text-muted px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Confirm delete">✓</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="p-1 text-text-muted hover:text-text-primary rounded" title="Cancel">✗</button>
          </div>
        ) : (
          <>
            {task.type === 'todo' && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                task.priority === 'high' ? 'bg-accent-red/20 text-accent-red' :
                task.priority === 'low' ? 'bg-gray-500/20 text-gray-400' :
                'bg-white/5 text-text-muted'
              }`}>
                {task.priority}
              </span>
            )}
            <button onClick={() => onDelete(task)} className="p-1 text-text-muted hover:text-accent-red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
