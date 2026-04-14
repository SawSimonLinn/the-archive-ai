'use server';

import { openai } from '@/ai/genkit';
import { generateText } from 'ai';
import { z } from 'zod';

const RAGQueryResponseInputSchema = z.object({
  userQuery: z.string(),
  retrievedContext: z.array(z.string()),
});
export type RAGQueryResponseInput = z.infer<typeof RAGQueryResponseInputSchema>;

const RAGQueryResponseOutputSchema = z.object({
  answer: z.string(),
});
export type RAGQueryResponseOutput = z.infer<typeof RAGQueryResponseOutputSchema>;

export async function ragQueryResponseGeneration(input: RAGQueryResponseInput): Promise<RAGQueryResponseOutput> {
  const { userQuery, retrievedContext } = RAGQueryResponseInputSchema.parse(input);

  const contextBlock = retrievedContext.map(c => `---\n${c}\n---`).join('\n');

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an AI assistant tasked with answering questions strictly based on the provided documents.
If the documents do not contain enough information to answer the question, state that you couldn't find relevant information in the documents. Do not use your general knowledge.`,
    prompt: `Documents:\n${contextBlock}\n\nUser Question: ${userQuery}\n\nAnswer:`,
  });

  return { answer: text };
}
