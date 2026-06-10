import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function AdBanner() {
  const profile = useAuthStore((s) => s.profile);
  const [hasPurchase, setHasPurchase] = useState(false);

  useEffect(() => {
    if (!profile) return;
    import('../../lib/supabase').then(({ supabase }) => {
      supabase
        .from('stripe_purchases')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .limit(1)
        .then(({ data }) => {
          setHasPurchase((data?.length ?? 0) > 0);
        });
    });
  }, [profile]);

  useEffect(() => {
    if (hasPurchase) return;
    const timer = setTimeout(() => {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // AdSense blocked or not loaded
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [hasPurchase]);

  if (hasPurchase) return null;

  return (
    <div className="w-full min-h-[90px] bg-bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
        data-ad-slot="your-ad-slot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
