/**
 * AI SDK Configuration
 *
 * Central configuration for the Vercel AI Gateway.
 * Uses model strings (e.g., 'openai/gpt-6-astra') to route through
 * the gateway — no provider SDK packages needed.
 *
 * @see https://ai-sdk.dev/docs/foundations/providers-and-models
 */

// ── Supported model identifiers (Vercel AI Gateway format) ──────────────

export const AI_MODELS = {
  // OpenAI models
  openai: {
    /** Latest flagship reasoning model */
    GPT_6_ASTRA: 'openai/gpt-6-astra',
    /** Fast, cost-effective model for most tasks */
    GPT_4_1: 'openai/gpt-4.1',
    /** Compact model for lightweight tasks */
    GPT_4_1_MINI: 'openai/gpt-4.1-mini',
    /** Nano model for simple/cheap tasks */
    GPT_4_1_NANO: 'openai/gpt-4.1-nano',
  },

  // Anthropic models
  anthropic: {
    /** Latest flagship model */
    CLAUDE_OPUS_5_5: 'anthropic/claude-opus-5.5',
    /** Balanced performance/cost model */
    CLAUDE_SONNET_4_5: 'anthropic/claude-sonnet-4.5',
    /** Fast, affordable model */
    CLAUDE_HAIKU_3_5: 'anthropic/claude-haiku-3.5',
  },
} as const;

// ── Default model for the application ───────────────────────────────────

/**
 * The default model used across the application.
 * Change this to switch the global default without touching individual features.
 */
export const DEFAULT_MODEL = AI_MODELS.anthropic.CLAUDE_SONNET_4_5;

// ── Type helpers ────────────────────────────────────────────────────────

/** Union type of all available OpenAI model identifiers */
export type OpenAIModel = (typeof AI_MODELS.openai)[keyof typeof AI_MODELS.openai];

/** Union type of all available Anthropic model identifiers */
export type AnthropicModel = (typeof AI_MODELS.anthropic)[keyof typeof AI_MODELS.anthropic];

/** Union type of all supported model identifiers */
export type AIModel = OpenAIModel | AnthropicModel;

// ── Shared generation defaults ──────────────────────────────────────────

/**
 * Default parameters for text generation.
 * Override per-call as needed.
 */
export const DEFAULT_GENERATION_CONFIG = {
  /** Controls randomness. Lower = more deterministic. */
  temperature: 0.7,
  /** Maximum number of output tokens to generate (v5 API uses maxOutputTokens) */
  maxOutputTokens: 2048,
} as const;
