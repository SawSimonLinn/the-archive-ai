import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
