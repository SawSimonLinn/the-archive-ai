import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Activity, Zap, CheckCircle, Clock } from 'lucide-react';

export default function UptimePage() {
  const regions = [
    { name: "NEURAL_NODE_AMER", status: "Operational", latency: "14ms", load: "24%" },
    { name: "NEURAL_NODE_EMEA", status: "Operational", latency: "28ms", load: "18%" },
    { name: "NEURAL_NODE_APAC", status: "Operational", latency: "42ms", load: "32%" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />
      
      <main className="flex-1 container px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-primary pl-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-foreground text-background px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
                <Activity className="h-4 w-4" /> Live_Sync: ACTIVE
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">
                System <br />
                Vitals<span className="text-primary">.</span>
              </h1>
            </div>
            <div className="bg-primary p-6 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center shrink-0">
               <span className="font-mono text-[10px] font-black uppercase tracking-widest">Current Uptime</span>
               <div className="text-5xl font-headline font-black">99.999%</div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-headline font-black uppercase flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" /> Active Cluster Status
            </h2>
            <div className="grid gap-4">
              {regions.map((region, i) => (
                <div key={i} className="flex items-center justify-between p-8 border-4 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-6">
                    <div className="w-4 h-4 rounded-none bg-primary animate-pulse" />
                    <span className="font-mono text-lg font-black tracking-widest">{region.name}</span>
                  </div>
                  <div className="flex gap-12 font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <span>Latency: {region.latency}</span>
                    <span>Load: {region.load}</span>
                    <span className="text-primary">{region.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-foreground p-12 bg-muted/30">
            <h2 className="text-2xl font-headline font-black uppercase mb-8 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" /> Incident Archive
            </h2>
            <div className="space-y-6">
              {[
                { date: "MAR 14, 2024", type: "MAINTENANCE", desc: "Scheduled neural weights optimization (COMPLETED)" },
                { date: "FEB 28, 2024", type: "UPDATE", desc: "Security patch for vector vault encryption (COMPLETED)" },
                { date: "JAN 12, 2024", type: "PERFORMANCE", desc: "Latency spikes in EMEA cluster (RESOLVED)" }
              ].map((log, i) => (
                <div key={i} className="flex gap-8 p-6 border-2 border-foreground/20 bg-background group hover:border-primary transition-colors">
                  <span className="font-mono text-sm font-black w-32 shrink-0">{log.date}</span>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-foreground text-background font-mono text-[9px] font-black mb-2">{log.type}</span>
                    <p className="font-bold uppercase tracking-tighter">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
