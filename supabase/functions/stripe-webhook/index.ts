import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { pack_id, user_id } = session.metadata;

    await supabase
      .from('stripe_purchases')
      .update({ status: 'completed', stripe_payment_intent: session.payment_intent })
      .eq('stripe_session_id', session.id);

    const packItems: Record<string, string[]> = {
      shadow_set: ['head_shadow', 'body_shadow', 'weapon_shadow', 'accessory_shadow'],
      celestial_set: ['head_celestial', 'body_celestial', 'weapon_celestial', 'accessory_celestial'],
      dragon_set: ['head_dragon', 'body_dragon', 'weapon_dragon', 'accessory_dragon'],
      starter_bundle: ['head_iron', 'body_iron', 'weapon_iron'],
    };

    const items = packItems[pack_id] || [];
    for (const itemId of items) {
      await supabase.from('inventory').insert([
        { user_id, item_id: itemId, quantity: 1, acquired_via: 'stripe' },
      ]);
    }

    if (pack_id === 'starter_bundle') {
      await supabase.from('profiles').update({ gold: supabase.rpc('increment', { x: 500 }) }).eq('id', user_id);
    }
  }

  return new Response('ok', { status: 200 });
});
