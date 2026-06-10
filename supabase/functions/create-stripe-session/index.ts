import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

// ─── Configuration ──────────────────────────────────────────────────────────
// Replace placeholder values with your actual Stripe Price IDs.
// Create one-time prices in the Stripe Dashboard for each cosmetic pack.
const PRICE_IDS: Record<string, string> = {
  starter_bundle: 'price_REPLACE_STARTER',
  shadow_set: 'price_REPLACE_SHADOW',
  celestial_set: 'price_REPLACE_CELESTIAL',
  dragon_set: 'price_REPLACE_DRAGON',
};

const VALID_PACKS = Object.keys(PRICE_IDS);

// ─── Clients ────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ─── CORS helpers ───────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ─── Handler ────────────────────────────────────────────────────────────────
serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    // 1. Authenticate user via Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing or malformed Authorization header' }, 401);
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError?.message ?? 'No user');
      return json({ error: 'Unauthorized' }, 401);
    }

    // 2. Parse and validate body
    const body: { pack_id?: string } = await req.json().catch(() => ({}));
    const { pack_id } = body;

    if (!pack_id || !VALID_PACKS.includes(pack_id)) {
      return json({
        error: `Invalid pack_id. Must be one of: ${VALID_PACKS.join(', ')}`,
      }, 400);
    }

    // 3. Idempotency check — prevent duplicate completed purchases
    const { data: existing, error: lookupError } = await supabase
      .from('stripe_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('pack_id', pack_id)
      .eq('status', 'completed')
      .limit(1);

    if (lookupError) {
      console.error('Purchase lookup error:', lookupError);
      return json({ error: 'Failed to verify purchase history' }, 500);
    }

    if (existing && existing.length > 0) {
      return json({ error: 'Pack already purchased' }, 409);
    }

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: PRICE_IDS[pack_id],
          quantity: 1,
        },
      ],
      metadata: {
        pack_id,
        user_id: user.id,
      },
      success_url: `${Deno.env.get('APP_URL')!}/dashboard/store?success=true`,
      cancel_url: `${Deno.env.get('APP_URL')!}/dashboard/store?canceled=true`,
    });

    // 5. Insert pending purchase record BEFORE redirect
    //    (prevents race conditions if webhook arrives before client redirects)
    const { error: insertError } = await supabase.from('stripe_purchases').insert([
      {
        user_id: user.id,
        pack_id,
        stripe_session_id: session.id,
        amount_cents: session.amount_total ?? 0,
        status: 'pending',
      },
    ]);

    if (insertError) {
      // Session was created but DB insert failed — try to expire it gracefully
      console.error('Failed to insert purchase record; expiring session:', insertError);
      await stripe.checkout.sessions.expire(session.id).catch(() => {});
      return json({ error: 'Failed to create purchase record' }, 500);
    }

    // 6. Return checkout URL to the client
    return json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('create-stripe-session unhandled error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return json({ error: message }, 500);
  }
});
