import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  GraduationCap,
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
import { MAX_WORDS, MIN_WORDS } from '@/constants/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export function SessionSetupPage() {
  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { startSession, setPhase } = useQuizStore();
  const isNoKey = NO_KEY_PROVIDERS.has(provider);
  const { play } = useSoundEffects();

  // Draft words persist across navigation and page reloads
  const [words, setWords, clearWords] = useLocalStorage<string[]>('pww-draft-words', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  // Prefill weak words coming from a session report ("Practice weak words")
  useEffect(() => {
    const stored = sessionStorage.getItem('pww-review-words');
    if (stored) {
      try {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWords(parsed);
          setReviewMode(true);
        }
      } catch {
        /* ignore malformed payload */
      }
      sessionStorage.removeItem('pww-review-words');
    }
  }, []);

  const canStart = words.length >= MIN_WORDS && !loading;
  const progressPct = Math.min(100, (words.length / MAX_WORDS) * 100);

  const handleStart = async () => {
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
  };

  return (
    <div className="page-container pb-28 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header — compact on mobile */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Wand2 className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">New Session</h1>
            <p className="text-xs text-gray-400 sm:text-sm">
              Add English words — the AI builds a full quiz
            </p>
          </div>
        </div>

        {/* Review banner */}
        {reviewMode && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <RotateCcw className="h-4 w-4 shrink-0" />
            Review mode: your weak words are loaded below.
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Words card */}
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 sm:text-sm">
                Your Words
              </h2>
              <div className="flex items-center gap-2">
                {/* Progress ring / counter */}
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                    words.length >= MIN_WORDS
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-gray-500'
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
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-all hover:border-red-500/50 hover:text-red-300 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Slim progress bar */}
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className={`h-full rounded-full transition-all ${
                  words.length >= MIN_WORDS ? 'bg-emerald-400' : 'bg-teal-500'
                }`}
                initial={false}
                animate={{ width: `${progressPct}%` }}
              />
            </div>

            <WordInput words={words} onChange={setWords} />

            {words.length === 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-gray-500">Try:</span>
                {['journey', 'improve', 'brave'].map(w => (
                  <button
                    key={w}
                    type='button'
                    onClick={() => {
                      play('click');
                      setWords(prev => (prev.includes(w) ? prev : [...prev, w]));
                    }}
                    className='inline-flex cursor-pointer items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal-300 transition-all hover:bg-teal-500/20 active:scale-95'
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {words.length < MIN_WORDS && (
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                <Sparkles className="h-3 w-3 text-teal-400" />
                Add at least {MIN_WORDS} word to unlock the quiz
              </p>
            )}
          </Card>

          {/* Session settings summary — one compact card with two rows */}
          <Card className="divide-y divide-white/5 p-0">
            {/* Level row */}
            <Link
              to="/level"
              id="change-level-link"
              className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10">
                <GraduationCap className="h-4 w-4 text-teal-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-200">
                  Level ·{' '}
                  <span className="badge-teal ml-0.5 inline-block align-middle">{defaultLevel}</span>
                </p>
                <p className="truncate text-xs text-gray-500">{LEVEL_DESCRIPTIONS[defaultLevel]}</p>
              </div>
              <SettingsIcon className="h-4 w-4 shrink-0 text-gray-500" />
            </Link>

            {/* Model row */}
            <Link
              to="/provider"
              id="change-provider-link"
              className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 active:bg-white/10"
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
                <p className="truncate text-sm font-semibold text-gray-200">
                  <span id="session-model-name" className="text-teal-300">
                    {model}
                  </span>
                </p>
                <p className="truncate text-xs text-gray-500">
                  {PROVIDER_LABELS[provider] ?? provider}
                  {isNoKey ? ' · no key needed' : ''}
                </p>
              </div>
              <SettingsIcon className="h-4 w-4 shrink-0 text-gray-500" />
            </Link>
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Loading overlay */}
      {loading && <QuizGeneratingOverlay words={words} />}

      {/* Sticky bottom CTA on mobile — respects safe areas */}
      {!loading && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-bg-primary/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
            <Button
              id="start-session-btn"
              onClick={() => void handleStart()}
              disabled={!canStart}
              size="lg"
              className="w-full"
            >
              {canStart ? `Generate Quiz (${words.length})` : `Add at least ${MIN_WORDS} word`}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button
              id="start-session-btn-desktop"
              onClick={() => void handleStart()}
              disabled={!canStart}
              size="lg"
              className="w-full"
            >
              Generate Quiz
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
