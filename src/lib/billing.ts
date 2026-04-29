import { PLANS, type PlanId } from "@/lib/plans";

export type BillingPlanSummary = {
  id: PlanId;
  name: string;
  price: number;
  maxDocuments: number | null;
  chatMessagesPerHour: number | null;
  features: string[];
};

export type BillingSubscriptionSummary = {
  planId: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  updatedAt: string | null;
};

export type BillingTransaction = {
  id: string;
  createdAt: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
};

export type BillingAccountResponse = {
  user: {
    id: string;
    email: string | null;
    createdAt: string | null;
  };
  plan: BillingPlanSummary;
  subscription: BillingSubscriptionSummary;
  transactions: BillingTransaction[];
  portalAvailable: boolean;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);
}

export function isActiveSubscriptionStatus(status: string | null | undefined) {
  return Boolean(status && ACTIVE_SUBSCRIPTION_STATUSES.has(status));
}

export function serializePlan(planId: PlanId): BillingPlanSummary {
  const plan = PLANS[planId];

  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    maxDocuments: Number.isFinite(plan.maxDocuments) ? plan.maxDocuments : null,
    chatMessagesPerHour: Number.isFinite(plan.chatMessagesPerHour) ? plan.chatMessagesPerHour : null,
    features: [...plan.features],
  };
}

export function getEffectivePlanId(
  planId: string | null | undefined,
  status: string | null | undefined,
): PlanId {
  if (!isActiveSubscriptionStatus(status)) return "free";
  return isPlanId(planId) ? planId : "free";
}

export function formatPlanLimit(limit: number | null) {
  return limit === null ? "Unlimited" : limit.toLocaleString();
}
