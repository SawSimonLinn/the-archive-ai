
"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Archive, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function SiteHeader() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = session !== undefined && session !== null;

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
            About
          </Link>
          <Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/#system">
            Features
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="default" className="rounded-none px-8 font-black uppercase tracking-tighter border-2 border-foreground hover:bg-background hover:text-foreground transition-all gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/auth">
                Login
              </Link>
              <Link href="/auth">
                <Button variant="default" className="rounded-none px-8 font-black uppercase tracking-tighter border-2 border-foreground hover:bg-background hover:text-foreground transition-all">
                  Try for Free
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="lg:hidden">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="rounded-none font-bold uppercase text-xs gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button className="rounded-none font-bold uppercase text-xs">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
