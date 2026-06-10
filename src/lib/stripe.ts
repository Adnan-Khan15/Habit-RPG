import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
}

export async function redirectToCheckout(packId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await import('./supabase')).supabase.auth.getSession()}`,
      },
      body: JSON.stringify({ pack_id: packId }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { url } = await response.json();
  window.open(url, '_blank');
}
