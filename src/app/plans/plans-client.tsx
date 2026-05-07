"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  FileStack,
  Gauge,
  Loader2,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useBillingPlan } from "@/hooks/use-billing-plan";
import { formatPlanLimit } from "@/lib/billing";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

const PLAN_IDS = ["free", "pro", "team"] as const;

type VisiblePlanId = (typeof PLAN_IDS)[number];
type PaidPlanId = Extract<VisiblePlanId, "pro" | "team">;

const PLAN_ICONS = {
  free: Shield,
  pro: Zap,
  team: Users,
} satisfies Record<VisiblePlanId, typeof Shield>;

const PLAN_COPY = {
  free: {
    label: "Starter archive",
    summary: "For trying the workflow with a few important files.",
    outcome: "Start with 3 documents and 20 chats per hour.",
  },
  pro: {
    label: "Individual workspace",
    summary: "For active research, client work, and repeat document review.",
    outcome: "Add multiple documents at once and remove chat limits.",
  },
  team: {
    label: "Team operating layer",
    summary: "For shared archives, collaboration, and higher-volume work.",
    outcome: "Unlimited documents with team workspace and API access.",
  },
} satisfies Record<VisiblePlanId, { label: string; summary: string; outcome: string }>;

const TRUST_ITEMS = [
  { icon: LockKeyhole, label: "Encrypted at rest" },
  { icon: CreditCard, label: "Stripe checkout" },
  { icon: ShieldCheck, label: "Cancel anytime" },
  { icon: Gauge, label: "Unlimited chats on paid plans" },
];

const COMPARISON_ROWS = [
  { label: "Document slots", values: { free: "3", pro: "25", team: "Unlimited" } },
  { label: "AI chats per hour", values: { free: "20", pro: "Unlimited", team: "Unlimited" } },
  { label: "Multiple document uploads", values: { free: "No", pro: "Yes", team: "Yes" } },
  { label: "Supported file types", values: { free: "PDF, TXT, DOCX", pro: "PDF, TXT, DOCX", team: "PDF, TXT, DOCX" } },
  { label: "Document analysis", values: { free: "Basic", pro: "Full", team: "Full" } },
  { label: "Export chat history", values: { free: "No", pro: "Yes", team: "Yes" } },
  { label: "Team workspace", values: { free: "No", pro: "No", team: "Yes" } },
  { label: "API access", values: { free: "No", pro: "No", team: "Yes" } },
  { label: "Priority support", values: { free: "No", pro: "No", team: "Yes" } },
] satisfies Array<{ label: string; values: Record<VisiblePlanId, string> }>;

const FAQ = [
  {
    q: "What happens when I hit the 3-document limit?",
    a: "You will see an upgrade prompt. Your existing documents and chat history stay accessible, but you cannot add new files until you upgrade or delete an existing document.",
  },
  {
    q: "Can I upload multiple documents at once?",
    a: "Free accounts upload one document at a time. Pro and Team accounts can upload multiple documents in one upload.",
  },
  {
    q: "What file types are supported?",
    a: "PDF, TXT, and DOCX are supported on every plan. The Archive extracts and indexes the readable text in each file.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Billing is month to month. You can manage cancellation from account settings and keep access through the paid period.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Documents are encrypted at rest with AES-256. Your data is not used to train AI models.",
  },
  {
    q: "When should I choose Team?",
    a: "Choose Team when you need a shared workspace, unlimited documents, API access, and priority support for multiple users.",
  },
];

function formatRawPlanLimit(value: number) {
  return value === Infinity ? "Unlimited" : value.toLocaleString();
}

function formatRawHourlyLimit(value: number) {
  return value === Infinity ? "Unlimited" : `${value.toLocaleString()}/hr`;
}

function formatCurrentHourlyLimit(value: number | null) {
  return value === null ? "Unlimited" : `${value.toLocaleString()}/hr`;
}

