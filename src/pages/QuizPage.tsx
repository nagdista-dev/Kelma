import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { FeedbackCard } from '@/components/quiz/FeedbackCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { XPCounter } from '@/components/quiz/XPCounter';
import { StreakBadge } from '@/components/quiz/StreakBadge';
import { WordPipelineTracker } from '@/components/quiz/WordPipelineTracker';
import { HintButton } from '@/components/quiz/HintButton';
import { I_DONT_KNOW } from '@/constants/index';

export function QuizPage() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const {
    phase,
    words,
    currentQuestion,
    lastAnswer,
    feedbackText,
    xp,
    streak,
    isLoadingFeedback,
    isAnswerLocked,
    handleAnswer,
    handleNext,
    handleHint,
  } = useQuizEngine();

  // Redirect to report when complete
  useEffect(() => {
    if (phase === 'complete') {
      play('complete');
      navigate('/report');
    }
  }, [phase, navigate, play]);

  useEffect(() => {
    if (phase !== 'feedback' || !lastAnswer) return;
    play(lastAnswer.correct ? 'correct' : 'wrong');
  }, [phase, lastAnswer, play]);

  // Redirect to session if no active quiz
  if (phase === 'idle') {
    navigate('/session');
    return null;
  }

  if (!currentQuestion || phase === 'loading') {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading quiz…</p>
        </div>
      </div>
    );
  }

  const question = currentQuestion;
  const masteredCount = words.filter(w => w.status === 'mastered').length;
  const progress = (masteredCount / words.length) * 100;

  // Determine answer button states
  function getButtonState(option: string) {
    if (phase !== 'feedback' || !lastAnswer) {
      return isAnswerLocked ? 'disabled' : 'default';
    }
    if (option === lastAnswer.selected) {
      return lastAnswer.correct ? 'correct' : 'wrong';
    }
    if (!lastAnswer.correct && option === question.correctAnswer) {
      return 'correct'; // Reveal correct answer
    }
    if (option === I_DONT_KNOW && lastAnswer.selected === I_DONT_KNOW) {
      return 'wrong';
    }
    return 'dimmed';
  }

  const isArabicRound = question.round === 3;

  return (
    <div className="page-container">
      {/* Header stats bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <XPCounter xp={xp} />
        <StreakBadge streak={streak} />
        <div className="text-xs text-slate-500 dark:text-gray-500">
          {masteredCount}/{words.length} mastered
        </div>
      </div>

      {/* Overall progress */}
      <ProgressBar value={progress} label={`Session progress`} color="violet" />
      <div className="mt-4 mb-4">
        <WordPipelineTracker
          words={words}
          currentWord={question.wordProgress.word}
        />
      </div>

      {/* Question */}
      <QuestionCard question={question} />

      {/* Feedback (shown after answer) */}
      {phase === 'feedback' && lastAnswer && (
        <FeedbackCard
          question={question}
          correct={lastAnswer.correct}
          feedbackText={feedbackText}
          isLoadingFeedback={isLoadingFeedback}
          onNext={() => {
            play('next');
            handleNext();
          }}
        />
      )}

      {/* Answer buttons */}
      {phase === 'active' && (
        <motion.div
          key={`${question.wordProgress.word}-${question.round}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2.5"
        >
          {question.options.map((option, i) => (
            <AnswerButton
              key={option}
              option={option}
              index={i}
              state={getButtonState(option)}
              onClick={() => handleAnswer(option)}
              isArabic={isArabicRound && option !== I_DONT_KNOW}
            />
          ))}

          <div className="mt-4">
            <HintButton
              onHint={() => {
                play('hint');
                return handleHint();
              }}
              disabled={isAnswerLocked}
            />
          </div>
        </motion.div>
      )}

      {/* Answer buttons (dimmed) during feedback */}
      {phase === 'feedback' && (
        <div className="space-y-2.5 opacity-50 pointer-events-none mt-2">
          {currentQuestion.options.map((option, i) => (
            <AnswerButton
              key={option}
              option={option}
              index={i}
              state={getButtonState(option)}
              onClick={() => {}}
              isArabic={isArabicRound && option !== I_DONT_KNOW}
            />
          ))}
        </div>
      )}
    </div>
  );
}
