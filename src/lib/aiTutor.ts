import { generateText } from 'ai';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

export interface TutorMessage {
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
  level: LanguageLevel,
  history: TutorMessage[]
): Promise<string> {
  const conversationContext = history
    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
    .join('\n');

  const prompt = `You are an expert conversational English tutor and language mentor. Your role is to help the learner achieve fluency through interactive dialogue, rich explanations, and gentle corrections.

Student's CEFR target level: ${level}

CRITICAL RULES:
- You are an ENGLISH tutor — focus on English language acquisition: vocabulary expansion, natural grammar, pronunciation nuances, idioms, and writing style.
- If the student goes off topic, gently steer the conversation back to English language mastery.
- Keep responses conversational, concise, and encouraging (2-4 sentences).
- When the student makes a mistake, correct it gently and explain why.
- Ask follow-up questions to keep the conversation going.
- Use vocabulary appropriate for ${level} level.
- Occasionally suggest new words, phrases, or idioms for the student to learn.
- Be warm, patient, and motivating — like a supportive teacher.

Current conversation:
${conversationContext}

Respond as the tutor. No markdown, no emojis, no greeting at the start.`;

  return withRetry(async () => {
    const { text } = await generateText({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateText>[0]['model'],
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });
    return text.trim();
  });
}
