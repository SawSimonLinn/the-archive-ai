
"use client"

import { useCallback, useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ragQueryResponseGeneration } from "@/ai/flows/rag-query-response-generation";
import { searchDocumentChunks } from "@/ai/flows/vector-search";
import { Message } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UploadZone, UploadResult } from "@/components/documents/upload-zone";
import { supabase } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

type StoredDocumentRef = {
  id: string;
  name: string;
};

const CURRENT_DOCUMENT_KEY = "archive.currentDocument";
const PREVIOUS_DOCUMENT_KEY = "archive.previousDocument";

function readStoredDocument(key: string): StoredDocumentRef | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;

    const parsed = JSON.parse(value) as Partial<StoredDocumentRef>;
    if (typeof parsed.id === "string" && typeof parsed.name === "string") {
      return { id: parsed.id, name: parsed.name };
    }
  } catch {
    return null;
  }

  return null;
}

function writeStoredDocument(key: string, document: StoredDocumentRef) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(document));
}

function notifyActiveDocumentChanged(documentId: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("archive:active-document-changed", { detail: documentId }));
}

function buildInitialMessage(documentName: string, includeSummaryNote = false): Message {
  return {
    id: "init",
    role: "assistant",
    content: includeSummaryNote
      ? `I've analyzed ${documentName}. You can now ask questions about its content. I've highlighted the main points in the summary modal.`
      : `I've analyzed ${documentName}. You can now ask questions about its content.`,
    timestamp: new Date(),
  };
}

async function saveChatMessage(documentId: string, role: Message["role"], content: string) {
  const res = await fetch('/api/chat-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, role, content }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'Failed to save chat message');
  }
}

