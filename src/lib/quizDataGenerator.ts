import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, WordQuizData, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

const getSessionDataMaxOutputTokens = (provider: AIProvider, wordCount: number) => {
  if (provider === 'openrouter') {
    return Math.min(1200, Math.max(700, wordCount * 450));
  }

  return Math.min(5000, Math.max(1200, wordCount * 550));
};

export function getFriendlyAIErrorMessage(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('401') ||
    normalizedMessage.includes('unauthorized') ||
    normalizedMessage.includes('authentication') ||
    normalizedMessage.includes('incorrect api key') ||
    normalizedMessage.includes('invalid api key')
  ) {
    return 'Invalid API key. Please check the selected provider and paste a fresh key.';
  }

  if (normalizedMessage.includes('requires more credits') || normalizedMessage.includes('can only afford')) {
    return 'Not enough provider credits for this request. Add credits, choose a cheaper model, or try fewer words.';
  }

  if (normalizedMessage.includes('429') || normalizedMessage.includes('rate')) {
    return 'Rate limit reached. Please wait a moment and try again.';
  }

  return `Connection error: ${message}`;
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const WordQuizDataSchema = z.object({
  word: z.string(),
  arabicMeaning: z.string(),
  englishDefinition: z.string(),
  ipa: z.string().optional(),
  exampleSentence: z.string(),
  distractors: z.array(z.string()).length(3),
  arabicDistractors: z.array(z.string()).length(3),
  sentenceDistractors: z.array(z.string()).length(3),
  collocations: z.array(z.string()),
  emojiAnchor: z.string().optional(),
  frequencyNote: z.enum(['common', 'formal', 'specialized']),
  memoryTip: z.string().optional(),
});

const SessionDataSchema = z.object({
  words: z.array(WordQuizDataSchema),
});

// ─── Retry Helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = AI_MAX_RETRIES): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, AI_RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

// ─── Call 1: Session Data Generation ─────────────────────────────────────────

export async function generateSessionData(
  words: string[],
  level: LanguageLevel,
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<WordQuizData[]> {
  const wordList = words.join(', ');

  const prompt = `You are an expert English vocabulary teacher specializing in teaching Egyptian Arabic speakers.

Generate complete quiz data for these ${words.length} English words at ${level} level: ${wordList}

For EACH word provide:
- arabicMeaning: The most accurate, natural Egyptian Arabic translation (use Arabic script)
- englishDefinition: A clear, level-appropriate English definition (${level} level vocabulary in the definition itself)
- ipa: (optional) The IPA phonetic transcription of the word, e.g. /ˈlæd.əl/
- exampleSentence: A natural sentence using the word with the word replaced by "___" (blank). Must be at ${level} level.
- distractors: 3 confusable English words (similar meaning, spelling, or sound — NOT random). These are wrong answers for MCQ rounds 1 and 2.
- arabicDistractors: 3 wrong Arabic meanings (plausible but incorrect). For MCQ round 3.
- sentenceDistractors: 3 wrong English words that could plausibly fit the blank in the example sentence. For MCQ round 4.
- collocations: 2–4 common collocations (e.g. "make a decision", "strong opinion")
- emojiAnchor: (optional) 1-2 emojis that visually anchor the meaning
- frequencyNote: one of "common" | "formal" | "specialized"
- memoryTip: (optional) A short memory trick or mnemonic in Egyptian Arabic or English

CRITICAL RULES:
- Distractors must be genuine confusables, not random words
- arabicDistractors must look like plausible translations at first glance
- sentenceDistractors must fit the sentence grammatically (but be wrong in meaning)
- exampleSentence must NOT contain the word — only "___"
- All content must match ${level} proficiency level

Return valid JSON matching the schema exactly.`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: SessionDataSchema,
      prompt,
      temperature: 0,
      maxOutputTokens: getSessionDataMaxOutputTokens(provider, words.length),
    });
    return object.words as WordQuizData[];
  });
}

// ─── Call 2: Wrong Answer Feedback ───────────────────────────────────────────

export async function generateWrongAnswerFeedback(
  word: string,
  round: number,
  userAnswer: string,
  correctAnswer: string,
  wordData: WordQuizData,
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<string> {
  const prompt = `You are a friendly English vocabulary teacher helping an Arabic-speaking student.

Word: "${word}"
Quiz round: ${round}
Student's answer: "${userAnswer}"
Correct answer: "${correctAnswer}"
Arabic meaning: ${wordData.arabicMeaning}
Example sentence: "${wordData.exampleSentence.replace('___', word)}"
${wordData.collocations.length ? `Common collocations: ${wordData.collocations.join(', ')}` : ''}
${wordData.emojiAnchor ? `Visual anchor: ${wordData.emojiAnchor}` : ''}
${wordData.memoryTip ? `Memory tip: ${wordData.memoryTip}` : ''}

Write a clear, concise pedagogical explanation in English, formatted EXACTLY as these 3 short lines (keep the labels):

Key Difference: [one sentence: why "${correctAnswer}" is correct and the distinction from the student's answer — put both words in **bold**]
Usage Context: [one sentence: when and how the word is naturally used]
Memory Anchor: [one short memorable mnemonic linking the word to its meaning]

Rules:
- No greeting, no intro, no closing praise.
- Use **bold** around the English words whenever they appear.
- Each line must stay short (max ~25 words).`;

  return withRetry(async () => {
    const { text } = await generateText({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateText>[0]['model'],
      prompt,
      maxOutputTokens: 300,
    });
    return text.trim();
  });
}

// ─── On-demand Translation (collocations / examples) ──────────────────────────

export async function translateToArabic(
  texts: string[],
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<string[]> {
  const prompt = `Translate each English item below into natural Egyptian Arabic (Arabic script).
Return ONLY JSON matching the schema — one translation per item, same order, same count.

Items:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: z.object({ translations: z.array(z.string()).length(texts.length) }),
      prompt,
      temperature: 0,
      maxOutputTokens: 1200,
    });
    return object.translations as string[];
  });
}

// ─── API Key Validation ───────────────────────────────────────────────────────

export async function validateApiKey(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    await generateText({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateText>[0]['model'],
      prompt: 'Say "ok" in one word.',
      maxOutputTokens: 5,
    });
    return { valid: true };
  } catch (err) {
    return { valid: false, error: getFriendlyAIErrorMessage(err) };
  }
}
