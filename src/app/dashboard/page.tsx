
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Files, MessageSquare, Database, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardOverview() {
  const stats = [
    { label: "Total Documents", value: "12", icon: Files, color: "text-blue-500" },
    { label: "Total Embeddings", value: "1,452", icon: Database, color: "text-primary" },
    { label: "Chat Sessions", value: "24", icon: MessageSquare, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold">Workspace Overview</h2>
          <p className="text-sm text-muted-foreground">Manage your knowledge base and start analyzing your data.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/documents">
            <Button variant="outline" className="gap-2">
              <Files className="h-4 w-4" /> Manage Documents
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button className="gap-2 font-bold">
              <MessageSquare className="h-4 w-4" /> Start Chat
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline font-bold">Quick Start</CardTitle>
            <CardDescription>New to AI Assistant? Follow these steps to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 font-bold text-xs">1</div>
              <div className="text-sm">
                <p className="font-bold">Upload Documents</p>
                <p className="text-xs text-muted-foreground">Add PDF, Text or Notes to your library.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 font-bold text-xs">2</div>
              <div className="text-sm">
                <p className="font-bold">Wait for Processing</p>
                <p className="text-xs text-muted-foreground">Our AI engine will chunk and index your content.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 font-bold text-xs">3</div>
              <div className="text-sm">
                <p className="font-bold">Start Chatting</p>
                <p className="text-xs text-muted-foreground">Ask natural language questions about your data.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-accent text-accent-foreground border-accent overflow-hidden relative">
          <CardHeader>
             <div className="absolute top-4 right-4 opacity-20">
                <Zap className="h-24 w-24" />
             </div>
            <CardTitle className="font-headline font-bold text-xl">RAG Efficiency</CardTitle>
            <CardDescription className="text-accent-foreground/80">How our knowledge retrieval works.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 relative z-10">
            <p className="text-sm leading-relaxed">
              Our system uses <b>Semantic Search</b> to find the most relevant parts of your documents. 
              Instead of reading everything every time, we index content as vectors to provide instant, 
              accurate, and hallucination-free answers.
            </p>
            <Link href="/dashboard/chat">
              <Button variant="secondary" className="w-full font-bold mt-4">
                Try Semantic Chat <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
