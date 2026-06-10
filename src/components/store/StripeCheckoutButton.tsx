import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useNotificationStore } from '../../store/notificationStore';

interface StripeCheckoutButtonProps {
  packId: string;
  label: string;
  price: string;
}

export function StripeCheckoutButton({ packId, label, price }: StripeCheckoutButtonProps) {
  const addToast = useNotificationStore((s) => s.addToast);

  const handlePurchase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        addToast({ type: 'error', title: 'Not signed in' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ pack_id: packId }),
        }
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? `Error ${response.status}`);
      }

      if (body.url) {
        window.open(body.url, '_blank');
      }
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      addToast({ type: 'error', title: 'Purchase failed', message: err.message });
    }
  };

  return (
    <Button onClick={handlePurchase}>
      💎 {label} — {price}
    </Button>
  );
}
