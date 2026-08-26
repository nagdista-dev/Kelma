import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard } from 'lucide-react';
import {
  AlertCircle,
  Loader2,
  Volume2,
} from 'lucide-react';
import { generateWordPronunciation } from '@/lib/wordInsights';
import { useSettingsStore } from '@/store/settingsStore';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSpeech } from '@/hooks/useSpeech';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/** Strip anything that is not a Latin letter, space, hyphen, or apostrophe */
function onlyEnglish(v: string): string {
  return v.replace(/[^a-zA-Z\s\-']/g, '');
}

export function PronouncePage() {
  usePageMeta('Pronunciation Lab', 'Listen to clear English pronunciation with IPA breakdown, syllable stress, and tap-to-hear repetition. Built for Arabic speakers.', '/pronounce');

  const { provider, apiKey, model } = useSettingsStore();
  const { speak, stop } = useSpeech();

  const [word, setWord] = useState('');
  const [result, setResult] = useState<{ ipa: string; syllables: string[]; stress: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (w?: string) => {
    const target = (w ?? word).trim().toLowerCase();
    if (!target) return;
    setWord(target);
    setLoading(true);
    setError(null);
    try {
      const res = await generateWordPronunciation(provider, apiKey, model, target);
      setResult(res);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string, rate?: number) => {
    stop();
    speak(text, rate);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWord(onlyEnglish(text));
    } catch {
      /* clipboard access denied — user can type */
    }
  };

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Volume2 className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Pronunciation Lab</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Tap any word to hear it spoken clearly — then repeat out loud
            </p>
          </div>
        </div>

        {/* Word input */}
        <Card className="mb-6 p-4">
          <label htmlFor="pron-word" className="mb-2 block text-[11px] font-bold text-slate-500 dark:text-gray-500">
            Type an English word
          </label>
          <div className="flex gap-2">
            <input
              id="pron-word"
              type="text"
              inputMode="text"
              pattern="[a-zA-Z\s\-']*"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={word}
              onChange={e => setWord(onlyEnglish(e.target.value))}
              onKeyDown={e => { if (e.key === 'Enter') void handleLookup(); }}
              placeholder="e.g. comfortable"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-teal-500/60 hover:text-teal-500 active:scale-95 dark:border-white/10 dark:text-gray-500 dark:hover:text-teal-300"
              title="Paste from clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </button>
            <Button
              id="pron-lookup-btn"
              onClick={() => void handleLookup()}
              disabled={!word.trim() || loading}
              loading={loading}
              size="md"
            >
              {loading ? 'Loading…' : 'Pronounce'}
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
            Generating pronunciation…
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <motion.div key={word} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
            <Card className="p-6">
              <h2 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">{word}</h2>
              <p className="mb-4 text-sm font-semibold text-teal-600 dark:text-teal-300">{result.ipa}</p>

              {/* Syllables */}
              <div className="mb-4 flex flex-wrap gap-2">
                {result.syllables.map(s => (
                  <span key={s} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    {s}
                  </span>
                ))}
              </div>

              {/* Stress tip */}
              <p className="mb-6 text-xs text-slate-500 dark:text-gray-500">
                Stress: {result.stress}
              </p>

              {/* Play buttons */}
              <div className="flex gap-3">
                <Button
                  id="pron-play-normal"
                  onClick={() => handleSpeak(word)}
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Normal speed
                </Button>
                <Button
                  id="pron-play-slow"
                  onClick={() => handleSpeak(word, 0.65)}
                  size="lg"
                  variant="secondary"
                  className="flex-1 gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Slow speed
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
