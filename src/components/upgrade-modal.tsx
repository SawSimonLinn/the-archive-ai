"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, ArrowRight, Lock, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { formatPlanLimit } from "@/lib/billing";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBillingPlan } from "@/hooks/use-billing-plan";

export type UpgradeReason = "document_limit" | "rate_limit";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: UpgradeReason;
}

const REASON_COPY: Record<UpgradeReason, { title: string; description: string }> = {
  document_limit: {
    title: "Document Limit Reached",
    description: `You've used all ${PLANS.free.maxDocuments} document slots on the free plan. Upgrade to keep adding files.`,
  },
  rate_limit: {
    title: "Chat Limit Reached",
    description: `You've hit the free plan limit of ${PLANS.free.chatMessagesPerHour} chats per hour. Upgrade for unlimited conversations.`,
  },
};

const HIGHLIGHT_PLAN = "pro";

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const { plan: currentPlan } = useBillingPlan();
  const copy = reason === "document_limit"
    ? {
        title: "Document Limit Reached",
        description: `You've used all ${formatPlanLimit(currentPlan.maxDocuments)} document slots on ${currentPlan.name}. Upgrade to keep adding files.`,
      }
    : REASON_COPY.rate_limit;
  const [loading, setLoading] = useState<'pro' | 'team' | null>(null);

  async function handleUpgrade(planId: 'pro' | 'team') {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent hideCloseButton className="border-4 border-foreground rounded-none shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-2xl bg-card p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-foreground text-background p-6 border-b-4 border-foreground">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center bg-primary">
              <Lock className="h-4 w-4 text-foreground" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">
              {copy.title}
            </DialogTitle>
          </div>
          <DialogDescription className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-background/60 mt-1">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        {/* Plans */}
        <div className="p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["pro", "team"] as const).map((planId) => {
              const plan = PLANS[planId];
              const isHighlight = planId === HIGHLIGHT_PLAN;

              return (
                <div
                  key={planId}
                  className={cn(
                    "relative border-2 p-5 flex flex-col gap-4",
                    isHighlight
                      ? "border-primary bg-primary/5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      : "border-foreground"
                  )}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-4 bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground border border-foreground">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline font-black text-3xl tracking-tighter">${plan.price}</span>
                      <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-50">/mo</span>
                    </div>
                    <p className="font-headline font-black text-lg uppercase tracking-tighter mt-0.5">{plan.name}</p>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(planId)}
                    disabled={loading !== null || currentPlan.id === planId}
                    className={cn(
                      "w-full h-11 rounded-none border-2 border-foreground font-black uppercase tracking-tighter text-sm transition-all",
                      isHighlight
                        ? "bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                        : "bg-foreground text-background hover:bg-foreground/80"
                    )}
                  >
                    {currentPlan.id === planId ? (
                      "Current Plan"
                    ) : loading === planId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>{isHighlight ? <Zap className="h-4 w-4 mr-2" /> : null}Get {plan.name}</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/plans"
              onClick={onClose}
              className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              See full comparison <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              onClick={onClose}
              className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
            >
              Stay on Free
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
