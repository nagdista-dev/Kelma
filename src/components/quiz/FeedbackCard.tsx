import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Lightbulb,
  Link2,
  Quote,
  Volume2,
  XCircle,
  Youtube,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useSpeech } from '@/hooks/useSpeech';
import type { QuizQuestion } from '@/types/index';

const PRAISE_MESSAGES = [
  'Correct! Brilliant! 🎉',
  'Nailed it! Keep going! 🔥',
  'Excellent memory! ⭐',
  'You are on fire! 🚀',
  'Perfect! That brain is sharp! 🧠',
  'Great job! Another one down! 💪',
];

const RETRY_MESSAGES = [
  'Not quite — but mistakes are how we learn! 🌱',
  'Close one! Let us lock this word in. 🔒',
  'No worries, you will get the next one! 💪',
  'Almost! One more look at this word. 👀',
];

function pickRandom(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

const ACTION_TILE =
  'group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95';

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
  const { speak } = useSpeech();
  const word = question.wordProgress.quizData;
  const hasArabicMemoryTip = /[\u0600-\u06FF]/.test(word.memoryTip ?? '');
  const fullSentence = word.exampleSentence.replace(/_{2,}/g, word.word);
  const headerMessage = correct ? pickRandom(PRAISE_MESSAGES) : pickRandom(RETRY_MESSAGES);

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
            {headerMessage}
          </p>
          {!correct && (
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Correct answer:{' '}
              <span className="font-semibold text-slate-950 dark:text-white">{question.correctAnswer}</span>
            </p>
          )}
        </div>
      </div>

      {/* Explore this word */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
          <Compass className="h-3.5 w-3.5" />
          Explore this word
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => speak(word.word)}
            aria-label={`Pronounce ${word.word}`}
            className={`${ACTION_TILE} border-violet-200 bg-violet-50/60 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10 dark:hover:bg-violet-500/20`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-500/20 dark:text-violet-300">
              <Volume2 className="h-4 w-4" />
            </span>
            <span className="w-full truncate text-xs font-bold text-slate-800 dark:text-gray-100">
              <bdi>{word.word}</bdi>
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">Hear it</span>
          </button>

          <button
            type="button"
            onClick={() => speak(fullSentence, 0.85)}
            aria-label="Listen to example sentence"
            className={`${ACTION_TILE} border-sky-200 bg-sky-50/60 hover:border-sky-400 hover:bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10 dark:hover:bg-sky-500/20`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-500/20 dark:text-sky-300">
              <Quote className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-gray-100">Sentence</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">Hear context</span>
          </button>

          <a
            href={`https://youglish.com/pronounce/${encodeURIComponent(word.word)}/english/us`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch real videos using ${word.word} on YouGlish`}
            className={`${ACTION_TILE} border-red-600 bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Youtube className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold">YouGlish</span>
            <span className="text-[10px] font-medium text-red-100">Real videos</span>
          </a>
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
        className="mt-4 w-full"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
