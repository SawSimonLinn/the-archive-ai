
"use client"

import { Fragment, useCallback, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  User,
  Bot,
  Loader2,
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
  X,
  Lock,
  MessageSquare,
  FileText,
  ExternalLink,
  SlidersHorizontal,
  Brain,
  Search,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { formatPlanLimit } from "@/lib/billing";
import {
  CHAT_MODEL_OPTIONS,
  DEFAULT_CHAT_MODEL_ID,
  DEFAULT_RETRIEVAL_MODE_ID,
  RETRIEVAL_MODE_OPTIONS,
  canUseChatModel,
  canUseRetrievalMode,
  getChatModelOption,
  getRetrievalModeOption,
  normalizeChatModelId,
  normalizeRetrievalModeId,
  type ChatModelId,
  type RetrievalModeId,
} from "@/lib/chat-options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { UploadZone, UploadResult } from "@/components/documents/upload-zone";
import { UpgradeModal } from "@/components/upgrade-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import type { UpgradeReason } from "@/components/upgrade-modal";
import { useBillingPlan } from "@/hooks/use-billing-plan";

type StoredDocumentRef = {
  id: string;
  name: string;
};

type SavedChatMessage = {
  id: string;
  role: Message["role"];
  content: string;
  created_at: string;
};

type AskDocumentResponse = {
  userMessage: SavedChatMessage;
  assistantMessage: SavedChatMessage;
};

type AskDocumentOptions = {
  model: ChatModelId;
  retrievalMode: RetrievalModeId;
};

type LoadedDocumentRef = StoredDocumentRef & {
  summary?: string | null;
  suggestedQuestions?: unknown;
};

type ChatDocumentRef = StoredDocumentRef & {
  size?: number | null;
  created_at?: string | null;
};

type DocumentPreview = StoredDocumentRef & {
  type?: string | null;
  size?: number | null;
  text: string;
  signedUrl?: string | null;
};

const CURRENT_DOCUMENT_KEY = "archive.currentDocument";
const PREVIOUS_DOCUMENT_KEY = "archive.previousDocument";
const CHAT_MODEL_KEY = "archive.chatModel";
const RETRIEVAL_MODE_KEY = "archive.retrievalMode";

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

function readStoredChatModel() {
  if (typeof window === "undefined") return DEFAULT_CHAT_MODEL_ID;
  return normalizeChatModelId(window.localStorage.getItem(CHAT_MODEL_KEY));
}

function readStoredRetrievalMode() {
  if (typeof window === "undefined") return DEFAULT_RETRIEVAL_MODE_ID;
  return normalizeRetrievalModeId(window.localStorage.getItem(RETRIEVAL_MODE_KEY));
}

function writeStoredChatPreference(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function clearStoredDocumentRefs(documentId: string) {
  if (typeof window === "undefined") return;

  [CURRENT_DOCUMENT_KEY, PREVIOUS_DOCUMENT_KEY].forEach((key) => {
    const document = readStoredDocument(key);
    if (document?.id === documentId) {
      window.localStorage.removeItem(key);
    }
  });
}

function notifyActiveDocumentChanged(documentId: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("archive:active-document-changed", { detail: documentId }));
}

function normalizeSuggestedQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((question): question is string => typeof question === "string" && question.trim().length > 0)
    .map(question => question.trim())
    .slice(0, 3);
}

function normalizeDocumentList(value: unknown): ChatDocumentRef[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((doc): doc is ChatDocumentRef => {
      const candidate = doc as Partial<ChatDocumentRef>;
      return typeof candidate.id === "string" && typeof candidate.name === "string";
    })
    .map(doc => ({
      id: doc.id,
      name: doc.name,
      size: typeof doc.size === "number" ? doc.size : null,
      created_at: typeof doc.created_at === "string" ? doc.created_at : null,
    }));
}

function formatFileSize(size: number | null | undefined) {
  if (!size) return "Size unknown";

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: value >= 10 ? 0 : 1 })} ${units[unitIndex]}`;
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

async function askDocumentQuestion(documentId: string, message: string, options: AskDocumentOptions): Promise<
  | { rateLimited: true; premiumRequired: false }
  | { rateLimited: false; premiumRequired: true }
  | { rateLimited: false; premiumRequired: false; data: AskDocumentResponse }
> {
  const res = await fetch(`/api/documents/${documentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      model: options.model,
      retrievalMode: options.retrievalMode,
    }),
  });

  if (res.status === 429) {
    return { rateLimited: true, premiumRequired: false };
  }

  if (res.status === 403) {
    const data = await res.json().catch(() => null);
    if (data?.error === "premium_ai_required") {
      return { rateLimited: false, premiumRequired: true };
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'Failed to send chat message');
  }

  return { rateLimited: false, premiumRequired: false, data: await res.json() };
}

