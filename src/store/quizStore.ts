import { create } from 'zustand';
import type {
  QuizState,
  QuizPhase,
  WordProgress,
  WordQuizData,
  QuizQuestion,
  RoundNumber,
  LanguageLevel,
} from '@/types/index';
import {
  I_DONT_KNOW,
  XP_PER_ROUND,
  XP_ROUND_4,
  XP_HINT_PENALTY,
  TOTAL_ROUNDS,
} from '@/constants/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(wp: WordProgress): QuizQuestion {
  const { quizData, currentRound } = wp;

  switch (currentRound) {
    case 1: {
      // Recognition: Arabic meaning → pick English word
      const options = [...shuffle([quizData.word, ...quizData.distractors]), I_DONT_KNOW];
      return {
        wordProgress: wp,
        round: 1,
        questionText: `Choose the English word that matches "${quizData.arabicMeaning}".`,
        options,
        correctAnswer: quizData.word,
        contextLine: 'Arabic to English',
      };
    }
    case 2: {
      // Comprehension: English definition → pick English word
      const options = [...shuffle([quizData.word, ...quizData.distractors]), I_DONT_KNOW];
      return {
        wordProgress: wp,
        round: 2,
        questionText: `Choose the word that best matches this definition: ${quizData.englishDefinition}`,
        options,
        correctAnswer: quizData.word,
        contextLine: 'Definition to word',
      };
    }
    case 3: {
      // Translation: English word → pick Arabic meaning
      const options = [...shuffle([quizData.arabicMeaning, ...quizData.arabicDistractors]), I_DONT_KNOW];
      return {
        wordProgress: wp,
        round: 3,
        questionText: `Choose the Arabic meaning of "${quizData.word}".`,
        options,
        correctAnswer: quizData.arabicMeaning,
        contextLine: 'English to Arabic',
      };
    }
    case 4: {
      // Fill-in-blank: Sentence with blank → tap correct word
      const options = [...shuffle([quizData.word, ...quizData.sentenceDistractors]), I_DONT_KNOW];
      return {
        wordProgress: wp,
        round: 4,
        questionText: `Complete the sentence: ${quizData.exampleSentence}`,
        options,
        correctAnswer: quizData.word,
        contextLine: 'Fill in the blank',
      };
    }
    default: {
      const _e: never = currentRound;
      throw new Error(`Unknown round: ${String(_e)}`);
    }
  }
}

