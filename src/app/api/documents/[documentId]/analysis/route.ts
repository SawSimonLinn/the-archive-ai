import { NextResponse } from 'next/server';
import { generateDocumentInitialAnalysis } from '@/ai/flows/document-initial-analysis';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, name')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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

    return NextResponse.json(initialAnalysis);
  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
