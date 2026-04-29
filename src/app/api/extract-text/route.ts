import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';
import { processDocumentForEmbeddings } from '@/ai/flows/document-embedding-processing';
import { generateDocumentInitialAnalysis } from '@/ai/flows/document-initial-analysis';
import { checkUploadRateLimit } from '@/lib/rate-limit';
import { getUserPlan } from '@/lib/get-user-plan';
import {
  extractDocumentText,
  getDocumentExtension,
  toDocumentTextError,
} from '@/lib/document-text';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Rate limit: 5 uploads per hour per user (checked against DB)
    const allowed = await checkUploadRateLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: 'rate_limit_reached', message: 'Too many uploads. Try again later.' },
        { status: 429 }
      );
    }

    const [plan, { count, error: countError }] = await Promise.all([
      getUserPlan(user.id),
      supabaseAdmin
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    const docLimit = plan.maxDocuments;
    if (!countError && docLimit !== Infinity && (count ?? 0) >= docLimit) {
      return NextResponse.json(
        { error: 'document_limit_reached', limit: docLimit },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20 MB.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text: string;
    try {
      text = await extractDocumentText(file, buffer);
    } catch (error) {
      const textError = toDocumentTextError(error);
      return NextResponse.json(
        { error: textError.code, message: textError.message },
        { status: textError.status },
      );
    }

    const initialAnalysisPromise = generateDocumentInitialAnalysis({
      documentName: file.name,
      documentContent: text,
    });

    // UUID-based path: no user-provided filename in storage, scoped per user
    const ext = getDocumentExtension(file);
    const storagePath = `${user.id}/${randomUUID()}.${ext}`;

    const { error: storageError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream' });
    if (storageError) throw storageError;

    const { data: doc, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        name: file.name,
        type: ext,
        size: file.size,
        storage_path: storagePath,
        user_id: user.id,
      })
      .select()
      .single();
    if (insertError || !doc) throw insertError ?? new Error('Insert failed');

    const [chunks, initialAnalysis] = await Promise.all([
      processDocumentForEmbeddings({ documentId: doc.id, documentContent: text }),
      initialAnalysisPromise,
    ]);
    if (chunks.length > 0) {
      const { error: chunkInsertError } = await supabaseAdmin.from('document_chunks').insert(
        chunks.map((c, i) => ({
          document_id: doc.id,
          content: c.chunk,
          embedding: c.embedding,
          chunk_index: i,
        }))
      );
      if (chunkInsertError) {
        console.error(`Failed to insert chunks for document ${doc.id}:`, chunkInsertError);
      }
    }

    return NextResponse.json({
      text,
      documentId: doc.id,
      summary: initialAnalysis.summary,
      suggestedQuestions: initialAnalysis.suggestedQuestions,
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      {
        error: 'upload_processing_failed',
        message: 'Could not finish processing this upload.',
      },
      { status: 500 },
    );
  }
}
