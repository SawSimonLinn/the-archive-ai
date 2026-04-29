"use client";

import { useState } from "react";
import { Check, Zap, Shield, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useBillingPlan } from "@/hooks/use-billing-plan";

const PLAN_ICONS = {
  free: Shield,
  pro: Zap,
  team: Users,
};

const FAQ = [
  {
    q: "What happens when I hit the 3-document limit?",
    a: "You'll see an upgrade prompt. Your existing documents and chat history remain accessible — you just can't add new files until you upgrade or delete an existing document.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No long-term contracts. Cancel from your account settings and you won't be charged again.",
  },
  {
    q: "What file types are supported?",
    a: "PDF, TXT, and DOCX on all plans. The AI reads and indexes the full text of each file.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Documents are encrypted at rest with AES-256. We don't use your data to train AI models.",
  },
];

export default function PlansPage() {
  const [loading, setLoading] = useState<'pro' | 'team' | null>(null);
  const { plan: currentPlan, isLoading: isPlanLoading } = useBillingPlan();

  async function handleUpgrade(planId: 'pro' | 'team') {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 pt-24 pb-24">
        <div className="container px-6 mx-auto max-w-5xl space-y-16">
          {/* Header */}
          <div className="border-l-4 border-primary pl-5 space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-primary">Pricing</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-black uppercase leading-tight tracking-tighter">
              Plans & Pricing<span className="text-primary">.</span>
            </h1>
            <p className="text-base font-medium opacity-60 max-w-lg">
              Start free. Upgrade when your archive grows.
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid gap-5 md:grid-cols-3">
            {(["free", "pro", "team"] as const).map((planId) => {
              const plan = PLANS[planId];
              const Icon = PLAN_ICONS[planId];
              const isPro = planId === "pro";
              const isPaid = planId === "pro" || planId === "team";
              const isCurrentPlan = !isPlanLoading && currentPlan.id === planId;

              return (
                <div
                  key={planId}
                  className={cn(
                    "relative flex flex-col border-2 p-6 gap-6",
                    isPro
                      ? "border-primary bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      : "border-foreground bg-card"
                  )}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground border-2 border-foreground whitespace-nowrap">
                      <Sparkles className="inline h-2.5 w-2.5 mr-1" />
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center border-2 border-foreground",
                      isPro ? "bg-primary" : "bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-headline font-black text-xl uppercase tracking-tighter">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        {plan.price === 0 ? (
                          <span className="font-headline font-black text-4xl tracking-tighter">Free</span>
                        ) : (
                          <>
                            <span className="font-headline font-black text-4xl tracking-tighter">${plan.price}</span>
                            <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-50">/mo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm font-medium">
                        <Check className={cn("h-4 w-4 shrink-0 mt-0.5", isPro ? "text-primary" : "text-foreground")} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t-2 border-foreground/10 pt-4 font-mono text-[9px] font-bold uppercase tracking-widest space-y-1 opacity-50">
                    <div>{plan.maxDocuments === Infinity ? "Unlimited" : plan.maxDocuments} documents</div>
                    <div>{plan.chatMessagesPerHour === Infinity ? "Unlimited" : plan.chatMessagesPerHour} chats / hour</div>
                  </div>

                  {isPaid ? (
                    <Button
                      onClick={() => handleUpgrade(planId)}
                      disabled={loading !== null || isCurrentPlan}
                      className={cn(
                        "w-full h-11 rounded-none border-2 border-foreground font-black uppercase tracking-tighter text-sm transition-all",
                        isPro
                          ? "bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                          : "bg-foreground text-background hover:bg-foreground/80"
                      )}
                    >
                      {isCurrentPlan ? (
                        "Current Plan"
                      ) : loading === planId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {isPro && <Zap className="h-4 w-4 mr-2" />}
                          Upgrade to {plan.name} <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full h-11 rounded-none border-2 border-foreground font-black uppercase tracking-tighter text-sm bg-muted text-foreground/50 cursor-default"
                    >
                      {isCurrentPlan ? "Current Plan" : "Free Tier"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature comparison table */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-2xl uppercase tracking-tight">Full Comparison</h2>
            <div className="border-2 border-foreground overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-black">Feature</th>
                    {(["free", "pro", "team"] as const).map((p) => (
                      <th key={p} className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest font-black text-center">{PLANS[p].name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Documents", values: ["3", "25", "Unlimited"] },
                    { label: "AI Chats / Hour", values: ["20", "Unlimited", "Unlimited"] },
                    { label: "File Types", values: ["PDF, TXT, DOCX", "PDF, TXT, DOCX", "PDF, TXT, DOCX"] },
                    { label: "Document Analysis", values: ["Basic", "Full", "Full"] },
                    { label: "Export History", values: ["—", "✓", "✓"] },
                    { label: "Team Workspace", values: ["—", "—", "✓"] },
                    { label: "API Access", values: ["—", "—", "✓"] },
                    { label: "Priority Support", values: ["—", "—", "✓"] },
                  ].map((row, i) => (
                    <tr key={row.label} className={cn("border-t-2 border-foreground/10", i % 2 === 0 ? "bg-muted/20" : "")}>
                      <td className="px-4 py-3 font-bold uppercase tracking-tighter text-xs">{row.label}</td>
                      {row.values.map((val, j) => (
                        <td key={j} className={cn("px-4 py-3 text-center font-mono text-xs font-bold", val === "—" ? "opacity-25" : j === 1 ? "text-primary font-black" : "")}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-3">
            <h2 className="font-headline font-black text-2xl uppercase tracking-tight">FAQ</h2>
            <div className="space-y-2">
              {FAQ.map((item) => (
                <div key={item.q} className="border-2 border-foreground p-5 space-y-2">
                  <p className="font-headline font-black uppercase tracking-tighter text-base">{item.q}</p>
                  <p className="text-sm font-medium opacity-60 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
