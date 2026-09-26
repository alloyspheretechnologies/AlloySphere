/**
 * AI Chat API Route
 *
 * Handles streaming chat completions via the Vercel AI Gateway.
 * Accepts a JSON body with `messages` and an optional `model` override.
 *
 * POST /api/ai/chat
 *
 * @example Request body:
 * ```json
 * {
 *   "messages": [{ "role": "user", "content": "Hello!" }],
 *   "model": "anthropic/claude-sonnet-4.5"
 * }
 * ```
 */

import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { DEFAULT_MODEL, DEFAULT_GENERATION_CONFIG, type AIModel } from '@/lib/ai/config';

export async function POST(req: Request) {
  const { messages, model, system } = (await req.json()) as {
    messages: UIMessage[];
    model?: AIModel;
    system?: string;
  };

  const result = streamText({
    model: model ?? DEFAULT_MODEL,
    system,
    messages: convertToModelMessages(messages),
    temperature: DEFAULT_GENERATION_CONFIG.temperature,
    maxOutputTokens: DEFAULT_GENERATION_CONFIG.maxOutputTokens,
  });

  return result.toTextStreamResponse();
}
