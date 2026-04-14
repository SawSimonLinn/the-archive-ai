'use server';
/**
 * @fileOverview This file implements a Genkit flow for Retrieval-Augmented Generation (RAG).
 * It takes a user query and relevant document chunks, and generates an answer strictly based on the provided context.
 *
 * - ragQueryResponseGeneration - A function that handles the RAG query and response generation.
 * - RAGQueryResponseInput - The input type for the ragQueryResponseGeneration function.
 * - RAGQueryResponseOutput - The return type for the ragQueryResponseGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Zod schema for the input of the RAG query response generation flow.
 */
const RAGQueryResponseInputSchema = z.object({
  userQuery: z.string().describe('The natural language question from the user.'),
  retrievedContext: z.array(z.string()).describe('An array of relevant document chunks retrieved from the vector database.'),
});
/**
 * TypeScript type for the input of the RAG query response generation flow.
 */
export type RAGQueryResponseInput = z.infer<typeof RAGQueryResponseInputSchema>;

/**
 * Zod schema for the output of the RAG query response generation flow.
 */
const RAGQueryResponseOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer based strictly on the provided context.'),
});
/**
 * TypeScript type for the output of the RAG query response generation flow.
 */
export type RAGQueryResponseOutput = z.infer<typeof RAGQueryResponseOutputSchema>;

/**
 * Defines the prompt for the RAG query response generation. This prompt instructs the LLM
 * to answer questions strictly based on the provided context and to state when information is insufficient.
 */
const ragPrompt = ai.definePrompt({
  name: 'ragQueryResponsePrompt',
  input: { schema: RAGQueryResponseInputSchema },
  output: { schema: RAGQueryResponseOutputSchema },
  prompt: `You are an AI assistant tasked with answering questions strictly based on the provided documents.
If the documents do not contain enough information to answer the question, state that you couldn't find relevant information in the documents. Do not use your general knowledge.

Documents:
{{#each retrievedContext}}
---
{{{this}}}
---
{{/each}}

User Question: {{{userQuery}}}

Answer:`,
});

/**
 * Defines the Genkit flow for RAG query response generation.
 * It takes a user query and an array of relevant document chunks, then uses an LLM
 * to generate an answer strictly based on those chunks.
 */
const ragQueryResponseGenerationFlow = ai.defineFlow(
  {
    name: 'ragQueryResponseGenerationFlow',
    inputSchema: RAGQueryResponseInputSchema,
    outputSchema: RAGQueryResponseOutputSchema,
  },
  async (input) => {
    const { output } = await ragPrompt(input);
    return output!;
  }
);

/**
 * Wrapper function to execute the RAG query response generation flow.
 * @param input - The RAGQueryResponseInput containing the user query and retrieved context.
 * @returns A Promise that resolves to RAGQueryResponseOutput, containing the AI's answer.
 */
export async function ragQueryResponseGeneration(input: RAGQueryResponseInput): Promise<RAGQueryResponseOutput> {
  return ragQueryResponseGenerationFlow(input);
}
