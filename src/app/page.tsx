import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Search, ShieldCheck, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
          <Link className="flex items-center gap-2" href="/">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tighter hidden sm:inline-block">AI Knowledge Assistant</span>
            <span className="font-headline font-bold text-xl tracking-tighter sm:hidden">AI Assistant</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/auth">
              Login
            </Link>
            <Link href="/auth">
              <Button variant="default" className="font-bold">
                Get Started
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/auth">
              <Button size="sm" className="font-bold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden border-b bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
                  Intelligent Document Analysis
                </div>
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Talk to Your <span className="text-accent">Documents.</span> Get Real Answers.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed">
                  The most advanced RAG platform for your personal knowledge base. Upload PDFs, notes, and text files to chat with your data instantly.
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
                  <Link href="/auth">
                    <Button size="lg" className="px-8 font-bold text-base h-12 w-full min-[400px]:w-auto">
                      Start Your Library <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="px-8 font-bold text-base h-12 w-full min-[400px]:w-auto">
                    Learn How it Works
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                        <Image src={`https://picsum.photos/seed/${i + 10}/100/100`} alt="User" width={32} height={32} />
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 2,000+ researchers and students</p>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border bg-card">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-lg hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Fast Processing</p>
                      <p className="text-xs text-muted-foreground">Indexing 100+ pages per minute</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Engineered for Accuracy</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                Our Retrieval-Augmented Generation (RAG) system ensures your AI assistant stays grounded in facts, not hallucinations.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Universal Upload</h3>
                <p className="text-muted-foreground leading-relaxed">Drop PDFs, TXT, or DOCX files. We handle the heavy lifting of parsing and cleaning your content.</p>
              </div>
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Semantic Search</h3>
                <p className="text-muted-foreground leading-relaxed">Our vector engine understands meaning, not just keywords. Find the needle in the haystack instantly.</p>
              </div>
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Private Vault</h3>
                <p className="text-muted-foreground leading-relaxed">Your data is siloed and encrypted. We never train our base models on your personal documents.</p>
              </div>
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Citations Included</h3>
                <p className="text-muted-foreground leading-relaxed">Every answer links back to the exact paragraph in your source document. Verify everything.</p>
              </div>
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Real-time Sync</h3>
                <p className="text-muted-foreground leading-relaxed">Upload a new document and start chatting with it in seconds. No long training times required.</p>
              </div>
              <div className="group relative flex flex-col p-8 rounded-3xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mb-3 font-headline font-bold text-2xl">Knowledge Graph</h3>
                <p className="text-muted-foreground leading-relaxed">Connect dots across multiple documents. Synthesize information from your entire library.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-8 text-center">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Ready to transform your knowledge?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Join the future of document analysis. Free to start, no credit card required.
              </p>
              <Link href="/auth">
                <Button size="lg" className="px-12 py-7 font-bold text-xl rounded-2xl shadow-xl hover:shadow-primary/20 transition-all">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-24 bg-card">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <Link className="flex items-center gap-2" href="/">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-headline font-bold text-xl tracking-tighter">AI Assistant</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The intelligent layer for your personal knowledge base. Empowering you to find answers faster and work smarter.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Enterprise</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Status</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2024 AI Knowledge Assistant. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary">Twitter</Link>
              <Link href="#" className="hover:text-primary">GitHub</Link>
              <Link href="#" className="hover:text-primary">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
