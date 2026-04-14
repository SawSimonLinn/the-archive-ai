
"use client"

import { useState } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { Document } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("manage");

  const mockDocs: Document[] = [
    { id: "1", name: "PROJECT_PROPOSAL_FINAL.PDF", size: 2450000, type: "pdf", status: "ready", createdAt: "2024-03-20 14:30" },
    { id: "2", name: "SYSTEM_SECURITY_POLICY.DOCX", size: 110000, type: "docx", status: "ready", createdAt: "2024-03-21 09:15" },
    { id: "3", name: "REDACTED_MEETING_NOTES.TXT", size: 10000, type: "txt", status: "processing", createdAt: "2024-03-22 16:45" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-[12px] border-primary pl-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 text-[10px] font-mono font-black uppercase tracking-[0.4em]">
            Vault Storage: 12% Used
          </div>
          <h2 className="text-7xl lg:text-9xl font-headline font-black uppercase leading-[0.8] tracking-[-0.08em]">
            Knowledge<br />Library<span className="text-primary">.</span>
          </h2>
        </div>
        {activeTab === "manage" && (
          <Button 
            onClick={() => setActiveTab("upload")} 
            className="h-20 px-10 bg-primary text-foreground border-4 border-foreground rounded-none font-black uppercase text-2xl tracking-tighter shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
          >
            <Plus className="h-8 w-8 mr-2 transition-transform group-hover:rotate-90" /> Inject New Data
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-20 border-4 border-foreground p-0 bg-muted rounded-none">
          <TabsTrigger 
            value="manage" 
            className="h-full font-black uppercase tracking-[0.2em] text-xl data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none transition-none"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="h-full font-black uppercase tracking-[0.2em] text-xl data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none transition-none"
          >
            Injection
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 opacity-40" />
              <Input 
                placeholder="SEARCH PROTOCOL..." 
                className="pl-16 h-20 border-4 border-foreground rounded-none font-black uppercase tracking-widest text-lg focus-visible:ring-primary focus-visible:ring-offset-0" 
              />
            </div>
            <Button variant="outline" className="h-20 px-8 border-4 border-foreground rounded-none font-black uppercase tracking-widest text-lg gap-3 hover:bg-foreground hover:text-background transition-all">
              <Filter className="h-6 w-6" /> Filter
            </Button>
          </div>
          <DocumentList documents={mockDocs} />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-12">
          <div className="max-w-3xl mx-auto">
            <UploadZone />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
