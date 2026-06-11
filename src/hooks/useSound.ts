import { useCallback } from 'react';
import { soundEffects } from '../lib/audio';

const SOUND_KEY = 'habit_rpg_sound_enabled';

export function useSound() {
  const isEnabled = typeof window !== 'undefined' ? localStorage.getItem(SOUND_KEY) !== 'false' : true;

  const play = useCallback((name: keyof typeof soundEffects) => {
    if (!isEnabled) return;
    try {
      soundEffects[name]();
    } catch {
      // ignore audio errors
    }
  }, [isEnabled]);

  return { play, isEnabled };
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_KEY, String(enabled));
}
