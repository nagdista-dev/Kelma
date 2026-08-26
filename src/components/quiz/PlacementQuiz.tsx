import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSettingsStore } from '@/store/settingsStore';
import { placementResult, usePlacementStore } from '@/store/placementStore';

/**
 * AI placement flow on its own /placement route. Answered questions stay
 * on screen as a compact review feed — nothing is ever removed — while
 * the current question slides in below and auto-scrolls into view.
 */
export function PlacementQuiz() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const setDefaultLevel = useSettingsStore(s => s.setDefaultLevel);
  const { questions, index, attempts, locked, answer, next, reset } = usePlacementStore();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const currentCardRef = useRef<HTMLDivElement | null>(null);

  const question = questions[index];
  const total = questions.length;

  const handleNext = useCallback(() => {
    setSelectedIndex(null);
    if (index + 1 < total) {
      play('next');
      next();
    } else {
      const res = placementResult(usePlacementStore.getState().attempts);
      setDefaultLevel(res.recommended);
      setDone(true);
    }
  }, [index, total, play, next, setDefaultLevel]);

  // Answers flow on their own — feedback banner, then auto-advance.
  // Wrong answers linger a beat longer so the correct one can be read.
  const lastPick = attempts.at(-1)?.selectedIndex;
  const wasCorrect = locked && question && lastPick === question.correctIndex;
  useEffect(() => {
    if (!locked) return;
    const delay = wasCorrect ? 1200 : 1900;
    const autoNext = window.setTimeout(handleNext, delay);
    return () => window.clearTimeout(autoNext);
  }, [locked, index, wasCorrect, handleNext]);

  // Bring the fresh question into view — the feed grows downward
  useEffect(() => {
    if (index > 0) {
      currentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [index]);

  const pick = useCallback(
    (i: number) => {
      if (locked || !question) return;
      play('click');
      setSelectedIndex(i);
      answer(i);
      if (i === question.correctIndex) play('correct');
      else window.setTimeout(() => play('wrong'), 0);
    },
    [locked, question, play, answer]
  );

  const buttonState = useCallback(
    (i: number): 'default' | 'correct' | 'wrong' | 'dimmed' => {
      if (!locked) return 'default';
      if (question && i === question.correctIndex) return 'correct';
      if (i === selectedIndex) return 'wrong';
      return 'dimmed';
    },
    [locked, question, selectedIndex]
  );

  if (!question && !done) return null;

  // ─── Done: recommended level ───
  if (done) {
    const { recommended, correctCount } = placementResult(attempts);
    return (
      <div className="page-container flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ scale: 0.85, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-full max-w-md rounded-2xl border border-gold/30 bg-gradient-to-b from-slate-900 to-bg-primary p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15, bounce: 0.5 }}
            className="glow-teal mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-teal-500/40 bg-teal-500/15 text-3xl font-extrabold text-teal-300"
          >
            {recommended}
          </motion.div>

          <p className="mt-5 text-xs text-slate-400">
            Scored {correctCount} of {total} — Recommended CEFR Level:
          </p>
          <h2 className="mt-1 flex items-center justify-center gap-2 text-2xl font-extrabold text-white">
            <span>Proficiency Level Saved</span>
            <Check className="h-6 w-6 text-emerald-400 stroke-[3]" />
          </h2>

          <div className="mt-6 space-y-2.5">
            <Button onClick={() => navigate('/session')} size="lg" className="w-full gap-2 font-bold" id="placement-done-session">
              <span>Start Practice at Your Level</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                reset();
                setDone(false);
                navigate('/level');
              }}
              variant="secondary"
              size="lg"
              className="w-full gap-2 font-bold"
              id="placement-done-retake"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </Button>
          </div>

          <p className="mt-4 inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Check className="h-3 w-3 text-emerald-500" /> Target level updated in your settings
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Header pill */}
      <div className="glass mb-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-bold text-teal-700 dark:text-teal-300">
          <BrainCircuit className="h-4 w-4" />
          Placement Test
        </span>
        <span className="text-[11px] font-bold tabular-nums text-slate-500 dark:text-gray-400">
          {Math.min(index + 1, total)}/{total}
        </span>
      </div>

      <ProgressBar value={((locked ? index + 1 : index) / total) * 100} label="Placement progress" color="teal" />

      {/* Answered questions stay visible as a compact review feed */}
      <div className="mt-4 space-y-2.5">
        {questions.slice(0, index).map((q, i) => {
          const picked = attempts[i]?.selectedIndex;
          const ok = picked === q.correctIndex;
          return (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white/60 p-3.5 dark:border-white/5 dark:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between gap-3">
                <bdi className="min-w-0 text-sm leading-relaxed text-slate-500 dark:text-gray-500">
                  {q.question}
                </bdi>
                <span
                  aria-label={ok ? 'Correct' : 'Wrong'}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                    ok ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                >
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                <span className="font-semibold text-slate-600 dark:text-gray-400">
                  {picked !== undefined && <bdi>{q.options[picked]}</bdi>}
                </span>
                {!ok && (
                  <>
                    {' · '}
                    <bdi className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {q.options[q.correctIndex]}
                    </bdi>
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current question — slides in below the feed, never removes it */}
      <motion.div
        ref={currentCardRef}
        key={index}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mt-4 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
          Question {index + 1}
        </p>
        <bdi className="block text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
          {question.question}
        </bdi>
      </motion.div>

      <div className="mt-4 space-y-2.5">
        {question.options.map((opt, i) => (
          <AnswerButton
            key={`${index}-${i}`}
            option={opt}
            index={i}
            state={buttonState(i)}
            onClick={() => pick(i)}
          />
        ))}
      </div>

      {/* Feedback banner — stays under the answered question */}
      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          role="status"
          className={`mt-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-extrabold ${
            wasCorrect
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
              wasCorrect ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {wasCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          </span>
          {wasCorrect ? 'Correct!' : 'Not quite — the highlighted answer is correct'}
        </motion.div>
      )}
    </div>
  );
}
