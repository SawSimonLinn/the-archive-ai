
"use client"

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, Trash2, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { ragQueryResponseGeneration } from "@/ai/flows/rag-query-response-generation";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "SESSION INITIALIZED. I am synchronized with your document index. Awaiting query input.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      const mockRetrievedContext = [
        "Knowledge base content snippet A about document structure...",
        "Policy details regarding document security and processing...",
      ];

      const response = await ragQueryResponseGeneration({
        userQuery: input,
        retrievedContext: mockRetrievedContext,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: ["Document_A.pdf", "Security_Manual.docx"],
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "ERROR: System interrupted. Failed to retrieve semantic match.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="p-6 border-b-4 border-foreground bg-primary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center">
            <Command className="h-5 w-5 text-background" />
          </div>
          <h2 className="font-headline font-black text-xl uppercase tracking-tighter">Neural Interface</h2>
        </div>
        <Button variant="ghost" size="sm" className="h-10 border-2 border-foreground font-bold uppercase tracking-tighter gap-2 hover:bg-foreground hover:text-background" onClick={() => setMessages([messages[0]])}>
          <Trash2 className="h-4 w-4" /> Purge Logs
        </Button>
      </div>

      <ScrollArea className="flex-1 p-8 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-100" ref={scrollRef}>
        <div className="space-y-8 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex items-center justify-center shrink-0 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-foreground"
              )}>
                {msg.role === "user" ? <User className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
              </div>
              <div className="space-y-3">
                <div className={cn(
                  "p-5 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-medium leading-relaxed",
                  msg.role === "user" ? "bg-card" : "bg-muted/80"
                )}>
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="font-mono text-[9px] uppercase font-black tracking-widest bg-foreground text-background px-2 py-0.5">Verified Sources:</span>
                    {msg.sources.map((s, i) => (
                      <span key={i} className="font-mono text-[9px] font-black uppercase tracking-tighter border-2 border-foreground px-2 py-0.5 bg-primary/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] mr-auto">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 border-2 border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="bg-muted p-5 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest animate-pulse">
                RETRIEVING_DATA...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t-4 border-foreground bg-card">
        <form
          className="flex items-center gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="INJECT QUERY HERE..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-16 border-2 border-foreground rounded-none px-6 font-bold uppercase tracking-tighter text-lg focus-visible:ring-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-16 w-16 bg-primary text-foreground border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <Send className="h-8 w-8" />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-4">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
            System status: nominal // encryption: active
          </p>
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
            v.4.0.1 Stable
          </p>
        </div>
      </div>
    </div>
  );
}
