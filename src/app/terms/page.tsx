import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { FileText, Gavel } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />
      
      <main className="flex-1 container px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-6 border-l-8 border-primary pl-8">
            <div className="inline-flex items-center gap-3 bg-foreground text-background px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest">
              <Gavel className="h-4 w-4" /> System_Governance_v4.0
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">
              Usage <br />
              Protocols<span className="text-primary">.</span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground max-w-2xl">
              By accessing The Archive, you agree to operate within our established semantic governance framework.
            </p>
          </div>

          <div className="border-4 border-foreground p-12 bg-card shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] space-y-12">
            {[
              {
                id: "01",
                title: "Acceptable Use",
                text: "The Archive is designed for professional intelligence augmentation. Users are prohibited from using the platform for illegal data processing or system-stress testing."
              },
              {
                id: "02",
                title: "Identity Responsibility",
                text: "Your system access token is your primary identity. You are solely responsible for maintaining the confidentiality of your credentials."
              },
              {
                id: "03",
                title: "Service Boundaries",
                text: "While our system aims for 99.99% recall precision, we do not guarantee the absolute accuracy of AI-generated summaries. Always verify via the provided source links."
              },
              {
                id: "04",
                title: "Termination Sequence",
                text: "We reserve the right to terminate access for nodes found in violation of our security protocols. Data purging occurs immediately upon termination."
              }
            ].map((rule, i) => (
              <div key={i} className="flex gap-8 border-b-2 border-foreground/10 pb-12 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-foreground text-background shrink-0 flex items-center justify-center font-black text-2xl">
                  {rule.id}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight">{rule.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
