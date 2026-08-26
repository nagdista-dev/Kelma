import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Headphones,
  Lightbulb,
  Loader2,
  PenLine,
  Sparkles,
  Volume2,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWordOfTheDay, type WotdSet, type WotdWord } from '@/lib/wordOfTheDay';
import { getCuratedDailyWotdSet } from '@/lib/wordOfTheDayData';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { LanguageLevel } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * Replace a `___` blank with the actual word, then highlight it.
 * Also handles sentences where the word is already present.
 */
function highlightExample(text: string, word: string) {
  if (!text) return text;
  // First resolve the blank placeholder to the actual word
  const resolved = text.replace(/___+/g, word);
  const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
  return resolved.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-black text-teal-700 dark:text-teal-300 bg-teal-500/15 px-0.5 rounded">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const FREQ_MAP: Record<string, { label: string; color: string }> = {
  common: { label: 'High Frequency', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' },
  formal: { label: 'Academic & Formal', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25' },
  specialized: { label: 'Specialized Lexicon', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25' },
};

function WordCard({
  word,
  level,
  onPlay,
  onHear,
  onCopy,
  copied,
  practiceLoading,
}: {
  word: WotdWord;
  level: LanguageLevel;
  onPlay: () => void;
  onHear: (slow?: boolean) => void;
  onCopy: () => void;
  copied: boolean;
  practiceLoading: boolean;
}) {
  const freq = FREQ_MAP[word.frequencyNote?.toLowerCase()] ?? FREQ_MAP.common;

  return (
    <motion.div
      key={`${level}-${word.word}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-0 overflow-hidden shadow-2xl border-slate-200/90 dark:border-white/10">
        {/* Top Hero Banner */}
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-teal-500/10 via-slate-50 to-teal-500/5 px-6 pt-7 pb-6 dark:from-teal-500/15 dark:via-slate-900/60 dark:to-blue-500/10 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Level & Frequency Badges */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-teal-600 text-white px-3 py-1 text-xs font-black shadow-sm shadow-teal-500/25">
                <span>Target Level: {level}</span>
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${freq.color}`}>
                {freq.label}
              </span>
            </div>

            {/* Quick Actions (Audio & Copy) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onHear(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-sm transition-all hover:border-teal-400 hover:text-teal-600 hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:text-teal-300"
                title="Hear normal pronunciation"
                aria-label="Hear pronunciation"
              >
                <Headphones className="h-4.5 w-4.5" />
              </button>

              <button
                type="button"
                onClick={() => onHear(true)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-sm transition-all hover:border-teal-400 hover:text-teal-600 hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:text-teal-300"
                title="Hear slow pronunciation"
                aria-label="Hear slow pronunciation"
              >
                <Volume2 className="h-4.5 w-4.5" />
              </button>

              <button
                type="button"
                onClick={onCopy}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-sm transition-all hover:border-teal-400 hover:text-teal-600 hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:text-teal-300"
                title="Copy word details"
                aria-label="Copy word details"
              >
                {copied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Word Heading & Phonetics */}
          <div className="mt-5">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white">
              {word.word}
            </h2>
            <p className="mt-1.5 font-mono text-sm sm:text-base font-semibold text-teal-700 dark:text-teal-300">
              {word.ipa}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-5 px-6 py-6">
          {/* English definition */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
              Definition
            </p>
            <p className="mt-1 text-base sm:text-lg font-semibold leading-relaxed text-slate-800 dark:text-gray-200">
              {word.englishDefinition}
            </p>
          </div>

          {/* Example in Context */}
          {word.exampleSentence && (
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 dark:border-teal-500/15 dark:bg-teal-500/[0.08]">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                  Real Context Example
                </p>
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-gray-200 italic">
                &ldquo;{highlightExample(word.exampleSentence, word.word)}&rdquo;
              </p>
            </div>
          )}

          {/* Memory Anchor & Conceptual Hook */}
          {word.memoryTip && (
            <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50 to-amber-50/40 p-4 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/[0.04]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-400 mb-1">
                    Memory Anchor & Conceptual Hook
                  </p>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-200">
                    {word.memoryTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collocations */}
          {word.collocations && word.collocations.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                Common Collocations & Pairings
              </p>
              <div className="flex flex-wrap gap-2">
                {word.collocations.map(col => (
                  <span
                    key={col}
                    className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Practice Button */}
          <div className="pt-3">
            <Button
              id="wotd-play-quiz"
              onClick={onPlay}
              disabled={practiceLoading}
              size="lg"
              className="w-full gap-2 py-4 text-base font-bold shadow-xl cursor-pointer"
            >
              {practiceLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing 6-Round Practice Gauntlet…
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" />
                  Practice & Master This Word
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function WordOfTheDayPage() {
  usePageMeta(
    'Daily Word',
    'Daily English vocabulary decoded for your CEFR level with pronunciation, examples, and active recall practice.',
    '/daily'
  );

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const navigate = useNavigate();
  const { speak, stop } = useSpeech();
  const { play } = useSoundEffects();

  // Instant pre-filled dataset so there is NEVER a blank or stuck screen
  const [data, setData] = useState<WotdSet>(() => getCuratedDailyWotdSet());
  const [error, setError] = useState<string | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-fetch cached or fresh daily words silently in the background
  useEffect(() => {
    let isMounted = true;
    getWordOfTheDay(provider, apiKey, model)
      .then(res => {
        if (isMounted && res) {
          setData(res);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn('Daily word loaded from curated bank:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [provider, apiKey, model]);

  // Word tailored directly to the user's active level
  const word = data.words[defaultLevel] || data.words.B1;

  const handlePlayQuiz = async (w: string) => {
    play('click');
    setPracticeLoading(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData([w], defaultLevel, provider, apiKey, model);
      startSession([w], defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Could not launch quiz: ' + getFriendlyAIErrorMessage(err));
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleHearWord = (slow = false) => {
    stop();
    speak(word.word, slow ? 0.65 : 1);
  };

  const handleCopyWord = () => {
    play('click');
    void navigator.clipboard.writeText(
      `${word.word} (${word.ipa})\n${word.englishDefinition}\nExample: ${word.exampleSentence}`
    );
    setCopied(true);
    toast.success(`Copied "${word.word}" to clipboard!`);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container pb-28 lg:pb-12 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header Title Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15 shadow-sm">
              <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Daily Vocabulary
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Your personalized daily word matched to your active CEFR level
              </p>
            </div>
          </div>

        </div>

        {/* Error notification banner if any */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Word Card tailored to user's level */}
        <AnimatePresence mode="wait">
          {word && (
            <WordCard
              key={`${defaultLevel}-${word.word}`}
              word={word}
              level={defaultLevel}
              onPlay={() => void handlePlayQuiz(word.word)}
              onHear={handleHearWord}
              onCopy={handleCopyWord}
              copied={copied}
              practiceLoading={practiceLoading}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
