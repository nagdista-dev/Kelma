import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronRight,
  Headphones,
  Lightbulb,
  Pen,
  Sparkles,
} from 'lucide-react';
import { getWordOfTheDay, type WotdSet, type WotdWord } from '@/lib/wordOfTheDay';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import type { LanguageLevel } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

const TABS: { key: LanguageLevel; label: string; desc: string }[] = [
  { key: 'A1', label: 'A1', desc: 'Beginner' },
  { key: 'A2', label: 'A2', desc: 'Elementary' },
  { key: 'B1', label: 'B1', desc: 'Intermediate' },
  { key: 'B2', label: 'B2', desc: 'Upper' },
  { key: 'C1', label: 'C1', desc: 'Advanced' },
];

function highlightExample(text: string, word: string) {
  const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-bold text-teal-600 dark:text-teal-300">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const FREQ_MAP: Record<string, { label: string; color: string }> = {
  common: { label: 'Common', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  formal: { label: 'Formal', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  specialized: { label: 'Specialized', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
};

function WordCard({ word, onPlay, onHear }: { word: WotdWord; onPlay: () => void; onHear: () => void }) {
  const freq = FREQ_MAP[word.frequencyNote] ?? FREQ_MAP.common;

  return (
    <motion.div
      key={word.word}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-0 overflow-hidden">
        {/* Hero band */}
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-teal-50/80 via-white to-amber-50/40 px-6 pt-6 pb-5 dark:from-teal-500/10 dark:via-transparent dark:to-amber-500/5 dark:border-white/5">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-4xl leading-none">{word.emojiAnchor}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${freq.color}`}>
              {freq.label}
            </span>
          </div>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {word.word}
          </h2>
          <p className="mt-1 font-mono text-sm text-teal-600/80 dark:text-teal-400/70">{word.ipa}</p>

          {/* Hear button */}
          <button
            type="button"
            onClick={onHear}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-all hover:border-teal-400 hover:text-teal-600 hover:shadow-md active:scale-90 dark:border-white/15 dark:bg-white/10 dark:text-gray-400 dark:hover:text-teal-300"
            title="Hear pronunciation"
          >
            <Headphones className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Arabic meaning */}
          <p className="text-lg font-bold text-slate-900 dark:text-white">{word.arabicMeaning}</p>

          {/* English definition */}
          <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-400">{word.englishDefinition}</p>

          {/* Example */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-gray-500">
              Example
            </p>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-gray-200">
              &ldquo;{highlightExample(word.exampleSentence, word.word)}&rdquo;
            </p>
          </div>

          {/* Memory tip */}
          {word.memoryTip && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">{word.memoryTip}</p>
            </div>
          )}

          {/* Collocations */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-gray-500">
              Collocations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {word.collocations.map(col => (
                <span
                  key={col}
                  className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Action */}
          <Button
            id="wotd-play-quiz"
            onClick={onPlay}
            size="lg"
            className="w-full gap-2"
          >
            <Pen className="h-4 w-4" />
            Practice this word
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function WordOfTheDayPage() {
  usePageMeta('Word of the Day', 'Learn a new English word every day, tuned to your CEFR level. Tap-to-hear pronunciation, Arabic meaning, and a quick quiz.', '/wotd');

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const navigate = useNavigate();
  const { speak, stop } = useSpeech();

  const [data, setData] = useState<WotdSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LanguageLevel>(defaultLevel);

  useEffect(() => {
    getWordOfTheDay(provider, apiKey, model)
      .then(setData)
      .catch(err => setError(getFriendlyAIErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [provider, apiKey, model]);

  const word = data?.words[activeTab];

  const handlePlayQuiz = async (w: string) => {
    try {
      setPhase('idle');
      const quizData = await generateSessionData([w], defaultLevel, provider, apiKey, model);
      startSession([w], defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    }
  };

  const handleHearWord = (w: string) => {
    stop();
    speak(w);
  };

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Calendar className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Word of the Day</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Pick your level — one word, fully explained
            </p>
          </div>
        </div>

        {/* Level pills */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 text-[10px] font-medium ${active ? 'text-teal-100' : 'text-slate-400 dark:text-gray-500'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="mb-3 h-5 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="mb-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
            <span>{error}</span>
          </div>
        )}

        {/* Word card */}
        <AnimatePresence mode="wait">
          {word && !loading && (
            <WordCard
              key={`${activeTab}-${word.word}`}
              word={word}
              onPlay={() => void handlePlayQuiz(word.word)}
              onHear={() => handleHearWord(word.word)}
            />
          )}
        </AnimatePresence>

        {/* All levels strip */}
        {data && !loading && (
          <Card className="mt-6 p-4 sm:p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500">
              All levels today
            </p>
            <div className="grid grid-cols-5 gap-2">
              {TABS.map(tab => {
                const w = data.words[tab.key];
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`group relative rounded-xl p-2.5 text-center transition-all ${
                      isActive
                        ? 'border-2 border-teal-500/50 bg-teal-500/10 shadow-md shadow-teal-500/10'
                        : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{w.emojiAnchor}</span>
                    <p className={`mt-1 text-xs font-bold ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-800 dark:text-white'}`}>
                      {w.word}
                    </p>
                    <p className={`text-[10px] ${isActive ? 'text-teal-500/70' : 'text-slate-400 dark:text-gray-500'}`}>
                      {tab.label}
                    </p>
                    {isActive && (
                      <motion.div
                        layoutId="wotd-active-dot"
                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-teal-500 shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Empty state — no API key */}
        {!loading && !data && !error && (
          <Card className="flex flex-col items-center py-16 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-teal-400" />
            <p className="mb-1 text-sm font-bold text-slate-900 dark:text-white">No word yet today</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Set an API key in Settings to get your daily word
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
