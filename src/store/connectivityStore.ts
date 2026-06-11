import { create } from 'zustand';
import { getQueue } from '../lib/offlineQueue';

interface ConnectivityState {
  isOnline: boolean;
  pendingCount: number;
  setOnline: (v: boolean) => void;
  refreshPendingCount: () => Promise<void>;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isOnline: navigator.onLine,
  pendingCount: 0,
  setOnline: (isOnline) => set({ isOnline }),
  refreshPendingCount: async () => {
    const queue = await getQueue();
    set({ pendingCount: queue.length });
  },
}));
