import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';
import { checkChatRateLimit } from '@/lib/rate-limit';
import { getUserPlan } from '@/lib/get-user-plan';

export const runtime = 'nodejs';

const ChatMessageSchema = z.object({
  documentId: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = ChatMessageSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid chat message payload' }, { status: 400 });
    }

    const { documentId, role, content } = parsed.data;

    // Only rate-limit user messages, not saved AI responses
    if (role === 'user') {
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
    }

    // Verify the document belongs to this user
    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { data: existingMessage, error: sessionLookupError } = await supabaseAdmin
      .from('chat_messages')
      .select('session_id')
      .eq('source_document_id', documentId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (sessionLookupError) {
      console.error('Chat session lookup error:', sessionLookupError);
      return NextResponse.json({ error: 'Failed to find chat session' }, { status: 500 });
    }

    let sessionId = existingMessage?.session_id as string | undefined;

    if (!sessionId) {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({})
        .select('id')
        .single();

      if (sessionError || !session) {
        console.error('Chat session create error:', sessionError);
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
      }

      sessionId = session.id;
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        source_document_id: documentId,
        role,
        content,
        user_id: user.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Chat message insert error:', error);
      return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Chat message save error:', error);
    return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 });
  }
}
