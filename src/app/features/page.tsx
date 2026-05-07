import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  Check,
  Clock3,
  Command,
  DatabaseZap,
  FileCheck2,
  FileSearch,
  FileText,
  Fingerprint,
  Layers,
  ScanText,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features | The Archive.ai",
  description:
    "Explore The Archive.ai features for document upload, semantic search, cited AI answers, privacy controls, and fast document intelligence workflows.",
  alternates: {
    canonical: "/features",
  },
};

const featureDetails = [
  {
    id: "smart-search",
    eyebrow: "Semantic retrieval",
    title: "Smart Search",
    body: "Find the idea you need even when the exact words are different. The Archive.ai extracts readable text, chunks documents, embeds meaning, and searches across your private library before generating an answer.",
    icon: Command,
    checks: [
      "Natural-language questions over uploaded files",
      "Meaning-based matching instead of keyword-only lookup",
      "Search context prepared for grounded AI responses",
    ],
  },
  {
    id: "source-citations",
    eyebrow: "Grounded answers",
    title: "Source Citations",
    body: "Every useful answer should give you a path back to the original document. Cited responses make it easier to inspect evidence, verify claims, and keep the source material in view.",
    icon: Layers,
    checks: [
      "Answers based on retrieved document context",
      "Clear source references for follow-up reading",
      "Designed to reduce unsupported AI output",
    ],
  },
  {
    id: "private-archive",
    eyebrow: "Data restraint",
    title: "Private Archive",
    body: "Your archive is built around account-scoped documents. Authentication, server-side document access, and storage boundaries keep private files from becoming public search material.",
    icon: ShieldCheck,
    checks: [
      "Authenticated dashboard for document management",
      "Account-specific document access patterns",
      "Security-first product copy and policy pages",
    ],
  },
  {
    id: "instant-setup",
    eyebrow: "Fast onboarding",
    title: "Instant Setup",
    body: "Start with one file, wait for analysis, and ask your first question. The workflow is intentionally direct so the product feels like a tool, not a configuration project.",
    icon: Zap,
    checks: [
      "Upload flow for PDF, TXT, and DOCX files",
      "Automated text extraction and analysis pipeline",
      "Chat interface built around your document set",
    ],
  },
];

const workflow = [
  {
    step: "01",
    title: "Upload documents",
    body: "Add supported files from the dashboard and keep them organized inside your account.",
    icon: UploadCloud,
  },
  {
    step: "02",
    title: "Extract and prepare",
    body: "The system reads document text and prepares it for analysis, retrieval, and chat.",
    icon: ScanText,
  },
  {
    step: "03",
    title: "Ask better questions",
    body: "Use natural language to search across your library and get answers shaped by your files.",
    icon: BotMessageSquare,
  },
  {
    step: "04",
    title: "Verify the source",
    body: "Move from an answer back into the supporting document context when the details matter.",
    icon: FileCheck2,
  },
];

const capabilityRows = [
  ["Document uploads", "PDF, TXT, and DOCX support for practical knowledge work"],
  ["Initial analysis", "Automatic summaries that make new files easier to understand"],
  ["Archive chat", "Ask questions across uploaded documents from one workspace"],
  ["Plan limits", "Usage limits and upgrade paths built into the product"],
  ["Billing portal", "Subscription management for paid plans"],
  ["Security posture", "Privacy, terms, refund, uptime, and security pages included"],
];

