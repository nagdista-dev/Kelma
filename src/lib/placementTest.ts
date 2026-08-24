import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const PLACEMENT_LEVELS = LEVELS;

const PlacementSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
      })
    )
    .length(12),
});

export interface PlacementQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  level: LanguageLevel;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < AI_MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, AI_RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

/** Generates a 12-question placement test spanning A1 → C1 */
export function generatePlacementQuiz(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<PlacementQuestion[]> {
  const prompt = `You are an English placement exam designer for Arabic-speaking learners.

Create exactly 12 multiple-choice vocabulary/grammar questions that together SPAN the CEFR levels A1, A2, B1, B2, C1 (roughly 2-3 questions per level, ordered easiest to hardest).

Each question object:
- question: The question text in English (fill-in-the-blank or meaning choice)
- options: exactly 4 answer options, only one correct
- correctIndex: index (0-3) of the correct option
- level: the CEFR level this question tests ("A1" | "A2" | "B1" | "B2" | "C1")

Rules:
- Questions must get progressively harder across levels.
- Distractors must be plausible.
- No duplicates.

Return JSON matching the schema exactly.`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: PlacementSchema,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 2500,
    });
    return object.questions as PlacementQuestion[];
  });
}

/**
 * Infers the best CEFR level from placement answers:
 * highest level whose accuracy is >= 60%, falling back to the best partial.
 */
export function inferLevel(answers: { level: LanguageLevel; correct: boolean }[]): LanguageLevel {
  const tally = new Map<LanguageLevel, { total: number; correct: number }>();
  for (const a of answers) {
    const t = tally.get(a.level) ?? { total: 0, correct: 0 };
    t.total += 1;
    if (a.correct) t.correct += 1;
    tally.set(a.level, t);
  }

  let recommended: LanguageLevel = 'A1';
  for (const level of LEVELS) {
    const t = tally.get(level);
    if (!t || t.correct / t.total >= 0.6) {
      recommended = level;
    }
  }
  return recommended;
}
