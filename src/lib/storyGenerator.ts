import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

export interface StoryResult {
  title: string;
  story: string;
}

const StorySchema = z.object({
  title: z.string(),
  story: z.string().min(50),
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

export function generateStory(
  provider: AIProvider,
  apiKey: string,
  model: string,
  words: string[],
  level: string
): Promise<StoryResult> {
  const prompt = `You are a creative English teacher for Arabic-speaking learners.
Write a short, engaging story (120-180 words) at CEFR level ${level} that naturally uses ALL these words: ${words.join(', ')}.
The story should be simple, coherent, with a clear beginning, middle, and end.
Make it fun and easy to memorize. Return JSON: { title: "A short title", story: "The full story text" }`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: StorySchema,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });
    return object;
  });
}