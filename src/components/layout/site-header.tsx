"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Archive, Fingerprint } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-6 mx-auto">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="w-10 h-10 bg-foreground rounded-none flex items-center justify-center transition-transform group-hover:-rotate-6">
            <Archive className="h-6 w-6 text-background" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter uppercase">
            The Archive<span className="text-primary">.ai</span>
          </span>
        </Link>
        
        <nav className="hidden lg:flex gap-10 items-center">
          <Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/#manifesto">
            Manifesto
          </Link>
          <Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/#system">
            The System
          </Link>
          <Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/auth">
            Access
          </Link>
          <Link href="/auth">
            <Button variant="default" className="rounded-none px-8 font-black uppercase tracking-tighter border-2 border-foreground hover:bg-background hover:text-foreground transition-all">
              Initialize Index
            </Button>
          </Link>
        </nav>

        <div className="lg:hidden">
          <Link href="/auth">
            <Button className="rounded-none font-bold uppercase text-xs">Login</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
