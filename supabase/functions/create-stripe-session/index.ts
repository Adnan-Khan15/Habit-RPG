import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { pack_id, user_id } = await req.json();

  const { data: existing } = await supabase
    .from('stripe_purchases')
    .select('id')
    .eq('user_id', user_id)
    .eq('pack_id', pack_id)
    .eq('status', 'completed')
    .limit(1);

  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ error: 'Already purchased' }), { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: `price_${pack_id}`, quantity: 1 }],
    metadata: { pack_id, user_id },
    success_url: `${Deno.env.get('APP_URL')}/dashboard/store?success=true`,
    cancel_url: `${Deno.env.get('APP_URL')}/dashboard/store?canceled=true`,
  });

  await supabase.from('stripe_purchases').insert([
    { user_id, pack_id, stripe_session_id: session.id, amount_cents: session.amount_total, status: 'pending' },
  ]);

  return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
