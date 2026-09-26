/**
 * AI Module — Public API
 *
 * Re-exports everything needed to use AI features in the application.
 *
 * @example
 * ```ts
 * // Server-side generation
 * import { generate, stream, AI_MODELS, DEFAULT_MODEL } from '@/lib/ai';
 * ```
 */

// Configuration & model constants
export {
  AI_MODELS,
  DEFAULT_MODEL,
  DEFAULT_GENERATION_CONFIG,
  type AIModel,
  type OpenAIModel,
  type AnthropicModel,
} from './config';

// Server-side generation utilities
// NOTE: These re-exports are marked 'server-only' and will error
// if imported in client components. Use them in:
//   - Route Handlers (app/api/**/route.ts)
//   - Server Components
//   - Server Actions
export { generate, stream } from './generate';
