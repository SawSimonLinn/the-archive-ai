import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const ChatMessageSchema = z.object({
  documentId: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = ChatMessageSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid chat message payload' }, { status: 400 });
    }

    const { documentId, role, content } = parsed.data;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        document_id: documentId,
        role,
        content,
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
