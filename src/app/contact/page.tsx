import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, LifeBuoy, Lock, Mail, ShieldAlert } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | The Archive.ai",
  description:
    "Contact The Archive.ai for product support, billing questions, privacy requests, and security reports.",
  alternates: {
    canonical: "/contact",
  },
};

const contactTopics = [
  {
    icon: LifeBuoy,
    title: "Product support",
    description: "Upload issues, document processing, search results, account access, and workspace questions.",
    response: "Typical response: 1-2 business days",
  },
  {
    icon: CreditCard,
    title: "Billing support",
    description: "Plan changes, failed payments, invoices, cancellations, and refund requests.",
    response: "Include the email used on your account",
  },
  {
    icon: Lock,
    title: "Privacy requests",
    description: "Data export, deletion, correction, or questions about how document content is processed.",
    response: "Identity verification may be required",
  },
  {
    icon: ShieldAlert,
    title: "Security reports",
    description: "Responsible disclosure reports for suspected vulnerabilities or account security issues.",
    response: "Include reproduction steps and impact",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <Mail className="h-4 w-4" /> Support channel
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Contact <br />
                The Archive<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                Use this page for product support, billing questions, privacy requests, and security reports.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Primary email
              </p>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="mt-4 block break-all text-2xl font-headline font-black tracking-tighter underline decoration-primary decoration-4 underline-offset-4 hover:text-primary"
              >
                {SITE.supportEmail}
              </a>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                For faster help, include your account email, document name if relevant, and the action you were trying to complete.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-6 md:grid-cols-2">
            {contactTopics.map((topic) => (
              <div
                key={topic.title}
                className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <topic.icon className="h-9 w-9 text-primary" />
                <h2 className="mt-8 text-2xl font-headline font-black uppercase tracking-tighter">
                  {topic.title}
                </h2>
                <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
                <p className="mt-6 border-t-2 border-foreground/10 pt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {topic.response}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-primary px-6 py-16">
          <div className="container mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">
                Need account or billing tools?
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                Signed-in users can manage documents, plans, and billing from the dashboard.
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex h-14 items-center justify-center gap-2 border-2 border-foreground bg-foreground px-6 text-sm font-black uppercase tracking-tighter text-background shadow-[6px_6px_0px_0px_rgba(255,255,255,0.35)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Open settings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
