import type { Metadata } from "next";
import { Activity, AlertCircle, CheckCircle2, Clock, Mail } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "System Status | The Archive.ai",
  description:
    "Public status information for The Archive.ai web app, document uploads, AI answers, and billing.",
  alternates: {
    canonical: "/uptime",
  },
};

const systems = [
  {
    name: "Web app",
    status: "Operational",
    details: "Public pages, authentication entry points, dashboard navigation, and account settings.",
  },
  {
    name: "Document uploads",
    status: "Operational",
    details: "PDF, TXT, and DOCX upload flow, text extraction, and document metadata storage.",
  },
  {
    name: "AI answers",
    status: "Operational",
    details: "Document analysis, embeddings, vector search, and cited chat responses.",
  },
  {
    name: "Billing",
    status: "Operational",
    details: "Stripe checkout, customer portal, subscription updates, and webhook processing.",
  },
];

const responseSteps = [
  "Confirm whether the issue affects authentication, upload processing, chat responses, or billing.",
  "Post a user-facing update on this page when the issue is confirmed and user impact is clear.",
  "Prioritize account safety, data integrity, and paid-plan access before non-critical fixes.",
  "Publish a short resolution note after the incident is mitigated.",
];

export default function UptimePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <Activity className="h-4 w-4" /> Public status
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                System <br />
                Status<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                Service availability for the web app, document processing, AI answers, and billing.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-primary p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="h-10 w-10" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary-foreground/70">
                Current summary
              </p>
              <p className="mt-2 text-4xl font-headline font-black tracking-tighter">
                Operational
              </p>
              <p className="mt-5 text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                Last reviewed {SITE.policyUpdatedAt}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-6 md:grid-cols-2">
            {systems.map((system) => (
              <article
                key={system.name}
                className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">
                    {system.name}
                  </h2>
                  <span className="inline-flex items-center gap-2 bg-primary px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {system.status}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                  {system.details}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y-2 border-foreground bg-foreground px-6 py-16 text-background">
          <div className="container mx-auto grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-3 bg-primary px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                <Clock className="h-4 w-4" /> Incident process
              </div>
              <h2 className="mt-6 text-3xl font-headline font-black uppercase tracking-tighter">
                How updates are handled
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-background/65">
                This page is the public status record until a dedicated automated status provider is connected.
              </p>
            </div>
            <ol className="lg:col-span-8 grid gap-4">
              {responseSteps.map((step, index) => (
                <li key={step} className="flex gap-5 border-2 border-background/15 p-5">
                  <span className="font-mono text-xs font-black text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-background/75">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="container mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-1 h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">
                  Experiencing an issue?
                </h2>
                <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
                  Send the affected account, approximate time, browser, and whether the issue is upload, chat, auth, or billing related.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="inline-flex h-14 items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 text-sm font-black uppercase tracking-tighter text-background transition-colors hover:bg-primary hover:text-foreground"
            >
              Contact support <Mail className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
