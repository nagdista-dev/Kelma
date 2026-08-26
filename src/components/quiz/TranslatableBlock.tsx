import { useState } from 'react';
import { Languages, Loader2, Volume2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpeech } from '@/hooks/useSpeech';
import { useSettingsStore } from '@/store/settingsStore';
import { translateToArabic, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';

interface TranslatableBlockProps {
  label: string;
  lines: string[];
}

/**
 * Displays English content with a small button that translates it to
 * Egyptian Arabic on demand (uses the currently selected AI provider).
 */
export function TranslatableBlock({ label, lines }: TranslatableBlockProps) {
  const { provider, apiKey, model } = useSettingsStore();
  const [translation, setTranslation] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasTranslation = translation !== null;

  const handleTranslate = async () => {
    if (hasTranslation) {
      setTranslation(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setTranslation(await translateToArabic(lines, provider, apiKey, model));
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
          {label}
        </p>
        <button
          type="button"
          onClick={() => void handleTranslate()}
          disabled={loading}
          aria-label={`Translate ${label} to Arabic`}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
            hasTranslation
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-300'
              : 'border-slate-200 text-slate-500 hover:border-teal-500/50 hover:text-teal-600 dark:border-white/10 dark:text-gray-400 dark:hover:text-teal-300'
          }`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : hasTranslation ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          {hasTranslation ? 'Hide' : 'Translate'}
        </button>
      </div>

      <bdi className="block text-base leading-relaxed text-slate-700 dark:text-gray-200">
        {lines.join(' · ')}
      </bdi>

      {translation && (
        <p dir="rtl" className="rtl-text mt-2 rounded-lg bg-teal-500/10 px-3 py-2 text-right text-sm font-medium leading-relaxed text-teal-700 dark:text-teal-200">
          {translation.join(' · ')}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

interface ExampleAudioBlockProps {
  sentence: string;
}

/**
 * Hidden-by-default example. Tapping play speaks the sentence AND reveals
 * its full text (with an Arabic translation button) so the user listens
 * first, reads second.
 */
export function ExampleAudioBlock({ sentence }: ExampleAudioBlockProps) {
  const { speak } = useSpeech();
  const { provider, apiKey, model } = useSettingsStore();
  const [revealed, setRevealed] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = () => {
    speak(sentence);
    setRevealed(true);
  };

  const handleTranslate = async () => {
    if (translation !== null) {
      setTranslation(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await translateToArabic([sentence], provider, apiKey, model);
      setTranslation(res[0] ?? '');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-white/5">
      {!revealed ? (
        /* Hidden state — tap to listen and reveal */
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            aria-label="Listen to the example sentence"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/25 transition-colors hover:bg-teal-500"
          >
            <Volume2 className="h-5 w-5" />
          </motion.button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
              Example
            </p>
            <p className="text-xs font-medium text-slate-400 dark:text-gray-500">
              Tap to listen — the sentence appears while you hear it
            </p>
          </div>
        </div>
      ) : (
        /* Revealed state — full text + translation */
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay}
                aria-label="Listen again"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-teal-600/15 text-teal-600 transition-colors hover:bg-teal-600/25 dark:text-teal-400"
              >
                <Volume2 className="h-5 w-5" />
              </motion.button>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  Example
                </p>
                <bdi className="block text-base leading-relaxed text-slate-700 dark:text-gray-200">
                  {sentence}
                </bdi>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleTranslate()}
              disabled={loading}
              aria-label="Translate example to Arabic"
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                translation !== null
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-300'
                  : 'border-slate-200 text-slate-500 hover:border-teal-500/50 hover:text-teal-600 dark:border-white/10 dark:text-gray-400 dark:hover:text-teal-300'
              }`}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : translation !== null ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Languages className="h-3.5 w-3.5" />
              )}
              {translation !== null ? 'Hide' : 'Translate'}
            </button>
          </div>

          {translation && (
            <p dir="rtl" className="rtl-text mt-2 rounded-lg bg-teal-500/10 px-3 py-2 text-right text-sm font-medium leading-relaxed text-teal-700 dark:text-teal-200">
              {translation}
            </p>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
