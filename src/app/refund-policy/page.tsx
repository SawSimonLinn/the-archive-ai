import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, FileCheck, Mail, RefreshCcw } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy | The Archive.ai",
  description:
    "Review subscription cancellations, refunds, plan changes, and billing support details for The Archive.ai.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const policySections = [
  {
    title: "Subscriptions",
    body: "Paid plans are billed in advance on a monthly basis unless a different billing period is shown at checkout. Your plan renews automatically until you cancel it.",
  },
  {
    title: "Cancellations",
    body: "You can cancel a paid plan from Dashboard Settings > Billing. Cancellation stops the next renewal. Your paid features remain available until the end of the current billing period.",
  },
  {
    title: "Refund eligibility",
    body: "If a charge was made by mistake, your account was upgraded accidentally, or the service could not be used because of a verified platform issue, contact support within 14 days of the charge.",
  },
  {
    title: "Non-refundable cases",
    body: "We generally do not refund partial months, unused document limits, unused chat messages, or cancellations requested after the current billing period has already completed.",
  },
  {
    title: "Plan changes",
    body: "Upgrades may take effect immediately. Downgrades usually apply at the next renewal. If you move to a lower plan, documents above the new limit may become unavailable until you delete files or upgrade again.",
  },
  {
    title: "Failed payments",
    body: "If payment fails, access to paid features may be paused until billing is resolved. We may retry the payment method on file according to the payment processor schedule.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <CreditCard className="h-4 w-4" /> Billing policy
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Refund <br />
                Policy<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                Details for subscription renewals, cancellations, plan changes, failed payments, and refund requests.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <FileCheck className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Last updated
              </p>
              <p className="mt-2 text-3xl font-headline font-black tracking-tighter">
                {SITE.policyUpdatedAt}
              </p>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                Refund requests should include your account email, charge date, and the reason for the request.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              {policySections.map((section, index) => (
                <article
                  key={section.title}
                  className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-foreground text-xl font-headline font-black text-background">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-8 text-2xl font-headline font-black uppercase tracking-tighter">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-foreground px-6 py-16 text-background">
          <div className="container mx-auto grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-primary px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                <RefreshCcw className="h-4 w-4" /> Need a billing review?
              </div>
              <h2 className="mt-6 text-3xl font-headline font-black uppercase tracking-tighter">
                Contact support before filing a dispute.
              </h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-background/70">
                We can look up the subscription, explain the charge, and process eligible corrections faster when contacted directly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-flex h-14 items-center justify-center gap-2 border-2 border-primary bg-primary px-6 text-sm font-black uppercase tracking-tighter text-foreground transition-all hover:translate-x-1 hover:translate-y-1"
              >
                Email billing <Mail className="h-4 w-4" />
              </a>
              <Link
                href="/dashboard/settings"
                className="inline-flex h-14 items-center justify-center gap-2 border-2 border-background/25 px-6 text-sm font-black uppercase tracking-tighter text-background transition-colors hover:border-primary hover:text-primary"
              >
                Manage billing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
