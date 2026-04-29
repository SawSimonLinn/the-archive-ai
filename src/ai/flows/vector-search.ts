'use server';

import { openai } from '@/ai/genkit';
import { embed } from 'ai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function searchDocumentChunks(query: string, documentId: string): Promise<string[]> {
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

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_document_id: documentId,
    match_count: 5,
  });

  if (error) throw error;
  return (data as { content: string }[]).map((d) => d.content);
}
