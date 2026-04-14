
"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Archive, MessageSquare, Files, Settings, LogOut, LayoutDashboard, Fingerprint } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-12 border-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all rounded-none font-bold uppercase tracking-tighter text-background">
                      <Link href="/dashboard/documents">
                        <Files className="h-5 w-5" />
                        <span>My Documents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
