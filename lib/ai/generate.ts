/**
 * AI Generation Utilities
 *
 * Server-side wrappers around the AI SDK's core generation functions.
 * These provide pre-configured, type-safe helpers that use the app's
 * default model and settings — import them instead of calling
 * `generateText` / `streamText` directly.
 *
 * @example
 * ```ts
 * import { generate, stream } from '@/lib/ai/generate';
 *
 * // Simple text generation
 * const { text } = await generate({ prompt: 'Summarize this pitch deck.' });
 *
 * // Streaming (for route handlers)
 * const result = stream({
 *   system: 'You are a startup advisor.',
 *   prompt: userMessage,
 * });
 * return result.toTextStreamResponse();
 * ```
 */

import 'server-only';

import { generateText, streamText } from 'ai';
import {
  DEFAULT_MODEL,
  DEFAULT_GENERATION_CONFIG,
  type AIModel,
} from './config';

// ── Types ───────────────────────────────────────────────────────────────

interface GenerateOptions {
  /** The model to use. Defaults to DEFAULT_MODEL. */
  model?: AIModel;
  /** System prompt to guide the model's behavior. */
  system?: string;
  /** The user prompt / input. */
  prompt: string;
  /** Controls randomness (0–1). */
  temperature?: number;
  /** Max output tokens to generate. */
  maxOutputTokens?: number;
}

interface StreamOptions {
  /** The model to use. Defaults to DEFAULT_MODEL. */
  model?: AIModel;
  /** System prompt to guide the model's behavior. */
  system?: string;
  /** The user prompt / input. */
  prompt: string;
  /** Controls randomness (0–1). */
  temperature?: number;
  /** Max output tokens to generate. */
  maxOutputTokens?: number;
}

// ── Generate (non-streaming) ────────────────────────────────────────────

/**
 * Generate text using the AI SDK (non-streaming).
 * Uses the app's default model and generation config unless overridden.
 */
export async function generate(options: GenerateOptions) {
  const {
    model = DEFAULT_MODEL,
    system,
    prompt,
    temperature = DEFAULT_GENERATION_CONFIG.temperature,
    maxOutputTokens = DEFAULT_GENERATION_CONFIG.maxOutputTokens,
  } = options;

  return generateText({
    model,
    system,
    prompt,
    temperature,
    maxOutputTokens,
  });
}

// ── Stream (streaming) ──────────────────────────────────────────────────

/**
 * Stream text using the AI SDK.
 * Returns a StreamTextResult that can be converted to a Response
 * via `.toTextStreamResponse()` in route handlers.
 */
export function stream(options: StreamOptions) {
  const {
    model = DEFAULT_MODEL,
    system,
    prompt,
    temperature = DEFAULT_GENERATION_CONFIG.temperature,
    maxOutputTokens = DEFAULT_GENERATION_CONFIG.maxOutputTokens,
  } = options;

  return streamText({
    model,
    system,
    prompt,
    temperature,
    maxOutputTokens,
  });
}
