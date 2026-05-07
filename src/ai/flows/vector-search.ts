import { openai } from '@/ai/openai';
import { embed } from 'ai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

type SearchDocumentChunksOptions = {
  matchCount?: number;
};

export async function searchDocumentChunks(
  query: string,
  documentId: string,
  options: SearchDocumentChunksOptions = {},
): Promise<string[]> {
  const normalizedQuery = query.trim().slice(0, 8000);
  if (!normalizedQuery) throw new Error('Query is required');

  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthorized');

  // Verify the caller owns this document before searching its chunks
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (!doc) throw new Error('Document not found');

  const matchCount = Math.min(Math.max(Math.trunc(options.matchCount ?? 5), 1), 10);

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: normalizedQuery,
  });

  const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_document_id: documentId,
    match_count: matchCount,
  });

  if (error) throw error;
  return (data as { content: string }[]).map((d) => d.content);
}
