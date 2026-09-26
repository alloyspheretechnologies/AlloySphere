/**
 * useAIChat — Client-side hook for streaming AI chat
 *
 * Wraps @ai-sdk/react's useChat with AlloySphere defaults.
 * Use this in client components to build chat interfaces.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useAIChat } from '@/hooks/use-ai-chat';
 *
 * export default function ChatPanel() {
 *   const { messages, input, handleInputChange, handleSubmit, status } = useAIChat();
 *
 *   return (
 *     <div>
 *       {messages.map(m => (
 *         <div key={m.id}>
 *           <strong>{m.role}:</strong>
 *           {m.parts.map((part, i) => (
 *             part.type === 'text' ? <span key={i}>{part.text}</span> : null
 *           ))}
 *         </div>
 *       ))}
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={input}
 *           onChange={handleInputChange}
 *           disabled={status !== 'ready'}
 *         />
 *       </form>
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';

/**
 * Options for the useAIChat hook.
 * Accepts all useChat options from @ai-sdk/react.
 */
interface UseAIChatOptions {
  /** Initial messages to populate the chat. */
  initialMessages?: UIMessage[];
  /** Chat ID for persisting conversations. */
  id?: string;
  /** Additional body params to send with each request. */
  body?: Record<string, unknown>;
  /** Headers to send with each request. */
  headers?: Record<string, string>;
  /** Callback when an error occurs. */
  onError?: (error: Error) => void;
}

export function useAIChat(options: UseAIChatOptions = {}) {
  return useChat({
    ...options,
  });
}