function isIncluded(value: string) {
  return value !== "No";
}

function PlansHeading() {
  return (
    <div className="max-w-3xl space-y-5">
      <div className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-3 py-1 font-mono text-xs font-bold uppercase text-foreground">
        <BadgeCheck className="h-4 w-4" />
        Pricing
      </div>
      <h1 className="font-headline text-4xl font-black uppercase leading-none tracking-normal sm:text-5xl lg:text-6xl">
        Choose the archive capacity you need.
      </h1>
      <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
        Start free, then scale into multi-document uploads, unlimited chats, team workspaces, and API access when your document library grows.
      </p>
    </div>
  );
}

export function PlansClient() {
  const [loading, setLoading] = useState<PaidPlanId | null>(null);
  const {
    plan: currentPlan,
    isLoading: isPlanLoading,
    isAuthenticated,
  } = useBillingPlan();

  const isSignedOut = isAuthenticated === false;
  const currentPlanName = isPlanLoading
    ? "Checking plan"
    : isSignedOut
      ? "Not signed in"
      : `${currentPlan.name} plan`;
  const accountStatusDescription = isPlanLoading
    ? "Loading your current billing status."
    : isSignedOut
      ? "Create an account to start on Free, or sign in before upgrading."
      : "Your plan limits update automatically after checkout.";
  const accountDocumentLimit = isPlanLoading
    ? "Loading"
    : isSignedOut
      ? "3"
      : formatPlanLimit(currentPlan.maxDocuments);
  const accountChatLimit = isPlanLoading
    ? "Loading"
    : isSignedOut
      ? "20/hr"
      : formatCurrentHourlyLimit(currentPlan.chatMessagesPerHour);

  async function handleUpgrade(planId: PaidPlanId) {
    setLoading(planId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (res.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!res.ok || typeof data.url !== "string") {
        throw new Error(data.error ?? "Checkout unavailable");
      }

      window.location.href = data.url;
    } catch {
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Could not start Stripe checkout. Please try again.",
      });
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <PlansHeading />

            <aside className="border-2 border-foreground bg-foreground p-5 text-background shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
              <p className="font-mono text-xs font-bold uppercase text-background/60">Account status</p>
              <h2 className="mt-2 font-headline text-3xl font-black uppercase leading-none tracking-normal">
                {currentPlanName}
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-background/70">
                {accountStatusDescription}
              </p>
              <div className="mt-5 grid grid-cols-2 border-2 border-background/20">
                <div className="border-r-2 border-background/20 p-3">
                  <p className="font-mono text-[11px] font-bold uppercase text-background/50">Documents</p>
                  <p className="mt-1 font-headline text-xl font-black tracking-normal">
                    {accountDocumentLimit}
                  </p>
                </div>
                <div className="p-3">
                  <p className="font-mono text-[11px] font-bold uppercase text-background/50">Chats</p>
                  <p className="mt-1 font-headline text-xl font-black tracking-normal">
                    {accountChatLimit}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-foreground text-background">
          <div className="container mx-auto grid max-w-7xl grid-cols-2 px-6 md:grid-cols-4">
            {TRUST_ITEMS.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex min-h-24 items-center gap-3 py-5",
                  index % 2 === 0 ? "pr-4" : "pl-4",
                  index > 1 ? "border-t-2 border-background/20 md:border-t-0" : "",
                  index > 0 ? "md:border-l-2 md:border-background/20 md:pl-6" : "",
                )}
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid gap-5 lg:grid-cols-3">
              {PLAN_IDS.map((planId) => {
                const plan = PLANS[planId];
                const Icon = PLAN_ICONS[planId];
                const copy = PLAN_COPY[planId];
                const isPro = planId === "pro";
                const isPaid = planId !== "free";
                const isCurrentPlan = !isPlanLoading && isAuthenticated === true && currentPlan.id === planId;
                const isCheckingPlan = isPlanLoading && !isSignedOut;

                return (
                  <article
                    key={planId}
                    className={cn(
                      "relative flex min-h-[560px] flex-col border-2 bg-card p-6",
                      isPro
                        ? "border-primary shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                        : "border-foreground",
                    )}
                    aria-label={`${plan.name} plan`}
                  >
                    {isPro ? (
                      <div className="absolute -top-4 left-6 inline-flex items-center gap-2 border-2 border-foreground bg-primary px-3 py-1 text-xs font-black uppercase text-foreground">
                        <Sparkles className="h-4 w-4" />
                        Most popular
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-4 pt-2">
                      <div className={cn("flex h-12 w-12 items-center justify-center border-2 border-foreground", isPro ? "bg-primary" : "bg-muted")}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {isCurrentPlan ? (
                        <span className="border-2 border-foreground bg-foreground px-2 py-1 text-xs font-black uppercase text-background">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-6 space-y-3">
                      <div>
                        <p className="text-sm font-bold uppercase text-muted-foreground">{copy.label}</p>
                        <h3 className="font-headline text-3xl font-black uppercase tracking-normal">{plan.name}</h3>
                      </div>
                      <div className="flex min-h-14 items-end gap-1">
                        {plan.price === 0 ? (
                          <span className="font-headline text-5xl font-black leading-none tracking-normal">Free</span>
                        ) : (
                          <>
                            <span className="font-headline text-5xl font-black leading-none tracking-normal">${plan.price}</span>
                            <span className="pb-1 font-mono text-xs font-bold uppercase text-muted-foreground">/mo</span>
                          </>
                        )}
                      </div>
                      <p className="min-h-16 text-sm font-medium leading-relaxed text-muted-foreground">{copy.summary}</p>
                    </div>

                    <div className="my-6 border-y-2 border-foreground/10 py-4">
                      <p className="text-sm font-bold leading-relaxed">{copy.outcome}</p>
                    </div>

                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm font-medium leading-snug">
                          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", isPro ? "text-primary" : "text-foreground")} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 grid grid-cols-2 border-2 border-foreground/10 text-sm">
                      <div className="border-r-2 border-foreground/10 p-3">
                        <p className="font-mono text-[11px] font-bold uppercase text-muted-foreground">Documents</p>
                        <p className="mt-1 font-bold">{formatRawPlanLimit(plan.maxDocuments)}</p>
                      </div>
                      <div className="p-3">
                        <p className="font-mono text-[11px] font-bold uppercase text-muted-foreground">Chats</p>
                        <p className="mt-1 font-bold">{formatRawHourlyLimit(plan.chatMessagesPerHour)}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      {planId === "free" ? (
                        isAuthenticated === true && currentPlan.id !== "free" ? (
                          <Button
                            disabled
                            className="h-12 w-full rounded-none border-2 border-foreground bg-muted font-black uppercase text-foreground/50"
                          >
                            Included
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="h-12 w-full rounded-none border-2 border-foreground bg-foreground font-black uppercase text-background hover:bg-foreground/80"
                          >
                            <Link href={isAuthenticated === true ? "/dashboard" : "/auth"}>
                              {isAuthenticated === true ? "Open Dashboard" : "Start Free"}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )
                      ) : isSignedOut ? (
                        <Button
                          asChild
                          className={cn(
                            "h-12 w-full rounded-none border-2 border-foreground font-black uppercase",
                            isPro ? "bg-primary text-foreground" : "bg-foreground text-background hover:bg-foreground/80",
                          )}
                        >
                          <Link href="/auth">
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUpgrade(planId)}
                          disabled={loading !== null || isCurrentPlan || isCheckingPlan}
                          aria-busy={loading === planId}
                          className={cn(
                            "h-12 w-full rounded-none border-2 border-foreground font-black uppercase transition-all",
                            isPro
                              ? "bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                              : "bg-foreground text-background hover:bg-foreground/80",
                          )}
                        >
                          {isCurrentPlan ? (
                            "Current Plan"
                          ) : loading === planId || isCheckingPlan ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              {isPro ? <Zap className="h-4 w-4" /> : null}
                              Upgrade to {plan.name}
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Prices are monthly in USD. Taxes may apply. Paid plans are processed securely through Stripe.
            </p>
          </div>
        </section>

        <section className="border-y-2 border-foreground bg-muted/30 py-12 sm:py-16">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase text-primary">Full comparison</p>
                <h2 className="mt-2 font-headline text-3xl font-black uppercase tracking-normal sm:text-4xl">
                  See every limit before you upgrade.
                </h2>
              </div>
              <p className="max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
                Pro and Team both unlock multiple document uploads. Team adds shared workspace features and API access.
              </p>
            </div>

            <div className="hidden overflow-hidden border-2 border-foreground bg-card lg:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Comparison of Free, Pro, and Team plans</caption>
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="px-5 py-4 text-left font-mono text-xs font-black uppercase">Feature</th>
                    {PLAN_IDS.map((planId) => (
                      <th key={planId} className="px-5 py-4 text-center font-mono text-xs font-black uppercase">
                        {PLANS[planId].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, index) => (
                    <tr key={row.label} className={cn("border-t-2 border-foreground/10", index % 2 === 0 ? "bg-muted/20" : "")}>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">{row.label}</th>
                      {PLAN_IDS.map((planId) => {
                        const value = row.values[planId];

                        return (
                          <td
                            key={planId}
                            className={cn(
                              "px-5 py-4 text-center font-mono text-xs font-bold",
                              planId === "pro" && isIncluded(value) ? "text-primary" : "",
                              value === "No" ? "text-muted-foreground" : "",
                            )}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {COMPARISON_ROWS.map((row) => (
                <div key={row.label} className="border-2 border-foreground bg-card p-4">
                  <h3 className="font-headline text-lg font-black uppercase tracking-normal">{row.label}</h3>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    {PLAN_IDS.map((planId) => {
                      const value = row.values[planId];

                      return (
                        <div key={planId} className="border-2 border-foreground/10 p-2">
                          <p className="font-mono font-bold uppercase text-muted-foreground">{PLANS[planId].name}</p>
                          <p className={cn("mt-1 font-bold", planId === "pro" && isIncluded(value) ? "text-primary" : "")}>
                            {value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-primary">FAQ</p>
              <h2 className="mt-2 font-headline text-3xl font-black uppercase leading-none tracking-normal sm:text-4xl">
                Billing questions, answered directly.
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {FAQ.map((item) => (
                <details key={item.q} className="group border-2 border-foreground bg-card p-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="font-headline text-lg font-black uppercase leading-tight tracking-normal">{item.q}</span>
                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-primary py-10">
          <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground bg-background">
                <FileStack className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-black uppercase tracking-normal">Ready to build your archive?</h2>
                <p className="text-sm font-bold text-foreground/70">Start free, or upgrade when you need multiple document uploads.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-none border-2 border-foreground bg-foreground px-6 font-black uppercase text-background hover:bg-foreground/80">
                <Link href={isAuthenticated === true ? "/dashboard" : "/auth"}>
                  <Upload className="h-4 w-4" />
                  {isAuthenticated === true ? "Open Dashboard" : "Start Free"}
                </Link>
              </Button>
              {isSignedOut ? (
                <Button asChild className="h-12 rounded-none border-2 border-foreground bg-background px-6 font-black uppercase text-foreground hover:bg-background/90">
                  <Link href="/auth">Upgrade to Pro</Link>
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade("pro")}
                  disabled={loading !== null || (isAuthenticated === true && currentPlan.id === "pro")}
                  className="h-12 rounded-none border-2 border-foreground bg-background px-6 font-black uppercase text-foreground hover:bg-background/90"
                >
                  {loading === "pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
