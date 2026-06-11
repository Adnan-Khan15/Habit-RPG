import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: z.enum(['habit', 'daily', 'todo']),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard']),
  is_positive: z.boolean(),
  priority: z.enum(['low', 'normal', 'high']),
  notes: z.string().max(500).nullable().optional().default(''),
  tags: z.array(z.string().max(30)).max(10).default([]),
  due_date: z.string().nullable().optional().default(''),
  repeat_schedule: z.any().nullable().optional().default(null),
});

export type TaskFormData = z.infer<typeof taskSchema>;
