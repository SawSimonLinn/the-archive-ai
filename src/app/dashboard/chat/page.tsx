
"use client"

import { ChatWindow } from "@/components/chat/chat-window";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId") ?? undefined;

  return <ChatWindow initialDocId={docId} />;
}

export default function ChatPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex-1 min-h-0 w-full">
        <Suspense fallback={null}>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  );
}
