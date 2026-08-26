import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSettingsStore } from '@/store/settingsStore';
import { placementResult, usePlacementStore } from '@/store/placementStore';

/**
 * Level placement flow rendered inside the quiz page — same visual
 * language, sounds and feedback colors as the word quiz.
 */
export function PlacementQuiz() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const setDefaultLevel = useSettingsStore(s => s.setDefaultLevel);
  const { questions, index, attempts, locked, answer, next, reset } = usePlacementStore();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const total = questions.length;

  if (!question && !done) return null;

  const pick = (i: number) => {
    if (locked || !question) return;
    play('click');
    setSelectedIndex(i);
    answer(i);
    if (i === question.correctIndex) play('correct');
    else window.setTimeout(() => play('wrong'), 0);
  };

  const finish = () => {
    const res = placementResult(attempts);
    setDefaultLevel(res.recommended);
    setDone(true);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    if (index + 1 < total) {
      play('next');
      next();
    } else {
      finish();
    }
  };

  const buttonState = (i: number) => {
    if (!locked) return 'default' as const;
    if (question && i === question.correctIndex) return 'correct' as const;
    if (i === selectedIndex) return 'wrong' as const;
    return 'dimmed' as const;
  };

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

          <p
            dir="rtl"
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            className="mt-5 text-xs text-gray-400"
          >
            صحّحت {correctCount} من {total} — مستواك المقترح:
          </p>
          <h2
            dir="rtl"
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            className="mt-1 text-2xl font-extrabold text-white"
          >
            تم حفظ مستواك ✓
          </h2>

          <div className="mt-6 space-y-2.5">
            <Button onClick={() => navigate('/session')} size="lg" className="w-full" id="placement-done-session">
              ابدأ جلسة على مستواك
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
              className="w-full"
              id="placement-done-retake"
            >
              <RotateCcw className="h-4 w-4" />
              Retake test
            </Button>
          </div>

          <p
            dir="rtl"
            style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
            className="mt-4 inline-flex items-center gap-1 text-[11px] text-gray-600"
          >
            <Check className="h-3 w-3" /> المستوى اتحدّث في إعداداتك
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Header pill */}
      <div className="glass mb-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-bold text-teal-300">
          <BrainCircuit className="h-4 w-4" />
          Placement Test
        </span>
        <span className="text-[11px] font-bold tabular-nums text-gray-400">
          {Math.min(index + 1, total)}/{total}
        </span>
      </div>

      <ProgressBar value={((locked ? index + 1 : index) / total) * 100} label="Placement progress" color="teal" />

      {/* Question */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
          Question {index + 1}
        </p>
        <bdi className="block text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
          {question.question}
        </bdi>
      </motion.div>

      {/* Options */}
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

      {/* Continue */}
      {locked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky bottom-3 z-10 mt-4">
          <Button onClick={handleNext} variant="primary" size="lg" className="w-full shadow-xl" id="placement-next-btn">
            {index + 1 < total ? 'Continue' : 'See my level'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
