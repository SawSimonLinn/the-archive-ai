import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Fingerprint,
  Archive,
  Command,
  ShieldCheck,
  Layers,
  Zap
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section className="relative w-full min-h-[90vh] flex flex-col justify-end border-b-2 border-foreground overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
             {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover opacity-20 grayscale hover:grayscale-0 transition-all duration-1000"
                priority
                data-ai-hint="brutalist architecture"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          </div>

          <div className="container relative z-10 px-6 mx-auto pb-12 lg:pb-24">
            <div className="grid gap-0 lg:grid-cols-12 items-end">
              <div className="lg:col-span-8 space-y-8">
                <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
                  <Fingerprint className="h-4 w-4" /> System v.4.0.1 Stable
                </div>
                <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-headline font-black leading-[0.85] tracking-[-0.07em] uppercase">
                  Quiet <br />
                  Intelligence<span className="text-primary">.</span>
                </h1>
                <p className="max-w-xl text-xl lg:text-2xl font-medium leading-tight text-muted-foreground border-l-4 border-foreground pl-6 italic">
                  Most AI is loud. Ours is observant. Turn your chaotic document stacks into a living, breathing knowledge ecosystem.
                </p>
              </div>
              
              <div className="lg:col-span-4 mt-12 lg:mt-0 flex flex-col gap-6">
                <div className="bg-foreground text-background p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">Current Status</p>
                    <p className="text-3xl font-headline font-bold leading-none">1,452,089 Documents Indexed Today</p>
                  </div>
                  <Link href="/auth" className="block">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter rounded-none h-16 text-xl">
                      Enter the Vault <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest py-4 border-t border-foreground/20">
                  <span>Latency: 24ms</span>
                  <span>Uptime: 99.99%</span>
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Manifesto / Stats Section */}
        <section id="manifesto" className="w-full py-24 bg-foreground text-background">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <h2 className="text-5xl lg:text-7xl font-headline font-black uppercase leading-none tracking-tighter">
                  We don't search.<br />
                  <span className="text-primary">We Recall.</span>
                </h2>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <span className="text-5xl font-headline font-bold block text-primary">0%</span>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-70">Hallucination Rate</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-5xl font-headline font-bold block text-primary">100%</span>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-70">Source Verifiability</p>
                  </div>
                </div>
              </div>
              <div className="text-lg lg:text-xl leading-relaxed font-light text-background/80 space-y-6 border-l border-background/20 pl-12">
                <p>
                  The modern world is drowning in files. PDFs that go unread, notes that disappear into the cloud, and research that stays siloed in folders. 
                </p>
                <p>
                  <strong className="text-background font-bold uppercase tracking-tighter italic">The Archive</strong> isn't just another chat bot. It's a semantic mirror of your own knowledge. We process your data locally, index it with extreme precision, and allow you to interact with it as if it were a colleague.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Industrial Style */}
        <section id="system" className="w-full py-24 border-b-2 border-foreground">
          <div className="container px-6 mx-auto">
            <div className="mb-20 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">System Capabilities</span>
              <h2 className="text-5xl lg:text-6xl font-headline font-black uppercase tracking-tighter">The Architecture of Insight</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-2 border-foreground divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-foreground">
              {[
                { 
                  title: "Semantic DNA", 
                  desc: "We don't use keywords. We understand the conceptual relationship between every sentence in your library.",
                  icon: Command
                },
                { 
                  title: "Cold Storage", 
                  desc: "Your data is encrypted at rest and never used for training. Your secrets remain your secrets.",
                  icon: ShieldCheck
                },
                { 
                  title: "Traceable Logic", 
                  desc: "Every answer comes with a direct link to the source document. No guessing, just facts.",
                  icon: Layers
                },
                { 
                  title: "Instant Sync", 
                  desc: "Upload a file and it's indexed in milliseconds. Your assistant is always up to date.",
                  icon: Zap
                }
              ].map((feat, i) => (
                <div key={i} className="p-10 group hover:bg-primary transition-colors cursor-default">
                  <feat.icon className="h-10 w-10 mb-8 transition-transform group-hover:scale-125" />
                  <h3 className="text-2xl font-headline font-black uppercase mb-4 tracking-tight">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-primary-foreground">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Massive Typography */}
        <section className="w-full py-32 overflow-hidden bg-primary">
          <div className="container px-6 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-12">
              <h2 className="text-7xl md:text-9xl lg:text-[14rem] font-headline font-black uppercase leading-[0.7] tracking-[-0.08em] select-none">
                Start <br />
                Indexing<span className="text-background">.</span>
              </h2>
              <p className="max-w-xl text-xl font-bold uppercase tracking-tight text-primary-foreground/80">
                Stop searching. Start knowing. Join the index today.
              </p>
              <Link href="/auth">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-20 px-16 text-2xl font-black uppercase tracking-tighter">
                  Access the Archive
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
