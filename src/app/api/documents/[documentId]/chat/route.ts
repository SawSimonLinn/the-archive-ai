import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ragQueryResponseGeneration } from '@/ai/flows/rag-query-response-generation';
import { searchDocumentChunks } from '@/ai/flows/vector-search';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  saveDocumentChatMessage,
} from '@/lib/chat-messages';
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
});

async function getFallbackContext(documentId: string) {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .select('content')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })
    .limit(8);

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
    const { message } = parsed.data;

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

    let retrievedContext: string[] = [];
    try {
      retrievedContext = await searchDocumentChunks(message, documentId);
    } catch (error) {
      console.error('Document vector search error:', error);
    }

    if (retrievedContext.length === 0) {
      retrievedContext = await getFallbackContext(documentId);
    }

    const response = await ragQueryResponseGeneration({
      userQuery: message,
      retrievedContext,
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
