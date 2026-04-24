import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { processDocumentForEmbeddings } from '@/ai/flows/document-embedding-processing';

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
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = buffer.toString('utf-8');
    }

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
        status: 'processing',
      })
      .select()
      .single();
    if (insertError || !doc) throw insertError ?? new Error('Insert failed');

    // Chunk, embed, and store synchronously so status is accurate on return
    const chunks = await processDocumentForEmbeddings({ documentId: doc.id, documentContent: text });
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
    await supabaseAdmin.from('documents').update({ status: 'ready' }).eq('id', doc.id);

    return NextResponse.json({ text, documentId: doc.id });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}
