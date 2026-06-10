import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { PhaserCanvas } from '../character/PhaserCanvas';

export function LevelUpOverlay() {
  const isLevelingUp = useCharacterStore((s) => s.isLevelingUp);
  const setLevelingUp = useCharacterStore((s) => s.setLevelingUp);
  const profile = useCharacterStore((s) => s.profile);

  useEffect(() => {
    if (isLevelingUp) {
      const timer = setTimeout(() => setLevelingUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLevelingUp, setLevelingUp]);

  return (
    <AnimatePresence>
      {isLevelingUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-4"
            >
              ⭐
            </motion.div>

            <h1 className="text-5xl font-display text-accent-gold mb-2">LEVEL UP!</h1>
            <p className="text-2xl font-display text-text-primary mb-6">
              You are now Level {profile?.level}!
            </p>

            <div className="flex justify-center">
              <PhaserCanvas
                characterClass={profile?.character_class ?? 'warrior'}
                className="border-2 border-accent-gold"
              />
            </div>

            <motion.div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -100 - Math.random() * 200, opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                  className="text-xl"
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
