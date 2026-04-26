import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { processDocumentForEmbeddings } from '@/ai/flows/document-embedding-processing';
import { generateDocumentInitialAnalysis } from '@/ai/flows/document-initial-analysis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text
    let text = '';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result.text;
      } finally {
        await parser.destroy();
      }
    } else {
      text = buffer.toString('utf-8');
    }

    const initialAnalysisPromise = generateDocumentInitialAnalysis({
      documentName: file.name,
      documentContent: text,
    });

    // Upload file to Supabase Storage
    const storagePath = `${Date.now()}_${file.name}`;
    const { error: storageError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type });
    if (storageError) throw storageError;

    // Save document metadata
    const { data: doc, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        name: file.name,
        type: file.name.split('.').pop() ?? 'txt',
        size: file.size,
        storage_path: storagePath,
      })
      .select()
      .single();
    if (insertError || !doc) throw insertError ?? new Error('Insert failed');

    // Chunk, embed, and store synchronously before returning the document id.
    const [chunks, initialAnalysis] = await Promise.all([
      processDocumentForEmbeddings({ documentId: doc.id, documentContent: text }),
      initialAnalysisPromise,
    ]);
    if (chunks.length > 0) {
      await supabaseAdmin.from('document_chunks').insert(
        chunks.map((c, i) => ({
          document_id: doc.id,
          content: c.chunk,
          embedding: c.embedding,
          chunk_index: i,
        }))
      );
    }

    return NextResponse.json({
      text,
      documentId: doc.id,
      summary: initialAnalysis.summary,
      suggestedQuestions: initialAnalysis.suggestedQuestions,
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}
