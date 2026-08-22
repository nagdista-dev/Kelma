import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Lightbulb, Link2, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { QuizQuestion } from '@/types/index';

interface FeedbackCardProps {
  question: QuizQuestion;
  correct: boolean;
  feedbackText: string;
  isLoadingFeedback: boolean;
  onNext: () => void;
}

export function FeedbackCard({
  question,
  correct,
  feedbackText,
  isLoadingFeedback,
  onNext,
}: FeedbackCardProps) {
  const word = question.wordProgress.quizData;
  const hasArabicMemoryTip = /[\u0600-\u06FF]/.test(word.memoryTip ?? '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border p-5 mb-4 shadow-sm dark:shadow-none ${
        correct
          ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            correct
              ? 'border-emerald-200 bg-white text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-red-200 bg-white text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
          }`}
        >
          {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className={`font-bold text-base ${correct ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
            {correct ? 'Correct!' : 'Not quite…'}
          </p>
          {!correct && (
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Correct answer: <span className="font-semibold text-slate-950 dark:text-white">{question.correctAnswer}</span>
            </p>
          )}
        </div>
      </div>

      {/* Collocations (always show on correct) */}
      {correct && word.collocations.length > 0 && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
            Common collocations
          </div>
          <div className="flex flex-wrap gap-2">
            {word.collocations.map(c => (
              <span key={c} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-black/10 dark:text-gray-200">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback for wrong answers */}
      {!correct && (
        <div className="mt-2">
          {isLoadingFeedback ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              <Spinner size="sm" />
              <span>Preparing a short explanation. You can continue now.</span>
            </div>
          ) : feedbackText ? (
            <p className="text-sm text-slate-700 rtl-text leading-relaxed bg-white rounded-xl p-3 dark:text-gray-200 dark:bg-white/5">
              {feedbackText}
            </p>
          ) : null}
        </div>
      )}

      {/* Memory tip */}
      {word.memoryTip && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <p
            dir={hasArabicMemoryTip ? 'rtl' : 'ltr'}
            className={hasArabicMemoryTip ? 'rtl-text text-right' : ''}
          >
            {word.memoryTip}
          </p>
        </div>
      )}

      {/* Continue button */}
      <Button
        id="feedback-next-btn"
        onClick={onNext}
        variant="primary"
        size="sm"
        className="mt-4 w-full"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
