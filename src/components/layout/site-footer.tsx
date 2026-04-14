"use client"

import Link from 'next/link';
import { Archive } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-background border-t-2 border-foreground py-20 px-6">
      <div className="container mx-auto">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-8">
             <Link className="flex items-center gap-3 group" href="/">
              <div className="w-10 h-10 bg-foreground rounded-none flex items-center justify-center">
                <Archive className="h-6 w-6 text-background" />
              </div>
              <span className="font-headline font-black text-2xl tracking-tighter uppercase">The Archive</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-sm opacity-60">
              A digital mirror of your intelligence. Engineered for professionals who value precision over noise.
            </p>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { 
                title: "Protocol", 
                links: [
                  { label: "Manifesto", href: "/#manifesto" },
                  { label: "The System", href: "/#system" },
                  { label: "Security", href: "/security" },
                  { label: "Uptime", href: "/uptime" }
                ] 
              },
              { 
                title: "Interface", 
                links: [
                  { label: "Web Vault", href: "/dashboard" },
                  { label: "API Access", href: "/security" },
                  { label: "Mobile App", href: "#" },
                  { label: "Desktop", href: "#" }
                ] 
              },
              { 
                title: "Network", 
                links: [
                  { label: "Github", href: "#" },
                  { label: "Twitter", href: "#" },
                  { label: "Discord", href: "#" },
                  { label: "LinkedIn", href: "#" }
                ] 
              },
              { 
                title: "Legal", 
                links: [
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                  { label: "Usage", href: "/terms" },
                  { label: "Compliance", href: "/security" }
                ] 
              }
            ].map((col, i) => (
              <div key={i} className="space-y-6">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm font-bold uppercase tracking-tighter hover:text-primary transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] uppercase tracking-widest opacity-50">
          <p>© 2024 THE ARCHIVE CO. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-12">
            <span>LOCATED IN THE CLOUD</span>
            <span>EST. 2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
