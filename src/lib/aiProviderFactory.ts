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
 * never sent to any backend server. Providers in NO_KEY_PROVIDERS work with
 * an empty key, so we fall back to a placeholder to satisfy the SDK client.
 */
export function getAIModel(provider: AIProvider, apiKey: string, model: string) {
  const key = apiKey || 'not-required';

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
          'X-OpenRouter-Title': 'Kelma',
        },
      }).chat(model);
    case 'opencode':
      return createOpenAI({
        apiKey,
        baseURL: 'https://opencode.ai/zen/v1',
        name: 'opencode',
      }).chat(model);
    case 'groq':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        name: 'groq',
      }).chat(model);
    case 'deepseek':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com/v1',
        name: 'deepseek',
      }).chat(model);
    case 'mistral':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.mistral.ai/v1',
        name: 'mistral',
      }).chat(model);
    case 'xai':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
        name: 'xai',
      }).chat(model);
    case 'aionlabs':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.aionlabs.ai/v1',
        name: 'aionlabs',
      }).chat(model);
    case 'zai':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.z.ai/api/paas/v4',
        name: 'zai',
      }).chat(model);
    case 'huggingface':
      return createOpenAI({
        apiKey,
        baseURL: 'https://router.huggingface.co/v1',
        name: 'huggingface',
      }).chat(model);
    case 'kilo':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.kilo.ai/api/gateway',
        name: 'kilo',
      }).chat(model);
    case 'llm7':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.llm7.io/v1',
        name: 'llm7',
      }).chat(model);
    case 'nvidia':
      return createOpenAI({
        apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
        name: 'nvidia',
      }).chat(model);
    case 'ollama':
      return createOpenAI({
        apiKey,
        baseURL: 'https://ollama.com/v1',
        name: 'ollama',
      }).chat(model);
    case 'ovh':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
        name: 'ovh',
      }).chat(model);
    case 'cloudflare': {
      // Key format: <account-id>:<api-token>
      const sepIndex = apiKey.indexOf(':');
      const accountId = sepIndex === -1 ? apiKey : apiKey.slice(0, sepIndex);
      const token = sepIndex === -1 ? '' : apiKey.slice(sepIndex + 1);
      return createOpenAI({
        apiKey: token,
        baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`,
        name: 'cloudflare',
      }).chat(model);
    }
    case 'modelscope':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api-inference.modelscope.cn/v1',
        name: 'modelscope',
      }).chat(model);
    case 'siliconflow':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.siliconflow.cn/v1',
        name: 'siliconflow',
      }).chat(model);
    case 'pollinations':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://gen.pollinations.ai/v1',
        name: 'pollinations',
      }).chat(model);
    case 'cerebras':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.cerebras.ai/v1',
        name: 'cerebras',
      }).chat(model);
    case 'sambanova':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.sambanova.ai/v1',
        name: 'sambanova',
      }).chat(model);
    case 'ai21':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.ai21.com/studio/v1',
        name: 'ai21',
      }).chat(model);
    case 'glhf':
      return createOpenAI({
        apiKey,
        baseURL: 'https://glhf.chat/api/openai/v1',
        name: 'glhf',
      }).chat(model);
    case 'nscale':
      return createOpenAI({
        apiKey,
        baseURL: 'https://inference.api.nscale.com/v1',
        name: 'nscale',
      }).chat(model);
    case 'nebius':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.studio.nebius.com/v1',
        name: 'nebius',
      }).chat(model);
    case 'chutes':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.chutes.ai/v1',
        name: 'chutes',
      }).chat(model);
    case 'kluster':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.kluster.ai/v1',
        name: 'kluster',
      }).chat(model);
    case 'alibaba':
      return createOpenAI({
        apiKey,
        baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
        name: 'alibaba',
      }).chat(model);
    case 'together':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.together.xyz/v1',
        name: 'together',
      }).chat(model);
    case 'fireworks':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.fireworks.ai/inference/v1',
        name: 'fireworks',
      }).chat(model);
    case 'novita':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.novita.ai/v3/openai',
        name: 'novita',
      }).chat(model);
    case 'hyperbolic':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.hyperbolic.xyz/v1',
        name: 'hyperbolic',
      }).chat(model);
    case 'deepinfra':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.deepinfra.com/v1/openai',
        name: 'deepinfra',
      }).chat(model);
    case 'scaleway':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.scaleway.ai/v1',
        name: 'scaleway',
      }).chat(model);
    case 'upstage':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.upstage.ai/v1/solar',
        name: 'upstage',
      }).chat(model);
    case 'wandb':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.inference.wandb.ai/v1',
        name: 'wandb',
      }).chat(model);
    case 'typhoon':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.opentyphoon.ai/v1',
        name: 'typhoon',
      }).chat(model);
    case 'arli':
      return createOpenAI({
        apiKey,
        baseURL: 'https://api.arliai.com/v1',
        name: 'arli',
      }).chat(model);
    case 'poolside':
      return createOpenAI({
        apiKey,
        baseURL: 'https://inference.poolside.ai/v1',
        name: 'poolside',
      }).chat(model);
    case 'anyapi':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://anyapi.openchatstudio.com/v1',
        name: 'anyapi',
      }).chat(model);
    case 'puter':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.puter.com/ai/v1',
        name: 'puter',
      }).chat(model);
    case 'surpollinations':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://sur.pollinations.ai/v1',
        name: 'surpollinations',
      }).chat(model);
    case 'uncloseai':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.uncloseai.com/v1',
        name: 'uncloseai',
      }).chat(model);
    case 'heckai':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.heck.ai/v1',
        name: 'heckai',
      }).chat(model);
    case 'g4f':
      return createOpenAI({
        apiKey: key,
        baseURL: 'https://api.g4f.dev/v1',
        name: 'g4f',
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
