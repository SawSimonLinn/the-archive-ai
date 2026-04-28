
"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Archive, MessageSquare, Files, Settings, LogOut, LayoutDashboard, Fingerprint, FileText } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useCallback, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [docs, setDocs] = useState<{ id: string; name: string }[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith("/dashboard/chat");

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase
      .from('documents')
      .select('id, name')
      .order('created_at', { ascending: false });

    if (data) setDocs(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/auth");
    });
  }, [router]);

  useEffect(() => {
    fetchDocs();
  }, [pathname, fetchDocs]);

  useEffect(() => {
    const syncActiveDocument = () => {
      setActiveDocId(new URLSearchParams(window.location.search).get("docId"));
    };
    const handleActiveDocumentChange = (event: Event) => {
      setActiveDocId((event as CustomEvent<string | null>).detail ?? null);
    };

    syncActiveDocument();
    window.addEventListener("popstate", syncActiveDocument);
    window.addEventListener("archive:active-document-changed", handleActiveDocumentChange);

    return () => {
      window.removeEventListener("popstate", syncActiveDocument);
      window.removeEventListener("archive:active-document-changed", handleActiveDocumentChange);
    };
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("archive:documents-changed", fetchDocs);

    return () => {
      window.removeEventListener("archive:documents-changed", fetchDocs);
    };
  }, [fetchDocs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

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
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/chat" && activeDocId === null} className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 data-[active=true]:border-primary data-[active=true]:bg-primary/20 transition-all rounded-none font-bold uppercase tracking-tighter text-background">
                      <Link href="/dashboard/chat" onClick={() => setActiveDocId(null)}>
                        <MessageSquare className="h-5 w-5" />
                        <span>Chat with AI</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/documents"} className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 data-[active=true]:border-primary data-[active=true]:bg-primary/20 transition-all rounded-none font-bold uppercase tracking-tighter text-background">
                      <Link href="/dashboard/documents" onClick={() => setActiveDocId(null)}>
                        <Files className="h-5 w-5" />
                        <span>Uploaded Documents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="pt-1">
              <SidebarGroupLabel className="px-2 text-[10px] font-mono font-black text-background/40 uppercase tracking-[0.3em] mb-3">
                Document Chats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuSub className="ml-2 border-l-2 border-background/20 pl-3 space-y-1">
                  {docs.length === 0 ? (
                    <SidebarMenuSubItem>
                      <span className="block px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-background/35">
                        No uploads yet
                      </span>
                    </SidebarMenuSubItem>
                  ) : (
                    docs.map((doc) => (
                      <SidebarMenuSubItem key={doc.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={activeDocId === doc.id}
                          className="h-9 rounded-none font-bold uppercase tracking-tighter text-background/70 hover:text-background hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-background text-xs"
                        >
                          <Link href={`/dashboard/chat?docId=${doc.id}`} onClick={() => setActiveDocId(doc.id)}>
                            <FileText className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate">{doc.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))
                  )}
                </SidebarMenuSub>
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
                <SidebarMenuButton onClick={handleLogout} className="h-12 bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/80 font-black uppercase tracking-tighter rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all cursor-pointer">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col w-full h-full overflow-hidden">
          {!isChatRoute && (
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
          )}
          <main
            className={cn(
              "flex-1 bg-background custom-scrollbar",
              isChatRoute ? "min-h-0 overflow-hidden p-0" : "overflow-y-auto p-5 md:p-7"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
