import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ragQueryResponseGeneration } from '@/ai/flows/rag-query-response-generation';
import { searchDocumentChunks } from '@/ai/flows/vector-search';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  saveDocumentChatMessage,
} from '@/lib/chat-messages';
import {
  CHAT_MODEL_IDS,
  DEFAULT_CHAT_MODEL_ID,
  DEFAULT_RETRIEVAL_MODE_ID,
  RETRIEVAL_MODE_IDS,
  canUseChatModel,
  canUseRetrievalMode,
  getRetrievalModeOption,
} from '@/lib/chat-options';
import { getUserPlan } from '@/lib/get-user-plan';
import { checkChatRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function normalizeSuggestedQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((question): question is string => typeof question === 'string' && question.trim().length > 0)
    .map(question => question.trim())
    .slice(0, 3);
}

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
  model: z.enum(CHAT_MODEL_IDS).optional(),
  retrievalMode: z.enum(RETRIEVAL_MODE_IDS).optional(),
});

type UserMetadata = {
  ai_response_mode?: unknown;
  citation_style?: unknown;
};

function normalizeAiResponseMode(value: unknown) {
  return value === 'concise' || value === 'detailed' || value === 'balanced' ? value : 'balanced';
}

function normalizeCitationStyle(value: unknown) {
  return value === 'strict' || value === 'standard' ? value : 'standard';
}

async function getFallbackContext(documentId: string, limit = 8) {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .select('content')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })
    .limit(Math.min(Math.max(Math.trunc(limit), 1), 10));

  if (error) throw error;

  return (data ?? [])
    .map(chunk => typeof chunk.content === 'string' ? chunk.content : '')
    .filter(Boolean);
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await context.params;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, name, summary, suggested_questions')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('source_document_id', documentId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          name: doc.name,
          summary: doc.summary ?? null,
          suggestedQuestions: normalizeSuggestedQuestions(doc.suggested_questions),
        },
        messages: messages ?? [],
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document chat load error:', error);
    return NextResponse.json({ error: 'Failed to load document chat' }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = ChatRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid chat message payload' }, { status: 400 });
    }

    const { documentId } = await context.params;
    const {
      message,
      model = DEFAULT_CHAT_MODEL_ID,
      retrievalMode = DEFAULT_RETRIEVAL_MODE_ID,
    } = parsed.data;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, name')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const plan = await getUserPlan(user.id);
    if (!canUseChatModel(plan.id, model) || !canUseRetrievalMode(plan.id, retrievalMode)) {
      return NextResponse.json(
        {
          error: 'premium_ai_required',
          message: 'Upgrade to use premium AI models and research routing.',
        },
        { status: 403 }
      );
    }

    const chatLimit = plan.chatMessagesPerHour;
    if (chatLimit !== Infinity) {
      const allowed = await checkChatRateLimit(user.id, chatLimit);
      if (!allowed) {
        return NextResponse.json(
          { error: 'rate_limit_reached', message: 'Chat limit reached. Upgrade for unlimited chats.' },
          { status: 429 }
        );
      }
    }

    const userMessage = await saveDocumentChatMessage({
      userId: user.id,
      documentId,
      role: 'user',
      content: message,
    });

    const retrievalModeOption = getRetrievalModeOption(retrievalMode);
    let retrievedContext: string[] = [];
    try {
      retrievedContext = await searchDocumentChunks(message, documentId, {
        matchCount: retrievalModeOption.matchCount,
      });
    } catch (error) {
      console.error('Document vector search error:', error);
    }

    if (retrievedContext.length === 0) {
      retrievedContext = await getFallbackContext(documentId, retrievalModeOption.fallbackChunkCount);
    }

    const metadata = user.user_metadata as UserMetadata;
    const response = await ragQueryResponseGeneration({
      userQuery: message,
      retrievedContext,
      chatModel: model,
      retrievalMode,
      responseMode: normalizeAiResponseMode(metadata.ai_response_mode),
      citationStyle: normalizeCitationStyle(metadata.citation_style),
    });

    const assistantMessage = await saveDocumentChatMessage({
      userId: user.id,
      documentId,
      role: 'assistant',
      content: response.answer,
    });

    return NextResponse.json(
      {
        userMessage: {
          id: userMessage.id,
          role: 'user',
          content: message,
          created_at: userMessage.created_at,
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: 'assistant',
          content: response.answer,
          created_at: assistantMessage.created_at,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document chat response error:', error);
    return NextResponse.json({ error: 'Failed to generate chat response' }, { status: 500 });
  }
}
