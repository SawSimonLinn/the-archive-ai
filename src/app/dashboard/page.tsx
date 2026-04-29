"use client"

import { useEffect, useState } from "react";
import { Files, Database, ArrowRight, Zap, ShieldCheck, Activity, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPlanLimit } from "@/lib/billing";
import { useBillingPlan } from "@/hooks/use-billing-plan";

const STORAGE_LIMIT_MB = 50;

type DashboardDocument = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
};

export default function DashboardOverview() {
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { plan, isLoading: isPlanLoading } = useBillingPlan();

  useEffect(() => {
    let cancelled = false;

    const loadDocuments = async () => {
      try {
        const res = await fetch('/api/documents', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load documents');

        const data = await res.json();
        if (!cancelled) {
          setDocuments(data.documents ?? []);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const handleDocumentsChanged = (event: Event) => {
      const document = (event as CustomEvent<{ id: string; name: string } | undefined>).detail;

      if (document?.id && document.name) {
        setDocuments((currentDocs) => [
          { id: document.id, name: document.name, size: null, created_at: new Date().toISOString() },
          ...currentDocs.filter((doc) => doc.id !== document.id),
        ]);
      }

      void loadDocuments();
    };

    void loadDocuments();
    window.addEventListener("archive:documents-changed", handleDocumentsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("archive:documents-changed", handleDocumentsChanged);
    };
  }, []);

  const fmt = (n: number | null, decimals = 0) =>
    n === null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: decimals });

  const docCount = documents.length;
  const documentLimit = plan.maxDocuments;
  const documentUsageLabel = isPlanLoading
    ? "—"
    : `${fmt(docCount)} / ${formatPlanLimit(documentLimit)}`;
  const atDocumentLimit = !isPlanLoading && documentLimit !== null && docCount >= documentLimit;
  const storageMB = documents.reduce((sum, doc) => sum + (doc.size ?? 0), 0) / 1024 / 1024;
  const readyCount = docCount;
  const latestDocument = documents[0] ?? null;
  const chatHref = latestDocument ? `/dashboard/chat?docId=${latestDocument.id}` : "/dashboard/chat";

  const storageLabel =
    isLoading
      ? "— / 50 MB"
      : `${fmt(storageMB, 1)} / ${STORAGE_LIMIT_MB} MB`;

  const storagePct =
    isLoading ? "—" : `${((storageMB / STORAGE_LIMIT_MB) * 100).toFixed(1)}% Used`;

  const statusLabel = isLoading
    ? "Status: Syncing Archive"
    : docCount > 0
      ? `Status: ${docCount} ${docCount === 1 ? "File" : "Files"} Indexed`
      : "Status: Awaiting Upload";

  const stats = [
    {
      label: "Indexed Files",
      value: isLoading ? "—" : documentUsageLabel,
      icon: Database,
      color: "text-primary",
      trend: isPlanLoading ? "Checking Plan" : `${plan.name} Plan`,
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
      value: isLoading ? "—" : fmt(readyCount),
      icon: Activity,
      color: "text-accent",
      trend: docCount > 0 ? "Live & Indexed" : "No Files Yet",
    },
  ];

  const workflowSteps = docCount > 0
    ? [
        { step: "01", title: "Open Saved Chats", desc: "Return to any document from the left sidebar." },
        { step: "02", title: "Ask Follow-ups", desc: "Continue the saved conversation with full chat history." },
        { step: "03", title: "Add More Files", desc: "Upload another document when your archive needs more context." },
      ]
    : [
        { step: "01", title: "Upload Files", desc: "Add your PDFs or documents to the library." },
        { step: "02", title: "Wait a Second", desc: "The AI automatically reads and indexes your files." },
        { step: "03", title: "Start Chatting", desc: "Ask questions about your data in plain English." },
      ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
            {statusLabel}
          </div>
          <h2 className="text-3xl lg:text-4xl font-headline font-black uppercase leading-tight tracking-tighter">System Dashboard<span className="text-primary">.</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={chatHref}>
            <Button className="h-10 px-6 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">
              {latestDocument ? "Continue Chat" : "Chat with AI"}
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

      {!isLoading && atDocumentLimit && (
        <div className="border-4 border-destructive bg-destructive/5 p-4 flex items-center justify-between gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
            </div>
            <div>
              <p className="font-headline font-black text-sm uppercase tracking-tighter">Document Limit Reached</p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">You've used all {formatPlanLimit(documentLimit)} document slots on {plan.name}. Upgrade to keep adding files.</p>
            </div>
          </div>
          <Link href="/plans" className="shrink-0">
            <Button className="h-10 px-5 bg-destructive text-destructive-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-xs">
              <Zap className="h-4 w-4 mr-2" /> Upgrade
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-lg font-headline font-black uppercase tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> How it Works
          </h3>
          <div className="space-y-2">
            {workflowSteps.map((step, i) => (
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
              Files Indexed: {isLoading ? "Syncing" : docCount} <br />
              Data Policy: Private & Encrypted
            </div>
            <Link href={chatHref}>
              <Button variant="secondary" className="w-full h-11 rounded-none border-2 border-foreground bg-primary text-primary-foreground font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                {latestDocument ? "Continue Latest Chat" : "Try Chatting"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
