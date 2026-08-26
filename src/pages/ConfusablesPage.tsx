import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Copy,
  Layers,
  Loader2,
  Search,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateConfusables, type ConfusableItem } from '@/lib/wordInsights';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ConfusablesPage() {
  usePageMeta(
    'Confusable Words Lab',
    'Disambiguate commonly confused English word pairs and homophones. Master precise nuances and launch practice quizzes.',
    '/confusables'
  );

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const { speak, stop } = useSpeech();
  const { play } = useSoundEffects();
  const navigate = useNavigate();

  const [word, setWord] = useState('');
  const [result, setResult] = useState<{ target: string; confusables: ConfusableItem[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (w?: string) => {
    const target = (w ?? word).trim().toLowerCase();
    if (!target) return;
    play('click');
    setWord(target);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateConfusables(provider, apiKey, model, target);
      setResult(res);
      toast.success(`Found distinctions for "${target}"`);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Failed to look up confusables');
    } finally {
      setLoading(false);
    }
  };

  const handlePronounce = (textToSpeak: string) => {
    stop();
    speak(textToSpeak, 0.88);
  };

  const handleCopyExample = (textToCopy: string) => {
    play('click');
    void navigator.clipboard.writeText(textToCopy);
    toast.success('Example sentence copied to clipboard');
  };

  const handleQuizThese = async () => {
    if (!result) return;
    play('click');
    const allWords = [result.target, ...result.confusables.map(c => c.word)];
    setGenerating(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData(allWords, defaultLevel, provider, apiKey, model);
      startSession(allWords, defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Could not start quiz: ' + getFriendlyAIErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-container pb-28 lg:pb-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Header ─── */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 shadow-sm">
              <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Confusable Words Lab
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Disambiguate tricky word pairs, homophones, and semantic twins with clear contrasting examples
              </p>
            </div>
          </div>

        </div>

        {/* ─── Search Input Bar ─── */}
        <Card className="mb-6 p-5 sm:p-6 border-slate-200/90 dark:border-white/10 shadow-xl">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2 block">
            Enter Any Tricky English Word
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
              <input
                id="conf-word-input"
                type="text"
                value={word}
                onChange={e => setWord(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleLookup();
                }}
                placeholder="Type any word to find its confusable twin (e.g. affect, complement, principle)…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => setWord('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              id="conf-lookup-btn"
              type="button"
              onClick={() => void handleLookup()}
              disabled={!word.trim() || loading}
              className="font-bold px-5 shrink-0 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1.5" />
                  <span>Disambiguate</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ─── Error Message ─── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Loading Skeleton ─── */}
        {loading && (
          <Card className="p-8 text-center border-slate-200/90 dark:border-white/10 animate-pulse">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mapping confusable vocabulary and grammatical nuances…
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                Generating distinct definitions, phonetic anchors, and clear contextual contrast.
              </p>
            </div>
          </Card>
        )}

        {/* ─── Results Breakdown ─── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Target Word Main Card */}
              <Card className="p-6 border-slate-200/90 dark:border-white/10 shadow-xl bg-gradient-to-br from-indigo-500/5 via-white to-transparent dark:from-indigo-500/10 dark:via-[#0c1322]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-indigo-600 text-white px-3 py-1 text-sm font-black uppercase">
                      Target
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                      {result.target}
                    </h2>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handlePronounce(result.target)}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 font-bold cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Pronounce</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {result.confusables.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                            {item.word}
                          </span>
                          <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-gray-300">
                            Confusable Pair
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePronounce(item.word)}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Listen</span>
                        </button>
                      </div>

                      {/* Explanation & Distinction */}
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300 leading-relaxed mb-3">
                        {item.difference || item.definition}
                      </p>

                      {/* Example Sentences */}
                      <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 dark:bg-white/5 dark:border-white/5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                              Example Context
                            </p>
                            <p className="text-xs font-semibold text-slate-800 dark:text-gray-200 mt-0.5 italic">
                              "{item.example}"
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyExample(item.example)}
                            className="text-slate-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 cursor-pointer p-1"
                            title="Copy example"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drill CTA */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5">
                  <Button
                    id="conf-quiz-btn"
                    type="button"
                    onClick={() => void handleQuizThese()}
                    disabled={generating}
                    size="lg"
                    className="w-full gap-2 py-4 text-base font-bold shadow-xl cursor-pointer"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Building Practice Gauntlet…</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4.5 w-4.5 fill-current" />
                        <span>Practice These Tricky Words in 6-Round Gauntlet</span>
                        <ArrowRight className="h-4.5 w-4.5 ml-auto" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}