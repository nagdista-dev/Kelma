import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Check,
  History,
  RotateCcw,
  Search,
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
      className={`relative mx-auto h-36 w-36 [--track:#e6ebf2] min-[420px]:h-44 min-[420px]:w-44 dark:[--track:#26334a] ${
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
          className="text-3xl font-extrabold tabular-nums leading-none tracking-tight text-slate-950 min-[420px]:text-4xl dark:text-white"
          aria-live="polite"
        >
          {count}
          <span className="text-base font-bold text-slate-400 min-[420px]:text-lg dark:text-gray-500">/{MAX_WORDS}</span>
        </span>
        <span
          className={`mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em] min-[420px]:text-[10px] ${
            ready ? 'animate-pulse text-amber-500' : 'text-slate-400 dark:text-gray-500'
          }`}
        >
          {ready ? '● Ready to launch' : `Add ${MIN_WORDS - count} more`}
        </span>
        {!ready && (
          <span className="mt-1 hidden text-[10px] text-slate-400 min-[420px]:block dark:text-gray-600">
            of {MAX_WORDS} slots
          </span>
        )}
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
  // Derived directly from storage so no effect needs to call setState for it
  const [reviewMode, setReviewMode] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem(REVIEW_WORDS_KEY);
      if (!stored) return false;
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 && parsed.every(w => typeof w === 'string');
    } catch {
      return false;
    }
  });
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

  // One-shot hydration of weak-words handoff (consumes the storage key once)
  useEffect(() => {
    const stored = sessionStorage.getItem(REVIEW_WORDS_KEY);
    if (!stored) return;
    sessionStorage.removeItem(REVIEW_WORDS_KEY);
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(w => typeof w === 'string')) {
        setWords(parsed as string[]);
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

  const filteredHistory = historyFilter.trim()
    ? allHistoryWords.filter(w => w.toLowerCase().includes(historyFilter.toLowerCase()))
    : allHistoryWords;

  return (
    <div className="kelma-session mx-auto w-full max-w-6xl px-4 pt-5 pb-24 sm:px-6 sm:pt-8 sm:pb-16 lg:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Header ─── */}
        <header className="mb-5 sm:mb-7">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-teal-600 min-[420px]:text-[11px] dark:text-teal-400">
            Active Recall Drill
          </p>
          <h1
            className="mt-1 font-extrabold tracking-tight text-slate-950 dark:text-white"
            style={{ fontSize: 'clamp(1.6rem, 1.25rem + 1.8vw, 2.5rem)' }}
          >
            Build your session
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-gray-400">
            Load up to {MAX_WORDS} English words — each one runs six rounds until it sticks.
          </p>
        </header>

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

        {/* ─── Workbench — word bench left, launch console right ─── */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left — Word Bench */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-lg shadow-slate-900/[0.04] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none sm:p-6">
            {/* Bench Header with Counter & Clear */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">
                Word load
              </h2>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-lg border px-2.5 py-0.5 font-mono text-xs font-black tabular-nums transition-colors ${
                    words.length >= MIN_WORDS
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
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
          </section>

          {/* Right — Launch Console */}
          <aside className="overflow-hidden rounded-2xl border border-teal-600/25 bg-white shadow-xl shadow-slate-900/[0.06] dark:border-teal-400/15 dark:bg-[#101b2d] dark:shadow-none lg:sticky lg:top-6">
            {/* Brand gradient edge */}
            <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-teal-600 via-teal-400 to-amber-400" />

            {/* Readiness Dial */}
            <div className="border-b border-dashed border-slate-200 px-4 pb-4 pt-5 sm:px-5 sm:pb-6 sm:pt-7 dark:border-white/10">
              <ReadinessDial count={words.length} ready={canStart} />
            </div>

            {/* The Six Rounds Ladder */}
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">
                The six rounds
              </h2>
              <ol>
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((n, i) => (
                  <motion.li
                    key={n}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 * i }}
                    className="flex items-start gap-2.5 rounded-xl border border-transparent px-1.5 py-1 transition-colors hover:border-slate-200 hover:bg-slate-50 sm:gap-3 sm:px-2 sm:py-1.5 dark:hover:border-white/10 dark:hover:bg-white/5"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-50 font-mono text-[11px] font-bold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                      {n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold leading-tight text-slate-800 sm:text-sm dark:text-gray-100">
                        {ROUND_LABELS[n]}
                      </p>
                      <p className="hidden text-[11px] leading-snug text-slate-400 sm:block dark:text-gray-500">
                        {ROUND_DESCRIPTIONS[n]}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Launch Zone */}
            <div className="space-y-2 px-4 pb-5 sm:px-5 sm:pb-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-600 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                id="start-session-btn"
                onClick={() => void handleStart()}
                disabled={!canStart}
                size="lg"
                className="min-h-[56px] w-full cursor-pointer gap-2 text-base font-extrabold md:min-h-[52px]"
              >
                {canStart ? (
                  <>
                    <span>Start drill ({words.length})</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <span>Add a word to begin</span>
                )}
              </Button>
              {canStart && !loading && (
                <p className="hidden text-center text-[10px] font-bold text-slate-400 md:block dark:text-gray-500">
                  Press{' '}
                  <kbd className="rounded border px-1 py-0.5 font-mono">Enter ↵</kbd> anywhere to start
                </p>
              )}
            </div>
          </aside>
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
