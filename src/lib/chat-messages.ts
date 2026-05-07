import { supabaseAdmin } from '@/lib/supabase-admin';

export type ChatMessageRole = 'user' | 'assistant';

export const MAX_CHAT_MESSAGE_LENGTH = 8000;

export async function getOrCreateDocumentChatSessionId(documentId: string) {
  const { data: existingMessage, error: sessionLookupError } = await supabaseAdmin
    .from('chat_messages')
    .select('session_id')
    .eq('source_document_id', documentId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (sessionLookupError) {
    throw sessionLookupError;
  }

  const existingSessionId = existingMessage?.session_id;
  if (typeof existingSessionId === 'string' && existingSessionId.length > 0) {
    return existingSessionId;
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('chat_sessions')
    .insert({})
    .select('id')
    .single();

  if (sessionError || !session) {
    throw sessionError ?? new Error('Failed to create chat session');
  }

  return session.id as string;
}

export async function saveDocumentChatMessage(input: {
  userId: string;
  documentId: string;
  role: ChatMessageRole;
  content: string;
}) {
  const sessionId = await getOrCreateDocumentChatSessionId(input.documentId);

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      source_document_id: input.documentId,
      role: input.role,
      content: input.content,
      user_id: input.userId,
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to save chat message');
  }

  return data as { id: string; created_at: string };
}
