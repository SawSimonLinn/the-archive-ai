
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Search, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tighter">AI Knowledge Assistant</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link href="/auth">
            <Button variant="default" className="font-medium bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Documents. <span className="text-accent">Perfect Answers.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  A Retrieval-Augmented Generation (RAG) platform that allows you to chat with your PDF, text, and notes. No hallucinations, just facts from your own data.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth">
                  <Button size="lg" className="px-8 font-bold">
                    Start Analyzing Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-card">
                <FileText className="h-10 w-10 text-primary" />
                <h2 className="text-xl font-headline font-bold">Easy Upload</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Drag and drop PDFs, notes, or text files directly into your personal workspace.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-card">
                <ShieldCheck className="h-10 w-10 text-primary" />
                <h2 className="text-xl font-headline font-bold">Privacy First</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Each user has their own secure storage and isolated vector database.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-card">
                <Search className="h-10 w-10 text-primary" />
                <h2 className="text-xl font-headline font-bold">Semantic Search</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Our RAG engine retrieves the most relevant context from your documents to answer queries.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-card">
                <Search className="h-10 w-10 text-primary" />
                <h2 className="text-xl font-headline font-bold">Zero Hallucinations</h2>
                <p className="text-sm text-muted-foreground text-center">
                  AI answers strictly based on your uploaded context, ensuring accuracy and reliability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 AI Knowledge Assistant. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
