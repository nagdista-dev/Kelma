import { generateText } from 'ai';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

export interface VoiceMessage {
  role: 'user' | 'tutor';
  text: string;
}

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

export async function generateTutorReply(
  provider: AIProvider,
  apiKey: string,
  model: string,
  words: string[],
  level: LanguageLevel,
  history: VoiceMessage[]
): Promise<string> {
  const conversationContext = history
    .map(m => `${m.role}: ${m.text}`)
    .join('\n');

  const prompt = `You are a friendly English-speaking conversation partner for Arabic speakers. You are chatting with a student who is practicing these vocabulary words: ${words.join(', ')}
The CEFR level is ${level}.

Write a response that:
1. Acknowledges what they said (or a relevant follow-up question if they haven't spoken yet)
2. Uses at least one of the practice words naturally in a sentence
3. Asks ONE simple follow-up question using vocabulary from the word list
4. Keeps the response short (1-3 sentences, max about 50 words)

Current conversation:
${conversationContext}

Respond as the tutor in plain English. No markdown, no emojis, no greeting.`;

  return withRetry(async () => {
    const { text } = await generateText({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateText>[0]['model'],
      prompt,
      maxOutputTokens: 150,
      temperature: 0.7,
    });
    return text.trim();
  });
}