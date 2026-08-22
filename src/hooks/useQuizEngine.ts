import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { useAIQuiz } from '@/hooks/useAIQuiz';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useSettingsStore } from '@/store/settingsStore';
import { MAX_XP_PER_WORD } from '@/constants/index';

/**
 * The main orchestrator for the quiz flow.
 * Ties together the quiz store, AI feedback, and session persistence.
 */
export function useQuizEngine() {
  const {
    phase,
    words,
    currentQuestion,
    lastAnswer,
    xp,
    streak,
    maxStreak,
    sessionStartTime,
    answerQuestion,
    nextQuestion,
    useHint: consumeHint,
    setPhase,
    resetQuiz,
  } = useQuizStore();

  const { fetchFeedback, isLoadingFeedback } = useAIQuiz();
  const { saveSession } = useSessionHistory();
  const { provider } = useSettingsStore();

  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const savedSessionRef = useRef(false);

  // When we enter feedback phase, optionally fetch AI explanation for wrong answers
  useEffect(() => {
    if (phase !== 'feedback' || !lastAnswer || !currentQuestion) return;

    const { correct, selected } = lastAnswer;
    let ignore = false;

    if (!correct) {
      // Fetch AI explanation
      void fetchFeedback(
        currentQuestion.wordProgress.word,
        currentQuestion.round,
        selected,
        currentQuestion.correctAnswer,
        currentQuestion.wordProgress.quizData
      ).then(text => {
        if (!ignore) setFeedbackText(text);
      });
    } else {
      setFeedbackText('');
    }

    return () => {
      ignore = true;
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (selected: string) => {
      if (isAnswerLocked || phase !== 'active') return;
      setIsAnswerLocked(true);
      setFeedbackText('');
      answerQuestion(selected);
    },
    [isAnswerLocked, phase, answerQuestion]
  );

  const handleNext = useCallback(() => {
    setIsAnswerLocked(false);
    setFeedbackText('');
    nextQuestion();
  }, [nextQuestion]);

  const handleHint = useCallback((): string => {
    return consumeHint();
  }, [consumeHint]);

  // Persist session when quiz completes
  useEffect(() => {
    if (phase !== 'complete') return;
    if (savedSessionRef.current) return;
    savedSessionRef.current = true;

    const masteredWords = words.filter(w => w.status === 'mastered').map(w => w.word);
    const struggledWords = words
      .filter(w => w.attempts.some(a => !a.correct))
      .map(w => w.word);
    const allWordStrs = words.map(w => w.word);
    const level = useQuizStore.getState().level;

    const maxPossibleXP = words.length * MAX_XP_PER_WORD;

    const durationMs = sessionStartTime
      ? Date.now() - sessionStartTime.getTime()
      : 0;

    void saveSession({
      date: new Date(),
      words: allWordStrs,
      level,
      provider,
      totalXP: xp,
      maxPossibleXP,
      masteredWords,
      struggledWords,
      durationMinutes: Math.round(durationMs / 60000),
      completed: true,
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    phase,
    words,
    currentQuestion,
    lastAnswer,
    feedbackText,
    xp,
    streak,
    maxStreak,
    isLoadingFeedback,
    isAnswerLocked,
    handleAnswer,
    handleNext,
    handleHint,
    setPhase,
    resetQuiz,
  };
}
