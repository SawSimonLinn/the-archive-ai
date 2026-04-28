
"use client"

import { useState, useEffect, useMemo } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const filterOptions = [
    { label: "All", value: null },
    { label: "Ready", value: "ready" },
    { label: "Processing", value: "processing" },
    { label: "Error", value: "error" },
  ];

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

      <div className="w-full">
        <div className="grid h-12 w-full grid-cols-2 border-2 border-foreground bg-muted p-0">
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={cn(
              "h-full font-black uppercase tracking-[0.2em] text-sm transition-none",
              activeTab === "manage" ? "bg-foreground text-background" : "hover:bg-foreground/10"
            )}
          >
            My Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "h-full border-l-2 border-foreground font-black uppercase tracking-[0.2em] text-sm transition-none",
              activeTab === "upload" ? "bg-foreground text-background" : "hover:bg-foreground/10"
            )}
          >
            Upload
          </button>
        </div>

        {activeTab === "manage" && (
        <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-bottom-4">
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

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              {filterOptions.map((option) => {
                const active = statusFilter === option.value;
                return (
                <Button
                  key={option.label}
                  variant="outline"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "h-11 flex-1 sm:flex-none px-3 border-2 border-foreground rounded-none font-black uppercase tracking-widest text-xs gap-2 transition-all",
                    active ? "bg-primary text-foreground" : "hover:bg-foreground hover:text-background"
                  )}
                >
                  {option.value === null ? <Filter className="h-4 w-4" /> : active ? <Check className="h-4 w-4" /> : null}
                  {option.label}
                </Button>
                );
              })}
            </div>
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
        </div>
        )}

        {activeTab === "upload" && (
        <div className="mt-5">
          <div className="max-w-3xl mx-auto">
            <UploadZone onUploadSuccess={() => { setActiveTab("manage"); fetchDocs(); }} />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
