import Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

type PaidPlanId = Exclude<PlanId, "free">;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_PRICE_IDS: Record<PaidPlanId, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
};

function isStripePriceId(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("price_") &&
    value.length > "price_".length
  );
}

export function getStripePriceId(planId: unknown): string | null {
  if (planId !== "pro" && planId !== "team") return null;

  const priceId = STRIPE_PRICE_IDS[planId];
  if (!isStripePriceId(priceId)) {
    throw new Error(
      `Missing or invalid Stripe price ID configuration for plan "${planId}"`,
    );
  }

  return priceId;
}

export function getStripePlanIdForPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) return null;

  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.team) return "team";

  return null;
}
