import { NextResponse } from 'next/server';
import { generateDocumentInitialAnalysis } from '@/ai/flows/document-initial-analysis';
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

    if (typeof doc.summary === 'string' && doc.summary.trim().length > 0) {
      return NextResponse.json(
        {
          summary: doc.summary,
          suggestedQuestions: normalizeSuggestedQuestions(doc.suggested_questions),
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true })
      .limit(80);

    if (chunksError) throw chunksError;

    const documentContent = (chunks ?? []).map(chunk => chunk.content).join('\n\n');
    const initialAnalysis = await generateDocumentInitialAnalysis({
      documentName: doc.name,
      documentContent,
    });

    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        summary: initialAnalysis.summary,
        suggested_questions: initialAnalysis.suggestedQuestions,
        analysis_generated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json(
      initialAnalysis,
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
