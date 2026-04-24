'use server';

import { openai } from '@/ai/genkit';
import { embed } from 'ai';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function searchDocumentChunks(query: string, documentId: string): Promise<string[]> {
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
