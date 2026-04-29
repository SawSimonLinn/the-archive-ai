
"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { Archive, MessageSquare, Settings, LogOut, LayoutDashboard, Fingerprint, FileText, MoreVertical, Pencil, Trash2, Zap, CreditCard, AlertTriangle, X } from "lucide-react";
import { formatPlanLimit } from "@/lib/billing";
import { UpgradeModal } from "@/components/upgrade-modal";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useCallback, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useBillingPlan } from "@/hooks/use-billing-plan";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type SidebarDocument = {
  id: string;
  name: string;
};

function notifyActiveDocumentChanged(documentId: string | null) {
  window.dispatchEvent(new CustomEvent("archive:active-document-changed", { detail: documentId }));
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [docs, setDocs] = useState<SidebarDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const [renameDoc, setRenameDoc] = useState<SidebarDocument | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteDoc, setDeleteDoc] = useState<SidebarDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith("/dashboard/chat");
  const { plan, isLoading: isPlanLoading } = useBillingPlan();
  const documentLimit = plan.maxDocuments;
  const atDocumentLimit = documentLimit !== null && docs.length >= documentLimit;
  const documentUsageLabel = `${docs.length}/${formatPlanLimit(documentLimit)} docs`;
  const isFreePlan = plan.id === "free";

  const fetchDocs = useCallback(async () => {
    const res = await fetch('/api/documents', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setDocs((data.documents ?? []).filter((doc: Partial<SidebarDocument>) => doc.id && doc.name));
  }, []);

  const upsertDocument = useCallback((document: SidebarDocument) => {
    setDocs((currentDocs) => [
      document,
      ...currentDocs.filter((doc) => doc.id !== document.id),
    ]);
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
    const handleDocumentsChanged = (event: Event) => {
      const document = (event as CustomEvent<SidebarDocument | undefined>).detail;
      if (document?.id && document.name) upsertDocument(document);
      fetchDocs();
    };
    window.addEventListener("archive:documents-changed", handleDocumentsChanged);
    return () => window.removeEventListener("archive:documents-changed", handleDocumentsChanged);
  }, [fetchDocs, upsertDocument]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const openRename = (doc: SidebarDocument) => {
    setRenameDoc(doc);
    setRenameValue(doc.name);
  };

  const handleRename = async () => {
    if (!renameDoc || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      const res = await fetch(`/api/documents/${renameDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!res.ok) throw new Error();
      const { document } = await res.json();
      setDocs((prev) => prev.map((d) => d.id === renameDoc.id ? { ...d, name: document.name } : d));
      toast({ title: "Renamed", description: `Document renamed to "${document.name}".` });
      setRenameDoc(null);
    } catch {
      toast({ variant: "destructive", title: "Rename Failed", description: "Could not rename the document." });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteDoc.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDocs((prev) => prev.filter((d) => d.id !== deleteDoc.id));
      toast({ title: "Deleted", description: `"${deleteDoc.name}" has been deleted.` });
      if (activeDocId === deleteDoc.id) {
        router.replace("/dashboard/chat");
        notifyActiveDocumentChanged(null);
      }
      setDeleteDoc(null);
    } catch {
      toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the document." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden font-body">
        <Sidebar variant="sidebar" className="border-r-4 border-foreground bg-foreground text-background">
          <SidebarHeader className="px-4 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <Archive className="h-6 w-6 text-foreground" />
              </div>
              <span className="font-headline font-black text-xl tracking-tighter uppercase text-background">The Archive</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="pl-3 pr-0">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="text-[10px] font-mono font-black text-background/40 uppercase tracking-[0.3em] px-2 mb-1">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 pr-3">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-10 border-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all rounded-none font-bold uppercase tracking-tighter text-background px-3">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/chat" && activeDocId === null} className="h-10 border-2 border-transparent hover:border-primary hover:bg-primary/10 data-[active=true]:border-primary data-[active=true]:bg-primary/20 transition-all rounded-none font-bold uppercase tracking-tighter text-background px-3">
                      <Link
                        href="/dashboard/chat"
                        onClick={() => {
                          setActiveDocId(null);
                          notifyActiveDocumentChanged(null);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat with AI</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="p-0 mt-4">
              <SidebarGroupLabel className="text-[10px] font-mono font-black text-background/40 uppercase tracking-[0.3em] px-2 mb-1">
                Document Chats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuSub className="border-l-2 border-background/20 ml-2 pl-2 space-y-0.5 mr-0">
                  {docs.length === 0 ? (
                    <SidebarMenuSubItem>
                      <span className="block px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-background/35">
                        No uploads yet
                      </span>
                    </SidebarMenuSubItem>
                  ) : (
                    docs.map((doc) => (
                      <SidebarMenuSubItem key={doc.id}>
                        <div className={cn(
                          "flex items-center h-8 w-full rounded-none text-xs font-bold uppercase tracking-tighter",
                          activeDocId === doc.id ? "bg-primary/20 text-background" : "text-background/70 hover:text-background hover:bg-primary/10"
                        )}>
                          <Link
                            href={`/dashboard/chat?docId=${doc.id}`}
                            onClick={() => {
                              setActiveDocId(doc.id);
                              notifyActiveDocumentChanged(doc.id);
                            }}
                            className="flex flex-1 min-w-0 items-center gap-2 h-full pl-2"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{doc.name}</span>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="shrink-0 h-8 w-7 flex items-center justify-center hover:bg-background/10 transition-colors rounded-none">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              className="w-36 rounded-none border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1"
                            >
                              <DropdownMenuItem
                                onClick={() => openRename(doc)}
                                className="gap-2 rounded-none font-bold uppercase tracking-tighter text-xs cursor-pointer focus:bg-primary/20"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-foreground/10" />
                              <DropdownMenuItem
                                onClick={() => setDeleteDoc(doc)}
                                className="gap-2 rounded-none font-bold uppercase tracking-tighter text-xs cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuSubItem>
                    ))
                  )}
                </SidebarMenuSub>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="px-3 py-4 border-t-2 border-background/10 space-y-3">
            {/* Upgrade CTA */}
            {!isPlanLoading && atDocumentLimit ? (
              <button onClick={() => setUpgradeModalOpen(true)} className="w-full text-left">
                <div className="border-2 border-destructive bg-destructive/10 p-3 flex items-center gap-3 hover:bg-destructive/20 transition-colors cursor-pointer">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-destructive">
                    <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-[10px] uppercase tracking-widest text-background leading-none">Limit Reached</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-background/50 mt-0.5">{documentUsageLabel} · Upgrade</p>
                  </div>
                  <Zap className="h-4 w-4 text-destructive ml-auto shrink-0" />
                </div>
              </button>
            ) : (
              <Link href={isFreePlan ? "/plans" : "/dashboard/settings"} className="block">
                <div className="border-2 border-primary bg-primary/10 p-3 flex items-center gap-3 hover:bg-primary/20 transition-colors cursor-pointer">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary">
                    <Zap className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-[10px] uppercase tracking-widest text-background leading-none">
                      {isPlanLoading ? "Checking Plan" : `${plan.name} Plan`}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-background/50 mt-0.5">
                      {isPlanLoading ? `${docs.length} docs` : `${documentUsageLabel} · ${isFreePlan ? "Upgrade" : "Manage"}`}
                    </p>
                  </div>
                  <CreditCard className="h-4 w-4 text-primary ml-auto shrink-0" />
                </div>
              </Link>
            )}

            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10 text-background/60 hover:text-background font-bold uppercase tracking-tighter rounded-none transition-colors px-3">
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="h-10 bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/80 font-black uppercase tracking-tighter rounded-none transition-all cursor-pointer px-3">
                  <LogOut className="h-4 w-4" />
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

      <UpgradeModal
        open={upgradeModalOpen}
        reason="document_limit"
        onClose={() => setUpgradeModalOpen(false)}
      />

      {/* Rename Modal */}
      <Dialog open={!!renameDoc} onOpenChange={(open) => { if (!open) setRenameDoc(null); }}>
        <DialogContent hideCloseButton className="border-4 border-foreground rounded-none shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-sm bg-card p-0 overflow-hidden">
          <DialogHeader className="bg-foreground text-background p-6 border-b-4 border-foreground">
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">Rename Document</DialogTitle>
            <DialogDescription className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background/60">Enter a new name</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
              className="h-12 rounded-none border-2 border-foreground font-bold tracking-tighter focus-visible:ring-primary"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setRenameDoc(null)}
                disabled={isRenaming}
                className="h-12 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRename}
                disabled={isRenaming || !renameValue.trim()}
                className="h-12 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                {isRenaming ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteDoc} onOpenChange={(open) => { if (!open) setDeleteDoc(null); }}>
        <DialogContent hideCloseButton className="border-4 border-foreground rounded-none shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-md bg-card p-0 overflow-hidden">
          <DialogHeader className="bg-destructive p-6 pr-14 border-b-4 border-foreground relative">
            <button
              onClick={() => setDeleteDoc(null)}
              disabled={isDeleting}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border-2 border-destructive-foreground/40 text-destructive-foreground opacity-70 hover:opacity-100 hover:border-destructive-foreground transition-all disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter text-destructive-foreground">Delete Document?</DialogTitle>
            <DialogDescription className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-destructive-foreground/70">This cannot be undone</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <p className="text-sm font-medium leading-relaxed">
              <span className="font-black break-all">&ldquo;{deleteDoc?.name}&rdquo;</span>{" "}
              and all its chat history will be permanently deleted.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDoc(null)}
                disabled={isDeleting}
                className="h-12 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-12 bg-destructive text-destructive-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
