import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useReferral() {
  const user = useAuthStore((s) => s.profile);

  const referralQuery = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user) return { code: null, count: 0, rewards: 0 };
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('id')
        .eq('referrer_id', user.id);
      return {
        code: user.referral_code,
        count: rewards?.length ?? 0,
        rewards: (rewards?.length ?? 0) * 200,
      };
    },
    enabled: !!user,
  });

  const shareUrl = user?.referral_code
    ? `${window.location.origin}/signup?ref=${user.referral_code}`
    : null;

  return {
    referralCode: referralQuery.data?.code ?? null,
    referralCount: referralQuery.data?.count ?? 0,
    totalGoldEarned: referralQuery.data?.rewards ?? 0,
    shareUrl,
  };
}
