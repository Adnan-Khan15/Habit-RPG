import { Button } from '../ui/Button';

interface StripeCheckoutButtonProps {
  packId: string;
  label: string;
  price: string;
}

export function StripeCheckoutButton({ packId, label, price }: StripeCheckoutButtonProps) {
  const handlePurchase = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId }),
        }
      );

      if (!response.ok) throw new Error('Failed to create session');
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
    }
  };

  return (
    <Button onClick={handlePurchase}>
      💎 {label} — {price}
    </Button>
  );
}