export function ChatWindow({ initialDocId }: { initialDocId?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null);
  const [documentSummary, setDocumentSummary] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [showTLDR, setShowTLDR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [previousDocument, setPreviousDocument] = useState<StoredDocumentRef | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rememberActiveDocument = useCallback((document: StoredDocumentRef, fallbackPrevious?: StoredDocumentRef | null) => {
    const currentDocument = fallbackPrevious ?? readStoredDocument(CURRENT_DOCUMENT_KEY);

    if (currentDocument && currentDocument.id !== document.id) {
      writeStoredDocument(PREVIOUS_DOCUMENT_KEY, currentDocument);
      setPreviousDocument(currentDocument);
    } else {
      const storedPrevious = readStoredDocument(PREVIOUS_DOCUMENT_KEY);
      setPreviousDocument(storedPrevious && storedPrevious.id !== document.id ? storedPrevious : null);
    }

    writeStoredDocument(CURRENT_DOCUMENT_KEY, document);
  }, []);

  const resetChatContext = useCallback((updateUrl = true) => {
    const lastActiveDocument =
      activeDocumentId && activeFile
        ? { id: activeDocumentId, name: activeFile }
        : readStoredDocument(CURRENT_DOCUMENT_KEY);

    if (lastActiveDocument) {
      writeStoredDocument(PREVIOUS_DOCUMENT_KEY, lastActiveDocument);
      setPreviousDocument(lastActiveDocument);
    }

    setMessages([]);
    setInput("");
    setActiveFile(null);
    setActiveDocumentId(null);
    setActiveFileUrl(null);
    setActiveFileContent(null);
    setDocumentSummary(null);
    setIsAnalysisLoading(false);
    setSuggestedQuestions([]);
    setShowPreview(false);
    setShowTLDR(false);

    if (updateUrl) {
      router.replace("/dashboard/chat");
      notifyActiveDocumentChanged(null);
    }
  }, [activeDocumentId, activeFile, router]);

  const goToDocument = useCallback((documentId: string) => {
    setShowPreview(false);
    setShowTLDR(false);
    setInput("");
    router.push(`/dashboard/chat?docId=${documentId}`);
    notifyActiveDocumentChanged(documentId);
  }, [router]);

  const canReturnToPreviousDocument = Boolean(
    previousDocument && previousDocument.id !== activeDocumentId
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (activeFileUrl) URL.revokeObjectURL(activeFileUrl);
    };
  }, [activeFileUrl]);

  useEffect(() => {
    setPreviousDocument(readStoredDocument(PREVIOUS_DOCUMENT_KEY) ?? readStoredDocument(CURRENT_DOCUMENT_KEY));
  }, []);

  useEffect(() => {
    if (!initialDocId) {
      if (activeDocumentId) resetChatContext(false);
      return;
    }
  }, [initialDocId]);

  // Load document + chat history when a doc is selected from the sidebar
  useEffect(() => {
    if (!initialDocId) return;
    if (activeDocumentId === initialDocId && activeFile) return;

    let cancelled = false;

    const load = async () => {
      setIsAnalysisLoading(true);
      const { data: doc } = await supabase
        .from('documents')
        .select('name')
        .eq('id', initialDocId)
        .single();

      if (!doc || cancelled) {
        if (!cancelled) setIsAnalysisLoading(false);
        return;
      }

      setActiveFile(doc.name);
      setActiveDocumentId(initialDocId);
      rememberActiveDocument({ id: initialDocId, name: doc.name });
      setActiveFileUrl(null);
      setActiveFileContent(null);
      setDocumentSummary(null);
      setSuggestedQuestions([]);

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('document_id', initialDocId)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length > 0) {
        setMessages(msgs.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
          sources: m.role === 'assistant' ? [doc.name] : undefined,
        })));
      } else {
        const initialMessage = buildInitialMessage(doc.name);
        setMessages([initialMessage]);
        void saveChatMessage(initialDocId, initialMessage.role, initialMessage.content).catch((error) => {
          console.error('Failed to save initial chat message:', error);
        });
      }

      try {
        const res = await fetch(`/api/documents/${initialDocId}/analysis`);
        if (!res.ok) throw new Error('Could not load document analysis');
        const analysis = await res.json();
        if (cancelled) return;

        setDocumentSummary(analysis.summary ?? null);
        setSuggestedQuestions((analysis.suggestedQuestions ?? []).filter(Boolean).slice(0, 3));
      } catch {
        if (!cancelled) {
          setDocumentSummary('The document was indexed, but a content-specific TL;DR could not be prepared from the stored chunks.');
          setSuggestedQuestions([]);
        }
      } finally {
        if (!cancelled) setIsAnalysisLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [initialDocId, activeDocumentId, activeFile, rememberActiveDocument]);

  const handleUploadSuccess = (result: UploadResult) => {
    const url = URL.createObjectURL(result.file);
    const fallbackPrevious =
      activeDocumentId && activeFile && activeDocumentId !== result.documentId
        ? { id: activeDocumentId, name: activeFile }
        : null;
    const initialMessage = buildInitialMessage(result.name, true);

    rememberActiveDocument({ id: result.documentId, name: result.name }, fallbackPrevious);
    setActiveFile(result.name);
    setActiveFileUrl(url);
    setActiveFileContent(result.text);
    setActiveDocumentId(result.documentId);
    setDocumentSummary(result.summary);
    setIsAnalysisLoading(false);
    setShowTLDR(true);

    setSuggestedQuestions(result.suggestedQuestions.filter(Boolean).slice(0, 3));

    setMessages([initialMessage]);

    void saveChatMessage(result.documentId, initialMessage.role, initialMessage.content).catch((error) => {
      console.error('Failed to save initial chat message:', error);
      toast({
        variant: "destructive",
        title: "Chat Save Failed",
        description: "The document loaded, but the starter chat could not be saved.",
      });
    });

    router.push(`/dashboard/chat?docId=${result.documentId}`);
    notifyActiveDocumentChanged(result.documentId);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Message copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSummary = () => {
    const summaryText = `TL;DR Summary for: ${activeFile}\n\n${documentSummary ?? 'No content-specific TL;DR is available for this document yet.'}`;
    const element = document.createElement("a");
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeFile}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSend = async (overrideInput?: string) => {
    const query = overrideInput || input;
    if (!query.trim() || isLoading || !activeFile || !activeDocumentId) return;

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
      // Save user message
      await saveChatMessage(activeDocumentId, 'user', query);

      // Vector search for relevant chunks, fall back to full text if none found
      let retrievedContext: string[];
      try {
        const chunks = await searchDocumentChunks(query, activeDocumentId);
        retrievedContext = chunks.length > 0
          ? chunks
          : activeFileContent
            ? [activeFileContent.slice(0, 8000)]
            : [`Context extracted from ${activeFile}...`];
      } catch {
        retrievedContext = activeFileContent
          ? [activeFileContent.slice(0, 8000)]
          : [`Context extracted from ${activeFile}...`];
      }

      const response = await ragQueryResponseGeneration({
        userQuery: query,
        retrievedContext,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: [activeFile],
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save AI response
      await saveChatMessage(activeDocumentId, 'assistant', response.answer);
    } catch {
      toast({ variant: "destructive", title: "System Error", description: "Could not save or retrieve document context." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden border-4 border-foreground bg-card p-6 text-center">
        <SidebarTrigger className="absolute left-4 top-4 h-9 w-9 rounded-none border-2 border-foreground bg-background hover:bg-foreground hover:text-background" />
        <div className="mb-6 flex h-16 w-16 items-center justify-center border-4 border-foreground bg-muted shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <Files className="h-8 w-8 text-primary" />
        </div>
        <div className="mb-8 space-y-2">
          <h2 className="font-headline text-2xl font-black uppercase tracking-tighter">No Active Context</h2>
          <p className="max-w-sm text-xs font-medium uppercase tracking-widest text-muted-foreground">
            You must upload a document before the AI can provide intelligent responses.
          </p>
        </div>
        {previousDocument && (
          <Button
            onClick={() => goToDocument(previousDocument.id)}
            variant="outline"
            className="mb-6 h-11 max-w-md border-2 border-foreground bg-background px-4 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background"
            title={`Back to ${previousDocument.name}`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">Back to {previousDocument.name}</span>
          </Button>
        )}
        <div className="w-full max-w-md">
          <UploadZone compact onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden border-4 border-foreground bg-card">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b-4 border-foreground bg-primary px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="h-9 w-9 shrink-0 rounded-none border-2 border-foreground bg-background hover:bg-foreground hover:text-background" />
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground">
            <Command className="h-5 w-5 text-background" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-headline text-base font-black uppercase leading-none tracking-tighter">Chat</h2>
            <span className="block truncate font-mono text-[9px] font-bold uppercase tracking-widest opacity-65">
              {activeFile}
            </span>
          </div>
        </div>

        <div className="grid w-full grid-cols-4 gap-2 lg:flex lg:w-auto lg:items-center">
          <Button
            onClick={() => {
              if (previousDocument) goToDocument(previousDocument.id);
            }}
            disabled={!canReturnToPreviousDocument || isLoading}
            variant="outline"
            className="h-10 min-w-0 border-2 border-foreground bg-background px-3 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-45"
            title={canReturnToPreviousDocument ? `Back to ${previousDocument?.name}` : "No previous file yet"}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="h-10 min-w-0 border-2 border-foreground bg-background px-3 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background"
            title="View document"
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Document</span>
          </Button>

          <Button
            onClick={() => setShowTLDR(true)}
            variant="outline"
            className="h-10 min-w-0 border-2 border-foreground bg-background px-3 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background"
            title="View summary"
          >
            {isAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary" />}
            <span className="hidden sm:inline">{isAnalysisLoading ? "Preparing" : "Summary"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-10 min-w-0 border-2 border-foreground px-3 font-bold uppercase tracking-tighter transition-all hover:bg-destructive hover:text-destructive-foreground"
            title="Reset chat"
            onClick={() => resetChatContext()}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Reset</span>
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
              {isAnalysisLoading ? (
                <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em]">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Preparing document-specific TL;DR...
                </div>
              ) : (
                <div className="whitespace-pre-line">
                  {documentSummary ?? 'No content-specific TL;DR is available for this document yet.'}
                </div>
              )}
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
      <ScrollArea className="min-h-0 flex-1 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" ref={scrollRef}>
        <div className="space-y-5 p-4 md:p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[94%] gap-3 md:gap-4",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-foreground"
              )}>
                {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className="group relative flex-1 space-y-2">
                <div className={cn(
                  "relative border-2 border-foreground p-4 text-sm font-medium leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-5",
                  msg.role === "user" ? "bg-card" : "bg-muted/90"
                )}>
                  {msg.content}

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="absolute right-2 top-2 border-2 border-foreground bg-background p-2 opacity-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary group-hover:opacity-100"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {!isLoading && messages.length === 1 && suggestedQuestions.length > 0 && (
            <div className="animate-in space-y-3 pt-2 fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.25em] opacity-45">
                <Sparkles className="h-3 w-3 text-primary" /> Suggested
              </div>
              <div className="grid gap-3">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="flex items-center gap-3 border-2 border-foreground bg-card p-3 text-left text-sm font-bold uppercase tracking-tighter shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-primary hover:shadow-none"
                  >
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mr-auto flex max-w-[85%] gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="animate-pulse border-2 border-foreground bg-muted p-4 text-xs font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 border-t-4 border-foreground bg-card p-4 md:p-5">
        <form
          className="flex items-center gap-3 md:gap-4"
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
            className="h-14 flex-1 rounded-none border-4 border-foreground px-5 text-sm font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus-visible:ring-primary md:text-base"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-14 w-14 rounded-none border-4 border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <Send className="h-6 w-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}
