import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Check,
  Command,
  FileCheck2,
  FileSearch,
  Fingerprint,
  Github,
  Globe2,
  Layers,
  Linkedin,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site';

const proofSignals = [
  {
    label: 'Open source',
    value: 'Public codebase',
    body: 'Inspect the product, deployment shape, and security posture before trusting it with important documents.',
    href: SITE.repositoryUrl,
    icon: Github,
  },
  {
    label: 'Accountable builder',
    value: SITE.founderName,
    body: `Built by the founder behind ${SITE.studioName}, with direct profile links instead of anonymous product claims.`,
    href: SITE.founderLinkedInUrl,
    icon: Linkedin,
  },
  {
    label: 'Grounded answers',
    value: 'Citations first',
    body: 'Responses are designed around retrieved document context so users can move from answer back to source.',
    href: '/features#source-citations',
    icon: FileCheck2,
  },
  {
    label: 'Private workspace',
    value: 'User-scoped files',
    body: 'Authentication, dashboard access, and document boundaries keep the archive focused on your own files.',
    href: '/security',
    icon: Lock,
  },
];

const audienceCards = [
  {
    title: 'Founders and operators',
    body: 'Pull answers from policies, vendor docs, investor notes, and internal references without digging through folders.',
    icon: Building2,
  },
  {
    title: 'Researchers and students',
    body: 'Turn long PDFs and notes into a working archive that can answer detailed questions with source context.',
    icon: FileSearch,
  },
  {
    title: 'Support and client teams',
    body: 'Find the right detail inside contracts, manuals, onboarding docs, and account material faster.',
    icon: Users,
  },
];

const featureCards = [
  {
    title: 'Smart search',
    desc: 'Meaning-based retrieval helps find the point you need even when the exact keyword is missing.',
    icon: Command,
  },
  {
    title: 'Total privacy',
    desc: 'Your archive is tied to your account and built around private document access patterns.',
    icon: ShieldCheck,
  },
  {
    title: 'Cite sources',
    desc: 'AI answers are designed to stay grounded in the uploaded documents that shaped them.',
    icon: Layers,
  },
  {
    title: 'Instant setup',
    desc: 'Start with one file, ask your first question, and upgrade only when the archive grows.',
    icon: Zap,
  },
];

