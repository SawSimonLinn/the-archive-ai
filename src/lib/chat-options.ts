import type { PlanId } from "@/lib/plans";

export const CHAT_MODEL_IDS = ["gpt-4o-mini", "gpt-4o", "gpt-5.5"] as const;
export type ChatModelId = (typeof CHAT_MODEL_IDS)[number];

export const RETRIEVAL_MODE_IDS = ["rag", "llm", "research"] as const;
export type RetrievalModeId = (typeof RETRIEVAL_MODE_IDS)[number];

export const DEFAULT_CHAT_MODEL_ID: ChatModelId = "gpt-4o-mini";
export const DEFAULT_RETRIEVAL_MODE_ID: RetrievalModeId = "rag";

type MinimumPlan = "free" | "paid";

export const CHAT_MODEL_OPTIONS = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    description: "Fast document Q&A",
    minimumPlan: "free",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description: "Stronger reasoning",
    minimumPlan: "paid",
  },
  {
    id: "gpt-5.5",
    label: "GPT-5.5",
    description: "Premium analysis",
    minimumPlan: "paid",
  },
] satisfies Array<{
  id: ChatModelId;
  label: string;
  description: string;
  minimumPlan: MinimumPlan;
}>;

export const RETRIEVAL_MODE_OPTIONS = [
  {
    id: "rag",
    label: "Internal RAG",
    description: "Semantic document matches",
    minimumPlan: "free",
    matchCount: 5,
    fallbackChunkCount: 8,
    maxOutputTokens: 900,
  },
  {
    id: "llm",
    label: "RAG LLM",
    description: "Wider model pass",
    minimumPlan: "paid",
    matchCount: 6,
    fallbackChunkCount: 8,
    maxOutputTokens: 1100,
  },
  {
    id: "research",
    label: "Research",
    description: "Deep evidence sweep",
    minimumPlan: "paid",
    matchCount: 8,
    fallbackChunkCount: 10,
    maxOutputTokens: 1500,
  },
] satisfies Array<{
  id: RetrievalModeId;
  label: string;
  description: string;
  minimumPlan: MinimumPlan;
  matchCount: number;
  fallbackChunkCount: number;
  maxOutputTokens: number;
}>;

function isPaidPlan(planId: PlanId) {
  return planId !== "free";
}

export function isChatModelId(value: unknown): value is ChatModelId {
  return typeof value === "string" && CHAT_MODEL_IDS.includes(value as ChatModelId);
}

export function isRetrievalModeId(value: unknown): value is RetrievalModeId {
  return typeof value === "string" && RETRIEVAL_MODE_IDS.includes(value as RetrievalModeId);
}

export function normalizeChatModelId(value: unknown): ChatModelId {
  return isChatModelId(value) ? value : DEFAULT_CHAT_MODEL_ID;
}

export function normalizeRetrievalModeId(value: unknown): RetrievalModeId {
  return isRetrievalModeId(value) ? value : DEFAULT_RETRIEVAL_MODE_ID;
}

export function getChatModelOption(modelId: ChatModelId) {
  return CHAT_MODEL_OPTIONS.find(option => option.id === modelId) ?? CHAT_MODEL_OPTIONS[0];
}

export function getRetrievalModeOption(modeId: RetrievalModeId) {
  return RETRIEVAL_MODE_OPTIONS.find(option => option.id === modeId) ?? RETRIEVAL_MODE_OPTIONS[0];
}

export function canUseChatModel(planId: PlanId, modelId: ChatModelId) {
  const option = getChatModelOption(modelId);
  return option.minimumPlan === "free" || isPaidPlan(planId);
}

export function canUseRetrievalMode(planId: PlanId, modeId: RetrievalModeId) {
  const option = getRetrievalModeOption(modeId);
  return option.minimumPlan === "free" || isPaidPlan(planId);
}
