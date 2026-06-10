import { create } from 'zustand';
import type { Profile, EquippedGear } from '../types';
import { addXpToLevel, calculateMaxHp } from '../lib/xpFormulas';

interface CharacterState {
  profile: Profile | null;
  equippedGear: EquippedGear | null;
  isLevelingUp: boolean;
  isFaint: boolean;
  debuffUntil: string | null;
  setProfile: (profile: Profile | null) => void;
  setEquippedGear: (gear: EquippedGear | null) => void;
  setLevelingUp: (value: boolean) => void;
  addXp: (xp: number) => { leveledUp: boolean; newLevel: number };
  addGold: (gold: number) => void;
  takeDamage: (damage: number) => void;
  healHp: (amount: number) => void;
  setFaintState: (faint: boolean) => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  profile: null,
  equippedGear: null,
  isLevelingUp: false,
  isFaint: false,
  debuffUntil: null,
  setProfile: (profile) =>
    set({
      profile,
      isFaint: profile ? profile.hp <= 0 : false,
    }),
  setEquippedGear: (equippedGear) => set({ equippedGear }),
  setLevelingUp: (isLevelingUp) => set({ isLevelingUp }),
  addXp: (xp) => {
    const profile = get().profile;
    if (!profile) return { leveledUp: false, newLevel: 1 };
    const result = addXpToLevel(profile.level, profile.xp, xp);
    set({
      profile: {
        ...profile,
        xp: result.xp,
        level: result.level,
        max_hp: calculateMaxHp(result.level),
      },
      isLevelingUp: result.leveledUp,
    });
    return { leveledUp: result.leveledUp, newLevel: result.level };
  },
  addGold: (gold) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, gold: profile.gold + gold } });
  },
  takeDamage: (damage) => {
    const profile = get().profile;
    if (!profile) return;
    const newHp = Math.max(0, profile.hp - damage);
    set({
      profile: { ...profile, hp: newHp },
      isFaint: newHp <= 0,
    });
  },
  healHp: (amount) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        hp: Math.min(profile.max_hp, profile.hp + amount),
      },
    });
  },
  setFaintState: (isFaint) => set({ isFaint }),
}));
