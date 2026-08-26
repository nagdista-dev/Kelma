import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  ListChecks,
  RotateCcw,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { WordInput } from '@/components/session/WordInput';
import { QuizGeneratingOverlay } from '@/components/session/QuizGeneratingOverlay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LEVEL_DESCRIPTIONS, NO_KEY_PROVIDERS, PROVIDER_LABELS } from '@/types/index';
import { MAX_WORDS, MIN_WORDS, TOTAL_ROUNDS } from '@/constants/index';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const REVIEW_WORDS_KEY = 'pww-review-words';

export function SessionSetupPage() {
  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { startSession, setPhase } = useQuizStore();
  const isNoKey = NO_KEY_PROVIDERS.has(provider);
  const { play } = useSoundEffects();
  const { getAllSessions } = useSessionHistory();

  // Draft words persist across navigation and page reloads
  const [words, setWords, clearWords] = useLocalStorage<string[]>('pww-draft-words', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [lastSessionWords, setLastSessionWords] = useState<string[]>([]);

  // Surface the previous completed session for one-tap repetition
  useEffect(() => {
    getAllSessions()
      .then(sessions => {
        const last = sessions.find(x => x.completed);
        if (last?.words?.length) setLastSessionWords(last.words.slice(0, MAX_WORDS));
      })
      .catch(() => {});
  }, [getAllSessions]);

  // One-shot hydration of the weak-words handoff from the session report
  useEffect(() => {
    const stored = sessionStorage.getItem(REVIEW_WORDS_KEY);
    if (!stored) return;
    sessionStorage.removeItem(REVIEW_WORDS_KEY);
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(w => typeof w === 'string')) {
        // One-shot hydration from an external system before first paint
        // oxlint-disable-next-line react/set-state-in-effect
        setWords(parsed as string[]);
        // oxlint-disable-next-line react/set-state-in-effect
        setReviewMode(true);
      }
    } catch {
      /* ignore malformed payload */
    }
  }, [setWords]);

  const canStart = words.length >= MIN_WORDS && !loading;

  const handleStart = useCallback(async () => {
    if (!canStart) return;
    play('next');
    setLoading(true);
    setError(null);
    setPhase('idle');

    try {
      const quizData = await generateSessionData(words, defaultLevel, provider, apiKey, model);
      startSession(words, defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }, [canStart, play, setPhase, words, defaultLevel, provider, apiKey, model, startSession, navigate]);

  // Enter starts the session from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Enter' && words.length >= MIN_WORDS && !loading) {
        e.preventDefault();
        void handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleStart, loading, words.length]);

  const progressPct = Math.min(100, (words.length / MAX_WORDS) * 100);

  const startButton = (id: string, fullLabel: boolean) => (
    <Button id={id} onClick={() => void handleStart()} disabled={!canStart} size="lg" className="w-full gap-2">
      {canStart
        ? fullLabel
          ? `Generate Quiz (${words.length} word${words.length !== 1 ? 's' : ''})`
          : 'Generate Quiz'
        : `Add at least ${MIN_WORDS} word`}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Wand2 className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">New Session</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Add English words — the AI builds a full quiz
            </p>
          </div>
        </div>

        {/* Review banner */}
        {reviewMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            Review mode: your weak words from last session are loaded below.
          </motion.div>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* ─── Main column: words ─── */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <Card className="p-4 sm:p-6">
              {/* Card header */}
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white">
                  <ListChecks className="h-4 w-4 text-teal-500 dark:text-teal-300" />
                  Your Words
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                      words.length >= MIN_WORDS
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-500'
                    }`}
                  >
                    {words.length}/{MAX_WORDS}
                  </span>
                  {words.length > 0 && (
                    <button
                      type="button"
                      id="clear-all-words-btn"
                      onClick={() => {
                        play('click');
                        clearWords();
                        setReviewMode(false);
                      }}
                      aria-label="Clear all words"
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-red-500/50 hover:text-red-500 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/5">
                <motion.div
                  className={`h-full rounded-full ${
                    words.length >= MIN_WORDS ? 'bg-emerald-400' : 'bg-teal-500'
                  }`}
                  initial={false}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>

              <WordInput words={words} onChange={setWords} />

              {/* Quick fills */}
              {words.length === 0 && (
                <div className="mt-4 space-y-2.5">
                  {lastSessionWords.length > 0 && (
                    <button
                      type="button"
                      id="repeat-last-session-btn"
                      onClick={() => {
                        play('next');
                        setWords(lastSessionWords);
                        setReviewMode(false);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-teal-500/60 hover:text-teal-600 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-teal-300"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Repeat last session ({lastSessionWords.length} words)
                    </button>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-gray-500">Try:</span>
                    {['journey', 'improve', 'brave'].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          play('click');
                          setWords(prev => (prev.includes(w) ? prev : [...prev, w]));
                        }}
                        className="inline-flex cursor-pointer items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal-700 transition-all hover:bg-teal-500/20 active:scale-95 dark:text-teal-300"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {words.length >= MAX_WORDS && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-gold">
                  <Sparkles className="h-3 w-3" />
                  Full house — you are ready to generate!
                </p>
              )}
              {words.length > 0 && words.length < MIN_WORDS && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500">
                  <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                  Add at least {MIN_WORDS} word to unlock the quiz
                </p>
              )}
            </Card>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* ─── Sidebar: settings + what happens next + CTA ─── */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="divide-y divide-slate-100 p-0 dark:divide-white/5">
              <p className="px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500">
                Session setup
              </p>

              {/* Level row */}
              <Link
                to="/level"
                id="change-level-link"
                className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-white/5 dark:active:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
                  <GraduationCap className="h-4 w-4 text-teal-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                    Level ·{' '}
                    <span className="badge-teal ml-0.5 inline-block align-middle">{defaultLevel}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-gray-500">
                    {LEVEL_DESCRIPTIONS[defaultLevel]}
                  </p>
                </div>
                <SettingsIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-gray-500" />
              </Link>

              {/* Model row */}
              <Link
                to="/provider"
                id="change-provider-link"
                className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-white/5 dark:active:bg-white/10"
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  {isNoKey && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1 py-px text-[8px] font-black uppercase text-emerald-950">
                      free
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-gray-200">
                    <span id="session-model-name" className="text-teal-600 dark:text-teal-300">
                      {model}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-gray-500">
                    {PROVIDER_LABELS[provider] ?? provider}
                    {isNoKey ? ' · no key needed' : ''}
                  </p>
                </div>
                <SettingsIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-gray-500" />
              </Link>
            </Card>

            {/* What happens next */}
            <Card className="p-4 sm:p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500">
                What happens next
              </p>
              <ol className="space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <BrainCircuit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500 dark:text-teal-300" />
                  The AI builds {TOTAL_ROUNDS} rounds of questions for every word
                </li>
                <li className="flex gap-2">
                  <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500 dark:text-teal-300" />
                  You play, earn XP and build streaks
                </li>
                <li className="flex gap-2">
                  <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500 dark:text-teal-300" />
                  Weak words come back as one-tap practice
                </li>
              </ol>
            </Card>

            {/* Desktop CTA lives in the sidebar */}
            <div className="hidden lg:block">{startButton('start-session-btn-desktop', false)}</div>
          </div>
        </div>
      </motion.div>

      {/* Loading overlay */}
      {loading && <QuizGeneratingOverlay words={words} />}

      {/* Sticky bottom CTA on mobile — respects safe areas */}
      {!loading && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/10 dark:bg-bg-primary/95 lg:hidden">
          {startButton('start-session-btn', true)}
        </div>
      )}
    </div>
  );
}
