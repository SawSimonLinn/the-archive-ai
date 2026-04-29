import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('id, name, size, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { documents: data ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Document list error:', error);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}
