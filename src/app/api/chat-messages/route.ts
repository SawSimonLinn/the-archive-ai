import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';
import { checkChatRateLimit } from '@/lib/rate-limit';
import { getUserPlan } from '@/lib/get-user-plan';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  saveDocumentChatMessage,
} from '@/lib/chat-messages';

export const runtime = 'nodejs';

const ChatMessageSchema = z.object({
  documentId: z.string().uuid(),
  content: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
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

    const { documentId, content } = parsed.data;

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

    const data = await saveDocumentChatMessage({
      userId: user.id,
      documentId,
      role: 'user',
      content,
    });

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Chat message save error:', error);
    return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 });
  }
}
