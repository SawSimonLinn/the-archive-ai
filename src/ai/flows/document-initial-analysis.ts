'use server';

import { openai } from '@/ai/genkit';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const DocumentInitialAnalysisInputSchema = z.object({
  documentName: z.string(),
  documentContent: z.string(),
});
export type DocumentInitialAnalysisInput = z.infer<typeof DocumentInitialAnalysisInputSchema>;

const DocumentInitialAnalysisOutputSchema = z.object({
  summary: z.string(),
  suggestedQuestions: z.array(z.string()).length(3),
});
export type DocumentInitialAnalysisOutput = z.infer<typeof DocumentInitialAnalysisOutputSchema>;

function normalizeDocumentText(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildAnalysisExcerpt(text: string, maxChars = 18000) {
  const normalized = normalizeDocumentText(text);
  if (normalized.length <= maxChars) return normalized;

  const headLength = Math.floor(maxChars * 0.45);
  const middleLength = Math.floor(maxChars * 0.25);
  const tailLength = maxChars - headLength - middleLength;
  const middleStart = Math.max(0, Math.floor(normalized.length / 2 - middleLength / 2));

  return [
    normalized.slice(0, headLength),
    '[Middle excerpt]',
    normalized.slice(middleStart, middleStart + middleLength),
    '[Final excerpt]',
    normalized.slice(-tailLength),
  ].join('\n\n');
}

function extractCandidateTopics(text: string) {
  const lines = normalizeDocumentText(text)
    .split(/\n+/)
    .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(line => line.length >= 18 && line.length <= 90)
    .filter(line => /[a-zA-Z]/.test(line));

  const topics: string[] = [];
  for (const line of lines) {
    const topic = line.replace(/[.:;,-]+$/, '');
    if (!topics.some(existing => existing.toLowerCase() === topic.toLowerCase())) {
      topics.push(topic);
    }
    if (topics.length === 3) break;
  }

  if (topics.length >= 3) return topics;

  const sentences = normalizeDocumentText(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 35 && sentence.length <= 140);

  for (const sentence of sentences) {
    const topic = sentence.replace(/[.:;,-]+$/, '');
    if (!topics.some(existing => existing.toLowerCase() === topic.toLowerCase())) {
      topics.push(topic);
    }
    if (topics.length === 3) break;
  }

  return topics;
}

function fallbackAnalysis(input: DocumentInitialAnalysisInput): DocumentInitialAnalysisOutput {
  const text = normalizeDocumentText(input.documentContent);

  if (!text) {
    return {
      summary: 'No readable text could be extracted from this document, so a content-specific TL;DR could not be prepared.',
      suggestedQuestions: [
        'What readable text was extracted from this upload?',
        'Can this file be re-uploaded as a searchable PDF or TXT file?',
        'What parts of the document failed text extraction?',
      ],
    };
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const summary = sentences.slice(0, 4).join(' ').slice(0, 900);
  const topics = extractCandidateTopics(text);
  const suggestedQuestions = [
    ...topics.map(topic => `What does the document say about "${topic}"?`),
    'What are the most important points in the extracted document text?',
    'Which details in the document should I pay attention to first?',
    'What specific terms or sections appear most important in this document?',
  ].slice(0, 3);

  return {
    summary,
    suggestedQuestions: DocumentInitialAnalysisOutputSchema.shape.suggestedQuestions.parse(suggestedQuestions),
  };
}

function cleanAnalysis(
  output: DocumentInitialAnalysisOutput,
  fallback: DocumentInitialAnalysisOutput
): DocumentInitialAnalysisOutput {
  const suggestedQuestions = output.suggestedQuestions
    .map(question => question.trim())
    .filter(Boolean)
    .slice(0, 3);

  while (suggestedQuestions.length < 3) {
    suggestedQuestions.push(fallback.suggestedQuestions[suggestedQuestions.length]);
  }

  return {
    summary: output.summary.trim() || fallback.summary,
    suggestedQuestions: DocumentInitialAnalysisOutputSchema.shape.suggestedQuestions.parse(suggestedQuestions),
  };
}

export async function generateDocumentInitialAnalysis(
  input: DocumentInitialAnalysisInput
): Promise<DocumentInitialAnalysisOutput> {
  const parsed = DocumentInitialAnalysisInputSchema.parse(input);
  const fallback = fallbackAnalysis(parsed);
  const excerpt = buildAnalysisExcerpt(parsed.documentContent);

  if (!excerpt) return fallback;

  try {
    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      output: Output.object({
        schema: DocumentInitialAnalysisOutputSchema,
      }),
      temperature: 0.2,
      maxOutputTokens: 700,
      system: `You prepare upload-time document analysis.
Use only the supplied document text. Do not invent facts, categories, risks, or requirements.
The summary must include document-specific details from the text, not generic upload-status language.
The suggested questions must be specific, answerable from the document, and useful for starting a chat.
If the text is thin or extraction looks poor, say that plainly.`,
      prompt: `Document name: ${parsed.documentName}

Document text:
${excerpt}`,
    });

    return cleanAnalysis(output, fallback);
  } catch (error) {
    console.error(`Error generating initial analysis for ${parsed.documentName}:`, error);
    return fallback;
  }
}
