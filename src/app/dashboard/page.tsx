
import { Files, MessageSquare, Database, ArrowRight, Zap, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardOverview() {
  const stats = [
    { label: "Indexed Files", value: "1,452", icon: Database, color: "text-primary", trend: "+12% Growth" },
    { label: "Storage Used", value: "12/50", icon: Files, color: "text-foreground", trend: "24% Full" },
    { label: "Recent Queries", value: "24", icon: Activity, color: "text-accent", trend: "Live Chat" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-primary pl-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
            Status: All Systems Ready
          </div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black uppercase leading-none tracking-tighter">System<br />Dashboard<span className="text-primary">.</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/documents">
            <Button variant="outline" className="h-14 px-8 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all">
              View Documents
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button className="h-14 px-8 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Chat with AI
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="border-4 border-foreground p-8 bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:bg-primary transition-colors cursor-default">
            <div className="flex justify-between items-start mb-8">
              <stat.icon className={`h-10 w-10 ${stat.color} group-hover:text-foreground transition-colors`} />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-40">{stat.trend}</span>
            </div>
            <div>
              <div className="text-6xl font-headline font-black mb-2 leading-none">{stat.value}</div>
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <section className="space-y-6">
          <h3 className="text-2xl font-headline font-black uppercase tracking-tight flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" /> How it Works
          </h3>
          <div className="space-y-4">
            {[
              { step: "01", title: "Upload Files", desc: "Add your PDFs or documents to the library." },
              { step: "02", title: "Wait a Second", desc: "The AI automatically reads and indexes your files." },
              { step: "03", title: "Start Chatting", desc: "Ask questions about your data in plain English." },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 p-6 border-2 border-foreground bg-muted/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 font-mono text-[40px] font-black opacity-5 transition-transform group-hover:scale-150">{step.step}</div>
                <div className="w-12 h-12 border-2 border-foreground bg-foreground text-background flex items-center justify-center shrink-0 font-black text-xl">
                  {step.step}
                </div>
                <div>
                  <p className="font-headline font-black uppercase text-xl">{step.title}</p>
                  <p className="text-sm font-medium opacity-60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col bg-foreground text-background rounded-none border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(251,191,36,0.3)] p-10 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldCheck className="h-64 w-64" />
          </div>
          <div className="p-0 mb-8">
            <h3 className="font-headline font-black text-4xl leading-tight">Private & Secure<br />Intelligence<span className="text-primary">.</span></h3>
          </div>
          <div className="p-0 flex-1 space-y-6 relative z-10">
            <p className="text-lg leading-relaxed font-medium">
              Your documents are kept safe and private. We use industrial encryption to ensure your data stays only with you.
            </p>
            <div className="p-4 border-2 border-primary/40 bg-primary/10 font-mono text-[10px] font-bold uppercase tracking-widest leading-loose">
              Security: AES-256 <br />
              AI Model: Gemini Flash <br />
              Data Policy: Private & Encrypted
            </div>
            <Link href="/dashboard/chat">
              <Button variant="secondary" className="w-full h-14 rounded-none border-2 border-foreground bg-primary text-primary-foreground font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Try Chatting <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
