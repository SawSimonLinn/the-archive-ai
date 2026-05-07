"use client"

import Link from 'next/link';
import { Activity, Archive, ArrowRight, FileText, Lock, Mail, ShieldCheck } from 'lucide-react';
import { SITE } from '@/lib/site';

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#system" },
      { label: "Pricing", href: "/plans" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sign in", href: "/auth" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      { label: "Status", href: "/uptime" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

const trustItems = [
  { label: "Encrypted documents", icon: Lock },
  { label: "Source-cited answers", icon: FileText },
  { label: "Security review ready", icon: ShieldCheck },
  { label: "Status updates", icon: Activity },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background border-t-2 border-foreground px-6">
      <div className="container mx-auto py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-8">
            <Link className="flex items-center gap-3 group w-fit" href="/" aria-label="The Archive.ai home">
              <div className="w-11 h-11 bg-primary text-foreground flex items-center justify-center transition-transform group-hover:-rotate-6">
                <Archive className="h-6 w-6 text-foreground" />
              </div>
              <span className="font-headline font-black text-2xl tracking-tighter uppercase">
                The Archive<span className="text-primary">.ai</span>
              </span>
            </Link>

            <div className="space-y-5 max-w-md">
              <p className="text-2xl sm:text-3xl font-headline font-black uppercase leading-none tracking-tighter">
                Search your documents by asking real questions.
              </p>
              <p className="text-sm font-medium leading-relaxed text-background/65">
                Upload PDFs, TXT files, and DOCX documents, then get cited answers from your private archive.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center gap-2 border-2 border-primary bg-primary px-5 text-sm font-black uppercase tracking-tighter text-foreground transition-all hover:translate-x-1 hover:translate-y-1"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 border-2 border-background/25 px-5 text-sm font-black uppercase tracking-tighter text-background transition-colors hover:border-primary hover:text-primary"
              >
                Contact support <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-10 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-5">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-background/40">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold uppercase tracking-tighter text-background/75 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-3 border-y border-background/15 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-xs font-bold uppercase tracking-tighter text-background/70">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-5 font-mono text-[10px] uppercase tracking-widest text-background/45 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} {SITE.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <a href={`mailto:${SITE.supportEmail}`} className="hover:text-primary transition-colors">
              {SITE.supportEmail}
            </a>
            <span>{SITE.domain}</span>
            <span>Secure document intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
