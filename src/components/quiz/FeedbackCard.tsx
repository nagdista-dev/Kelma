import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useSpeech } from '@/hooks/useSpeech';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { WordVideosModal } from '@/components/quiz/WordVideosModal';
import { TranslatableBlock } from '@/components/quiz/TranslatableBlock';
import { getFriendlyAIErrorMessage, translateToArabic } from '@/lib/quizDataGenerator';
import type { QuizQuestion } from '@/types/index';

const PRAISE_MESSAGES = [
  'Correct! Brilliant!',
  'Nailed it! Keep going!',
  'Excellent memory!',
  'You are on fire!',
  'Perfect! Sharp recall!',
  'Great job! Another one mastered!',
];

const RETRY_MESSAGES = [
  'Not quite — but mistakes are how we learn!',
  'Close one! Let\'s lock this word in.',
  'No worries, you\'ll get the next one!',
  'Almost! One more look at this word.',
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
  'group flex cursor-pointer flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-2xl border px-1.5 py-3 sm:px-2 sm:py-3.5 text-center transition-all duration-200 active:scale-95 hover:scale-[1.03]';

interface FeedbackCardProps {
  question: QuizQuestion;
  correct: boolean;
  feedbackText: string;
  isLoadingFeedback: boolean;
  onNext: () => void;
}

/**
 * Answer result popup — bottom sheet on mobile, centered dialog on desktop.
 * Slides in over a blurred scrim so nothing underneath competes for attention.
 */
export function FeedbackCard({
  question,
  correct,
  feedbackText,
  isLoadingFeedback,
  onNext,
}: FeedbackCardProps) {
  const { speak } = useSpeech();
  const { provider, apiKey, model } = useSettingsStore();
  const { play } = useSoundEffects();
  const word = question.wordProgress.quizData;
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

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[85] flex items-end justify-stretch bg-slate-950/60 backdrop-blur-md"
      role="dialog"
      aria-label="Answer result"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`flex max-h-[93dvh] w-full flex-col overflow-hidden rounded-t-[2rem] shadow-2xl ${
          correct
            ? 'bg-white dark:bg-[#0d1b2a]'
            : 'bg-white dark:bg-[#0d1b2a]'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>

        {/* ─── Result Header ─── */}
        <div
          className={`px-5 pt-4 pb-4 ${
            correct
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}
        >
          <div className="flex items-center gap-3.5 sm:mx-auto sm:max-w-xl">
            {/* Icon circle */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm">
              {correct
                ? <CheckCircle2 className="h-6 w-6 text-white stroke-[2.5]" />
                : <XCircle className="h-6 w-6 text-white stroke-[2.5]" />
              }
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-white leading-snug">
                {headerMessage}
              </p>
              {!correct && (
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-100 shrink-0" />
                  <span className="text-xs text-red-100 font-medium">
                    Correct answer:{' '}
                    <span className="font-black text-white">
                      <bdi>{question.correctAnswer}</bdi>
                    </span>
                  </span>
                </div>
              )}
              {correct && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-white/20 border border-white/30 px-2.5 py-0.5 text-xs font-black text-white">
                    <Zap className="h-3 w-3 fill-white" />
                    Word Mastered
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:mx-auto sm:w-full sm:max-w-xl">

          {/* Explore this word — 4 action tiles */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-white/8 dark:bg-white/[0.03]">
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-gray-500">
              <Compass className="h-3.5 w-3.5" />
              Explore this word
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {/* Normal pronunciation */}
              <button
                type="button"
                onClick={() => { play('click'); speak(word.word); }}
                aria-label={`Pronounce ${word.word}`}
                className={`${ACTION_TILE} border-teal-200/80 bg-teal-50/70 hover:border-teal-400 hover:bg-teal-50 dark:border-teal-500/25 dark:bg-teal-500/8 dark:hover:bg-teal-500/18`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:text-teal-300">
                  <Volume2 className="h-4 w-4" />
                </span>
                <span className="w-full truncate text-[11px] font-bold text-slate-800 dark:text-gray-100">
                  <bdi>{word.word}</bdi>
                </span>
                <span className="hidden text-[10px] font-medium text-slate-400 dark:text-gray-500 sm:block">Hear it</span>
              </button>

              {/* Slow pronunciation */}
              <button
                type="button"
                onClick={() => { play('click'); speak(word.word, 0.55); }}
                aria-label={`Hear ${word.word} slowly`}
                id="slow-pronounce-btn"
                className={`${ACTION_TILE} border-amber-200/80 bg-amber-50/70 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/8 dark:hover:bg-amber-500/18`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white dark:text-amber-300">
                  <Turtle className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-gray-100">Slow</span>
                <span className="hidden text-[10px] font-medium text-slate-400 dark:text-gray-500 sm:block">Hear slowly</span>
              </button>

              {/* Example sentence */}
              <button
                type="button"
                onClick={() => { play('click'); speak(fullSentence, 0.85); }}
                aria-label="Listen to example sentence"
                className={`${ACTION_TILE} border-sky-200/80 bg-sky-50/70 hover:border-sky-400 hover:bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/8 dark:hover:bg-sky-500/18`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white dark:text-sky-300">
                  <Quote className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-gray-100">Sentence</span>
                <span className="hidden text-[10px] font-medium text-slate-400 dark:text-gray-500 sm:block">Hear context</span>
              </button>

              {/* Videos */}
              <button
                type="button"
                onClick={() => { play('click'); setShowVideos(true); }}
                aria-label={`Watch real videos using ${word.word}`}
                className={`${ACTION_TILE} border-red-500/50 bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 hover:from-red-400 hover:to-red-500 hover:shadow-red-500/35`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <Play className="h-4 w-4 fill-white" />
                </span>
                <span className="text-[11px] font-bold">Videos</span>
                <span className="hidden text-[10px] font-medium text-red-100 sm:block">Real usage</span>
              </button>
            </div>

            {word.ipa && (
              <p dir="ltr" className="mt-2.5 text-center text-xs font-semibold tracking-wide text-teal-600 dark:text-teal-400 font-mono">
                {word.ipa}
              </p>
            )}
          </div>

          {/* Example sentence with translation toggle */}
          <TranslatableBlock label="Example" lines={[fullSentence]} />

          {/* Collocations */}
          {word.collocations.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-white/8 dark:bg-white/[0.04]">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                  <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Common collocations
                </div>
                <button
                  type="button"
                  onClick={() => { play('click'); void toggleCollocationTranslation(); }}
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
                  {colTranslations ? 'Hide' : 'Translate'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {word.collocations.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => speak(c)}
                    aria-label={`Pronounce ${c}`}
                    title="Hear this collocation"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 active:scale-95 dark:border-white/10 dark:bg-black/10 dark:text-gray-200 dark:hover:bg-emerald-500/20"
                  >
                    <Volume2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-300" />
                    {colTranslations?.[i] ? (
                      <span>{colTranslations[i]}</span>
                    ) : (
                      c
                    )}
                  </button>
                ))}
              </div>
              {colError && <p className="mt-2 text-xs text-red-400">{colError}</p>}
            </div>
          )}

          {/* AI Teacher Breakdown — wrong answers only */}
          {!correct && (
            <div>
              {isLoadingFeedback ? (
                <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-400">
                  <Spinner size="sm" />
                  <span>Preparing a short explanation…</span>
                </div>
              ) : feedbackText ? (
                <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-white p-4 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-transparent">
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-violet-700 dark:text-violet-300 uppercase">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    AI Teacher Breakdown
                  </p>
                  <div className="space-y-2 text-sm leading-relaxed text-right text-slate-700 dark:text-gray-200">
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

          {/* Memory Anchor */}
          {word.memoryTip && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-transparent p-3.5 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-transparent">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
                  Memory Anchor
                </p>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-200">
                  {word.memoryTip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Sticky Footer ─── */}
        <div className={`shrink-0 border-t px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${
          correct
            ? 'border-emerald-500/20 bg-emerald-50/50 dark:border-emerald-500/15 dark:bg-emerald-500/[0.06]'
            : 'border-red-500/20 bg-red-50/50 dark:border-red-500/15 dark:bg-red-500/[0.06]'
        }`}>
          <Button
            id="feedback-next-btn"
            onClick={onNext}
            variant="primary"
            className={`w-full font-bold py-3 gap-2 ${
              correct
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25'
                : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 dark:from-slate-600 dark:to-slate-700 shadow-lg shadow-slate-900/25'
            }`}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* In-app videos popup */}
      {showVideos && <WordVideosModal word={word.word} onClose={() => setShowVideos(false)} />}
    </motion.div>,
    document.body
  );
}
