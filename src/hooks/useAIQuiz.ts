import { useState, useCallback } from 'react';
import { generateWrongAnswerFeedback } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Manages AI feedback calls for wrong answers.
 * Returns a `fetchFeedback` function that the quiz engine calls after
 * a wrong answer is submitted.
 */
export function useAIQuiz() {
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const { provider, apiKey, model } = useSettingsStore();

  const fetchFeedback = useCallback(
    async (
      word: string,
      round: number,
      userAnswer: string,
      correctAnswer: string,
      wordData: import('@/types/index').WordQuizData
    ): Promise<string> => {
      setIsLoadingFeedback(true);
      setFeedbackError(null);
      try {
        const text = await generateWrongAnswerFeedback(
          word,
          round,
          userAnswer,
          correctAnswer,
          wordData,
          provider,
          apiKey,
          model
        );
        return text;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load feedback.';
        setFeedbackError(msg);
        return 'Could not load explanation. Please try again.';
      } finally {
        setIsLoadingFeedback(false);
      }
    },
    [provider, apiKey, model]
  );

  return { fetchFeedback, isLoadingFeedback, feedbackError };
}
