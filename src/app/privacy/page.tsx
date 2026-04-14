import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Fingerprint, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />
      
      <main className="flex-1 container px-6 mx-auto py-24">
        <div className="max-w-4xl space-y-16">
          <div className="space-y-6 border-l-8 border-primary pl-8">
            <div className="inline-flex items-center gap-3 bg-foreground text-background px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Protocol: Privacy_01
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">
              Privacy <br />
              Manifesto<span className="text-primary">.</span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground max-w-2xl">
              Your data is your intelligence. We operate on a Zero-Knowledge architecture where your proprietary documents are yours alone.
            </p>
          </div>

          <div className="grid gap-12">
            {[
              {
                title: "Data Sovereignty",
                content: "We do not own your data. Every document you upload remains your exclusive property. We do not sell, share, or lease your semantic vectors to third parties."
              },
              {
                title: "Cold Storage Indexing",
                content: "Our system utilizes isolated processing nodes. Once indexed, your data is stored in encrypted semantic vaults that are only accessible via your unique identity token."
              },
              {
                title: "No-Train Guarantee",
                content: "Your documents are never used to train global LLMs. All retrieval happens within your secure system partition."
              },
              {
                title: "PURGE Protocol",
                content: "When you terminate your session or delete a unit, the data is wiped from our primary and backup semantic caches within 18 milliseconds of the request."
              }
            ].map((section, i) => (
              <div key={i} className="border-4 border-foreground p-10 bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:bg-primary transition-colors">
                <h2 className="text-3xl font-headline font-black uppercase mb-6 tracking-tight group-hover:text-foreground">{section.title}</h2>
                <p className="text-lg leading-relaxed text-muted-foreground group-hover:text-foreground font-medium">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
