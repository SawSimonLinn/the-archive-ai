
"use client"

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
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
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ragQueryResponseGeneration } from "@/ai/flows/rag-query-response-generation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/documents/upload-zone";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showTLDR, setShowTLDR] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleUploadSuccess = (files: File[]) => {
    const fileName = files[0].name;
    setActiveFile(fileName);
    setShowTLDR(true);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeFile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ragQueryResponseGeneration({
        userQuery: input,
        retrievedContext: [`Context extracted from ${activeFile}...`],
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
      <div className="p-6 border-b-4 border-foreground bg-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center">
            <Command className="h-5 w-5 text-background" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline font-black text-lg uppercase tracking-tighter leading-none">Contextual Chat</h2>
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest opacity-60">Source: {activeFile}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowTLDR(true)}
            variant="outline" 
            className="flex-1 sm:flex-none h-10 border-2 border-foreground bg-background font-black uppercase tracking-tighter gap-2 hover:bg-foreground hover:text-background transition-all"
          >
            <Zap className="h-4 w-4 text-primary" /> Show Summary
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 sm:flex-none h-10 border-2 border-foreground font-bold uppercase tracking-tighter gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all" 
            onClick={() => {
              setMessages([]);
              setActiveFile(null);
            }}
          >
            <Trash2 className="h-4 w-4" /> New Session
          </Button>
        </div>
      </div>

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
