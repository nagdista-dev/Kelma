import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

const WOTD_LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const WotdWordSchema = z.object({
  word: z.string(),
  arabicMeaning: z.string(),
  englishDefinition: z.string(),
  ipa: z.string(),
  emojiAnchor: z.string(),
  memoryTip: z.string(),
  collocations: z.array(z.string()).min(2).max(4),
  frequencyNote: z.enum(['common', 'formal', 'specialized']),
  exampleSentence: z.string(),
});

const WotdSetSchema = z.object({
  date: z.string(),
  words: z.record(z.enum(WOTD_LEVELS), WotdWordSchema),
});

export type WotdWord = z.infer<typeof WotdWordSchema>;
export type WotdSet = z.infer<typeof WotdSetSchema>;

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

export function getWordOfTheDay(provider: AIProvider, apiKey: string, model: string): Promise<WotdSet> {
  const cacheKey = `pww-wotd-${new Date().toISOString().slice(0, 10)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.date === new Date().toISOString().slice(0, 10)) return Promise.resolve(parsed);
    } catch {
      /* ignore malformed cache */
    }
  }

  const prompt = `You are an English vocabulary expert for Arabic-speaking learners of all levels.

Generate exactly 5 high-frequency English words, one for each CEFR level: A1, A2, B1, B2, C1.

Requirements for EACH word:
- The word itself is real and useful at that level
- A natural Arabic translation (Egyptian dialect preferred)
- A clear English definition matching the CEFR level
- IPA pronunciation guide (British/American, e.g. /ˈkɒmpjuːtər/)
- A one-word emoji that visually anchors the meaning
- A short memorable tip in Egyptian Arabic or simple English
- 2-4 common collocations (e.g. "make a decision")
- One of: "common", "formal", "specialized"
- One natural example sentence using the word (the word replaced by "___" as a blank)

Return JSON with structure: { date: "YYYY-MM-DD", words: { A1: {...}, A2: {...}, B1: {...}, B2: {...}, C1: {...} } }
`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: WotdSetSchema,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 4000,
    });
    const result = object;
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  });
}