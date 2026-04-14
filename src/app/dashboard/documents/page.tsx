
"use client"

import { useState } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { Document } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Library, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("manage");

  const mockDocs: Document[] = [
    { id: "1", name: "PROJECT_PROPOSAL_FINAL.PDF", size: 2450000, type: "pdf", status: "ready", createdAt: "2024-03-20 14:30" },
    { id: "2", name: "SYSTEM_SECURITY_POLICY.DOCX", size: 120000, type: "docx", status: "ready", createdAt: "2024-03-21 09:15" },
    { id: "3", name: "REDACTED_MEETING_NOTES.TXT", size: 15000, type: "txt", status: "processing", createdAt: "2024-03-22 16:45" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-primary pl-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
            Vault Storage: 12% Used
          </div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black uppercase leading-none tracking-tighter">Knowledge<br />Library<span className="text-primary">.</span></h2>
        </div>
        {activeTab === "manage" && (
          <Button onClick={() => setActiveTab("upload")} className="h-14 px-8 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <Plus className="h-6 w-6 mr-2" /> Inject New Data
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-12 border-4 border-foreground p-1 bg-muted">
          <TabsTrigger value="manage" className="h-12 font-black uppercase tracking-tighter text-lg data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Inventory</TabsTrigger>
          <TabsTrigger value="upload" className="h-12 font-black uppercase tracking-tighter text-lg data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Injection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
              <Input placeholder="SEARCH PROTOCOL..." className="pl-12 h-14 border-2 border-foreground rounded-none font-bold uppercase tracking-tighter focus-visible:ring-primary" />
            </div>
            <Button variant="outline" className="h-14 px-6 border-2 border-foreground rounded-none font-bold uppercase tracking-tighter gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
          <DocumentList documents={mockDocs} />
        </TabsContent>
        
        <TabsContent value="upload">
          <div className="max-w-2xl mx-auto">
            <UploadZone />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
