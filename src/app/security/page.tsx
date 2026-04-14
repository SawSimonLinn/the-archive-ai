import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ShieldCheck, Lock, Cpu, Database } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />
      
      <main className="flex-1 container px-6 mx-auto py-24">
        <div className="max-w-5xl space-y-20">
          <div className="space-y-6 border-l-8 border-primary pl-8">
            <div className="inline-flex items-center gap-3 bg-foreground text-background px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
              <Lock className="h-4 w-4" /> Defense_Grade: High
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">
              Hardened <br />
              Architecture<span className="text-primary">.</span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground max-w-2xl">
              Our security model is built on the principle of total isolation. We don't just protect data; we physically partition it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Encryption Standard",
                desc: "All data is encrypted at rest using AES-256 and in transit via TLS 1.3. Your semantic vectors are shredded across multiple physical nodes."
              },
              {
                icon: Cpu,
                title: "Neural Isolation",
                desc: "Each user workspace runs in a dedicated, ephemeral container. There is zero cross-contamination between document libraries."
              },
              {
                icon: Database,
                title: "Vector Shredding",
                desc: "Documents are split into semantic chunks before indexing. No single storage unit contains the full context of your intelligence."
              },
              {
                icon: Lock,
                title: "MFA Enforcement",
                desc: "Hardware-level security keys and multi-factor authorization are required for all administrative access."
              }
            ].map((item, i) => (
              <div key={i} className="border-4 border-foreground p-12 bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:bg-foreground hover:text-background transition-all">
                <item.icon className="h-12 w-12 text-primary mb-12 transition-transform group-hover:scale-125 group-hover:text-primary" />
                <div>
                  <h3 className="text-3xl font-headline font-black uppercase mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground font-medium group-hover:text-background/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary p-12 border-4 border-foreground shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
             <h2 className="text-4xl font-headline font-black uppercase mb-8 tracking-tighter">Third-Party Audit Status</h2>
             <div className="grid sm:grid-cols-3 gap-8">
                <div className="p-6 bg-background/20 border-2 border-foreground/10 font-mono text-[10px] font-black uppercase tracking-widest text-center">
                  SOC-2 TYPE II <br /> <span className="text-2xl mt-2 block">VERIFIED</span>
                </div>
                <div className="p-6 bg-background/20 border-2 border-foreground/10 font-mono text-[10px] font-black uppercase tracking-widest text-center">
                  HIPAA COMPLIANT <br /> <span className="text-2xl mt-2 block">YES</span>
                </div>
                <div className="p-6 bg-background/20 border-2 border-foreground/10 font-mono text-[10px] font-black uppercase tracking-widest text-center">
                  GDPR READY <br /> <span className="text-2xl mt-2 block">INDEXED</span>
                </div>
             </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
