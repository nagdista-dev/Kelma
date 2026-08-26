export const MAX_WORDS = 10;
export const MIN_WORDS = 1;

// XP values
export const XP_PER_ROUND = 5;    // Rounds 1, 2, 3
export const XP_ROUND_4 = 10;     // Fill in the blank (harder)
export const XP_ROUND_5 = 10;     // Listening
export const XP_ROUND_6 = 15;     // Spelling (production — hardest)
export const XP_HINT_PENALTY = 3; // Deducted when hint is used
export const XP_SKIP_PENALTY = 5; // Deducted when a spelling question is skipped

// Total XP a single word can award across all rounds
export const MAX_XP_PER_WORD = XP_PER_ROUND * 3 + XP_ROUND_4 + XP_ROUND_5 + XP_ROUND_6;

// Quiz structure
export const TOTAL_ROUNDS = 6;
export const MCQ_OPTIONS_COUNT = 4;      // 3 distractors + 1 correct
export const I_DONT_KNOW = "I don't know";

// Streak milestones that show celebration
export const STREAK_MILESTONES = [3, 5, 10];

// AI retry config
export const AI_RETRY_DELAY_MS = 2000;
export const AI_MAX_RETRIES = 2;

// Round labels shown in the UI
export const ROUND_LABELS: Record<number, string> = {
  1: 'Recognition',
  2: 'Comprehension',
  3: 'Translation',
  4: 'Fill in the Blank',
  5: 'Listening',
  6: 'Spelling',
};

export const ROUND_DESCRIPTIONS: Record<number, string> = {
  1: 'Pick the correct English word from its Arabic meaning',
  2: 'Pick the correct English word from its definition',
  3: 'Pick the correct Arabic meaning of the word',
  4: 'Complete the sentence with the correct word',
  5: 'Listen to the pronunciation and pick the correct word',
  6: 'Type the English word from its Arabic meaning',
};
