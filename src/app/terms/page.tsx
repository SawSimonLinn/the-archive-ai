import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Gavel } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionScrollNav } from "@/components/layout/section-scroll-nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | The Archive.ai",
  description:
    "Review The Archive.ai account terms, acceptable use rules, subscription terms, and AI output limitations.",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  {
    id: "using-the-service",
    title: "Using the service",
    body: "The Archive.ai lets users upload supported documents, extract text, generate document summaries, search document content, and ask questions against their private archive. You are responsible for making sure you have the right to upload and process each file.",
  },
  {
    id: "accounts-and-access",
    title: "Accounts and access",
    body: "You must keep your account credentials secure and provide accurate account information. Activity under your account is your responsibility unless it results from a security issue caused by The Archive.ai.",
  },
  {
    id: "user-content",
    title: "User content",
    body: "You keep ownership of the documents and text you upload. You grant The Archive.ai the limited rights needed to host, process, index, display, and generate responses from your content so the product can work.",
  },
  {
    id: "ai-outputs",
    title: "AI outputs",
    body: "AI answers, summaries, and suggested questions can be incomplete or incorrect. The Archive.ai is a document intelligence tool, not a substitute for professional legal, medical, financial, or safety advice. Verify important outputs against the cited source material.",
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: "Do not use the service to upload illegal content, infringe intellectual property rights, attack systems, bypass limits, extract other users' data, generate harmful instructions, or violate applicable law.",
  },
  {
    id: "subscriptions-and-billing",
    title: "Subscriptions and billing",
    body: "Paid plans renew until canceled. Billing, cancellation, refunds, failed payments, and plan changes are handled under the Refund Policy and the checkout terms shown when you subscribe.",
  },
  {
    id: "service-availability",
    title: "Service availability",
    body: "We work to keep the product reliable, but we do not guarantee uninterrupted service. Maintenance, provider outages, rate limits, or security events may temporarily affect access.",
  },
  {
    id: "termination",
    title: "Termination",
    body: "You may stop using the service at any time. We may suspend or terminate accounts that violate these terms, create security risk, fail to pay, or require action for legal or operational reasons.",
  },
];

const termsNav = terms.map((term) => ({
  label: term.title,
  href: `#${term.id}`,
}));

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <Gavel className="h-4 w-4" /> Terms of service
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Terms <br />
                Of Service<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                These terms govern access to The Archive.ai, including accounts, uploads, subscriptions, AI outputs, and acceptable use.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <FileText className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Last updated
              </p>
              <p className="mt-2 text-3xl font-headline font-black tracking-tighter">
                {SITE.policyUpdatedAt}
              </p>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                Questions about these terms can be sent to{" "}
                <a className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4" href={`mailto:${SITE.supportEmail}`}>
                  {SITE.supportEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <div className="sticky top-28 border-4 border-foreground bg-primary p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <FileText className="h-10 w-10" />
                <h2 className="mt-8 text-3xl font-headline font-black uppercase tracking-tighter">
                  Terms contents
                </h2>
                <SectionScrollNav items={termsNav} ariaLabel="Terms of service sections" />
              </div>
            </aside>

            <div className="space-y-6 lg:col-span-8">
              {terms.map((term, index) => (
                <article
                  key={term.id}
                  id={term.id}
                  className="grid scroll-mt-28 gap-6 border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:grid-cols-[88px_1fr]"
                >
                  <div className="flex h-16 w-16 items-center justify-center bg-foreground text-2xl font-headline font-black text-background">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">
                      {term.title}
                    </h2>
                    <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
                      {term.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-primary px-6 py-16">
          <div className="container mx-auto flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-9 w-9 shrink-0" />
              <div>
                <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">
                  Review billing details before subscribing.
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                  The Refund Policy explains renewals, cancellations, failed payments, and eligible refund requests.
                </p>
              </div>
            </div>
            <Link
              href="/refund-policy"
              className="inline-flex h-14 items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 text-sm font-black uppercase tracking-tighter text-background shadow-[6px_6px_0px_0px_rgba(255,255,255,0.35)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Refund policy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
