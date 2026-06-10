import { get, set, del } from 'idb-keyval';
import type { OfflineQueueItem } from '../types';

const QUEUE_KEY = 'offline_task_queue';

export async function getQueue(): Promise<OfflineQueueItem[]> {
  return (await get<OfflineQueueItem[]>(QUEUE_KEY)) ?? [];
}

export async function addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await getQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  });
  await set(QUEUE_KEY, queue);
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  await set(QUEUE_KEY, queue.filter((item) => item.id !== id));
}

export async function incrementRetry(id: string): Promise<void> {
  const queue = await getQueue();
  const idx = queue.findIndex((item) => item.id === id);
  if (idx !== -1) {
    queue[idx].retries++;
    await set(QUEUE_KEY, queue);
  }
}

export async function clearQueue(): Promise<void> {
  await del(QUEUE_KEY);
}

export async function processQueue(
  processor: (item: OfflineQueueItem) => Promise<boolean>
): Promise<void> {
  const queue = await getQueue();
  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      const success = await processor(item);
      if (!success) {
        item.retries++;
        if (item.retries < 5) {
          remaining.push(item);
        }
      }
    } catch {
      item.retries++;
      if (item.retries < 5) {
        remaining.push(item);
      }
    }
  }

  await set(QUEUE_KEY, remaining);
}