const useCases = [
  "Review long reports without losing the original source.",
  "Ask policies and internal references direct questions.",
  "Turn research PDFs into a searchable working library.",
  "Find contract, compliance, or support details faster.",
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          <div className="container relative mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="space-y-7 border-l-8 border-primary pl-8 lg:col-span-7">
              <div className="inline-flex items-center gap-3 bg-primary px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Fingerprint className="h-4 w-4" /> Feature Details
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Built to make files answerable<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                The Archive.ai combines upload, extraction, semantic search, cited chat, and account controls into one workflow for private document intelligence.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth">
                  <Button className="h-14 rounded-none border-2 border-foreground px-6 font-black uppercase tracking-tighter shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                    Start free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="outline" className="h-14 rounded-none border-2 border-foreground px-6 font-black uppercase tracking-tighter">
                    Compare plans
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="border-4 border-foreground bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between border-b-4 border-foreground bg-foreground px-5 py-4 text-background">
                  <div className="flex items-center gap-3">
                    <DatabaseZap className="h-5 w-5 text-primary" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background/65">
                      Archive Engine
                    </span>
                  </div>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4 p-5 sm:p-7">
                  {[
                    { label: "Upload", value: "7 docs", icon: FileText },
                    { label: "Index", value: "Ready", icon: Clock3 },
                    { label: "Ask", value: "Cited", icon: FileSearch },
                  ].map((item, index) => (
                    <div key={item.label} className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-2 border-foreground bg-background p-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center border-2 border-foreground", index === 1 ? "bg-primary" : "bg-muted")}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-headline text-xl font-black uppercase tracking-tighter">
                          {item.label}
                        </p>
                        <div className="mt-2 h-2 border border-foreground bg-muted">
                          <div className={cn("h-full bg-primary", index === 0 ? "w-3/4" : "w-full")} />
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <div className="border-2 border-foreground bg-foreground p-5 text-background">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-background/45">
                      Example prompt
                    </p>
                    <p className="mt-3 text-2xl font-headline font-black uppercase leading-none tracking-tighter">
                      What does the report say about risk?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-foreground px-6 py-20 text-background">
          <div className="container mx-auto grid gap-8 md:grid-cols-4">
            {[
              ["4", "Core feature pillars"],
              ["3", "Supported file types"],
              ["1", "Private archive workspace"],
              ["24/7", "Self-serve access"],
            ].map(([value, label]) => (
              <div key={label} className="border-l-4 border-primary pl-5">
                <p className="text-5xl font-headline font-black uppercase tracking-tighter text-primary">
                  {value}
                </p>
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background/55">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto">
            <div className="mb-12 max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Core features
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter sm:text-5xl">
                The details behind the homepage cards.
              </h2>
            </div>

            <div className="grid gap-6">
              {featureDetails.map((feature, index) => (
                <article
                  id={feature.id}
                  key={feature.id}
                  className="grid gap-8 border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scroll-mt-28 lg:grid-cols-12 lg:p-8"
                >
                  <div className="lg:col-span-4">
                    <div className={cn("flex h-16 w-16 items-center justify-center border-2 border-foreground", index % 2 === 0 ? "bg-primary" : "bg-foreground text-background")}>
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <p className="mt-8 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                      {feature.eyebrow}
                    </p>
                    <h3 className="mt-3 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                      {feature.title}
                    </h3>
                  </div>
                  <div className="lg:col-span-5">
                    <p className="text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                      {feature.body}
                    </p>
                  </div>
                  <ul className="space-y-3 lg:col-span-3">
                    {feature.checks.map((check) => (
                      <li key={check} className="flex items-start gap-3 text-sm font-bold uppercase tracking-tight">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y-2 border-foreground px-6 py-20">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                  Workflow
                </p>
                <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                  One path from file to answer.
                </h2>
              </div>
            </div>

            <div className="grid gap-5 lg:col-span-8">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="grid gap-5 border-4 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-[72px_1fr]"
                >
                  <div className="flex h-14 w-14 items-center justify-center bg-primary font-headline text-xl font-black text-foreground">
                    {item.step}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <item.icon className="h-6 w-6 text-primary" />
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="border-4 border-foreground bg-primary p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:col-span-5">
              <SlidersHorizontal className="h-10 w-10" />
              <h2 className="mt-8 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                Built for practical document work.
              </h2>
              <p className="mt-5 text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                The page-level feature set is focused on what users do every day: upload files, ask questions, verify answers, and manage access.
              </p>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">
                Capability map
              </h2>
              <div className="mt-6 border-4 border-foreground bg-card">
                {capabilityRows.map(([label, value], index) => (
                  <div
                    key={label}
                    className={cn(
                      "grid gap-3 p-5 sm:grid-cols-[220px_1fr]",
                      index !== capabilityRows.length - 1 && "border-b-2 border-foreground"
                    )}
                  >
                    <p className="font-headline text-xl font-black uppercase tracking-tighter">
                      {label}
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-foreground px-6 py-20 text-background">
          <div className="container mx-auto grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Use cases
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                Where the features help.
              </h2>
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <div key={useCase} className="border-2 border-background/30 p-5 text-sm font-black uppercase tracking-tight text-background/80">
                  {useCase}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-primary px-6 py-16">
          <div className="container mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary-foreground/60">
                Ready for your first archive
              </p>
              <h2 className="mt-3 text-4xl font-headline font-black uppercase tracking-tighter">
                Upload. Ask. Verify.
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                Start with a few documents and see whether source-cited answers fit your workflow.
              </p>
            </div>
            <Link href="/auth">
              <Button className="h-14 rounded-none border-2 border-foreground bg-foreground px-7 font-black uppercase tracking-tighter text-background hover:bg-foreground/90">
                Try the features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
