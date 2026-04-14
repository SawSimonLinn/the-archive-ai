'use server';
/**
 * @fileOverview A Genkit flow for processing document content, splitting it into chunks,
 * and generating embeddings for each chunk.
 *
 * - processDocumentForEmbeddings - A function that handles the document processing.
 * - DocumentEmbeddingProcessingInput - The input type for the processDocumentForEmbeddings function.
 * - DocumentEmbeddingProcessingOutput - The return type for the processDocumentForEmbeddings function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentEmbeddingProcessingInputSchema = z.object({
  documentId: z.string().describe('The unique identifier for the document.'),
  documentContent: z.string().describe('The full text content of the document.'),
});
export type DocumentEmbeddingProcessingInput = z.infer<typeof DocumentEmbeddingProcessingInputSchema>;

const ChunkEmbeddingSchema = z.object({
  documentId: z.string().describe('The unique identifier for the source document.'),
  chunk: z.string().describe('A segment of the document text.'),
  embedding: z.array(z.number()).describe('The embedding vector for the text chunk.'),
});

const DocumentEmbeddingProcessingOutputSchema = z.array(ChunkEmbeddingSchema).describe('An array of text chunks with their corresponding embeddings.');
export type DocumentEmbeddingProcessingOutput = z.infer<typeof DocumentEmbeddingProcessingOutputSchema>;

/**
 * Helper function to split text into manageable chunks.
 * This implementation attempts to respect paragraph and sentence boundaries where possible.
 */
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  // Split by one or more newlines to get paragraphs, then filter out empty ones.
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding the current paragraph to the chunk doesn't exceed maxChunkSize
    // (accounting for potential newlines between paragraphs in the chunk)
    if (currentChunk.length + paragraph.length + (currentChunk ? 2 : 0) <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      // Current chunk is full or paragraph is too large on its own
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;

      // If the new paragraph itself is too large, split it further
      while (currentChunk.length > maxChunkSize) {
        // Try to find a reasonable split point within the paragraph (e.g., end of sentence)
        let splitPoint = currentChunk.substring(0, maxChunkSize).lastIndexOf('.');
        // If no good sentence break, or it's too early in the chunk (e.g., first half),
        // just split by maxChunkSize to avoid tiny chunks.
        if (splitPoint === -1 || splitPoint < maxChunkSize / 2) {
          splitPoint = maxChunkSize;
        } else {
          splitPoint++; // Include the period in the current chunk
        }
        chunks.push(currentChunk.substring(0, splitPoint).trim());
        currentChunk = currentChunk.substring(splitPoint).trim();
      }
    }
  }
  // Add any remaining content in currentChunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  // Filter out any empty chunks that might result from trimming or initial splits
  return chunks.filter(chunk => chunk.length > 0);
}

export async function processDocumentForEmbeddings(
  input: DocumentEmbeddingProcessingInput
): Promise<DocumentEmbeddingProcessingOutput> {
  return documentEmbeddingProcessingFlow(input);
}

const documentEmbeddingProcessingFlow = ai.defineFlow(
  {
    name: 'documentEmbeddingProcessingFlow',
    inputSchema: DocumentEmbeddingProcessingInputSchema,
    outputSchema: DocumentEmbeddingProcessingOutputSchema,
  },
  async (input) => {
    const { documentId, documentContent } = input;

    // 1. Chunk the document content
    const textChunks = chunkText(documentContent);

    const embeddedChunks: DocumentEmbeddingProcessingOutput = [];

    // 2. Generate embeddings for each chunk
    // Using Promise.all to process chunks in parallel for efficiency
    const embeddingPromises = textChunks.map(async (chunk) => {
      try {
        const embedResponse = await ai.generate({
          model: 'googleai/text-embedding-004', // Google's embedding model for text
          prompt: chunk,
          config: {
            outputFormat: 'embedding',
          },
        });

        if (!embedResponse.embedding) {
          throw new Error('Failed to generate embedding for chunk.');
        }

        return {
          documentId,
          chunk,
          embedding: embedResponse.embedding,
        };
      } catch (error) {
        console.error(`Error generating embedding for chunk of document ${documentId}:`, error);
        // Return null or throw, depending on desired error handling. Returning null here
        // allows Promise.all to complete and filter out failed chunks.
        return null;
      }
    });

    const results = await Promise.all(embeddingPromises);
    // Filter out any chunks that failed to generate embeddings
    embeddedChunks.push(...results.filter((res): res is z.infer<typeof ChunkEmbeddingSchema> => res !== null));

    return embeddedChunks;
  }
);
