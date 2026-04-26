
"use client"

import { useState, useEffect, useMemo } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { Document } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from('documents')
      .select('id, name, type, size, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      setDocs(data.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        status: 'ready',
        createdAt: new Date(d.created_at).toLocaleString(),
      })));
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const totalSize = docs.reduce((acc, d) => acc + d.size, 0);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? doc.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [docs, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-[0.4em]">
            Storage: {((totalSize / (50 * 1024 * 1024)) * 100).toFixed(1)}% Used
          </div>
          <h2 className="text-3xl lg:text-4xl font-headline font-black uppercase leading-tight tracking-tighter">
            Document Library<span className="text-primary">.</span>
          </h2>
        </div>
        {activeTab === "manage" && (
          <Button
            onClick={() => setActiveTab("upload")}
            className="h-11 px-6 bg-primary text-foreground border-2 border-foreground rounded-none font-black uppercase text-sm tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" /> Upload Files
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 border-2 border-foreground p-0 bg-muted rounded-none">
          <TabsTrigger
            value="manage"
            className="h-full font-black uppercase tracking-[0.2em] text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none transition-none"
          >
            My Files
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="h-full font-black uppercase tracking-[0.2em] text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none transition-none"
          >
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-5 space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 border-2 border-foreground rounded-none font-bold uppercase tracking-widest text-sm focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-11 px-5 border-2 border-foreground rounded-none font-black uppercase tracking-widest text-sm gap-2 transition-all",
                    statusFilter ? "bg-primary text-foreground" : "hover:bg-foreground hover:text-background"
                  )}
                >
                  <Filter className="h-4 w-4" /> {statusFilter ? statusFilter : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border-4 border-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0">
                <DropdownMenuLabel className="font-mono text-[10px] font-black uppercase tracking-widest p-4 opacity-40">Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator className="h-1 bg-foreground" />
                <DropdownMenuItem
                  onClick={() => setStatusFilter(null)}
                  className="p-4 font-black uppercase tracking-tighter text-sm flex justify-between items-center cursor-pointer focus:bg-primary"
                >
                  All Files {!statusFilter && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('ready')}
                  className="p-4 font-black uppercase tracking-tighter text-sm flex justify-between items-center cursor-pointer focus:bg-primary"
                >
                  Ready {statusFilter === 'ready' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('processing')}
                  className="p-4 font-black uppercase tracking-tighter text-sm flex justify-between items-center cursor-pointer focus:bg-primary"
                >
                  Processing {statusFilter === 'processing' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('error')}
                  className="p-4 font-black uppercase tracking-tighter text-sm flex justify-between items-center cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  Error {statusFilter === 'error' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              <span>Showing {filteredDocs.length} files</span>
              {statusFilter && (
                <button onClick={() => setStatusFilter(null)} className="hover:text-primary transition-colors underline underline-offset-4">
                  Clear Filters
                </button>
              )}
            </div>
            <DocumentList documents={filteredDocs} onDelete={handleDelete} />
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-5">
          <div className="max-w-3xl mx-auto">
            <UploadZone onUploadSuccess={() => { setActiveTab("manage"); fetchDocs(); }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
