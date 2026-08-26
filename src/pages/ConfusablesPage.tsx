import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Layers,
} from 'lucide-react';
import { generateConfusables } from '@/lib/wordInsights';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ConfusablesPage() {
  usePageMeta('Confusable Words', 'Spot the difference between words learners mix up. Practice them with a quiz and stop making the same mistake.', '/confusables');

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const navigate = useNavigate();

  const [word, setWord] = useState('');
  const [result, setResult] = useState<{ target: string; confusables: Array<{ word: string; arabicMeaning: string; difference: string }> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (w?: string) => {
    const target = (w ?? word).trim().toLowerCase();
    if (!target) return;
    setWord(target);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateConfusables(provider, apiKey, model, target);
      setResult(res);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizThese = async () => {
    if (!result) return;
    const allWords = [result.target, ...result.confusables.map(c => c.word)];
    setGenerating(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData(allWords, defaultLevel, provider, apiKey, model);
      startSession(allWords, defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Layers className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Confusable Words</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Words learners mix up — see the difference, then quiz them
            </p>
          </div>
        </div>

        {/* Word input */}
        <Card className="mb-6 p-4">
          <label htmlFor="conf-word" className="mb-2 block text-[11px] font-bold text-slate-500 dark:text-gray-500">
            Type a word you keep mixing up
          </label>
          <div className="flex gap-2">
            <input
              id="conf-word"
              type="text"
              value={word}
              onChange={e => setWord(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleLookup(); }}
              placeholder="e.g. affect"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
            <Button
              id="conf-lookup-btn"
              onClick={() => void handleLookup()}
              disabled={!word.trim() || loading}
              loading={loading}
              size="md"
            >
              {loading ? 'Looking…' : 'Find confusables'}
            </Button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 dark:text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding confusable words…
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
            {/* Target word */}
            <Card className="mb-4 border-teal-500/20 bg-teal-500/5 p-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-300">
                Your word
              </p>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{result.target}</h2>
            </Card>

            {/* Confusables */}
            <div className="mb-6 space-y-3">
              {result.confusables.map((c, i) => (
                <motion.div
                  key={c.word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-950 dark:text-white">{c.word}</h3>
                        <p className="text-sm text-teal-600 dark:text-teal-300">{c.arabicMeaning}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-gray-400">{c.difference}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quiz CTA */}
            <Button
              id="conf-quiz-btn"
              onClick={() => void handleQuizThese()}
              disabled={generating}
              loading={generating}
              size="lg"
              className="w-full gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              {generating ? 'Generating quiz…' : 'Quiz these words'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}