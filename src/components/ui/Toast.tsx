import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, type Toast as ToastType } from '../../store/notificationStore';

const icons: Record<ToastType['type'], string> = {
  achievement: '🏆',
  levelup: '⭐',
  error: '✕',
  success: '✓',
  info: 'ℹ',
};

const bgColors: Record<ToastType['type'], string> = {
  achievement: 'bg-accent-gold/10 border-accent-gold/30',
  levelup: 'bg-accent-purple/10 border-accent-purple/30',
  error: 'bg-accent-red/10 border-accent-red/30',
  success: 'bg-accent-green/10 border-accent-green/30',
  info: 'bg-white/5 border-border',
};

export function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-start gap-3 p-3 rounded-lg border ${bgColors[toast.type]} backdrop-blur-sm cursor-pointer`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-lg">{icons[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-text-muted mt-0.5">{toast.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
