import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';
import { getCuratedDailyWotdSet } from '@/lib/wordOfTheDayData';

const WotdWordSchema = z.object({
  word: z.string(),
  arabicMeaning: z.string(),
  englishDefinition: z.string(),
  ipa: z.string().default('/ˈwɜːd/'),
  emojiAnchor: z.string().default('✨'),
  memoryTip: z.string().default(''),
  collocations: z.array(z.string()).default([]),
  frequencyNote: z.string().default('common'),
  exampleSentence: z.string().default(''),
});

const WotdSetSchema = z.object({
  date: z.string(),
  words: z.object({
    A1: WotdWordSchema,
    A2: WotdWordSchema,
    B1: WotdWordSchema,
    B2: WotdWordSchema,
    C1: WotdWordSchema,
  }),
});

export type WotdWord = z.infer<typeof WotdWordSchema>;
export type WotdSet = {
  date: string;
  words: Record<LanguageLevel, WotdWord>;
};

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

/**
 * Retrieves the Word of the Day set.
 * Guaranteed to return a valid, rich word set for today (instant local curated default + cached AI).
 */
export async function getWordOfTheDay(
  provider: AIProvider,
  apiKey: string,
  model: string,
  forceAI = false
): Promise<WotdSet> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `pww-wotd-${today}`;

  // 1. Check local storage cache
  if (!forceAI) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.date === today && parsed?.words?.A1 && parsed?.words?.B1) {
          return parsed as WotdSet;
        }
      } catch {
        /* ignore malformed cache */
      }
    }
  }

  // 2. If no key and not forcing AI, immediately return the curated set
  if (!apiKey && provider !== 'llm7' && provider !== 'pollinations' && provider !== 'ovh' && !forceAI) {
    const curated = getCuratedDailyWotdSet(today);
    localStorage.setItem(cacheKey, JSON.stringify(curated));
    return curated;
  }

  // 3. Try generating with AI
  try {
    const prompt = `You are an English language vocabulary mentor.
Generate 5 high-yield English words for today, one for each CEFR level: A1, A2, B1, B2, C1.

For each word provide:
- word: the target English word
- arabicMeaning: clear, simple English core definition or essence
- englishDefinition: precise, natural English definition
- ipa: accurate phonetic IPA transcription (e.g. /ˈkɒm.fər.tə.bəl/)
- emojiAnchor: a theme keyword matching the word
- memoryTip: a vivid, memorable mnemonic hook and conceptual memory anchor in 100% clear English
- collocations: 2-3 common natural English phrases or pairings
- frequencyNote: "common", "formal", or "specialized"
- exampleSentence: a natural, realistic English example sentence showcasing the word in authentic context (use the actual word in the sentence)

Respond with valid JSON matching the schema. All text, definitions, and memory hooks must be in English.`;

    const result = await withRetry(async () => {
      const { object } = await generateObject({
        model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
        schema: WotdSetSchema,
        prompt,
        temperature: 0.4,
      });
      return object as WotdSet;
    });

    if (result && result.words) {
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
  } catch (err) {
    console.warn('AI WOTD generation failed, using curated daily word bank fallback:', err);
  }

  // 4. Guaranteed 100% Reliable Fallback: Curated daily set
  const fallback = getCuratedDailyWotdSet(today);
  localStorage.setItem(cacheKey, JSON.stringify(fallback));
  return fallback;
}