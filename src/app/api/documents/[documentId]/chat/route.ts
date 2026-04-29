import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await context.params;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, name')
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
        document: doc,
        messages: messages ?? [],
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document chat load error:', error);
    return NextResponse.json({ error: 'Failed to load document chat' }, { status: 500 });
  }
}