function getNextPendingWord(words: WordProgress[]): WordProgress | undefined {
  // Pick a RANDOM candidate so the user can never predict which word comes next
  const candidates = words.filter(
    w => w.status === 'in-progress' || w.status === 'pending'
  );
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useQuizStore = create<QuizState>((set, get) => ({
  phase: 'idle',
  words: [],
  currentQuestion: null,
  lastAnswer: null,
  xp: 0,
  streak: 0,
  maxStreak: 0,
  level: 'B1',
  sessionStartTime: null,

  startSession: (_wordStrings: string[], level: LanguageLevel, quizData: WordQuizData[]) => {
    // Shuffle so the quiz never follows the input order
    const shuffledQuizData = shuffle(quizData);
    const words: WordProgress[] = shuffledQuizData.map(qd => ({
      word: qd.word,
      quizData: qd,
      currentRound: 1 as RoundNumber,
      status: 'pending',
      attempts: [],
      xpEarned: 0,
      hintsUsed: 0,
    }));

    const firstWord = words[0];
    const currentQuestion = firstWord ? buildQuestion(firstWord) : null;
    // Mark first word as in-progress
    if (firstWord) firstWord.status = 'in-progress';

    set({
      phase: 'active',
      words,
      currentQuestion,
      lastAnswer: null,
      xp: 0,
      streak: 0,
      maxStreak: 0,
      level,
      sessionStartTime: new Date(),
    });
  },

  answerQuestion: (selected: string) => {
    const { currentQuestion, words, xp, streak } = get();
    if (!currentQuestion) return;

    const correct = selected === currentQuestion.correctAnswer;
    const isIDontKnow = selected === I_DONT_KNOW;

    // XP calculation
    const wordInProgress = words.find(w => w.word === currentQuestion.wordProgress.word);
    let xpGained = 0;
    let hintsUsed = wordInProgress?.hintsUsed ?? 0;

    if (correct && !isIDontKnow) {
      const baseXp = currentQuestion.round === 4 ? XP_ROUND_4 : XP_PER_ROUND;
      const hintPenalty = Math.min(hintsUsed * XP_HINT_PENALTY, baseXp - 1);
      xpGained = Math.max(baseXp - hintPenalty, 1);
    }

    const newStreak = correct && !isIDontKnow ? streak + 1 : 0;
    const newMaxStreak = Math.max(get().maxStreak, newStreak);

    // Update word progress
    const updatedWords = words.map(w => {
      if (w.word !== currentQuestion.wordProgress.word) return w;
      const updatedAttempts = [
        ...w.attempts,
        {
          round: currentQuestion.round,
          correct: correct && !isIDontKnow,
          usedHint: w.hintsUsed > 0,
          timestamp: new Date(),
        },
      ];
      return {
        ...w,
        attempts: updatedAttempts,
        xpEarned: w.xpEarned + xpGained,
        hintsUsed: 0, // Reset hint count per round
      };
    });

    set({
      words: updatedWords,
      xp: xp + xpGained,
      streak: newStreak,
      maxStreak: newMaxStreak,
      lastAnswer: {
        selected,
        correct: correct && !isIDontKnow,
        feedbackText: '', // Will be filled by useAIQuiz hook if wrong
      },
      phase: 'feedback',
    });
  },

  nextQuestion: () => {
    const { words, currentQuestion } = get();
    if (!currentQuestion) return;

    const wasCorrect = get().lastAnswer?.correct ?? false;
    const wasIDontKnow = get().lastAnswer?.selected === I_DONT_KNOW;

    // Advance the word's round or mark mastered
    let updatedWords = words.map(w => {
      if (w.word !== currentQuestion.wordProgress.word) return w;

      if (wasCorrect) {
        const nextRound = (w.currentRound + 1) as RoundNumber;
        if (nextRound > TOTAL_ROUNDS) {
          return { ...w, status: 'mastered' as const };
        }
        return { ...w, currentRound: nextRound, status: 'in-progress' as const };
      } else if (wasIDontKnow) {
        // On "I don't know": stay on same round but move to back of queue
        return { ...w, status: 'pending' as const };
      } else {
        // Wrong answer: retry this round (move to back of queue)
        return { ...w, status: 'pending' as const };
      }
    });

    const nextWord = getNextPendingWord(updatedWords);

    if (!nextWord) {
      // All words mastered
      set({ words: updatedWords, phase: 'complete', currentQuestion: null });
      return;
    }

    // Mark the next word as in-progress
    updatedWords = updatedWords.map(w =>
      w.word === nextWord.word ? { ...w, status: 'in-progress' as const } : w
    );

    const nextQuestion = buildQuestion(nextWord);
    set({
      words: updatedWords,
      currentQuestion: nextQuestion,
      lastAnswer: null,
      phase: 'active',
    });
  },

  useHint: () => {
    const { currentQuestion, words } = get();
    if (!currentQuestion) return '';

    // Give the user the first collocation as a contextual hint
    const hint = currentQuestion.wordProgress.quizData.collocations[0] ?? '';

    const updatedWords = words.map(w =>
      w.word === currentQuestion.wordProgress.word
        ? { ...w, hintsUsed: w.hintsUsed + 1 }
        : w
    );

    set({ words: updatedWords });
    return hint;
  },

  setPhase: (phase: QuizPhase) => set({ phase }),

  resetQuiz: () =>
    set({
      phase: 'idle',
      words: [],
      currentQuestion: null,
      lastAnswer: null,
      xp: 0,
      streak: 0,
      maxStreak: 0,
      sessionStartTime: null,
    }),
}));
