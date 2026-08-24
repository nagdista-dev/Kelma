import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  Languages,
  Lightbulb,
  Link2,
  Loader2,
  Quote,
  Turtle,
  Volume2,
  XCircle,
  Play,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useSpeech } from '@/hooks/useSpeech';
import { useSettingsStore } from '@/store/settingsStore';
import { WordVideosModal } from '@/components/quiz/WordVideosModal';
import { TranslatableBlock } from '@/components/quiz/TranslatableBlock';
import { getFriendlyAIErrorMessage, translateToArabic } from '@/lib/quizDataGenerator';
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

/** Renders **bold** markers inside AI feedback lines */
function FeedbackLine({ line }: { line: string }) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            <bdi>{p.slice(2, -2)}</bdi>
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

const ACTION_TILE =
  'group flex cursor-pointer flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl border px-1.5 py-2.5 sm:px-2 sm:py-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95';

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
  const { provider, apiKey, model } = useSettingsStore();
  const word = question.wordProgress.quizData;
  const hasArabicMemoryTip = /[\u0600-\u06FF]/.test(word.memoryTip ?? '');
  const fullSentence = word.exampleSentence.replace(/_{2,}/g, word.word);
  const headerMessage = correct ? pickRandom(PRAISE_MESSAGES) : pickRandom(RETRY_MESSAGES);
  const [showVideos, setShowVideos] = useState(false);
  const [colTranslations, setColTranslations] = useState<string[] | null>(null);
  const [colLoading, setColLoading] = useState(false);
  const [colError, setColError] = useState('');

  const toggleCollocationTranslation = async () => {
    if (colTranslations) {
      setColTranslations(null);
      return;
    }
    setColLoading(true);
    setColError('');
    try {
      setColTranslations(await translateToArabic(word.collocations, provider, apiKey, model));
    } catch (err) {
      setColError(getFriendlyAIErrorMessage(err));
    } finally {
      setColLoading(false);
    }
  };

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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => speak(word.word)}
            aria-label={`Pronounce ${word.word}`}
            className={`${ACTION_TILE} border-teal-200 bg-teal-50/60 hover:border-teal-400 hover:bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10 dark:hover:bg-teal-500/20`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/20 dark:text-teal-300">
              <Volume2 className="h-4 w-4" />
            </span>
            <span className="w-full truncate text-xs font-bold text-slate-800 dark:text-gray-100">
              <bdi>{word.word}</bdi>
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">Hear it</span>
          </button>

          {/* Slow pronunciation — great for beginners */}
          <button
            type="button"
            onClick={() => speak(word.word, 0.55)}
            aria-label={`Hear ${word.word} slowly`}
            id="slow-pronounce-btn"
            className={`${ACTION_TILE} border-amber-200 bg-amber-50/60 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/20`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-500/20 dark:text-amber-300">
              <Turtle className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-gray-100">Slow</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">Hear slowly</span>
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

          <button
            type="button"
            onClick={() => setShowVideos(true)}
            aria-label={`Watch real videos using ${word.word} without leaving the app`}
            className={`${ACTION_TILE} border-red-600 bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Play className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold">Videos</span>
            <span className="text-[10px] font-medium text-red-100">Real usage</span>
          </button>
        </div>
      </div>

      {/* Example — complete, filled sentence with Arabic translation */}
      <div className="mb-3">
        <TranslatableBlock label="Example" lines={[fullSentence]} />
      </div>

      {/* Collocations — always visible, each chip speaks, section translates */}
      {word.collocations.length > 0 && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
              <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
              Common collocations
            </div>
            <button
              type="button"
              onClick={() => void toggleCollocationTranslation()}
              disabled={colLoading}
              aria-label="Translate collocations to Arabic"
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                colTranslations
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-300'
                  : 'border-slate-200 text-slate-500 hover:border-teal-500/50 hover:text-teal-600 dark:border-white/10 dark:text-gray-400 dark:hover:text-teal-300'
              }`}
            >
              {colLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Languages className="h-3.5 w-3.5" />
              )}
              {colTranslations ? 'EN' : 'عربي'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {word.collocations.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => speak(c)}
                aria-label={`Pronounce ${c}`}
                title="Hear this collocation"
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 dark:border-white/10 dark:bg-black/10 dark:text-gray-200 dark:hover:bg-emerald-500/20"
              >
                <Volume2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-300" />
                {colTranslations?.[i] ? (
                  <span dir="rtl" style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}>
                    {colTranslations[i]}
                  </span>
                ) : (
                  c
                )}
              </button>
            ))}
          </div>
          {colError && <p className="mt-2 text-xs text-red-400">{colError}</p>}
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
            <div
              dir="rtl"
              className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-3.5 dark:border-teal-500/20 dark:from-teal-500/10 dark:to-white/5"
            >
              <p
                dir="rtl"
                style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-teal-700 dark:text-teal-300"
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                شرح سريع من المعلّم
              </p>
              <div className="space-y-1.5 text-sm leading-relaxed text-right text-slate-700 dark:text-gray-200">
                {feedbackText
                  .split('\n')
                  .map(l => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i} dir="rtl" style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}>
                      <FeedbackLine line={line} />
                    </p>
                  ))}
              </div>
            </div>
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

      {/* In-app videos popup */}
      {showVideos && (
        <WordVideosModal word={word.word} onClose={() => setShowVideos(false)} />
      )}
    </motion.div>
  );
}
