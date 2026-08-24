import { create } from 'zustand';
import type { PlacementQuestion } from '@/lib/placementTest';
import type { LanguageLevel } from '@/types/index';

export interface PlacementAttempt {
  question: PlacementQuestion;
  selectedIndex: number;
}

interface PlacementState {
  active: boolean;
  questions: PlacementQuestion[];
  index: number;
  attempts: PlacementAttempt[];
  locked: boolean;

  start: (questions: PlacementQuestion[]) => void;
  answer: (selectedIndex: number) => void;
  next: () => void;
  reset: () => void;
}

export const usePlacementStore = create<PlacementState>(set => ({
  active: false,
  questions: [],
  index: 0,
  attempts: [],
  locked: false,

  start: questions =>
    set({ active: true, questions, index: 0, attempts: [], locked: false }),

  answer: selectedIndex =>
    set(state => {
      if (!state.active || state.locked) return state;
      const question = state.questions[state.index];
      return {
        locked: true,
        attempts: [...state.attempts, { question, selectedIndex }],
      };
    }),

  next: () =>
    set(state => {
      if (!state.active) return state;
      const isLast = state.index + 1 >= state.questions.length;
      if (isLast) return { ...state, active: false };
      return { index: state.index + 1, locked: false };
    }),

  reset: () => set({ active: false, questions: [], index: 0, attempts: [], locked: false }),
}));

export function placementResult(
  attempts: PlacementAttempt[]
): { recommended: LanguageLevel; correctCount: number } {
  const tally = new Map<LanguageLevel, { total: number; correct: number }>();
  attempts.forEach(a => {
    const t = tally.get(a.question.level) ?? { total: 0, correct: 0 };
    t.total += 1;
    if (a.selectedIndex === a.question.correctIndex) t.correct += 1;
    tally.set(a.question.level, t);
  });

  let recommended: LanguageLevel = 'A1';
  (['A1', 'A2', 'B1', 'B2', 'C1'] as LanguageLevel[]).forEach(level => {
    const t = tally.get(level);
    if (!t || t.correct / t.total >= 0.6) recommended = level;
  });

  const correctCount = attempts.filter(
    a => a.selectedIndex === a.question.correctIndex
  ).length;
  return { recommended, correctCount };
}
