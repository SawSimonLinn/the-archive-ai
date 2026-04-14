
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
        <section className="relative w-full min-h-[100vh] lg:min-h-[90vh] flex flex-col justify-center lg:justify-end border-b-2 border-foreground overflow-hidden pt-20 lg:pt-0">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
             {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover opacity-10 lg:opacity-20 grayscale"
                priority
                data-ai-hint="brutalist architecture"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          </div>

          <div className="container relative z-10 px-6 mx-auto pb-12 lg:pb-24">
            <div className="grid gap-12 lg:gap-0 lg:grid-cols-12 items-end">
              <div className="lg:col-span-8 space-y-8">
                <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-4 py-1 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Fingerprint className="h-4 w-4" /> Secure & Simple
                </div>
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-headline font-black leading-[0.85] tracking-[-0.07em] uppercase break-words">
                  Smart <br />
                  Documents<span className="text-primary">.</span>
                </h1>
                <p className="max-w-xl text-lg sm:text-xl lg:text-2xl font-medium leading-tight text-muted-foreground border-l-4 border-foreground pl-6 italic">
                  Most AI is confusing. Ours is simple. Turn your unread PDFs into a smart, searchable library you can talk to.
                </p>
              </div>
              
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-foreground text-background p-6 sm:p-8 space-y-6 shadow-[12px_12px_0px_0px_rgba(var(--primary),0.3)] border-2 border-foreground">
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">App Status</p>
                    <p className="text-2xl sm:text-3xl font-headline font-bold leading-none">Over 1M Documents Processed Today</p>
                  </div>
                  <Link href="/auth" className="block">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter rounded-none h-16 text-lg sm:text-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                      Get Started <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono uppercase tracking-widest py-4 border-t border-foreground/20">
                  <span>Fast Response</span>
                  <span>99% Uptime</span>
                  <span>Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Manifesto / Stats Section */}
        <section id="manifesto" className="w-full py-24 bg-foreground text-background border-b-2 border-foreground">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-12">
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-black uppercase leading-none tracking-tighter">
                  Stop Searching.<br />
                  <span className="text-primary">Just Ask.</span>
                </h2>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <span className="text-4xl sm:text-5xl font-headline font-bold block text-primary">0%</span>
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-70">Confusing Errors</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-4xl sm:text-5xl font-headline font-bold block text-primary">100%</span>
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-70">Data Security</p>
                  </div>
                </div>
              </div>
              <div className="text-base sm:text-lg lg:text-xl leading-relaxed font-light text-background/80 space-y-6 lg:border-l lg:border-background/20 lg:pl-12">
                <p>
                  We all have too many files. PDFs that stay unread, notes that get lost, and research that stays hidden in folders. 
                </p>
                <p>
                  <strong className="text-background font-bold uppercase tracking-tighter italic">The Archive</strong> makes your data useful. We read your files and let you ask questions about them as if you were talking to an expert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Industrial Style */}
        <section id="system" className="w-full py-24 border-b-2 border-foreground">
          <div className="container px-6 mx-auto">
            <div className="mb-16 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.5em] text-primary">What we do</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-black uppercase tracking-tighter">Built for Simplicity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-4 border-foreground divide-y-4 md:divide-y-0 md:divide-x-4 divide-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              {[
                { 
                  title: "Smart Search", 
                  desc: "We don't just find words. We understand what your documents are actually about.",
                  icon: Command
                },
                { 
                  title: "Total Privacy", 
                  desc: "Your data is encrypted and never shared. Your secrets stay private.",
                  icon: ShieldCheck
                },
                { 
                  title: "Cite Sources", 
                  desc: "Every AI answer links directly to the page it came from. No more guessing.",
                  icon: Layers
                },
                { 
                  title: "Instant Setup", 
                  desc: "Upload a file and start chatting in seconds. It's that easy.",
                  icon: Zap
                }
              ].map((feat, i) => (
                <div key={i} className="p-8 sm:p-10 group hover:bg-primary transition-colors cursor-default bg-card">
                  <feat.icon className="h-10 w-10 mb-8 transition-transform group-hover:scale-125" />
                  <h3 className="text-xl sm:text-2xl font-headline font-black uppercase mb-4 tracking-tight">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-primary-foreground font-medium">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Massive Typography */}
        <section className="w-full py-24 sm:py-32 overflow-hidden bg-primary border-b-2 border-foreground">
          <div className="container px-6 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-12">
              <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] font-headline font-black uppercase leading-[0.75] lg:leading-[0.7] tracking-[-0.08em] select-none">
                Start <br />
                Now<span className="text-background">.</span>
              </h2>
              <p className="max-w-xl text-lg sm:text-xl font-bold uppercase tracking-tight text-primary-foreground/80 italic">
                Stop searching. Start knowing. Try it today.
              </p>
              <Link href="/auth">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-20 px-12 sm:px-16 text-xl sm:text-2xl font-black uppercase tracking-tighter border-4 border-foreground shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  Start for Free
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
