import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCharacterStore } from '../store/characterStore';
import { useNotificationStore } from '../store/notificationStore';

const REWARD_TIERS = [
  { streak: 1, gold: 10, xp: 20, label: 'Day 1' },
  { streak: 2, gold: 15, xp: 30, label: 'Day 2' },
  { streak: 3, gold: 20, xp: 40, label: 'Day 3' },
  { streak: 4, gold: 25, xp: 50, label: 'Day 4' },
  { streak: 5, gold: 30, xp: 60, label: 'Day 5' },
  { streak: 6, gold: 40, xp: 80, label: 'Day 6' },
  { streak: 7, gold: 50, xp: 100, item: 'hp_potion', label: 'Day 7 — HP Potion!' },
  { streak: 14, gold: 100, xp: 200, item: 'xp_boost', label: 'Day 14 — XP Boost!' },
  { streak: 30, gold: 300, xp: 500, item: 'accessory_shadow', label: 'Day 30 — Shadow Amulet!' },
];

export function useLoginReward() {
  const user = useAuthStore((s) => s.profile);
  const addToast = useNotificationStore((s) => s.addToast);
  const addGold = useCharacterStore((s) => s.addGold);
  const addXp = useCharacterStore((s) => s.addXp);

  useEffect(() => {
    if (!user) return;
    checkLoginReward();
  }, [user?.id]);

  async function checkLoginReward() {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('login_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('claimed_at', today)
      .maybeSingle();

    if (existing) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const { data: yesterdayReward } = await supabase
      .from('login_rewards')
      .select('login_streak')
      .eq('user_id', user.id)
      .eq('claimed_at', yesterday)
      .maybeSingle();

    const newStreak = yesterdayReward ? yesterdayReward.login_streak + 1 : 1;

    const tier = [...REWARD_TIERS].reverse().find((t) => newStreak >= t.streak) ?? REWARD_TIERS[0];

    const rewardType = tier.item || 'gold';
    const rewardAmount = tier.item ? tier.streak : tier.gold;

    const { error } = await supabase.from('login_rewards').insert({
      user_id: user.id,
      claimed_at: today,
      login_streak: newStreak,
      reward_type: rewardType,
      reward_amount: rewardAmount,
    });

    if (error) return;

    if (tier.item) {
      await supabase.from('inventory').upsert(
        { user_id: user.id, item_id: tier.item, quantity: 1, acquired_via: 'reward' },
        { onConflict: 'user_id, item_id', ignoreDuplicates: true }
      );
    }

    addGold(tier.gold);
    addXp(tier.xp);
    addToast({
      type: 'success',
      title: `🔥 ${newStreak}-day login streak!`,
      message: `${tier.label} — Earned ${tier.gold}🪙 ${tier.xp}⚡`,
    });

    const { data: freshProfile } = await supabase
      .from('profiles')
      .update({
        gold: user.gold + tier.gold,
        xp: user.xp + tier.xp,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (freshProfile) {
      useCharacterStore.getState().setProfile(freshProfile as any);
    }
  }
}
