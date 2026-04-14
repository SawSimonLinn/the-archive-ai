
"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Trash2, 
  Command, 
  Copy, 
  Download, 
  Check,
  Zap,
  Files,
  ArrowRight,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ragQueryResponseGeneration } from "@/ai/flows/rag-query-response-generation";
import { Message } from "@/lib/types";

const MOCK_DOC_HISTORY: Record<string, { name: string; messages: Message[] }> = {
  "1": {
    name: "PROJECT_PROPOSAL_FINAL.PDF",
    messages: [
      { id: "h1-1", role: "assistant", content: "I've analyzed PROJECT_PROPOSAL_FINAL.PDF. You can now ask questions about its content.", timestamp: new Date("2024-03-20T14:31:00") },
      { id: "h1-2", role: "user", content: "What are the 3 main takeaways from this file?", timestamp: new Date("2024-03-20T14:32:00") },
      { id: "h1-3", role: "assistant", content: "The three main takeaways are: (1) The project targets a 40% reduction in infrastructure costs, (2) Phase 1 delivery is scheduled for Q3, and (3) A cross-functional team of 12 is required for execution.", timestamp: new Date("2024-03-20T14:32:15"), sources: ["PROJECT_PROPOSAL_FINAL.PDF"] },
    ],
  },
  "2": {
    name: "SYSTEM_SECURITY_POLICY.DOCX",
    messages: [
      { id: "h2-1", role: "assistant", content: "I've analyzed SYSTEM_SECURITY_POLICY.DOCX. You can now ask questions about its content.", timestamp: new Date("2024-03-21T09:16:00") },
      { id: "h2-2", role: "user", content: "Does this document discuss security or privacy protocols?", timestamp: new Date("2024-03-21T09:17:00") },
      { id: "h2-3", role: "assistant", content: "Yes. The document mandates AES-256 encryption for all data at rest, requires MFA for system access, and outlines a 72-hour breach notification window per GDPR compliance requirements.", timestamp: new Date("2024-03-21T09:17:20"), sources: ["SYSTEM_SECURITY_POLICY.DOCX"] },
    ],
  },
  "3": {
    name: "REDACTED_MEETING_NOTES.TXT",
    messages: [
      { id: "h3-1", role: "assistant", content: "I've analyzed REDACTED_MEETING_NOTES.TXT. You can now ask questions about its content.", timestamp: new Date("2024-03-22T16:46:00") },
    ],
  },
  "4": {
    name: "RESEARCH_DATA_V2.PDF",
    messages: [
      { id: "h4-1", role: "assistant", content: "I've analyzed RESEARCH_DATA_V2.PDF. You can now ask questions about its content.", timestamp: new Date("2024-03-23T11:21:00") },
      { id: "h4-2", role: "user", content: "Can you summarize the technical requirements mentioned in this file?", timestamp: new Date("2024-03-23T11:22:00") },
      { id: "h4-3", role: "assistant", content: "The technical requirements include: a minimum of 16GB RAM per node, a distributed storage layer with 99.99% uptime SLA, and support for parallel query execution across 8 processing cores.", timestamp: new Date("2024-03-23T11:22:30"), sources: ["RESEARCH_DATA_V2.PDF"] },
      { id: "h4-4", role: "user", content: "What datasets were used?", timestamp: new Date("2024-03-23T11:24:00") },
      { id: "h4-5", role: "assistant", content: "The study references three primary datasets: the CERN Open Data portal, a proprietary telemetry feed from 2023, and a synthetic benchmark set generated internally for stress testing.", timestamp: new Date("2024-03-23T11:24:18"), sources: ["RESEARCH_DATA_V2.PDF"] },
    ],
  },
  "5": {
    name: "NETWORK_LOG_EXCERPT.TXT",
    messages: [
      { id: "h5-1", role: "assistant", content: "I've analyzed NETWORK_LOG_EXCERPT.TXT. You can now ask questions about its content.", timestamp: new Date("2024-03-24T08:06:00") },
    ],
  },
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/documents/upload-zone";

export function ChatWindow({ initialDocId }: { initialDocId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null);
  const [showTLDR, setShowTLDR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (activeFileUrl) URL.revokeObjectURL(activeFileUrl);
    };
  }, [activeFileUrl]);

  // Load history for a doc selected from the sidebar
  useEffect(() => {
    if (!initialDocId) return;
    const entry = MOCK_DOC_HISTORY[initialDocId];
    if (!entry) return;
    setActiveFile(entry.name);
    setActiveFileUrl(null);
    setActiveFileContent(null);
    setMessages(entry.messages);
    setSuggestedQuestions([]);
  }, [initialDocId]);

  const handleUploadSuccess = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name;
    const url = URL.createObjectURL(file);

    setActiveFile(fileName);
    setActiveFileUrl(url);
    setShowTLDR(true);

    // Extract text content from the file
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/extract-text', { method: 'POST', body: formData });
      const data = await res.json();
      setActiveFileContent(data.text ?? null);
    } catch {
      setActiveFileContent(null);
    }
    
    setSuggestedQuestions([
      `What are the 3 main takeaways from ${fileName}?`,
      `Can you summarize the technical requirements mentioned in this file?`,
      `Does this document discuss security or privacy protocols?`
    ]);

    setMessages([
      {
        id: "init",
        role: "assistant",
        content: `I've analyzed ${fileName}. You can now ask questions about its content. I've highlighted the main points in the summary modal.`,
        timestamp: new Date(),
      }
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSummary = () => {
    const summaryText = `TL;DR Summary for: ${activeFile}\n\nThis document covers technical specifications and industrial design protocols. The key focus is on efficiency and secure data management within a brutalist architectural framework.`;
    const element = document.createElement("a");
    const file = new Blob([summaryText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeFile}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSend = async (overrideInput?: string) => {
    const query = overrideInput || input;
    if (!query.trim() || isLoading || !activeFile) return;

    setSuggestedQuestions([]);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ragQueryResponseGeneration({
        userQuery: query,
        retrievedContext: activeFileContent
          ? [activeFileContent]
          : [`Context extracted from ${activeFile}...`],
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: [activeFile],
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      toast({ variant: "destructive", title: "System Error", description: "Could not retrieve document context." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex flex-col h-full bg-card border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden items-center justify-center p-12 text-center space-y-8">
        <div className="w-20 h-20 bg-muted border-4 border-foreground flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Files className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">No Active Context</h2>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest max-w-sm">
            You must upload a document before the AI can provide intelligent responses.
          </p>
        </div>
        <div className="w-full max-w-md">
          <UploadZone compact onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-4 border-foreground bg-primary flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center">
            <Command className="h-5 w-5 text-background" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline font-black text-lg uppercase tracking-tighter leading-none">Contextual Chat</h2>
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest opacity-60">Source: {activeFile}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Button 
            onClick={() => setShowPreview(true)}
            variant="outline" 
            className="flex-1 sm:flex-none h-10 border-2 border-foreground bg-background font-black uppercase tracking-tighter gap-2 hover:bg-foreground hover:text-background transition-all"
          >
            <Eye className="h-4 w-4" /> View Document
          </Button>

          <Button 
            onClick={() => setShowTLDR(true)}
            variant="outline" 
            className="flex-1 sm:flex-none h-10 border-2 border-foreground bg-background font-black uppercase tracking-tighter gap-2 hover:bg-foreground hover:text-background transition-all"
          >
            <Zap className="h-4 w-4 text-primary" /> Get Summary
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 sm:flex-none h-10 border-2 border-foreground font-bold uppercase tracking-tighter gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all" 
            onClick={() => {
              setMessages([]);
              setActiveFile(null);
              setActiveFileUrl(null);
              setActiveFileContent(null);
              setSuggestedQuestions([]);
            }}
          >
            <Trash2 className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="border-4 border-foreground rounded-none shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] max-w-5xl h-[90vh] bg-card p-0 overflow-hidden flex flex-col">
          <DialogHeader className="bg-foreground text-background p-6 border-b-4 border-foreground flex flex-row items-center justify-between shrink-0">
            <div className="space-y-1">
              <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">Document Preview</DialogTitle>
              <DialogDescription className="font-mono text-[8px] font-bold uppercase tracking-[0.4em] text-background/60 leading-none">Source: {activeFile}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="text-background hover:bg-primary hover:text-foreground">
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>
          <div className="flex-1 bg-muted/30 p-4">
            {activeFileUrl ? (
              <iframe 
                src={activeFileUrl} 
                className="w-full h-full border-4 border-foreground bg-white"
                title="Document Preview"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <Files className="h-16 w-16 opacity-20" />
                <p className="font-headline font-black uppercase text-xl">Preview Unavailable</p>
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">The document could not be loaded into the viewer.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t-4 border-foreground bg-muted flex justify-between items-center font-mono text-[10px] font-black uppercase tracking-widest">
            <span>Security: AES-256 Vaulted</span>
            <Button onClick={() => setShowPreview(false)} className="bg-foreground text-background border-2 border-foreground rounded-none hover:bg-primary hover:text-foreground transition-all">Close Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TL;DR Modal */}
      <Dialog open={showTLDR} onOpenChange={setShowTLDR}>
        <DialogContent className="border-4 border-foreground rounded-none shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg bg-card p-0 overflow-hidden">
          <DialogHeader className="bg-primary p-8 border-b-4 border-foreground">
            <DialogTitle className="font-headline font-black text-3xl uppercase tracking-tighter">Initial Analysis</DialogTitle>
            <DialogDescription className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60">Source: {activeFile}</DialogDescription>
          </DialogHeader>
          <div className="p-10 space-y-8">
            <div className="p-6 bg-muted border-2 border-foreground font-medium text-sm leading-relaxed relative">
              <div className="absolute -top-3 left-4 bg-foreground text-background px-2 py-0.5 text-[8px] font-black uppercase">Executive Summary</div>
              This document contains detailed information about <span className="font-black underline decoration-primary decoration-4">System Protocols</span> and <span className="font-black underline decoration-primary decoration-4">Architectural Blueprints</span>. 
              <br /><br />
              The AI has indexed the full text and is ready to answer specific questions regarding its technical requirements.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleDownloadSummary}
                className="h-16 bg-primary text-foreground border-4 border-foreground rounded-none font-black uppercase tracking-tighter gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Download className="h-5 w-5" /> Download TL;DR
              </Button>
              <Button 
                onClick={() => setShowTLDR(false)}
                className="h-16 bg-foreground text-background border-4 border-foreground rounded-none font-black uppercase tracking-tighter gap-3 hover:bg-muted hover:text-foreground transition-all"
              >
                Start Chatting <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <ScrollArea className="flex-1 p-8 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" ref={scrollRef}>
        <div className="space-y-8 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-6 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex items-center justify-center shrink-0 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-foreground"
              )}>
                {msg.role === "user" ? <User className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
              </div>
              <div className="space-y-4 flex-1 group relative">
                <div className={cn(
                  "p-6 border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm font-medium leading-relaxed relative",
                  msg.role === "user" ? "bg-card" : "bg-muted/90"
                )}>
                  {msg.content}
                  
                  {msg.role === "assistant" && (
                    <button 
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="absolute top-2 right-2 p-2 bg-background border-2 border-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-mono text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                      <Files className="h-3 w-3" /> AI Covered Content From:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, i) => (
                        <span key={i} className="font-mono text-[8px] font-black uppercase tracking-tighter border-2 border-foreground px-3 py-1 bg-primary/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {!isLoading && messages.length === 1 && suggestedQuestions.length > 0 && (
            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                <Sparkles className="h-3 w-3 text-primary" /> Suggested Inquiries
              </div>
              <div className="grid gap-3">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="flex items-center gap-4 p-4 bg-card border-2 border-foreground text-left font-bold uppercase tracking-tighter text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-6 max-w-[85%] mr-auto">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 border-2 border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="bg-muted p-6 border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                Analyzing Neural Weights...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-8 border-t-4 border-foreground bg-card">
        <form
          className="flex items-center gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder={`Ask about ${activeFile}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-16 border-4 border-foreground rounded-none px-8 font-black uppercase tracking-tighter text-lg focus-visible:ring-primary shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-16 w-16 bg-primary text-foreground border-4 border-foreground rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <Send className="h-8 w-8" />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-6">
          <p className="font-mono text-[8px] font-black uppercase tracking-[0.4em] opacity-40">
            System: Connected // Vault: Encrypted
          </p>
          <div className="flex gap-4 font-mono text-[8px] font-black uppercase tracking-[0.4em] opacity-40">
            <span>Recall: 99.8%</span>
            <span>Latency: 42ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
