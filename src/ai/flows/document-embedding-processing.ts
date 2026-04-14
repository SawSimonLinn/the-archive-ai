'use server';

import { openai } from '@/ai/genkit';
import { embed } from 'ai';
import { z } from 'zod';

const DocumentEmbeddingProcessingInputSchema = z.object({
  documentId: z.string(),
  documentContent: z.string(),
});
export type DocumentEmbeddingProcessingInput = z.infer<typeof DocumentEmbeddingProcessingInputSchema>;

const ChunkEmbeddingSchema = z.object({
  documentId: z.string(),
  chunk: z.string(),
  embedding: z.array(z.number()),
});

const DocumentEmbeddingProcessingOutputSchema = z.array(ChunkEmbeddingSchema);
export type DocumentEmbeddingProcessingOutput = z.infer<typeof DocumentEmbeddingProcessingOutputSchema>;

function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + (currentChunk ? 2 : 0) <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;

      while (currentChunk.length > maxChunkSize) {
        let splitPoint = currentChunk.substring(0, maxChunkSize).lastIndexOf('.');
        if (splitPoint === -1 || splitPoint < maxChunkSize / 2) {
          splitPoint = maxChunkSize;
        } else {
          splitPoint++;
        }
        chunks.push(currentChunk.substring(0, splitPoint).trim());
        currentChunk = currentChunk.substring(splitPoint).trim();
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.filter(chunk => chunk.length > 0);
}

export async function processDocumentForEmbeddings(
  input: DocumentEmbeddingProcessingInput
): Promise<DocumentEmbeddingProcessingOutput> {
  const { documentId, documentContent } = DocumentEmbeddingProcessingInputSchema.parse(input);
  const textChunks = chunkText(documentContent);

  const results = await Promise.all(
    textChunks.map(async (chunk) => {
      try {
        const { embedding } = await embed({
          model: openai.embedding('text-embedding-3-small'),
          value: chunk,
        });
        return { documentId, chunk, embedding };
      } catch (error) {
        console.error(`Error generating embedding for chunk of document ${documentId}:`, error);
        return null;
      }
    })
  );

  return results.filter((r): r is z.infer<typeof ChunkEmbeddingSchema> => r !== null);
}
