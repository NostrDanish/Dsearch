/**
 * Prompts for the AI Answer Layer.
 *
 * The contract: answers are synthesized ONLY from the supplied evidence,
 * statements carry [n] citations, and the model must say so when the
 * evidence doesn't cover the question. This turns the LLM from a generic
 * chatbot into an evidence synthesizer sitting on the federated index.
 *
 * The system prompt lives in the engine profile (src/lib/engine/profile.ts)
 * — the same prompt is injected server-side on the engine tier and used
 * client-side for user-BYOK calls.
 */
import { ENGINE_PROFILE } from '@/lib/engine/profile';
import type { AIEvidenceItem } from './types';

export const ANSWER_SYSTEM_PROMPT = ENGINE_PROFILE.ai.systemPrompt;

/** Build the user message: query + numbered evidence block. */
export function buildEvidencePrompt(query: string, evidence: AIEvidenceItem[]): string {
  const block = evidence
    .map((e) => `[${e.n}]\ntitle: ${e.title}\nurl: ${e.url}\nsnippet: ${e.snippet}`)
    .join('\n\n');

  return `QUERY:\n${query}\n\nEVIDENCE:\n${block}\n\nAnswer the query. End with a "Sources:" section listing the [n] references you actually used, one per line, exactly like "[1] <title>".`;
}
