import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '@/types/index';
import { ROUND_LABELS, ROUND_DESCRIPTIONS } from '@/constants/index';

interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const quizData = question.wordProgress.quizData;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${question.wordProgress.word}-${question.round}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm"
      >
        {/* Round badge + context */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <span className="badge-violet bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30">
            Round {question.round} · {ROUND_LABELS[question.round]}
          </span>
          {question.contextLine && (
            <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
              {question.contextLine}
            </span>
          )}
        </div>

        {/* Question text */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-black/10">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            Question
          </p>
          {question.round === 1 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-950 leading-relaxed dark:text-white">
                Choose the English word that matches this Arabic meaning.
              </p>
              <p dir="rtl" className="rtl-text rounded-lg bg-white px-3 py-2 text-right text-slate-950 dark:bg-white/5 dark:text-white">
                {quizData.arabicMeaning}
              </p>
            </div>
          )}

          {question.round === 2 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-950 leading-relaxed dark:text-white">
                Choose the word that best matches this definition.
              </p>
              <p className="text-base leading-relaxed text-slate-700 dark:text-gray-200">
                {quizData.englishDefinition}
              </p>
            </div>
          )}

          {question.round === 3 && (
            <p className="text-lg font-semibold text-slate-950 leading-relaxed dark:text-white">
              Choose the Arabic meaning of <bdi className="font-bold text-violet-700 dark:text-violet-300">{quizData.word}</bdi>.
            </p>
          )}

          {question.round === 4 && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-950 leading-relaxed dark:text-white">
                Complete the sentence.
              </p>
              <p className="text-base leading-relaxed text-slate-700 dark:text-gray-200">
                {quizData.exampleSentence}
              </p>
            </div>
          )}
        </div>

        {/* Round description for context */}
        <p className="text-xs text-slate-500 mt-3 dark:text-gray-500">
          {ROUND_DESCRIPTIONS[question.round]}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
