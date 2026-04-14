
"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Archive, MessageSquare, Files, Settings, LogOut, LayoutDashboard, Fingerprint, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const mockDocs = [
  { id: "1", name: "PROJECT_PROPOSAL_FINAL.PDF" },
  { id: "2", name: "SYSTEM_SECURITY_POLICY.DOCX" },
  { id: "3", name: "REDACTED_MEETING_NOTES.TXT" },
  { id: "4", name: "RESEARCH_DATA_V2.PDF" },
  { id: "5", name: "NETWORK_LOG_EXCERPT.TXT" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden font-body">
        <Sidebar variant="sidebar" className="border-r-4 border-foreground bg-foreground text-background">
          <SidebarHeader className="p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <Archive className="h-6 w-6 text-foreground" />
              </div>
              <span className="font-headline font-black text-xl tracking-tighter uppercase text-background">The Archive</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-[10px] font-mono font-black text-background/40 uppercase tracking-[0.3em] mb-4">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all rounded-none font-bold uppercase tracking-tighter text-background">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all rounded-none font-bold uppercase tracking-tighter text-background">
                      <Link href="/dashboard/chat">
                        <MessageSquare className="h-5 w-5" />
                        <span>Chat with AI</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <Collapsible open={docsOpen} onOpenChange={setDocsOpen} asChild>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all rounded-none font-bold uppercase tracking-tighter text-background w-full">
                          <Files className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">My Documents</span>
                          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-200 ${docsOpen ? "rotate-90" : ""}`} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-4 mt-1 border-l-2 border-background/20 pl-3 space-y-1">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild className="h-10 rounded-none font-bold uppercase tracking-tighter text-background/70 hover:text-background hover:bg-primary/10 text-xs">
                              <Link href="/dashboard/documents">
                                <FileText className="h-4 w-4 shrink-0" />
                                <span>All Documents</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {mockDocs.map((doc) => (
                            <SidebarMenuSubItem key={doc.id}>
                              <SidebarMenuSubButton asChild className="h-10 rounded-none font-bold uppercase tracking-tighter text-background/70 hover:text-background hover:bg-primary/10 text-xs">
                                <Link href={`/dashboard/chat?docId=${doc.id}`}>
                                  <FileText className="h-4 w-4 shrink-0 opacity-60" />
                                  <span className="truncate">{doc.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t-2 border-background/10">
             <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-12 text-background/60 hover:text-background font-bold uppercase tracking-tighter rounded-none transition-colors">
                  <Link href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-12 bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/80 font-black uppercase tracking-tighter rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all">
                  <Link href="/auth">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col w-full h-full overflow-hidden">
          <header className="flex h-20 shrink-0 items-center gap-2 border-b-4 border-foreground px-6 justify-between bg-card z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-10 w-10 border-2 border-foreground rounded-none" />
              <Separator orientation="vertical" className="h-8 border-foreground/20" />
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-primary" />
                <h1 className="font-headline font-black text-lg tracking-tighter uppercase">ARCHIVE_SYSTEM_V4</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-widest opacity-40">
              <span>Status: Connected</span>
              <span>Secure Session</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-background custom-scrollbar">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
