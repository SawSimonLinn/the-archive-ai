import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';
import { isPlanId } from '@/lib/billing';
import {
  getStripeObjectId,
  getSubscriptionCurrentPeriodEnd,
  getSubscriptionPlanId,
} from '@/lib/stripe-subscription';

export const runtime = 'nodejs';

async function upsertSubscription(input: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
}) {
  await supabaseAdmin.from('user_subscriptions').upsert(
    {
      user_id: input.userId,
      stripe_customer_id: input.customerId,
      stripe_subscription_id: input.subscriptionId,
      plan_id: input.planId,
      status: input.status,
      current_period_end: input.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

async function syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string, fallbackPlanId?: string) {
  const userId = subscription.metadata?.userId ?? fallbackUserId;
  const planId = getSubscriptionPlanId(subscription, subscription.metadata?.planId ?? fallbackPlanId);

  if (!userId || !planId) {
    if (subscription.id) {
      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: subscription.status,
          current_period_end: getSubscriptionCurrentPeriodEnd(subscription),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
    }
    return;
  }

  await upsertSubscription({
    userId,
    customerId: getStripeObjectId(subscription.customer),
    subscriptionId: subscription.id,
    planId,
    status: subscription.status,
    currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
  });
}

// Must read raw body for signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, planId } = session.metadata ?? {};
    if (!userId || !planId) return NextResponse.json({ received: true });

    const subscriptionId = getStripeObjectId(session.subscription);
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    await upsertSubscription({
      userId,
      customerId: getStripeObjectId(session.customer),
      subscriptionId,
      planId: isPlanId(planId) ? planId : 'free',
      status: subscription?.status ?? 'active',
      currentPeriodEnd: subscription ? getSubscriptionCurrentPeriodEnd(subscription) : null,
    });
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    await syncSubscription(sub);
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan_id: 'free',
        status: 'canceled',
        current_period_end: getSubscriptionCurrentPeriodEnd(sub),
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
