import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { QuizQuestion } from '@/types/index';
import { ROUND_LABELS } from '@/constants/index';
import { useSpeech } from '@/hooks/useSpeech';

interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { speak } = useSpeech();
  const quizData = question.wordProgress.quizData;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${question.wordProgress.word}-${question.round}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 mb-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm"
      >
        {/* Round badge + true sequence indicator (6 rounds) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <span className="badge-teal bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30">
            Round {question.round} · {ROUND_LABELS[question.round]}
          </span>
          {/* 6 diamonds — filled up to the current round */}
          <span className="flex items-center gap-1" aria-label={`Round ${question.round} of 6`}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <span
                key={n}
                aria-hidden="true"
                className={`h-1.5 w-3.5 rounded-full transition-colors ${
                  n < question.round
                    ? 'bg-emerald-400'
                    : n === question.round
                      ? 'bg-gold'
                      : 'bg-slate-200 dark:bg-white/10'
                }`}
              />
            ))}
          </span>
        </div>

        {/* Question */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-black/10">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Question
          </p>

          {question.round === 1 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Choose the English word that matches this Arabic meaning.
              </p>
              <p dir="rtl" className="rtl-text rounded-lg bg-white px-3 py-2 text-right text-lg font-bold text-slate-950 dark:bg-white/5 dark:text-white">
                {quizData.arabicMeaning}
                {quizData.emojiAnchor && (
                  <span className="mr-2" aria-hidden="true">{quizData.emojiAnchor}</span>
                )}
              </p>
            </div>
          )}

          {question.round === 2 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Choose the word that best matches this definition.
              </p>
              <p className="text-base leading-relaxed text-slate-700 dark:text-gray-200">
                {quizData.englishDefinition}
              </p>
            </div>
          )}

          {question.round === 3 && (
            <div className="space-y-4">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Choose the Arabic meaning of this word.
              </p>
              {/* Duolingo-style big speaker */}
              <div className="flex items-center gap-4 rounded-lg bg-white px-3 py-3 dark:bg-white/5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speak(quizData.word)}
                  aria-label={`Pronounce ${quizData.word}`}
                  className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition-colors hover:bg-teal-500"
                >
                  <Volume2 className="h-8 w-8" />
                </motion.button>
                <div className="min-w-0">
                  <bdi className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {quizData.word}
                  </bdi>
                  {quizData.emojiAnchor && (
                    <span className="ml-2 text-2xl" aria-hidden="true">{quizData.emojiAnchor}</span>
                  )}
                  {quizData.ipa && (
                    <p dir="ltr" className="mt-0.5 text-xs font-medium tracking-wide text-teal-600 dark:text-teal-400">
                      {quizData.ipa}
                    </p>
                  )}
                  <p className="text-xs font-medium text-slate-400 dark:text-gray-500">
                    Tap to hear it again
                  </p>
                </div>
              </div>
            </div>
          )}

          {question.round === 4 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Complete the sentence.
              </p>
              <bdi className="block rounded-lg bg-white px-3 py-2 text-base font-medium leading-relaxed text-slate-800 dark:bg-white/5 dark:text-gray-100">
                {quizData.exampleSentence}
              </bdi>
            </div>
          )}

          {question.round === 5 && (
            <div className="space-y-4">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Listen carefully. Which word did you hear?
              </p>
              <div className="flex items-center gap-4 rounded-lg bg-white px-3 py-3 dark:bg-white/5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speak(quizData.word)}
                  aria-label="Play the word"
                  className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30 transition-colors hover:bg-sky-500"
                >
                  <Volume2 className="h-8 w-8" />
                </motion.button>
                <p className="text-sm font-medium text-slate-400 dark:text-gray-500">
                  Tap the speaker to hear it again
                </p>
              </div>
            </div>
          )}

          {question.round === 6 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold leading-relaxed text-slate-950 dark:text-white">
                Type the English word for this meaning.
              </p>
              <p dir="rtl" className="rtl-text rounded-lg bg-white px-3 py-2 text-right text-lg font-bold text-slate-950 dark:bg-white/5 dark:text-white">
                {quizData.arabicMeaning}
                {quizData.emojiAnchor && (
                  <span className="mr-2" aria-hidden="true">{quizData.emojiAnchor}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
