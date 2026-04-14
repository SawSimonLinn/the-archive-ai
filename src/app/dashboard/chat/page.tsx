
"use client"

import { ChatWindow } from "@/components/chat/chat-window";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId") ?? undefined;

  return <ChatWindow initialDocId={docId} />;
}

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-headline font-bold">Knowledge Query</h2>
        <p className="text-muted-foreground flex items-center gap-2">
          <Search className="h-4 w-4" /> Ask questions about your personal document index.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={null}>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  );
}
