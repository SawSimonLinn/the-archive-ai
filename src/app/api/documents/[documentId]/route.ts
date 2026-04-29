import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

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

    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('source_document_id', documentId);

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