const comparisonRows = [
  ['Folder search', 'Ask across the archive'],
  ['Long skim sessions', 'Short cited answers'],
  ['Generic chatbot', 'Responses shaped by your files'],
  ['Hard-to-check output', 'Source context stays visible'],
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative flex min-h-[calc(100svh-5.125rem)] overflow-hidden border-b-2 border-foreground py-5 sm:py-10 lg:py-0">
          <div className="absolute inset-0 z-0">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover opacity-10 grayscale sm:opacity-15"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto grid max-w-7xl gap-5 px-6 sm:gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 sm:space-y-6 lg:col-span-8 xl:space-y-8">
              <div className="inline-flex items-center gap-3 bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:px-4 sm:text-xs">
                <Fingerprint className="h-4 w-4" /> Secure & simple
              </div>
              <h1 className="max-w-5xl text-[2.75rem] font-headline font-black uppercase leading-[0.82] tracking-normal sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8rem] 2xl:text-[9.5rem]">
                <span className="block">Smart</span>
                <span className="block">
                  Documents<span className="text-primary">.</span>
                </span>
              </h1>
              <p className="max-w-2xl border-l-4 border-foreground pl-5 text-base font-medium leading-tight text-muted-foreground sm:text-xl lg:text-2xl">
                Turn unread PDFs, docs, and notes into a private searchable library you can talk to, with cited answers you can verify.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4 lg:pt-24">
              <div className="border-2 border-foreground bg-foreground p-4 text-background shadow-[10px_10px_0px_0px_hsl(var(--primary))] sm:p-7">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-background/45">
                  Archive status
                </p>
                <h2 className="mt-3 text-2xl font-headline font-black uppercase leading-none tracking-normal sm:mt-4 sm:text-4xl lg:text-5xl">
                  Upload. Ask. Verify.
                </h2>
                <p className="mt-3 text-xs font-medium leading-relaxed text-background/65 sm:mt-4 sm:text-base">
                  Start with a few files and get source-aware answers without building a document system yourself.
                </p>
                <Link href="/auth" className="mt-4 block sm:mt-6">
                  <Button size="lg" className="h-12 w-full rounded-none border-2 border-foreground bg-primary text-base font-black uppercase tracking-normal text-primary-foreground shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-primary/90 hover:shadow-none sm:h-16 sm:text-lg">
                    Get started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="hidden grid-cols-3 gap-3 border-t border-foreground/25 pt-4 text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground sm:grid sm:text-[10px]">
                <span>Fast setup</span>
                <span className="text-center">Cited answers</span>
                <span className="text-right">Private archive</span>
              </div>
              <Link href="/features" className="hidden w-fit items-center gap-2 text-xs font-black uppercase tracking-widest underline decoration-primary decoration-4 underline-offset-4 transition-colors hover:text-primary sm:inline-flex">
                See how it works <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section id="proof" className="border-b-2 border-foreground px-6 py-12">
          <div className="container mx-auto">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                  Proof and trust
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-headline font-black uppercase leading-none tracking-normal sm:text-5xl">
                  Built to be checked before it is trusted.
                </h2>
              </div>
              <Link href="/about" className="inline-flex w-fit items-center gap-2 border-2 border-foreground px-5 py-3 text-sm font-black uppercase tracking-normal transition-colors hover:bg-primary">
                About the builder <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              {proofSignals.map((signal) => (
                <Link key={signal.label} href={signal.href} target={signal.href.startsWith('http') ? '_blank' : undefined} rel={signal.href.startsWith('http') ? 'noreferrer' : undefined} className="group border-2 border-foreground bg-card p-5 transition-colors hover:bg-primary">
                  <div className="mb-8 flex h-12 w-12 items-center justify-center border-2 border-foreground bg-background transition-transform group-hover:-rotate-3">
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground group-hover:text-primary-foreground/70">
                    {signal.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-headline font-black uppercase leading-none tracking-normal">
                    {signal.value}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground group-hover:text-primary-foreground/80">
                    {signal.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="who" className="border-b-2 border-foreground px-6 py-20">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                  Who it helps
                </p>
                <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-normal sm:text-5xl">
                  For people buried in important files.
                </h2>
                <p className="mt-5 text-base font-medium leading-relaxed text-muted-foreground">
                  The product is for work where the answer matters, the source matters, and manually searching takes too long.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:col-span-8">
              {audienceCards.map((audience, index) => (
                <article key={audience.title} className="grid gap-5 border-4 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-[72px_1fr]">
                  <div className={cn('flex h-14 w-14 items-center justify-center border-2 border-foreground', index === 0 ? 'bg-primary' : index === 1 ? 'bg-foreground text-background' : 'bg-muted')}>
                    <audience.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-headline font-black uppercase leading-none tracking-normal">
                      {audience.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                      {audience.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="border-b-2 border-foreground bg-foreground px-6 py-20 text-background">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Why it is easier
              </p>
              <h2 className="mt-5 text-4xl font-headline font-black uppercase leading-none tracking-normal sm:text-6xl">
                Less hunting. More knowing.
              </h2>
              <p className="mt-6 text-base font-medium leading-relaxed text-background/70 sm:text-lg">
                The Archive.ai removes the usual steps between having a file and using the knowledge inside it: no scattered folders, no generic answers, no blind trust in unsourced output.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="border-4 border-background bg-background text-foreground">
                <div className="grid grid-cols-[1fr_1fr] border-b-4 border-foreground bg-primary text-sm font-black uppercase tracking-normal sm:text-base">
                  <div className="border-r-4 border-foreground p-4">Old way</div>
                  <div className="p-4">Archive way</div>
                </div>
                {comparisonRows.map(([oldWay, archiveWay], index) => (
                  <div key={oldWay} className={cn('grid grid-cols-[1fr_1fr] text-sm font-bold uppercase tracking-normal sm:text-base', index !== comparisonRows.length - 1 && 'border-b-2 border-foreground')}>
                    <div className="border-r-2 border-foreground p-4 text-muted-foreground">
                      {oldWay}
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {archiveWay}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="system" className="w-full border-b-2 border-foreground py-24">
          <div className="container mx-auto px-6">
            <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                  What the product does
                </span>
                <h2 className="text-4xl font-headline font-black uppercase tracking-normal sm:text-5xl lg:text-6xl">
                  One workflow for document intelligence.
                </h2>
              </div>
              <Link href="/features" className="inline-flex w-fit items-center gap-2 border-2 border-foreground bg-foreground px-5 py-3 text-sm font-black uppercase tracking-normal text-background transition-colors hover:bg-primary hover:text-foreground">
                Explore feature details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 divide-y-4 divide-foreground border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:grid-cols-2 md:divide-x-4 md:divide-y-0 lg:grid-cols-4">
              {featureCards.map((feat) => (
                <div key={feat.title} className="group cursor-default bg-card p-8 transition-colors hover:bg-primary sm:p-10">
                  <feat.icon className="mb-8 h-10 w-10 transition-transform group-hover:scale-125" />
                  <h3 className="mb-4 text-2xl font-headline font-black uppercase tracking-normal">
                    {feat.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground group-hover:text-primary-foreground">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full border-b-2 border-foreground py-24">
          <div className="container mx-auto px-6">
            <div className="mb-16 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">
                Pricing
              </span>
              <h2 className="text-4xl font-headline font-black uppercase tracking-normal sm:text-5xl lg:text-6xl">
                Start free<span className="text-primary">.</span>
              </h2>
              <p className="max-w-lg text-base font-medium text-muted-foreground sm:text-lg">
                Try the product with a small archive, then upgrade when your document work needs more room.
              </p>
            </div>

            <div className="mb-10 grid gap-5 md:grid-cols-3">
              {(['free', 'pro', 'team'] as const).map((planId) => {
                const plan = PLANS[planId];
                const Icon = planId === 'free' ? Shield : planId === 'pro' ? Zap : Users;
                const isPro = planId === 'pro';

                return (
                  <div
                    key={planId}
                    className={cn(
                      'relative flex flex-col gap-6 border-2 p-6',
                      isPro
                        ? 'border-primary bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-foreground bg-card'
                    )}
                  >
                    {isPro && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-foreground bg-primary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground">
                        <Sparkles className="mr-1 inline h-2.5 w-2.5" />
                        Most popular
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className={cn('flex h-10 w-10 items-center justify-center border-2 border-foreground', isPro ? 'bg-primary' : 'bg-muted')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-headline text-xl font-black uppercase tracking-normal">
                          {plan.name}
                        </p>
                        <div className="mt-1 flex items-baseline gap-1">
                          {plan.price === 0 ? (
                            <span className="font-headline text-4xl font-black tracking-normal">
                              Free
                            </span>
                          ) : (
                            <>
                              <span className="font-headline text-4xl font-black tracking-normal">
                                ${plan.price}
                              </span>
                              <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-50">
                                /mo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <ul className="flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm font-medium">
                          <Check className={cn('mt-0.5 h-4 w-4 shrink-0', isPro ? 'text-primary' : 'text-foreground')} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href="/auth">
                      <Button
                        className={cn(
                          'h-11 w-full rounded-none border-2 border-foreground text-sm font-black uppercase tracking-normal transition-all',
                          isPro
                            ? 'bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                            : 'bg-foreground text-background hover:bg-foreground/80'
                        )}
                      >
                        {plan.price === 0 ? 'Start free' : `Upgrade to ${plan.name}`} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/plans" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest opacity-60 underline underline-offset-4 transition-opacity hover:opacity-100">
                View full comparison and FAQ <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b-2 border-foreground bg-primary py-20 sm:py-24">
          <div className="container relative mx-auto px-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-primary-foreground/60">
                Ready to try
              </p>
              <h2 className="text-5xl font-headline font-black uppercase leading-[0.82] tracking-normal sm:text-7xl lg:text-8xl">
                Build your first smart archive<span className="text-background">.</span>
              </h2>
              <p className="max-w-2xl text-base font-bold uppercase tracking-normal text-primary-foreground/75 sm:text-lg">
                Upload a few documents, ask a real question, and verify whether cited answers fit your workflow.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth">
                  <Button size="lg" className="h-16 rounded-none border-4 border-foreground bg-foreground px-10 text-lg font-black uppercase tracking-normal text-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-foreground/90 hover:shadow-none">
                    Start for free
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="outline" size="lg" className="h-16 rounded-none border-4 border-foreground bg-primary px-10 text-lg font-black uppercase tracking-normal hover:bg-background">
                    Compare plans
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  { label: 'GitHub', href: SITE.githubProfileUrl, icon: Github },
                  { label: 'LinkedIn', href: SITE.founderLinkedInUrl, icon: Linkedin },
                  { label: 'Studio', href: SITE.studioUrl, icon: Globe2 },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 border-2 border-foreground px-3 text-[10px] font-black uppercase tracking-normal transition-colors hover:bg-background"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
