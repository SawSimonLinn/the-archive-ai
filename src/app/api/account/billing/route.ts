import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getEffectivePlanId,
  isActiveSubscriptionStatus,
  isPlanId,
  serializePlan,
  type BillingAccountResponse,
  type BillingTransaction,
} from "@/lib/billing";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import {
  getStripeObjectId,
  getSubscriptionCurrentPeriodEnd,
  getSubscriptionPlanId,
  subscriptionSummaryFromRow,
} from "@/lib/stripe-subscription";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string | null;
  status: string | null;
  current_period_end: string | null;
  updated_at: string | null;
};

function toTimestampIso(timestamp: number | null | undefined) {
  return typeof timestamp === "number" ? new Date(timestamp * 1000).toISOString() : null;
}

function getInvoiceAmount(invoice: Stripe.Invoice) {
  if (invoice.amount_paid > 0) return invoice.amount_paid;
  if (invoice.total > 0) return invoice.total;
  return invoice.amount_due;
}

async function getStoredSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("user_subscriptions")
    .select("user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_end, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

async function upsertSubscription(input: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  planId: PlanId;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("user_subscriptions")
    .upsert(
      {
        user_id: input.userId,
        stripe_customer_id: input.customerId,
        stripe_subscription_id: input.subscriptionId,
        plan_id: input.planId,
        status: input.status,
        current_period_end: input.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_end, updated_at")
    .single();

  if (error) throw error;
  return data as SubscriptionRow;
}

async function syncCheckoutSession(userId: string, sessionId: string) {
  if (!sessionId.startsWith("cs_")) return null;

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const sessionUserId = session.metadata?.userId ?? session.client_reference_id;
  if (sessionUserId !== userId) return null;

  const customerId = getStripeObjectId(session.customer);
  const subscriptionId = getStripeObjectId(session.subscription);
  let subscription =
    typeof session.subscription === "object" && session.subscription?.object === "subscription"
      ? session.subscription
      : null;

  if (!subscription && subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  const planId =
    subscription
      ? getSubscriptionPlanId(subscription, session.metadata?.planId)
      : isPlanId(session.metadata?.planId) && session.metadata.planId !== "free"
        ? session.metadata.planId
        : null;

  if (!customerId || !subscriptionId || !planId) return null;

  return upsertSubscription({
    userId,
    customerId,
    subscriptionId,
    planId,
    status: subscription?.status ?? "active",
    currentPeriodEnd: subscription ? getSubscriptionCurrentPeriodEnd(subscription) : null,
  });
}

async function syncStripeSubscription(userId: string, row: SubscriptionRow | null) {
  if (!row?.stripe_subscription_id && !row?.stripe_customer_id) return row;

  let subscription: Stripe.Subscription | null = null;

  if (row.stripe_subscription_id) {
    try {
      subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    } catch (error) {
      console.error("Failed to refresh Stripe subscription:", error);
    }
  }

  if (!subscription && row.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: row.stripe_customer_id,
      status: "all",
      limit: 100,
    });

    subscription =
      subscriptions.data.find((item) => isActiveSubscriptionStatus(item.status) && getSubscriptionPlanId(item)) ??
      null;
  }

  if (!subscription) return row;

  const customerId = getStripeObjectId(subscription.customer) ?? row.stripe_customer_id;
  const subscriptionId = subscription.id;

  if (!isActiveSubscriptionStatus(subscription.status)) {
    return upsertSubscription({
      userId,
      customerId,
      subscriptionId,
      planId: "free",
      status: subscription.status,
      currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
    });
  }

  const planId = getSubscriptionPlanId(subscription, row.plan_id);
  if (!planId) return row;

  return upsertSubscription({
    userId,
    customerId,
    subscriptionId,
    planId,
    status: subscription.status,
    currentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
  });
}

async function getStripeTransactions(customerId: string | null): Promise<BillingTransaction[]> {
  if (!customerId) return [];

  const transactions: BillingTransaction[] = [];

  for await (const invoice of stripe.invoices.list({ customer: customerId, limit: 100 })) {
    transactions.push({
      id: invoice.id,
      createdAt: toTimestampIso(invoice.created) ?? new Date().toISOString(),
      description: invoice.number ? `Invoice ${invoice.number}` : invoice.description ?? "Stripe invoice",
      amount: getInvoiceAmount(invoice),
      currency: invoice.currency,
      status: invoice.status ?? "unknown",
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    });
  }

  return transactions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let subscription = await getStoredSubscription(user.id);
    const checkoutSessionId = req.nextUrl.searchParams.get("session_id");

    if (checkoutSessionId) {
      subscription = (await syncCheckoutSession(user.id, checkoutSessionId)) ?? subscription;
    }

    subscription = await syncStripeSubscription(user.id, subscription);

    const effectivePlanId = getEffectivePlanId(subscription?.plan_id, subscription?.status);
    const transactions = await getStripeTransactions(subscription?.stripe_customer_id ?? null);
    const subscriptionSummary = subscriptionSummaryFromRow(subscription);

    const response: BillingAccountResponse = {
      user: {
        id: user.id,
        email: user.email ?? null,
        createdAt: user.created_at ?? null,
      },
      plan: serializePlan(effectivePlanId),
      subscription: {
        ...subscriptionSummary,
        planId: effectivePlanId,
        status: subscription?.status ?? "free",
      },
      transactions,
      portalAvailable: Boolean(subscription?.stripe_customer_id),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Billing account load error:", error);
    return NextResponse.json({ error: "Failed to load billing account" }, { status: 500 });
  }
}
