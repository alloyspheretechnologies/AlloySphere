/**
 * AI Generate API Route
 *
 * Non-streaming text generation endpoint.
 * Useful for one-shot tasks like summarization, content generation, etc.
 *
 * POST /api/ai/generate
 *
 * @example Request body:
 * ```json
 * {
 *   "prompt": "Summarize this pitch deck in 3 bullet points.",
 *   "system": "You are a startup advisor.",
 *   "model": "openai/gpt-4.1-mini"
 * }
 * ```
 *
 * @example Response:
 * ```json
 * { "text": "• ...\n• ...\n• ..." }
 * ```
 */

import { generate } from '@/lib/ai';

export async function POST(req: Request) {
  const { prompt, system, model, temperature, maxTokens } = (await req.json()) as {
    prompt: string;
    system?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };

  if (!prompt) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }

  const result = await generate({
    prompt,
    system,
    ...(model && { model: model as Parameters<typeof generate>[0]['model'] }),
    ...(temperature !== undefined && { temperature }),
    ...(maxTokens !== undefined && { maxTokens }),
  });

  return Response.json({ text: result.text });
}
