import { useEffect, useRef, useState } from 'react';
import { QuizCompleteModal } from '@/components/quiz/QuizCompleteModal';
import { PlacementQuiz } from '@/components/quiz/PlacementQuiz';
import { InlineCorrectBar } from '@/components/quiz/InlineCorrectBar';
import { usePlacementStore } from '@/store/placementStore';
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
  const placementActive = usePlacementStore(st => st.active);
  const prevStreakRef = useRef(0);
  const prevMasteredCountRef = useRef(0);
  const questionShownAtRef = useRef(0);
  const lastWasFastRef = useRef(false);
  const prevXpRef = useRef(0);
  const [correctXp, setCorrectXp] = useState(0);
  const [correctFast, setCorrectFast] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
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
    resetQuiz,
  } = useQuizEngine();

  // Auto-pronounce the word when it is revealed (round 3) or tested by ear (round 5)
  useEffect(() => {
    if (phase !== 'active' || !currentQuestion) return;
    questionShownAtRef.current = Date.now();
    if (currentQuestion.round === 3 || currentQuestion.round === 5) {
      speak(currentQuestion.wordProgress.quizData.word);
    }
  }, [phase, currentQuestion?.wordProgress.word, currentQuestion?.round, speak]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Shared answer path — measures speed and fires the answer with a bonus */
  const answerWithSpeed = (selected: string) => {
    const elapsedSec = (Date.now() - questionShownAtRef.current) / 1000;
    const fast = elapsedSec <= 5;
    lastWasFastRef.current = fast;
    play('click');
    handleAnswer(selected, fast ? 2 : undefined);
  };

  // Feedback sounds + spoken reinforcement of the target word after EVERY answer
  useEffect(() => {
    if (phase !== 'feedback' || !lastAnswer) return;
    play(lastAnswer.correct ? 'correct' : 'wrong');

    // Speed zap rides on top of the answer sound
    if (lastAnswer.correct) {
      setCorrectXp(xp - prevXpRef.current);
      setCorrectFast(lastWasFastRef.current);
      if (lastWasFastRef.current) {
        window.setTimeout(() => play('speed'), 300);
      }
    }
    prevXpRef.current = xp;

    if (!lastAnswer.correct && lastAnswer.selected === I_DONT_KNOW) return;

    // Streak milestone celebration — pitch escalates as the streak grows
    if (streak > prevStreakRef.current && STREAK_MILESTONES.includes(streak)) {
      const step = STREAK_MILESTONES.indexOf(streak);
      window.setTimeout(() => play('streak', { pitch: 1 + step * 0.15 }), 350);
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

  // Keep the next question in view — no hunting with scroll
  useEffect(() => {
    if (phase === 'active' && currentQuestion) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [phase, currentQuestion?.wordProgress.word, currentQuestion?.round]);

  // Celebrate when a word reaches mastered status
  useEffect(() => {
    const masteredCount = words.filter(w => w.status === 'mastered').length;
    if (masteredCount > prevMasteredCountRef.current && phase !== 'idle') {
      play('mastered');
    }
    prevMasteredCountRef.current = masteredCount;
  }, [words, phase, play]);

  // Show celebration modal when complete — navigation is a player choice now
  useEffect(() => {
    if (phase === 'complete') {
      play('complete');
      setShowComplete(true);
    }
  }, [phase, play]);

  // Keyboard shortcuts: 1-6 pick answers, Enter continues
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (phase === 'active' && currentQuestion && !isAnswerLocked && !isTypingRound(currentQuestion.round)) {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < currentQuestion.options.length) {
          answerWithSpeed(currentQuestion.options[idx]);
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

  // Session accuracy across every recorded attempt
  const allAttempts = words.flatMap(w => w.attempts);
  const accuracy =
    allAttempts.length > 0
      ? (allAttempts.filter(a => a.correct).length / allAttempts.length) * 100
      : 0;

  // Session complete modal — must render before any early returns (portal)
  const completeModal =
    showComplete && phase === 'complete' ? (
      <QuizCompleteModal
        xp={xp}
        maxStreak={useQuizStore.getState().maxStreak}
        accuracy={accuracy}
        mastered={words.filter(w => w.status === 'mastered').length}
        total={words.length}
        onViewReport={() => navigate('/report')}
        onNewSession={() => {
          resetQuiz();
          navigate('/session');
        }}
      />
    ) : null;

  // Placement test takes over the quiz page entirely
  if (placementActive) {
    return <PlacementQuiz />;
  }

  // Redirect to session if no active quiz
  if (phase === 'idle') {
    navigate('/session');
    return null;
  }

  if (!currentQuestion || phase === 'loading') {
    // Completion modal still takes priority over the loader
    if (completeModal) return completeModal;
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
    <div className="quiz-container">
      {/* Header stats bar — one unified pill */}
      <div className="glass mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl px-3.5 py-2.5">
        <XPCounter xp={xp} />
        <StreakBadge streak={streak} />
        <QuizTimer startedAt={sessionStartTime ? sessionStartTime.getTime() : Date.now()} />
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${
            masteredCount === words.length && words.length > 0
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/5 text-gray-400'
          }`}
        >
          {masteredCount}/{words.length} mastered
        </span>
      </div>

      {/* Overall progress */}
      <ProgressBar value={progress} label={`Session progress`} color="teal" />
      <div className="mt-4 mb-4">
        <WordPipelineTracker words={words} />
      </div>

      {/* Question */}
      <QuestionCard question={question} />

      {/* Wrong answer → full explanation sheet | Correct → slim banner */}
      {phase === 'feedback' && lastAnswer && !lastAnswer.correct && (
        <FeedbackCard
          question={question}
          correct={false}
          feedbackText={feedbackText}
          isLoadingFeedback={isLoadingFeedback}
          onNext={() => {
            stop();
            play('next');
            handleNext();
          }}
        />
      )}

      {phase === 'feedback' && lastAnswer?.correct && (
        <InlineCorrectBar
          message={['Great job! 💪', 'Nailed it! 🔥', 'Excellent! ⭐', 'You are on fire! 🚀'][streak % 4]}
          xpGained={correctXp}
          speedBonus={correctFast}
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
            onSubmit={selected => answerWithSpeed(selected)}
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
              onClick={() => answerWithSpeed(option)}
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

      {/* Keyboard hint — desktop only */}
      <p className="mt-4 hidden text-center text-[11px] text-gray-600 lg:block dark:text-gray-600">
        Press 1–6 to answer · Enter to continue
      </p>

    </div>
  );
}
