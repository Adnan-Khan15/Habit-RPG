import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

// ─── Configuration ──────────────────────────────────────────────────────────
// Items granted per pack. Gold bonus is separate from items.
const PACK_REWARDS: Record<string, { items: string[]; gold_bonus?: number }> = {
  shadow_set: {
    items: ['head_shadow', 'body_shadow', 'weapon_shadow', 'accessory_shadow'],
  },
  celestial_set: {
    items: ['head_celestial', 'body_celestial', 'weapon_celestial', 'accessory_celestial'],
  },
  dragon_set: {
    items: ['head_dragon', 'body_dragon', 'weapon_dragon', 'accessory_dragon'],
  },
  starter_bundle: {
    items: ['head_iron', 'body_iron', 'weapon_iron'],
    gold_bonus: 500,
  },
};

// ─── Clients ────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ─── Helpers ────────────────────────────────────────────────────────────────
async function grantItems(userId: string, itemIds: string[]): Promise<string[]> {
  const errors: string[] = [];
  for (const itemId of itemIds) {
    const { error } = await supabase.from('inventory').upsert(
      {
        user_id: userId,
        item_id: itemId,
        quantity: 1,
        acquired_via: 'stripe',
      },
      {
        onConflict: 'user_id, item_id',
        ignoreDuplicates: true,
      }
    );
    if (error) {
      errors.push(`Failed to grant ${itemId}: ${error.message}`);
    }
  }
  return errors;
}

async function grantGold(userId: string, amount: number): Promise<string | null> {
  // Read current gold and increment — avoids RPC dependency
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('gold')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    return `Could not fetch profile: ${fetchError?.message ?? 'Not found'}`;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gold: profile.gold + amount })
    .eq('id', userId);

  return updateError ? `Gold update failed: ${updateError.message}` : null;
}

// ─── Handler ────────────────────────────────────────────────────────────────
serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    });
  }

  try {
    // 1. Verify Stripe webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET env var is not set');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured on server' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Handle only completed checkouts
    if (event.type !== 'checkout.session.completed') {
      return new Response(
        JSON.stringify({ received: true, skipped: event.type }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata) {
      console.error('Session missing metadata:', session.id);
      return new Response(
        JSON.stringify({ error: 'Session has no metadata' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { pack_id, user_id } = session.metadata;
    if (!pack_id || !user_id) {
      console.error('Session metadata missing pack_id or user_id:', session.id, session.metadata);
      return new Response(
        JSON.stringify({ error: 'Session metadata incomplete' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Mark purchase as completed
    const { error: updateError } = await supabase
      .from('stripe_purchases')
      .update({
        status: 'completed',
        stripe_payment_intent: session.payment_intent?.toString() ?? null,
      })
      .eq('stripe_session_id', session.id);

    if (updateError) {
      console.error('Failed to update stripe_purchases row:', updateError);
      // Continue processing — the payment is still valid
    }

    // 4. Grant items
    const packConfig = PACK_REWARDS[pack_id];
    if (!packConfig) {
      console.error(`Unknown pack_id in webhook: ${pack_id}`);
      return new Response(
        JSON.stringify({ error: `Unknown pack: ${pack_id}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const grantErrors = await grantItems(user_id, packConfig.items);
    if (grantErrors.length > 0) {
      console.error('Inventory grant errors:', grantErrors);
      // Partial success — we still return 200 so Stripe doesn't retry
    }

    // 5. Grant gold bonus (starter_bundle only)
    if (packConfig.gold_bonus) {
      const goldError = await grantGold(user_id, packConfig.gold_bonus);
      if (goldError) {
        console.error('Gold grant error:', goldError);
      }
    }

    // 6. Check and unlock the "Patron" achievement
    const { data: existingAchievement } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user_id)
      .eq('achievement_key', 'patron')
      .limit(1);

    if (!existingAchievement || existingAchievement.length === 0) {
      const { error: achError } = await supabase.from('user_achievements').upsert(
        { user_id, achievement_key: 'patron' },
        { onConflict: 'user_id, achievement_key', ignoreDuplicates: true }
      );
      if (achError) {
        console.error('Failed to unlock patron achievement:', achError);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('stripe-webhook unhandled error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
