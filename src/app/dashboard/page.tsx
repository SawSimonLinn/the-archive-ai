"use client"

import { useEffect, useState } from "react";
import { Files, MessageSquare, Database, ArrowRight, Zap, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const STORAGE_LIMIT_MB = 50;

export default function DashboardOverview() {
  const [docCount, setDocCount] = useState<number | null>(null);
  const [storageMB, setStorageMB] = useState<number | null>(null);
  const [readyCount, setReadyCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("documents")
      .select("size")
      .then(({ data }) => {
        if (!data) return;
        setDocCount(data.length);
        setStorageMB(data.reduce((sum, d) => sum + (d.size ?? 0), 0) / 1024 / 1024);
        setReadyCount(data.length);
      });
  }, []);

  const fmt = (n: number | null, decimals = 0) =>
    n === null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: decimals });

  const storageLabel =
    storageMB === null
      ? "— / 50 GB"
      : `${fmt(storageMB, 1)} / ${STORAGE_LIMIT_MB} MB`;

  const storagePct =
    storageMB === null ? "—" : `${((storageMB / STORAGE_LIMIT_MB) * 100).toFixed(1)}% Used`;

  const stats = [
    {
      label: "Indexed Files",
      value: fmt(docCount),
      icon: Database,
      color: "text-primary",
      trend: docCount === null ? "" : `${docCount === 1 ? "1 Document" : `${docCount} Documents`}`,
    },
    {
      label: "Storage Used",
      value: storageLabel,
      icon: Files,
      color: "text-foreground",
      trend: storagePct,
    },
    {
      label: "Ready to Query",
      value: fmt(readyCount),
      icon: Activity,
      color: "text-accent",
      trend: "Live & Indexed",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
            Status: All Systems Ready
          </div>
          <h2 className="text-3xl lg:text-4xl font-headline font-black uppercase leading-tight tracking-tighter">System Dashboard<span className="text-primary">.</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/documents">
            <Button variant="outline" className="h-10 px-6 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all text-sm">
              View Documents
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button className="h-10 px-6 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">
              Chat with AI
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="border-2 border-foreground p-5 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:bg-primary transition-colors cursor-default">
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`h-7 w-7 ${stat.color} group-hover:text-foreground transition-colors`} />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-40">{stat.trend}</span>
            </div>
            <div>
              <div className="text-3xl font-headline font-black mb-1 leading-none">{stat.value}</div>
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-lg font-headline font-black uppercase tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> How it Works
          </h3>
          <div className="space-y-2">
            {[
              { step: "01", title: "Upload Files", desc: "Add your PDFs or documents to the library." },
              { step: "02", title: "Wait a Second", desc: "The AI automatically reads and indexes your files." },
              { step: "03", title: "Start Chatting", desc: "Ask questions about your data in plain English." },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 p-4 border-2 border-foreground bg-muted/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 font-mono text-[32px] font-black opacity-5 transition-transform group-hover:scale-150">{step.step}</div>
                <div className="w-9 h-9 border-2 border-foreground bg-foreground text-background flex items-center justify-center shrink-0 font-black text-sm">
                  {step.step}
                </div>
                <div>
                  <p className="font-headline font-black uppercase text-base">{step.title}</p>
                  <p className="text-xs font-medium opacity-60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col bg-foreground text-background rounded-none border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(251,191,36,0.3)] p-6 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldCheck className="h-48 w-48" />
          </div>
          <div className="p-0 mb-4">
            <h3 className="font-headline font-black text-2xl leading-tight">Private & Secure Intelligence<span className="text-primary">.</span></h3>
          </div>
          <div className="p-0 flex-1 space-y-4 relative z-10">
            <p className="text-sm leading-relaxed font-medium">
              Your documents are kept safe and private. We use industrial encryption to ensure your data stays only with you.
            </p>
            <div className="p-3 border-2 border-primary/40 bg-primary/10 font-mono text-[10px] font-bold uppercase tracking-widest leading-loose">
              Security: AES-256 <br />
              AI Model: GPT-4o <br />
              Data Policy: Private & Encrypted
            </div>
            <Link href="/dashboard/chat">
              <Button variant="secondary" className="w-full h-11 rounded-none border-2 border-foreground bg-primary text-primary-foreground font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                Try Chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