function ChatModelIcon({ modelId }: { modelId: ChatModelId }) {
  if (modelId === "gpt-5.5") return <Brain className="h-4 w-4" />;
  if (modelId === "gpt-4o") return <Cpu className="h-4 w-4" />;
  return <Bot className="h-4 w-4" />;
}

function RetrievalModeIcon({ modeId }: { modeId: RetrievalModeId }) {
  if (modeId === "research") return <Search className="h-4 w-4" />;
  if (modeId === "llm") return <Brain className="h-4 w-4" />;
  return <Files className="h-4 w-4" />;
}

function normalizeMarkdown(content: string) {
  return content
    .trim()
    .replace(/\s+(\d+\.\s+\*\*)/g, '\n\n$1')
    .replace(/:\s+-\s+/g, ':\n- ')
    .replace(/\s+-\s+(\*\*)/g, '\n- $1');
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="border border-foreground/20 bg-background px-1 py-0.5 font-mono text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function MarkdownMessage({ content, className }: { content: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = normalizeMarkdown(content).split('\n');
  let paragraph: string[] = [];
  let listItems: ReactNode[] = [];
  let listType: 'ol' | 'ul' | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;

    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-3 last:mb-0">
        {renderInlineMarkdown(paragraph.join(' '))}
      </p>
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;

    const ListTag = listType;
    blocks.push(
      <ListTag
        key={`list-${blocks.length}`}
        className={cn(
          "mb-4 space-y-2 pl-5 last:mb-0",
          listType === 'ol' ? "list-decimal" : "list-disc"
        )}
      >
        {listItems}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  const pushListItem = (type: 'ol' | 'ul', text: string) => {
    flushParagraph();
    if (listType && listType !== type) flushList();
    listType = type;
    listItems.push(
      <li key={`li-${blocks.length}-${listItems.length}`} className="pl-1">
        {renderInlineMarkdown(text)}
      </li>
    );
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="mb-3 font-headline text-base font-black uppercase tracking-tighter">
          {renderInlineMarkdown(heading[2])}
        </h3>
      );
      return;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      pushListItem('ol', ordered[1]);
      return;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      pushListItem('ul', unordered[1]);
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return <div className={cn("max-w-none text-sm leading-relaxed", className)}>{blocks}</div>;
}

function ChatWindowSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden border-4 border-foreground bg-card">
      <div className="flex shrink-0 flex-col gap-3 border-b-4 border-foreground bg-primary px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="h-9 w-9 shrink-0 rounded-none border-2 border-foreground bg-background hover:bg-foreground hover:text-background" />
          <Skeleton className="h-9 w-9 shrink-0 rounded-none border-2 border-foreground bg-foreground/30" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-16 rounded-none bg-foreground/25" />
            <Skeleton className="h-3 w-44 rounded-none bg-foreground/20" />
          </div>
        </div>

        <div className="grid w-full grid-cols-4 gap-2 lg:flex lg:w-auto lg:items-center">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              className="h-10 rounded-none border-2 border-foreground bg-background/55 lg:w-28"
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]">
        <div className="space-y-5 p-4 md:p-6">
          {[0, 1, 2].map((item) => {
            const isUser = item === 1;

            return (
              <div
                key={item}
                className={cn(
                  "flex max-w-[94%] gap-3",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-none border-2 border-foreground bg-primary/60 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" />
                <div className="flex-1 border-2 border-foreground bg-muted/90 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-5">
                  <Skeleton className="mb-3 h-4 w-11/12 rounded-none bg-foreground/20" />
                  <Skeleton className="mb-3 h-4 w-4/5 rounded-none bg-foreground/20" />
                  {!isUser && <Skeleton className="h-4 w-2/3 rounded-none bg-foreground/20" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t-4 border-foreground bg-card p-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Skeleton className="h-14 flex-1 rounded-none border-4 border-foreground bg-muted" />
          <Skeleton className="h-14 w-14 rounded-none border-4 border-foreground bg-primary/60" />
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({ initialDocId }: { initialDocId?: string }) {
  const router = useRouter();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(initialDocId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [documentSummary, setDocumentSummary] = useState<string | null>(null);
  const [showTLDR, setShowTLDR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAiControls, setShowAiControls] = useState(false);
  const [selectedChatModel, setSelectedChatModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL_ID);
  const [selectedRetrievalMode, setSelectedRetrievalMode] = useState<RetrievalModeId>(DEFAULT_RETRIEVAL_MODE_ID);
  const [draftChatModel, setDraftChatModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL_ID);
  const [draftRetrievalMode, setDraftRetrievalMode] = useState<RetrievalModeId>(DEFAULT_RETRIEVAL_MODE_ID);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; reason: UpgradeReason }>({ open: false, reason: "document_limit" });
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [previousDocument, setPreviousDocument] = useState<StoredDocumentRef | null>(null);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [documents, setDocuments] = useState<ChatDocumentRef[]>([]);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { plan, isLoading: isPlanLoading } = useBillingPlan();
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateSelectedChatModel = useCallback((modelId: ChatModelId) => {
    setSelectedChatModel(modelId);
    writeStoredChatPreference(CHAT_MODEL_KEY, modelId);
  }, []);

  const updateSelectedRetrievalMode = useCallback((modeId: RetrievalModeId) => {
    setSelectedRetrievalMode(modeId);
    writeStoredChatPreference(RETRIEVAL_MODE_KEY, modeId);
  }, []);

  const handleAiControlsOpenChange = useCallback((open: boolean) => {
    if (open) {
      setDraftChatModel(selectedChatModel);
      setDraftRetrievalMode(selectedRetrievalMode);
    }

    setShowAiControls(open);
  }, [selectedChatModel, selectedRetrievalMode]);

  const handleSaveAiControls = useCallback(() => {
    updateSelectedChatModel(draftChatModel);
    updateSelectedRetrievalMode(draftRetrievalMode);
    setShowAiControls(false);
    toast({
      title: "AI Controls Saved",
      description: `${getChatModelOption(draftChatModel).label} / ${getRetrievalModeOption(draftRetrievalMode).label}`,
    });
  }, [draftChatModel, draftRetrievalMode, updateSelectedChatModel, updateSelectedRetrievalMode]);

  useEffect(() => {
    const storedChatModel = readStoredChatModel();
    const storedRetrievalMode = readStoredRetrievalMode();
    setSelectedChatModel(storedChatModel);
    setSelectedRetrievalMode(storedRetrievalMode);
    setDraftChatModel(storedChatModel);
    setDraftRetrievalMode(storedRetrievalMode);
  }, []);

  useEffect(() => {
    if (isPlanLoading) return;

    if (!canUseChatModel(plan.id, selectedChatModel)) {
      updateSelectedChatModel(DEFAULT_CHAT_MODEL_ID);
    }

    if (!canUseRetrievalMode(plan.id, selectedRetrievalMode)) {
      updateSelectedRetrievalMode(DEFAULT_RETRIEVAL_MODE_ID);
    }
  }, [
    isPlanLoading,
    plan.id,
    selectedChatModel,
    selectedRetrievalMode,
    updateSelectedChatModel,
    updateSelectedRetrievalMode,
  ]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await fetch('/api/documents', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const nextDocuments = normalizeDocumentList(data.documents);
      setDocuments(nextDocuments);
      setDocCount(nextDocuments.length);
    };

    void fetchDocuments();

    const handleDocumentsChanged = () => void fetchDocuments();
    const handleDocumentDeleted = () => {
      setDocCount(currentCount => currentCount === null ? null : Math.max(currentCount - 1, 0));
      setUpgradeModal(currentModal =>
        currentModal.reason === "document_limit" ? { ...currentModal, open: false } : currentModal
      );
      void fetchDocuments();
    };

    window.addEventListener("archive:documents-changed", handleDocumentsChanged);
    window.addEventListener("archive:document-deleted", handleDocumentDeleted);

    return () => {
      window.removeEventListener("archive:documents-changed", handleDocumentsChanged);
      window.removeEventListener("archive:document-deleted", handleDocumentDeleted);
    };
  }, []);

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

  const resetChatContext = useCallback((updateUrl = true, preservePrevious = true) => {
    const lastActiveDocument =
      activeDocumentId && activeFile
        ? { id: activeDocumentId, name: activeFile }
        : readStoredDocument(CURRENT_DOCUMENT_KEY);

    if (preservePrevious && lastActiveDocument) {
      writeStoredDocument(PREVIOUS_DOCUMENT_KEY, lastActiveDocument);
      setPreviousDocument(lastActiveDocument);
    } else if (!preservePrevious) {
      setPreviousDocument(readStoredDocument(PREVIOUS_DOCUMENT_KEY));
    }

    setMessages([]);
    setInput("");
    setActiveFile(null);
    setActiveDocumentId(null);
    setIsChatLoading(false);
    setDocumentSummary(null);
    setSuggestedQuestions([]);
    setShowPreview(false);
    setPreviewDocumentId(null);
    setPreviewDocument(null);
    setPreviewError(null);
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

  const openDocumentViewer = useCallback(() => {
    setPreviewDocumentId(activeDocumentId ?? selectedDocumentId ?? documents[0]?.id ?? null);
    setShowPreview(true);
  }, [activeDocumentId, documents, selectedDocumentId]);

  const canReturnToPreviousDocument = Boolean(
    previousDocument && previousDocument.id !== activeDocumentId
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setPreviousDocument(readStoredDocument(PREVIOUS_DOCUMENT_KEY) ?? readStoredDocument(CURRENT_DOCUMENT_KEY));
  }, []);

  useEffect(() => {
    if (initialDocId) {
      setSelectedDocumentId(initialDocId);
    }
  }, [initialDocId]);

  useEffect(() => {
    const handleActiveDocumentChange = (event: Event) => {
      setSelectedDocumentId((event as CustomEvent<string | null>).detail ?? null);
    };
    const handlePopState = () => {
      setSelectedDocumentId(new URLSearchParams(window.location.search).get("docId"));
    };

    window.addEventListener("archive:active-document-changed", handleActiveDocumentChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("archive:active-document-changed", handleActiveDocumentChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleDocumentDeleted = (event: Event) => {
      const deletedDocumentId = (event as CustomEvent<string>).detail;
      if (!deletedDocumentId) return;

      clearStoredDocumentRefs(deletedDocumentId);
      setPreviousDocument(currentDocument =>
        currentDocument?.id === deletedDocumentId ? readStoredDocument(PREVIOUS_DOCUMENT_KEY) : currentDocument
      );
      setDocuments(currentDocuments => currentDocuments.filter(documentRef => documentRef.id !== deletedDocumentId));
      if (previewDocumentId === deletedDocumentId) {
        setPreviewDocumentId(null);
        setPreviewDocument(null);
        setPreviewError(null);
      }
      if (selectedDocumentId === deletedDocumentId || activeDocumentId === deletedDocumentId) {
        setSelectedDocumentId(null);
        resetChatContext(false, false);
      }
    };

    window.addEventListener("archive:document-deleted", handleDocumentDeleted);
    return () => window.removeEventListener("archive:document-deleted", handleDocumentDeleted);
  }, [activeDocumentId, previewDocumentId, resetChatContext, selectedDocumentId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      if (activeDocumentId) resetChatContext(false);
      setIsChatLoading(false);
      return;
    }
  }, [selectedDocumentId, activeDocumentId, resetChatContext]);

  useEffect(() => {
    if (!showPreview || previewDocumentId || documents.length === 0) return;
    setPreviewDocumentId(activeDocumentId ?? selectedDocumentId ?? documents[0].id);
  }, [activeDocumentId, documents, previewDocumentId, selectedDocumentId, showPreview]);

  useEffect(() => {
    if (!showPreview) {
      setIsPreviewLoading(false);
      setPreviewError(null);
      return;
    }

    if (!previewDocumentId) {
      setPreviewDocument(null);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      setPreviewDocument(null);

      try {
        const res = await fetch(`/api/documents/${previewDocumentId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not load document preview');

        const data = await res.json();
        if (cancelled) return;

        const preview: DocumentPreview = {
          id: data.document?.id ?? previewDocumentId,
          name: data.document?.name ?? "Untitled Document",
          type: typeof data.document?.type === "string" ? data.document.type : null,
          size: typeof data.document?.size === "number" ? data.document.size : null,
          text: typeof data.text === "string" ? data.text : "",
          signedUrl: typeof data.signedUrl === "string" ? data.signedUrl : null,
        };

        setPreviewDocument(preview);
      } catch {
        if (!cancelled) {
          setPreviewDocument(null);
          setPreviewError("Could not load this document.");
        }
      } finally {
        if (!cancelled) setIsPreviewLoading(false);
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [activeDocumentId, previewDocumentId, showPreview]);

  // Load document + chat history when a doc is selected from the sidebar
  useEffect(() => {
    if (!selectedDocumentId) return;
    if (activeDocumentId === selectedDocumentId && activeFile) return;

    let cancelled = false;

    const load = async () => {
      setIsChatLoading(true);

      let chatData: {
        document: LoadedDocumentRef;
        messages: SavedChatMessage[];
      };

      try {
        const chatRes = await fetch(`/api/documents/${selectedDocumentId}/chat`, { cache: 'no-store' });
        if (!chatRes.ok) throw new Error('Could not load document chat');
        chatData = await chatRes.json();
      } catch {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Chat Load Failed",
            description: "Could not load the saved document chat.",
          });
          setIsChatLoading(false);
        }
        return;
      }

      if (cancelled) return;

      const doc = chatData.document;
      const msgs = chatData.messages ?? [];

      setActiveFile(doc.name);
      setActiveDocumentId(selectedDocumentId);
      rememberActiveDocument({ id: selectedDocumentId, name: doc.name });
      const savedSummary = typeof doc.summary === "string" && doc.summary.trim().length > 0
        ? doc.summary
        : null;
      setDocumentSummary(savedSummary);
      setSuggestedQuestions(normalizeSuggestedQuestions(doc.suggestedQuestions));

      if (msgs.length > 0) {
        setMessages(msgs.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
          sources: m.role === 'assistant' ? [doc.name] : undefined,
        })));
      } else {
        const initialMessage = buildInitialMessage(doc.name);
        setMessages([initialMessage]);
      }

      setIsChatLoading(false);

      if (savedSummary) return;

      try {
        const res = await fetch(`/api/documents/${selectedDocumentId}/analysis`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not load document analysis');
        const analysis = await res.json();
        if (cancelled) return;

        setDocumentSummary(analysis.summary ?? null);
        setSuggestedQuestions(normalizeSuggestedQuestions(analysis.suggestedQuestions));
      } catch {
        if (!cancelled) {
          setDocumentSummary('The document was indexed, but a content-specific TL;DR could not be prepared from the stored chunks.');
          setSuggestedQuestions([]);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId, activeDocumentId, activeFile, rememberActiveDocument]);

  const handleUploadSuccess = (result: UploadResult) => {
    const fallbackPrevious =
      activeDocumentId && activeFile && activeDocumentId !== result.documentId
        ? { id: activeDocumentId, name: activeFile }
        : null;
    const initialMessage = buildInitialMessage(result.name, true);

    rememberActiveDocument({ id: result.documentId, name: result.name }, fallbackPrevious);
    setActiveFile(result.name);
    setIsChatLoading(false);
    setActiveDocumentId(result.documentId);
    setDocumentSummary(result.summary);
    setShowTLDR(true);

    setSuggestedQuestions(normalizeSuggestedQuestions(result.suggestedQuestions));

    setMessages([initialMessage]);

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
      const chatResult = await askDocumentQuestion(activeDocumentId, query, {
        model: selectedChatModel,
        retrievalMode: selectedRetrievalMode,
      });
      if (chatResult.rateLimited) {
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        setInput(query);
        setUpgradeModal({ open: true, reason: "rate_limit" });
        return;
      }
      if (chatResult.premiumRequired) {
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        setInput(query);
        setUpgradeModal({ open: true, reason: "premium_ai" });
        return;
      }

      const savedUserMessage = chatResult.data.userMessage;
      const savedAssistantMessage = chatResult.data.assistantMessage;

      const aiMsg: Message = {
        id: savedAssistantMessage.id,
        role: "assistant",
        content: savedAssistantMessage.content,
        timestamp: new Date(savedAssistantMessage.created_at),
        sources: [activeFile],
      };

      setMessages(prev => [
        ...prev.map(message =>
          message.id === userMsg.id
            ? { ...message, id: savedUserMessage.id, timestamp: new Date(savedUserMessage.created_at) }
            : message
        ),
        aiMsg,
      ]);
    } catch {
      toast({ variant: "destructive", title: "System Error", description: "Could not save or retrieve document context." });
    } finally {
      setIsLoading(false);
    }
  };

  const isOpeningDocument = Boolean(selectedDocumentId && activeDocumentId !== selectedDocumentId);

  if (isChatLoading || isOpeningDocument) {
    return <ChatWindowSkeleton />;
  }

  const documentLimit = plan.maxDocuments;
  const atDocumentLimit =
    !isPlanLoading && docCount !== null && documentLimit !== null && docCount >= documentLimit;

  if (!activeFile) {
    return (
      <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden border-4 border-foreground bg-card p-6 text-center">
        <SidebarTrigger className="absolute left-4 top-4 h-9 w-9 rounded-none border-2 border-foreground bg-background hover:bg-foreground hover:text-background" />

        {atDocumentLimit ? (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center border-4 border-destructive bg-destructive/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div className="mb-8 space-y-2">
              <h2 className="font-headline text-2xl font-black uppercase tracking-tighter">Document Limit Reached</h2>
              <p className="max-w-sm text-xs font-medium uppercase tracking-widest text-muted-foreground">
                You've used all {formatPlanLimit(documentLimit)} document slots on {plan.name}. Upgrade your plan to add more files.
              </p>
            </div>
            {previousDocument && (
              <Button
                onClick={() => goToDocument(previousDocument.id)}
                variant="outline"
                className="mb-4 h-11 max-w-md border-2 border-foreground bg-background px-4 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background"
                title={`Back to ${previousDocument.name}`}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">Back to {previousDocument.name}</span>
              </Button>
            )}
            <Button
              onClick={() => setUpgradeModal({ open: true, reason: "document_limit" })}
              className="h-12 px-8 bg-primary text-foreground border-4 border-foreground rounded-none font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Zap className="h-5 w-5 mr-2" /> Upgrade Plan
            </Button>
          </>
        ) : (
          <>
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
              <UploadZone
                compact
                onUploadSuccess={handleUploadSuccess}
                onLimitReached={() => setUpgradeModal({ open: true, reason: "document_limit" })}
                onUpgradeRequired={(reason) => setUpgradeModal({ open: true, reason })}
              />
            </div>
          </>
        )}

        <UpgradeModal
          open={upgradeModal.open}
          reason={upgradeModal.reason}
          onClose={() => setUpgradeModal(prev => ({ ...prev, open: false }))}
        />
      </div>
    );
  }

  const activeChatModelOption = getChatModelOption(selectedChatModel);
  const activeRetrievalModeOption = getRetrievalModeOption(selectedRetrievalMode);
  const draftChatModelOption = getChatModelOption(draftChatModel);
  const draftRetrievalModeOption = getRetrievalModeOption(draftRetrievalMode);
  const hasDraftAiChanges =
    draftChatModel !== selectedChatModel || draftRetrievalMode !== selectedRetrievalMode;

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

        <div className="grid w-full grid-cols-3 gap-2 lg:flex lg:w-auto lg:items-center">
          <Button
            onClick={() => {
              if (previousDocument) goToDocument(previousDocument.id);
            }}
            disabled={!canReturnToPreviousDocument || isLoading}
            variant="outline"
            className="h-10 min-w-0 border-2 border-foreground bg-background px-3 font-black uppercase tracking-tighter transition-all hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-45 lg:hidden"
            title={canReturnToPreviousDocument ? `Back to ${previousDocument?.name}` : "No previous file yet"}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button
            onClick={openDocumentViewer}
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
            <Zap className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Summary</span>
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent hideCloseButton className="flex h-[90vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden rounded-none border-4 border-foreground bg-card p-0 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="bg-foreground text-background p-6 border-b-4 border-foreground flex flex-row items-center justify-between shrink-0">
            <div className="space-y-1">
              <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">Documents</DialogTitle>
              <DialogDescription className="font-mono text-[8px] font-bold uppercase tracking-[0.4em] text-background/60 leading-none">
                {documents.length} {documents.length === 1 ? "source" : "sources"} available
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="text-background hover:bg-primary hover:text-foreground">
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 bg-muted/30 lg:grid-cols-[18rem_1fr]">
            <aside className="min-h-0 border-b-4 border-foreground bg-card lg:border-b-0 lg:border-r-4">
              <div className="border-b-2 border-foreground p-4">
                <p className="font-mono text-[9px] font-black uppercase tracking-[0.3em] opacity-50">Select Document</p>
              </div>
              <ScrollArea className="h-[14rem] lg:h-full">
                <div className="space-y-2 p-3">
                  {documents.length === 0 ? (
                    <div className="flex h-28 flex-col items-center justify-center gap-2 border-2 border-dashed border-foreground/20 text-center">
                      <Files className="h-8 w-8 opacity-25" />
                      <p className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-45">No documents</p>
                    </div>
                  ) : (
                    documents.map((doc) => {
                      const isSelected = previewDocumentId === doc.id;
                      const isActive = activeDocumentId === doc.id;

                      return (
                        <button
                          key={doc.id}
                          onClick={() => setPreviewDocumentId(doc.id)}
                          className={cn(
                            "flex w-full min-w-0 items-start gap-3 border-2 p-3 text-left transition-all",
                            isSelected
                              ? "border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                              : "border-foreground/20 bg-background hover:border-foreground hover:bg-primary/10"
                          )}
                        >
                          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-black uppercase tracking-tighter text-xs">{doc.name}</span>
                            <span className="mt-1 block font-mono text-[8px] font-bold uppercase tracking-widest opacity-45">
                              {isActive ? "Active Chat" : formatFileSize(doc.size)}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </aside>

            <section className="flex min-h-0 flex-col">
              <div className="flex shrink-0 flex-col gap-3 border-b-4 border-foreground bg-muted p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-headline text-xl font-black uppercase tracking-tighter">
                    {previewDocument?.name ?? documents.find(doc => doc.id === previewDocumentId)?.name ?? "Document Preview"}
                  </p>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-50">
                    {previewDocument ? `${formatFileSize(previewDocument.size)} · ${previewDocument.type?.toUpperCase() ?? "DOC"}` : "Extracted document text"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {previewDocument?.signedUrl && (
                    <Button asChild variant="outline" className="h-10 rounded-none border-2 border-foreground bg-background px-3 font-black uppercase tracking-tighter hover:bg-foreground hover:text-background">
                      <a href={previewDocument.signedUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" /> Original
                      </a>
                    </Button>
                  )}
                  {previewDocumentId && previewDocumentId !== activeDocumentId && (
                    <Button
                      onClick={() => goToDocument(previewDocumentId)}
                      className="h-10 rounded-none border-2 border-foreground bg-primary px-3 font-black uppercase tracking-tighter text-foreground hover:bg-primary/80"
                    >
                      <MessageSquare className="h-4 w-4" /> Open Chat
                    </Button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 bg-background p-4">
                {isPreviewLoading ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Loading Document</p>
                  </div>
                ) : previewError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <Files className="h-14 w-14 opacity-20" />
                    <p className="font-headline text-xl font-black uppercase tracking-tighter">Preview Unavailable</p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-50">{previewError}</p>
                  </div>
                ) : previewDocument ? (
                  <ScrollArea className="h-full border-4 border-foreground bg-card">
                    {previewDocument.text.trim().length > 0 ? (
                      <pre className="whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-foreground md:text-sm">
                        {previewDocument.text}
                      </pre>
                    ) : (
                      <div className="flex h-full min-h-[22rem] flex-col items-center justify-center gap-3 p-8 text-center">
                        <Files className="h-14 w-14 opacity-20" />
                        <p className="font-headline text-xl font-black uppercase tracking-tighter">No Extracted Text</p>
                        <p className="max-w-sm font-mono text-[10px] font-bold uppercase tracking-widest opacity-50">
                          This file exists, but no readable text was stored for preview.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <Files className="h-14 w-14 opacity-20" />
                    <p className="font-headline text-xl font-black uppercase tracking-tighter">Select A Document</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t-4 border-foreground bg-muted p-4 font-mono text-[10px] font-black uppercase tracking-widest">
            <span>Security: AES-256 Vaulted</span>
            <Button onClick={() => setShowPreview(false)} className="rounded-none border-2 border-foreground bg-foreground text-background transition-all hover:bg-primary hover:text-foreground">Close Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TL;DR Modal */}
      <Dialog open={showTLDR} onOpenChange={setShowTLDR}>
        <DialogContent hideCloseButton className="flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-none border-4 border-foreground bg-card p-0 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="min-w-0 shrink-0 border-b-4 border-foreground bg-primary p-5 sm:p-6">
            <DialogTitle className="font-headline text-2xl font-black uppercase leading-none tracking-tighter sm:text-3xl">Initial Analysis</DialogTitle>
            <DialogDescription className="block truncate font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-foreground/60">Source: {activeFile}</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 sm:p-6">
            <div className="relative flex min-h-0 flex-1 flex-col border-2 border-foreground bg-muted p-4 font-medium leading-relaxed sm:p-5">
              <div className="absolute -top-3 left-4 bg-foreground text-background px-2 py-0.5 text-[8px] font-black uppercase">Executive Summary</div>
              <ScrollArea className="min-h-0 flex-1 pr-3">
                <MarkdownMessage
                  content={documentSummary ?? 'No content-specific TL;DR is available for this document yet.'}
                  className="break-words"
                />
              </ScrollArea>
            </div>
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                onClick={handleDownloadSummary}
                className="h-12 rounded-none border-4 border-foreground bg-primary text-foreground font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:h-14"
              >
                <Download className="h-5 w-5" /> Download TL;DR
              </Button>
              <Button
                onClick={() => setShowTLDR(false)}
                className="h-12 rounded-none border-4 border-foreground bg-foreground text-background font-black uppercase tracking-tighter transition-all hover:bg-muted hover:text-foreground sm:h-14"
              >
                Start Chatting <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={upgradeModal.open}
        reason={upgradeModal.reason}
        onClose={() => setUpgradeModal(prev => ({ ...prev, open: false }))}
      />

      {/* AI Controls Modal */}
      <Dialog open={showAiControls} onOpenChange={handleAiControlsOpenChange}>
        <DialogContent hideCloseButton className="flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-none border-4 border-foreground bg-card p-0 shadow-[18px_18px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b-4 border-foreground bg-foreground p-5 text-background sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-foreground">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-headline text-2xl font-black uppercase leading-none tracking-tighter">
                  AI Controls
                </DialogTitle>
                <DialogDescription className="mt-1 block truncate font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-background/55">
                  {draftChatModelOption.label} / {draftRetrievalModeOption.label}
                </DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAiControls(false)}
              className="h-10 w-10 shrink-0 rounded-none text-background hover:bg-primary hover:text-foreground"
              title="Close AI controls"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Model</h3>
                {plan.id === "free" && (
                  <span className="border-2 border-foreground bg-muted px-2 py-1 font-mono text-[8px] font-black uppercase tracking-widest">
                    Upgrade
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHAT_MODEL_OPTIONS.map((option) => {
                  const isSelected = draftChatModel === option.id;
                  const isLocked = !canUseChatModel(plan.id, option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setShowAiControls(false);
                          setUpgradeModal({ open: true, reason: "premium_ai" });
                          return;
                        }

                        setDraftChatModel(option.id);
                      }}
                      className={cn(
                        "min-h-24 border-2 border-foreground p-3 text-left transition-all",
                        isSelected
                          ? "bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-card hover:bg-primary/10",
                        isLocked && "bg-muted/50 text-foreground/55 hover:bg-muted"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <ChatModelIcon modelId={option.id} />
                          <span className="truncate font-headline text-base font-black uppercase tracking-tighter">
                            {option.label}
                          </span>
                        </span>
                        {isLocked && <Lock className="h-4 w-4 shrink-0" />}
                      </span>
                      <span className="mt-2 block font-mono text-[9px] font-bold uppercase leading-relaxed tracking-widest opacity-55">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Route</h3>
                <span className="font-mono text-[9px] font-black uppercase tracking-widest opacity-45">
                  Document Grounded
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {RETRIEVAL_MODE_OPTIONS.map((option) => {
                  const isSelected = draftRetrievalMode === option.id;
                  const isLocked = !canUseRetrievalMode(plan.id, option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setShowAiControls(false);
                          setUpgradeModal({ open: true, reason: "premium_ai" });
                          return;
                        }

                        setDraftRetrievalMode(option.id);
                      }}
                      className={cn(
                        "min-h-24 border-2 border-foreground p-3 text-left transition-all",
                        isSelected
                          ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(229,184,28,1)]"
                          : "bg-card hover:bg-foreground/5",
                        isLocked && "bg-muted/50 text-foreground/55 hover:bg-muted"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <RetrievalModeIcon modeId={option.id} />
                          <span className="truncate font-headline text-base font-black uppercase tracking-tighter">
                            {option.label}
                          </span>
                        </span>
                        {isLocked && <Lock className="h-4 w-4 shrink-0" />}
                      </span>
                      <span className="mt-2 block font-mono text-[9px] font-bold uppercase leading-relaxed tracking-widest opacity-55">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
          <div className="flex shrink-0 flex-col gap-3 border-t-4 border-foreground bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 font-mono text-[9px] font-black uppercase tracking-widest opacity-55">
              {hasDraftAiChanges ? "Unsaved selection" : "Current selection"}
            </div>
            <div className="grid gap-2 sm:flex sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAiControls(false)}
                className="h-11 rounded-none border-2 border-foreground bg-background px-5 font-black uppercase tracking-tighter hover:bg-foreground hover:text-background"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAiControls}
                className="h-11 rounded-none border-2 border-foreground bg-primary px-6 font-black uppercase tracking-tighter text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Check className="h-4 w-4" /> Save Selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <ScrollArea className="min-h-0 flex-1 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" ref={scrollRef}>
        <div className="space-y-5 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-[94%] gap-3",
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
                  "relative border-2 border-foreground p-4 text-sm font-medium leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  msg.role === "user" ? "bg-card" : "bg-muted/90"
                )}>
                  {msg.role === "assistant" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    msg.content
                  )}

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
      <div className="shrink-0 border-t-4 border-foreground bg-card p-4">
        <form
          className="flex items-center gap-3 md:gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => handleAiControlsOpenChange(true)}
                  disabled={isLoading}
                  className="h-14 w-14 shrink-0 rounded-none border-4 border-foreground bg-background text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-primary hover:shadow-none"
                  title={`${activeChatModelOption.label} / ${activeRetrievalModeOption.label}`}
                >
                  <SlidersHorizontal className="h-6 w-6" />
                  <span className="sr-only">AI controls</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-none border-2 border-foreground bg-foreground font-mono text-[10px] font-black uppercase tracking-widest text-background">
                {activeChatModelOption.label} / {activeRetrievalModeOption.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
