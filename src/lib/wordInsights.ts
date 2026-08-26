/** English word definition and pronunciation for the Pronounce page. */
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

const PronunciationSchema = z.object({
  ipa: z.string(),
  syllables: z.array(z.string()),
  stress: z.string(),
});

const ConfusableSchema = z.object({
  word: z.string(),
  definition: z.string(),
  difference: z.string(),
  example: z.string(),
});

const ConfusablesSchema = z.object({
  target: z.string(),
  confusables: z.array(ConfusableSchema),
});

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < AI_MAX_RETRIES) await new Promise(r => setTimeout(r, AI_RETRY_DELAY_MS));
    }
  }
  throw lastError;
}

export interface PronunciationResult {
  ipa: string;
  syllables: string[];
  stress: string;
}

export function generateWordPronunciation(
  provider: AIProvider,
  apiKey: string,
  model: string,
  word: string
): Promise<PronunciationResult> {
  const cacheKey = `pww-pron-${word.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return Promise.resolve(JSON.parse(cached));
    } catch {
      /* ignore and regenerate */
    }
  }

  const prompt = `You are an expert English pronunciation coach.
Provide:
- IPA transcription for "${word}"
- Syllable breakdown as an array (e.g. ["re", "lax"])
- A one-sentence phonetic stress guide explaining which syllable carries primary emphasis.

Return JSON matching the schema.`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: PronunciationSchema,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 500,
    });
    localStorage.setItem(cacheKey, JSON.stringify(object));
    return object;
  });
}

export interface ConfusableItem {
  word: string;
  definition: string;
  difference: string;
  example: string;
}

export function generateConfusables(
  provider: AIProvider,
  apiKey: string,
  model: string,
  word: string
): Promise<{ target: string; confusables: ConfusableItem[] }> {
  const cacheKey = `pww-conf-v2-${word.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return Promise.resolve(JSON.parse(cached));
    } catch {
      /* ignore */
    }
  }

  const prompt = `You are an expert English vocabulary coach distinguishing commonly confused word pairs and homophones.

The target word is: "${word}"

Provide 2-3 English words that learners frequently confuse with "${word}" (similar sound, spelling, or overlapping usage). For each confusable word provide:
- word: the confusable word
- definition: concise 1-sentence English definition
- difference: clear explanation of the core distinction from "${word}"
- example: a natural example sentence demonstrating correct usage

Return JSON matching the schema: { target: "${word}", confusables: [...] }`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: ConfusablesSchema,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 800,
    });
    localStorage.setItem(cacheKey, JSON.stringify(object));
    return { target: word, confusables: object.confusables };
  });
}