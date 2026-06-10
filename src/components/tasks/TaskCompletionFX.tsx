import { motion, AnimatePresence } from 'framer-motion';

interface TaskCompletionFXProps {
  xp: number;
  gold: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function TaskCompletionFX({ xp, gold, x, y, onComplete }: TaskCompletionFXProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed pointer-events-none z-50"
        initial={{ opacity: 1, x, y, scale: 0.5 }}
        animate={{ opacity: 0, y: y - 60, scale: 1.2 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
      >
        <div className="flex flex-col items-center">
          <span className="text-accent-purple font-bold text-lg mono">+{xp} XP</span>
          <span className="text-accent-gold font-bold text-sm mono">+{gold} 🪙</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
