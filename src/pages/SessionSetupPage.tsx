import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  History,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { WordInput } from '@/components/session/WordInput';
import { QuizGeneratingOverlay } from '@/components/session/QuizGeneratingOverlay';
import { Button } from '@/components/ui/Button';

import {
  MAX_WORDS,
  MIN_WORDS,
  TOTAL_ROUNDS,
  ROUND_LABELS,
  ROUND_DESCRIPTIONS,
} from '@/constants/index';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { usePageMeta } from '@/hooks/usePageMeta';

const REVIEW_WORDS_KEY = 'pww-review-words';

/* ─── Readiness Dial — the signature of this page ─────────────────────────── */
function ReadinessDial({ count, ready }: { count: number; ready: boolean }) {
  const R = 66;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const pct = Math.min(100, (count / MAX_WORDS) * 100);

  return (
    <div
      className={`relative mx-auto h-44 w-44 [--track:#e6ebf2] dark:[--track:#26334a] ${
        ready ? 'drop-shadow-[0_0_14px_rgba(245,158,11,0.35)]' : ''
      }`}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true">
        <circle cx="80" cy="80" r={R} fill="none" strokeWidth="10" style={{ stroke: 'var(--track)' }} />
        <motion.circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{
            strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100),
            stroke: ready ? '#F59E0B' : '#14b8a6',
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          transform="rotate(-90 80 80)"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-extrabold tabular-nums leading-none tracking-tight text-slate-950 dark:text-white"
          aria-live="polite"
        >
          {count}
          <span className="text-lg font-bold text-slate-400 dark:text-gray-500">/{MAX_WORDS}</span>
        </span>
        <span
          className={`mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${
            ready ? 'text-gold dark:text-gold-light' : 'text-slate-400 dark:text-gray-500'
          }`}
        >
          {ready ? 'Ready to launch' : `Add ${MIN_WORDS - count} more`}
        </span>
        {!ready && <span className="mt-1 text-[10px] text-slate-400 dark:text-gray-600">of {MAX_WORDS} slots</span>}
      </div>
    </div>
  );
}

