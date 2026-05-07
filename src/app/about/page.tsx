import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  Code2,
  FileSearch,
  Github,
  Globe2,
  Linkedin,
  Lock,
  Mail,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About | The Archive.ai",
  description:
    "Learn what The Archive.ai does, who it is built for, and how it turns private documents into searchable, cited answers.",
  alternates: {
    canonical: "/about",
  },
};

const principles = [
  {
    icon: FileSearch,
    title: "Answers must point back to sources",
    body: "The Archive.ai is built around source-grounded document search. The product should help users inspect the original material, not replace it with unsupported claims.",
  },
  {
    icon: Lock,
    title: "Private documents deserve restraint",
    body: "Uploaded documents are treated as user content. We collect and process what is needed to run the archive, enforce limits, and answer questions against each account's files.",
  },
  {
    icon: ScanSearch,
    title: "Search should work like thinking",
    body: "Most files are written for reading, not retrieval. The Archive.ai extracts text, chunks documents, creates embeddings, and makes the library easier to interrogate.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Upload",
    body: "Add supported PDF, TXT, or DOCX files from the dashboard.",
  },
  {
    step: "02",
    title: "Index",
    body: "The app extracts readable text, creates document chunks, and prepares semantic search.",
  },
  {
    step: "03",
    title: "Ask",
    body: "Chat with your archive and use cited answers to move back into the source material.",
  },
  {
    step: "04",
    title: "Manage",
    body: "Control documents, plan limits, and billing from the authenticated workspace.",
  },
];

const audiences = [
  "Researchers organizing long PDFs and source notes.",
  "Operators who need quick answers from internal reference material.",
  "Founders and teams reviewing contracts, reports, policies, and support docs.",
  "Students and professionals turning scattered files into a searchable library.",
];

const founderLinks = [
  { label: "GitHub", href: SITE.githubProfileUrl, icon: Github },
  { label: "LinkedIn", href: SITE.founderLinkedInUrl, icon: Linkedin },
  { label: "Portfolio", href: SITE.founderWebsiteUrl, icon: Globe2 },
  { label: "Studio", href: SITE.studioUrl, icon: Building2 },
  { label: "Email", href: `mailto:${SITE.founderEmail}`, icon: Mail },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-6 border-l-8 border-primary pl-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <BookOpenCheck className="h-4 w-4" /> About The Archive.ai
              </div>
              <h1 className="text-5xl font-headline font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Documents <br />
                You Can Ask<span className="text-primary">.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                The Archive.ai turns private document collections into searchable, source-grounded answers for people who need to understand files faster.
              </p>
            </div>

            <div className="lg:col-span-4 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <BrainCircuit className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Product focus
              </p>
              <p className="mt-3 text-3xl font-headline font-black uppercase leading-none tracking-tighter">
                Private document intelligence
              </p>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                Built for upload, analysis, semantic retrieval, and cited chat over files owned by the user.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-foreground px-6 py-20 text-background">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Why it exists
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter sm:text-5xl">
                Files should not become forgotten storage.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-base font-medium leading-relaxed text-background/75 sm:text-lg">
              <p>
                Useful information often gets buried inside PDFs, reports, notes, policies, and reference documents. Traditional search helps when you know the exact word to look for. It is weaker when you need the meaning of a passage, a summary of an argument, or the source behind an answer.
              </p>
              <p>
                The Archive.ai is designed to make a personal or team document library easier to question. It extracts text, indexes meaning, and gives users a faster path back to the original evidence.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto">
            <div className="mb-12 max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Operating principles
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase tracking-tighter sm:text-5xl">
                Built around source trust.
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {principles.map((principle) => (
                <article
                  key={principle.title}
                  className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <principle.icon className="h-10 w-10 text-primary" />
                  <h3 className="mt-8 text-2xl font-headline font-black uppercase tracking-tighter">
                    {principle.title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
                    {principle.body}
                  </p>
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
                  How it works
                </p>
                <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                  From upload to answer.
                </h2>
              </div>
            </div>

            <div className="lg:col-span-8 grid gap-5">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="grid gap-5 border-4 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-[72px_1fr]"
                >
                  <div className="flex h-14 w-14 items-center justify-center bg-foreground font-headline text-xl font-black text-background">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
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
            <div className="lg:col-span-5 border-4 border-foreground bg-primary p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck className="h-10 w-10" />
              <h2 className="mt-8 text-4xl font-headline font-black uppercase leading-none tracking-tighter">
                Designed for practical knowledge work.
              </h2>
              <p className="mt-5 text-sm font-bold uppercase tracking-tight text-primary-foreground/75">
                Not a generic chatbot. Not a public search engine. A workspace for asking your own material better questions.
              </p>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">
                Who uses it
              </h2>
              <div className="mt-6 grid gap-4">
                {audiences.map((audience) => (
                  <div key={audience} className="border-2 border-foreground bg-card p-5 text-sm font-black uppercase tracking-tight">
                    {audience}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground px-6 py-20">
          <div className="container mx-auto grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Who builds it
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-tighter sm:text-5xl">
                Built by a visible developer.
              </h2>
              <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                The Archive.ai is an open-source document intelligence product built by {SITE.founderName}, the developer behind {SITE.studioName}. The product stays focused on practical workflows, inspectable source code, and direct contact.
              </p>
            </div>

            <div className="lg:col-span-5 border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <Code2 className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Founder / builder
              </p>
              <h3 className="mt-3 text-3xl font-headline font-black uppercase leading-none tracking-tighter">
                {SITE.founderName}
              </h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
                Independent software builder focused on useful AI products, web systems, and private document workflows.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {founderLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="inline-flex h-12 items-center justify-center gap-2 border-2 border-foreground px-4 text-xs font-black uppercase tracking-tighter transition-colors hover:bg-primary"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground bg-foreground px-6 py-16 text-background">
          <div className="container mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-background/45">
                {SITE.domain}
              </p>
              <h2 className="mt-3 text-3xl font-headline font-black uppercase tracking-tighter">
                Build your archive.
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-background/70">
                Start with a few documents, ask your first question, and decide whether the workflow fits your research or team process.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex h-14 items-center justify-center gap-2 border-2 border-primary bg-primary px-6 text-sm font-black uppercase tracking-tighter text-foreground transition-all hover:translate-x-1 hover:translate-y-1"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-14 items-center justify-center border-2 border-background/25 px-6 text-sm font-black uppercase tracking-tighter text-background transition-colors hover:border-primary hover:text-primary"
              >
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
