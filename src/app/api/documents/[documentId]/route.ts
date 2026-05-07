import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';
import { extractDocumentText } from '@/lib/document-text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const MAX_DOCUMENT_NAME_LENGTH = 200;

function getMimeType(type: string | null | undefined) {
  if (!type) return 'application/octet-stream';
  return MIME_TYPES[type.toLowerCase()] ?? 'application/octet-stream';
}

async function getChunkText(documentId: string) {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .select('content, chunk_index')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map((chunk) => typeof chunk.content === 'string' ? chunk.content : '')
    .filter(Boolean)
    .join('\n\n');
}

async function createSignedDocumentUrl(storagePath: string | null | undefined) {
  if (!storagePath) return null;

  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUrl(storagePath, 5 * 60);

  if (error) {
    console.error('Document signed URL error:', error);
    return null;
  }

  return data.signedUrl ?? null;
}

async function extractStoredDocumentText(doc: { name: string; type: string | null; storage_path: string | null }) {
  if (!doc.storage_path) return null;

  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .download(doc.storage_path);

  if (error || !data) {
    if (error) console.error('Document storage download error:', error);
    return null;
  }

  try {
    const buffer = Buffer.from(await data.arrayBuffer());
    const file = new File([buffer], doc.name, { type: getMimeType(doc.type) });
    return await extractDocumentText(file, buffer);
  } catch (error) {
    console.error('Stored document text extraction error:', error);
    return null;
  }
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await context.params;

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, name, type, size, storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const [signedUrl, storedText] = await Promise.all([
      createSignedDocumentUrl(doc.storage_path),
      extractStoredDocumentText(doc),
    ]);
    const text = storedText ?? await getChunkText(documentId);

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
        },
        text,
        signedUrl,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document detail error:', error);
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await context.params;
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (name.length > MAX_DOCUMENT_NAME_LENGTH) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ name })
      .eq('id', documentId)
      .eq('user_id', user.id)
      .select('id, name')
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('Document rename error:', error);
    return NextResponse.json({ error: 'Failed to rename document' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await context.params;

    // Verify ownership before cascading delete
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { error: chatDeleteError } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('source_document_id', documentId);
    if (chatDeleteError) throw chatDeleteError;

    const { error: chunkDeleteError } = await supabaseAdmin
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);
    if (chunkDeleteError) throw chunkDeleteError;

    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
