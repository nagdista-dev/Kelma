import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/aiProviderFactory';
import type { AIProvider, LanguageLevel } from '@/types/index';
import { AI_RETRY_DELAY_MS, AI_MAX_RETRIES } from '@/constants/index';

/** Levels measured by the placement test — English has 6 CEFR levels */
export type PlacementLevel = LanguageLevel | 'C2';

const TEST_LEVELS: PlacementLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const PLACEMENT_LEVELS = TEST_LEVELS;

const PlacementSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      })
    )
    .length(20),
});

export interface PlacementQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  level: PlacementLevel;
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

/** Generates a 20-question placement test spanning A1 → C2, shuffled */
export function generatePlacementQuiz(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<PlacementQuestion[]> {
  const prompt = `You are an English placement exam designer for Arabic-speaking learners.

Create exactly 20 multiple-choice VOCABULARY questions that together SPAN all six CEFR levels A1, A2, B1, B2, C1, C2.

This test decides the vocabulary level the learner will study words at — test WORD knowledge only, never grammar rules.

Structure:
- 18 questions: exactly 3 per CEFR level (A1, A2, B1, B2, C1, C2)
- 2 extra questions around the A2/B1-to-B2 range — the most discriminating zone — to sharpen the final placement

Each question object:
- question: The question text in English (word meaning choice or a fill-in-the-blank whose blank is a single target word)
- options: exactly 4 answer options, only one correct
- correctIndex: index (0-3) of the correct option
- level: the CEFR level this question tests ("A1" | "A2" | "B1" | "B2" | "C1" | "C2")

Rules:
- WORDS only: no grammar-rule questions, no verb-tense drills, no punctuation.
- SHUFFLE the final order: do NOT group or order questions by level — mix all 20 randomly so the difficulty pattern is not guessable.
- Distractors must be plausible.
- No duplicates.

Return JSON matching the schema exactly.`;

  return withRetry(async () => {
    const { object } = await generateObject({
      model: getAIModel(provider, apiKey, model) as Parameters<typeof generateObject>[0]['model'],
      schema: PlacementSchema,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 4000,
    });
    return object.questions as PlacementQuestion[];
  });
}

/**
 * Infers the best CEFR level from placement answers:
 * highest level whose accuracy is >= 60%, falling back to the best partial.
 * C2 mastery maps to C1 — the highest level the app teaches words at.
 */
export function inferLevel(answers: { level: PlacementLevel; correct: boolean }[]): LanguageLevel {
  const tally = new Map<PlacementLevel, { total: number; correct: number }>();
  for (const a of answers) {
    const t = tally.get(a.level) ?? { total: 0, correct: 0 };
    t.total += 1;
    if (a.correct) t.correct += 1;
    tally.set(a.level, t);
  }

  let recommended: PlacementLevel = 'A1';
  for (const level of TEST_LEVELS) {
    const t = tally.get(level);
    if (t && t.correct / t.total >= 0.6) {
      recommended = level;
    }
  }
  return recommended === 'C2' ? 'C1' : recommended;
}
