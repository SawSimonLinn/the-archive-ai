import type { Metadata } from "next";
import Link from "next/link";
import { Database, FileText, KeyRound, Lock, Server, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security | The Archive.ai",
  description:
    "Review The Archive.ai security practices for authentication, document storage, AI processing, billing, and vulnerability reports.",
  alternates: {
    canonical: "/security",
  },
};

const controls = [
  {
    icon: KeyRound,
    title: "Authentication",
    body: "Accounts use Supabase authentication with email/password and OAuth providers. API routes require an authenticated user before returning or mutating account data.",
  },
  {
    icon: Database,
    title: "User-scoped data",
    body: "Document records are tied to user IDs, and document API reads filter data by the authenticated account. Stored files use generated paths instead of user-provided filenames.",
  },
  {
    icon: Lock,
    title: "Transport and storage",
    body: "The production app is designed for HTTPS transport. Database, object storage, secrets, and payment data rely on managed infrastructure controls from Supabase, Vercel, Stripe, and related providers.",
  },
  {
    icon: FileText,
    title: "Document processing",
    body: "Uploaded files are parsed into text, split into searchable chunks, and processed for embeddings and answers. The app sends the minimum document context needed for the requested AI workflow.",
  },
  {
    icon: Server,
    title: "Operational controls",
    body: "Server-only keys stay out of the browser, Stripe webhooks are verified, upload size and rate limits are enforced, and billing state is checked before plan-limited operations.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance posture",
    body: "We do not advertise third-party certifications such as SOC 2 or HIPAA unless they are formally completed. Regulated teams should contact us for a security review before uploading sensitive workloads.",
  },
];

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <ShieldCheck className="h-4 w-4" /> Security overview
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Security <br />
                Practices<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                The Archive.ai is built around authenticated access, user-scoped document records, managed infrastructure, and conservative handling of uploaded document content.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <Lock className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Security contact
              </p>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="mt-4 block break-all text-2xl font-headline font-black tracking-tighter underline decoration-primary decoration-4 underline-offset-4 hover:text-primary"
              >
                {SITE.supportEmail}
              </a>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                Include the affected account, impact, reproduction steps, and whether you accessed any data that was not yours.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {controls.map((control) => (
              <article
                key={control.title}
                className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <control.icon className="h-10 w-10 text-primary" />
                <h2 className="mt-8 text-2xl font-headline font-black uppercase tracking-tighter">
                  {control.title}
                </h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
                  {control.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-foreground px-6 py-16 text-background">
          <div className="container mx-auto grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">
                Responsible disclosure
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-background/70">
                Please do not access, modify, delete, or share data that does not belong to you. Report suspected vulnerabilities with enough detail for us to reproduce and verify the issue.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-flex h-14 items-center justify-center border-2 border-primary bg-primary px-6 text-sm font-black uppercase tracking-tighter text-foreground transition-all hover:translate-x-1 hover:translate-y-1"
              >
                Report issue
              </a>
              <Link
                href="/privacy"
                className="inline-flex h-14 items-center justify-center border-2 border-background/25 px-6 text-sm font-black uppercase tracking-tighter text-background transition-colors hover:border-primary hover:text-primary"
              >
                Privacy policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
