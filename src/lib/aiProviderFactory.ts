import { createOpenAI } from '@ai-sdk/openai';
import { createGoogle } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createCohere } from '@ai-sdk/cohere';
import type { AIProvider } from '@/types/index';

/**
 * Returns the provider-specific model instance for use with Vercel AI SDK's
 * `generateObject` / `generateText` calls.
 *
 * API keys are injected at call time — they come from LocalStorage and are
 * never sent to any backend server.
 */
export function getAIModel(provider: AIProvider, apiKey: string, model: string) {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey }).chat(model);
    case 'commandcode':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.commandcode.ai/provider/v1',
        name: 'commandcode',
      }).chat(model);
    case 'openrouter':
      return createOpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        name: 'openrouter',
        headers: {
          'HTTP-Referer': typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
          'X-OpenRouter-Title': 'Play With Words',
        },
      }).chat(model);
    case 'opencode':
      return createOpenAI({
        apiKey,
        baseURL: 'https://opencode.ai/zen/v1',
        name: 'opencode',
      }).chat(model);
    case 'google':
      return createGoogle({ apiKey })(model);
    case 'anthropic':
      return createAnthropic({ apiKey })(model);
    case 'cohere':
      return createCohere({ apiKey })(model);
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown AI provider: ${String(_exhaustive)}`);
    }
  }
}
