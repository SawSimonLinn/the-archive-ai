"use client";

import { useCallback, useEffect, useState } from "react";
import { serializePlan, type BillingAccountResponse, type BillingPlanSummary } from "@/lib/billing";

export function useBillingPlan() {
  const [plan, setPlan] = useState<BillingPlanSummary>(() => serializePlan("free"));
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const sessionId =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("session_id") : null;

      if (sessionId) params.set("session_id", sessionId);

      const res = await fetch(`/api/account/billing${params.size ? `?${params.toString()}` : ""}`, {
        cache: "no-store",
      });

      if (!res.ok) return null;

      const data = (await res.json()) as BillingAccountResponse;
      setPlan(data.plan);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const handleBillingChanged = () => void refresh();
    window.addEventListener("archive:billing-changed", handleBillingChanged);

    return () => window.removeEventListener("archive:billing-changed", handleBillingChanged);
  }, [refresh]);

  return { plan, isLoading, refresh };
}
