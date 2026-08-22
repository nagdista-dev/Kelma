import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSpeech } from '@/hooks/useSpeech';
import { useQuizStore } from '@/store/quizStore';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { FeedbackCard } from '@/components/quiz/FeedbackCard';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { XPCounter } from '@/components/quiz/XPCounter';
import { StreakBadge } from '@/components/quiz/StreakBadge';
import { WordPipelineTracker } from '@/components/quiz/WordPipelineTracker';
import { HintButton } from '@/components/quiz/HintButton';
import { SpellingInput } from '@/components/quiz/SpellingInput';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { I_DONT_KNOW, STREAK_MILESTONES } from '@/constants/index';
import type { RoundNumber } from '@/types/index';

function isTypingRound(round: RoundNumber) {
  return round === 6;
}

export function QuizPage() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { speak, stop } = useSpeech();
  const { sessionStartTime } = useQuizStore();
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

    // Reinforce learning: always hear the WORD itself automatically
    if (currentQuestion) {
      const targetWord = currentQuestion.wordProgress.quizData.word;
      const timer = window.setTimeout(() => {
        speak(targetWord);
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [phase, lastAnswer, play, speak, streak, currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Keyboard shortcuts: 1-6 pick answers, Enter continues
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (phase === 'active' && currentQuestion && !isAnswerLocked && !isTypingRound(currentQuestion.round)) {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < currentQuestion.options.length) {
          play('click');
          handleAnswer(currentQuestion.options[idx]);
        }
      }

      if (phase === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        stop();
        play('next');
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, currentQuestion, isAnswerLocked, handleAnswer, handleNext, play, stop]);

  // Redirect to session if no active quiz
  if (phase === 'idle') {
    navigate('/session');
    return null;
  }

  if (!currentQuestion || phase === 'loading') {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
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
      <div className="flex items-center justify-between mb-4 gap-3">
        <XPCounter xp={xp} />
        <StreakBadge streak={streak} />
        <QuizTimer startedAt={sessionStartTime ? sessionStartTime.getTime() : Date.now()} />
        <div className="text-xs text-slate-500 dark:text-gray-500">
          {masteredCount}/{words.length} mastered
        </div>
      </div>

      {/* Overall progress */}
      <ProgressBar value={progress} label={`Session progress`} color="teal" />
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
            stop();
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

      {/* During feedback show only the relevant options */}
      {phase === 'feedback' && !isSpellingRound && (
        <div className="space-y-2.5 mt-2">
          {currentQuestion.options
            .filter(option => {
              if (!lastAnswer) return false;
              // Correct pick → hide everything else
              if (lastAnswer.correct) return option === lastAnswer.selected;
              // Wrong pick → show the wrong pick + reveal the correct one
              return (
                option === lastAnswer.selected ||
                (option !== I_DONT_KNOW && option === question.correctAnswer)
              );
            })
            .map((option, i) => (
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
