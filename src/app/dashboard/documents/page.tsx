
"use client"

import { useState } from "react";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { Document } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("manage");

  // Mock data for demonstration
  const mockDocs: Document[] = [
    { id: "1", name: "Project_Proposal.pdf", size: 2450000, type: "pdf", status: "ready", createdAt: "2024-03-20 14:30" },
    { id: "2", name: "Security_Policy.docx", size: 120000, type: "docx", status: "ready", createdAt: "2024-03-21 09:15" },
    { id: "3", name: "Meeting_Notes_Q1.txt", size: 15000, type: "txt", status: "processing", createdAt: "2024-03-22 16:45" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">Knowledge Library</h2>
          <p className="text-muted-foreground">Manage and upload documents for the AI Assistant to index.</p>
        </div>
        {activeTab === "manage" && (
          <Button onClick={() => setActiveTab("upload")} className="gap-2 font-bold shadow-md">
            <Plus className="h-4 w-4" /> New Upload
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="manage" className="font-bold">Manage Existing</TabsTrigger>
          <TabsTrigger value="upload" className="font-bold">Upload New</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-headline font-semibold">Your Documents</h3>
            <span className="text-sm text-muted-foreground">{mockDocs.length} Total</span>
          </div>
          <DocumentList documents={mockDocs} />
        </TabsContent>
        <TabsContent value="upload">
          <UploadZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
