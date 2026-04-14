
"use client"

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { ragQueryResponseGeneration } from "@/ai/flows/rag-query-response-generation";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Knowledge Assistant. Ask me anything about your uploaded documents.",
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
      // Simulate RAG Flow
      // In a real app, we'd fetch chunks from pgvector first
      // But we simulate retrieval for this UI
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
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-headline font-bold text-sm">Knowledge Chat</h2>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2">
          <Book className="h-3 w-3" /> Clear History
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === "user" ? "bg-accent text-accent-foreground border-accent" : "bg-primary text-primary-foreground border-primary"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className="space-y-2">
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-muted rounded-tl-none text-foreground"
                )}>
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Sources:</span>
                    {msg.sources.map((s, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary-foreground border border-primary/20 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary text-primary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="Ask anything about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI Knowledge Assistant answers strictly based on your provided document context.
        </p>
      </div>
    </div>
  );
}
