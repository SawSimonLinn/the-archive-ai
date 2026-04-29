import type Stripe from "stripe";
import { isPlanId, type BillingSubscriptionSummary } from "@/lib/billing";
import type { PlanId } from "@/lib/plans";
import { getStripePlanIdForPriceId } from "@/lib/stripe";

export function getStripeObjectId(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") return value;
  return typeof value?.id === "string" ? value.id : null;
}

export function getSubscriptionPlanId(
  subscription: Stripe.Subscription,
  fallbackPlanId?: unknown,
): Exclude<PlanId, "free"> | null {
  if (isPlanId(fallbackPlanId) && fallbackPlanId !== "free") return fallbackPlanId;

  const metadataPlanId = subscription.metadata?.planId;
  if (isPlanId(metadataPlanId) && metadataPlanId !== "free") return metadataPlanId;

  for (const item of subscription.items.data) {
    const planId = getStripePlanIdForPriceId(item.price?.id);
    if (planId) return planId;
  }

  return null;
}

export function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data.reduce<number | null>((latest, item) => {
    if (typeof item.current_period_end !== "number") return latest;
    return latest === null ? item.current_period_end : Math.max(latest, item.current_period_end);
  }, null);

  if (periodEnd === null) return null;
  return new Date(periodEnd * 1000).toISOString();
}

export function subscriptionSummaryFromRow(row: {
  plan_id?: string | null;
  status?: string | null;
  current_period_end?: string | null;
  updated_at?: string | null;
} | null): BillingSubscriptionSummary {
  return {
    planId: isPlanId(row?.plan_id) ? row.plan_id : "free",
    status: row?.status ?? "free",
    currentPeriodEnd: row?.current_period_end ?? null,
    updatedAt: row?.updated_at ?? null,
  };
}
