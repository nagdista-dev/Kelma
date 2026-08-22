import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSpeech } from '@/hooks/useSpeech';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { FeedbackCard } from '@/components/quiz/FeedbackCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { XPCounter } from '@/components/quiz/XPCounter';
import { StreakBadge } from '@/components/quiz/StreakBadge';
import { WordPipelineTracker } from '@/components/quiz/WordPipelineTracker';
import { HintButton } from '@/components/quiz/HintButton';
import { SpellingInput } from '@/components/quiz/SpellingInput';
import { I_DONT_KNOW, STREAK_MILESTONES } from '@/constants/index';

export function QuizPage() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { speak, speakSequence } = useSpeech();
  const prevStreakRef = useRef(0);
  const prevMasteredCountRef = useRef(0);
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

  // Auto-pronounce the word when it is revealed (round 3) or tested by ear (round 5)
  useEffect(() => {
    if (phase !== 'active' || !currentQuestion) return;
    if (currentQuestion.round === 3 || currentQuestion.round === 5) {
      speak(currentQuestion.wordProgress.quizData.word);
    }
  }, [phase, currentQuestion?.wordProgress.word, currentQuestion?.round, speak]); // eslint-disable-line react-hooks/exhaustive-deps

  // Feedback sounds + spoken reinforcement of the target word after EVERY answer
  useEffect(() => {
    if (phase !== 'feedback' || !lastAnswer) return;
    play(lastAnswer.correct ? 'correct' : 'wrong');

    if (!lastAnswer.correct && lastAnswer.selected === I_DONT_KNOW) return;

    // Streak milestone celebration
    if (streak > prevStreakRef.current && STREAK_MILESTONES.includes(streak)) {
      window.setTimeout(() => play('streak'), 350);
    }
    prevStreakRef.current = streak;

    // Reinforce learning: hear the word, then its example sentence
    if (currentQuestion) {
      const quizData = currentQuestion.wordProgress.quizData;
      const fullSentence = quizData.exampleSentence.replace(/_{2,}/g, quizData.word);
      const timer = window.setTimeout(() => {
        speakSequence([quizData.word, fullSentence], 0.9);
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [phase, lastAnswer, play, speakSequence, streak, currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Celebrate when a word reaches mastered status
  useEffect(() => {
    const masteredCount = words.filter(w => w.status === 'mastered').length;
    if (masteredCount > prevMasteredCountRef.current && phase !== 'idle') {
      play('mastered');
    }
    prevMasteredCountRef.current = masteredCount;
  }, [words, phase, play]);

  // Redirect to report when complete
  useEffect(() => {
    if (phase === 'complete') {
      play('complete');
      navigate('/report');
    }
  }, [phase, navigate, play]);

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
  const isSpellingRound = question.round === 6;

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
        <WordPipelineTracker words={words} />
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

      {/* Answer input (spelling round) */}
      {phase === 'active' && isSpellingRound && (
        <motion.div
          key={`${question.wordProgress.word}-${question.round}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2.5"
        >
          <SpellingInput
            onSubmit={selected => {
              play('click');
              handleAnswer(selected);
            }}
            disabled={isAnswerLocked}
          />
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

      {/* Answer buttons */}
      {phase === 'active' && !isSpellingRound && (
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
              onClick={() => {
                play('click');
                handleAnswer(option);
              }}
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
      {phase === 'feedback' && !isSpellingRound && (
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
