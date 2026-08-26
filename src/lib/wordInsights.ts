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
  arabicMeaning: z.string(),
  difference: z.string(),
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

  const prompt = `You are an English pronunciation coach for Arabic speakers.
Provide:
- IPA transcription for "${word}"
- Syllable breakdown as an array (e.g. ["re", "lax"])
- A one-sentence stress tip for Arabic speakers

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

export function generateConfusables(
  provider: AIProvider,
  apiKey: string,
  model: string,
  word: string
): Promise<{ target: string; confusables: Array<{ word: string; arabicMeaning: string; difference: string }> }> {
  const cacheKey = `pww-conf-${word.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return Promise.resolve(JSON.parse(cached));
    } catch {
      /* ignore */
    }
  }

  const prompt = `You are an English teacher explaining tricky words to Arabic-speaking learners.

The target word is: "${word}"

Provide 3-4 other English words that learners frequently confuse with it (similar spelling, sound, or meaning). For each confusable word:
- its English spelling
- its Arabic meaning (Egyptian dialect)
- a short clear explanation in ARABIC (Egyptian dialect) of how it differs from "${word}" — include an example sentence

Return JSON: { word: "${word}", confusables: [{ word, arabicMeaning, difference }, ...] }`;

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