export function SessionSetupPage() {
  usePageMeta(
    'New Session',
    'Build an active recall gauntlet for your English vocabulary list. Drills each word across 6 interactive rounds.',
    '/session'
  );

  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { startSession, setPhase } = useQuizStore();
  const { play } = useSoundEffects();
  const { getAllSessions } = useSessionHistory();

  // Persisted draft words
  const [words, setWords, clearWords] = useLocalStorage<string[]>('pww-draft-words', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [lastSessionWords, setLastSessionWords] = useState<string[]>([]);

  // Surface previous completed session
  useEffect(() => {
    getAllSessions()
      .then(sessions => {
        const last = sessions.find(x => x.completed);
        if (last?.words?.length) setLastSessionWords(last.words.slice(0, MAX_WORDS));
      })
      .catch(() => {});
  }, [getAllSessions]);

  // One-shot hydration of weak-words handoff
  useEffect(() => {
    const stored = sessionStorage.getItem(REVIEW_WORDS_KEY);
    if (!stored) return;
    sessionStorage.removeItem(REVIEW_WORDS_KEY);
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(w => typeof w === 'string')) {
        setWords(parsed as string[]);
        setReviewMode(true);
        toast.success(`Loaded ${parsed.length} review words from your report!`);
      }
    } catch {
      /* ignore */
    }
  }, [setWords]);

  // History word picker modal state
  const [historyPickerOpen, setHistoryPickerOpen] = useState(false);
  const [historyPickerLoading, setHistoryPickerLoading] = useState(false);
  const [allHistoryWords, setAllHistoryWords] = useState<string[]>([]);
  const [historySelected, setHistorySelected] = useState<Set<string>>(new Set());
  const [historyFilter, setHistoryFilter] = useState('');

  const loadHistoryWords = async () => {
    play('click');
    setHistoryPickerOpen(true);
    setHistoryPickerLoading(true);
    setHistorySelected(new Set(words));
    setHistoryFilter('');
    try {
      const sessions = await getAllSessions();
      const unique = [...new Set(sessions.flatMap(s => s.words))].sort();
      setAllHistoryWords(unique);
    } catch {
      setAllHistoryWords([]);
    } finally {
      setHistoryPickerLoading(false);
    }
  };

  const toggleHistoryWord = (w: string) => {
    setHistorySelected(prev => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else if (next.size < MAX_WORDS) next.add(w);
      return next;
    });
  };

  const applyHistorySelection = () => {
    if (historySelected.size === 0) return;
    setWords([...historySelected]);
    setReviewMode(false);
    setHistoryPickerOpen(false);
    play('next');
    toast.success(`Added ${historySelected.size} words from history!`);
  };

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

  // Enter starts session
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

  const filteredHistory = historyFilter.trim()
    ? allHistoryWords.filter(w => w.toLowerCase().includes(historyFilter.toLowerCase()))
    : allHistoryWords;

  return (
    <div className="page-container pb-24 sm:pb-16 lg:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Header ─── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15 shadow-sm">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-teal-500 dark:text-teal-300 fill-current" />
            </div>
            <div className="min-w-0">
              <h1
                className="font-extrabold text-slate-950 dark:text-white tracking-tight"
                style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 2rem)' }}
              >
                New Session Gauntlet
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm leading-relaxed">
                Master 1 to 10 words through 6 attacks of active recall until they stick
              </p>
            </div>
          </div>

          {/* AI Model Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/provider"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-teal-500/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              title="AI Provider Settings"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[10rem] sm:max-w-[12rem]">{model}</span>
            </Link>
          </div>
        </div>

        {/* Review Mode Banner */}
        <AnimatePresence>
          {reviewMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <RotateCcw className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Review Mode: Weak words from your last session are loaded below.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  play('click');
                  clearWords();
                  setReviewMode(false);
                }}
                className="self-start sm:self-auto text-xs font-bold underline hover:opacity-80 cursor-pointer shrink-0"
              >
                Clear & Start Fresh
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Content ─── */}
        <div className="space-y-4">
          <Card className="p-4 sm:p-6 shadow-xl border-slate-200/90 dark:border-white/10">
            {/* Card Header with Counter & Clear */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ListChecks className="h-4 w-4 text-teal-500 dark:text-teal-400 shrink-0" />
                <h2 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider truncate">
                  Your Word List
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full border px-2.5 sm:px-3 py-0.5 text-xs font-black tabular-nums transition-colors ${
                    words.length >= MIN_WORDS
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                  }`}
                >
                  {words.length} / {MAX_WORDS}
                </span>

                {words.length > 0 && (
                  <button
                    type="button"
                    id="clear-all-words-btn"
                    onClick={() => {
                      play('click');
                      clearWords();
                      setReviewMode(false);
                      toast.success('Cleared word list');
                    }}
                    aria-label="Clear all words"
                    className="inline-flex h-9 w-9 sm:h-8 sm:w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-red-500/50 hover:text-red-500 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-red-400"
                    title="Clear all words"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
              <motion.div
                className={`h-full rounded-full ${
                  words.length >= MIN_WORDS
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    : 'bg-teal-500'
                }`}
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>

            {/* Interactive Word Input */}
            <WordInput words={words} onChange={setWords} />

            {/* ─── Repeat Past History Shortcut (if available) ─── */}
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2">
              <button
                type="button"
                onClick={() => void loadHistoryWords()}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-500 hover:bg-white transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 cursor-pointer"
              >
                <History className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Pick from My Past Words</span>
              </button>

              {lastSessionWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    play('next');
                    setWords(lastSessionWords);
                    setReviewMode(false);
                    toast.success(`Loaded last session (${lastSessionWords.length} words)!`);
                  }}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-500 hover:bg-white transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">
                    Repeat Last ({lastSessionWords.slice(0, 3).join(', ')}…)
                  </span>
                </button>
              )}
            </div>
          </Card>

          {/* Launch Button */}
          <Button
            id="start-session-btn"
            onClick={() => void handleStart()}
            disabled={!canStart}
            size="lg"
            className="w-full min-h-[52px] gap-2 py-4 text-base font-bold cursor-pointer"
          >
            {canStart ? (
              <>
                <span>Launch Gauntlet ({words.length} words)</span>
                <ArrowRight className="h-5 w-5" />
              </>
            ) : (
              <span>Add at least {MIN_WORDS} word to start</span>
            )}
          </Button>
          {canStart && (
            <p className="mt-2 text-center text-[10px] font-bold text-slate-400 dark:text-gray-500">
              Press{' '}
              <kbd className="rounded border px-1 py-0.5 font-mono">Enter ↵</kbd> anywhere to start
            </p>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Loading / Generating Fullscreen Overlay ─── */}
      {loading && <QuizGeneratingOverlay words={words} />}

      {/* ─── History Word Picker Modal ─── */}
      <AnimatePresence>
        {historyPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryPickerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f172a] max-h-[90dvh] flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Pick Words From Past History
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Re-drill words you studied previously
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryPickerOpen(false)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-600 dark:border-white/10 dark:hover:text-white cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={historyFilter}
                  onChange={e => setHistoryFilter(e.target.value)}
                  placeholder="Filter past words…"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {historyPickerLoading ? (
                <p className="py-8 text-center text-sm text-slate-400">Loading your history…</p>
              ) : allHistoryWords.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No past sessions yet. Complete your first session to build your history!
                </p>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">
                      {historySelected.size}/{MAX_WORDS} selected
                    </span>
                    {historySelected.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setHistorySelected(new Set())}
                        className="text-red-500 hover:underline cursor-pointer font-bold"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="mb-5 flex max-h-[40dvh] flex-wrap gap-1.5 overflow-y-auto pr-1">
                    {filteredHistory.map(w => {
                      const selected = historySelected.has(w);
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => toggleHistoryWord(w)}
                          disabled={!selected && historySelected.size >= MAX_WORDS}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                            selected
                              ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-teal-300'
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          <span>{w}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    id="history-apply-btn"
                    onClick={applyHistorySelection}
                    disabled={historySelected.size === 0}
                    size="lg"
                    className="w-full min-h-[52px] gap-2 shadow-lg"
                  >
                    Add {historySelected.size} word{historySelected.size !== 1 ? 's' : ''} to Session
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
