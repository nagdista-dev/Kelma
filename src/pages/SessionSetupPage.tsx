import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, RotateCcw, Settings as SettingsIcon, Wand2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { WordInput } from '@/components/session/WordInput';
import { QuizGeneratingOverlay } from '@/components/session/QuizGeneratingOverlay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LEVEL_DESCRIPTIONS } from '@/types/index';
import { MIN_WORDS } from '@/constants/index';

export function SessionSetupPage() {
  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const { startSession, setPhase } = useQuizStore();

  const [words, setWords] = useState<string[]>([]);
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

  const handleStart = async () => {
    if (!canStart) return;
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
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Wand2 className="w-6 h-6 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">New Session</h1>
            <p className="text-sm text-gray-400">
              Enter up to 10 English words and the AI will generate a full quiz
            </p>
          </div>
        </div>

        {reviewMode && (
          <div className="flex items-center gap-2 mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <RotateCcw className="h-4 w-4 shrink-0" />
            Review mode: your weak words from the last session are loaded below.
          </div>
        )}

        <div className="space-y-6">
          {/* Word Input */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-3">
              Your Words
            </h2>
            <WordInput words={words} onChange={setWords} />
          </Card>

          {/* Level — read-only, managed in Settings */}
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="badge-teal text-sm">{defaultLevel}</span>
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  {LEVEL_DESCRIPTIONS[defaultLevel]}
                </p>
                <p className="text-xs text-gray-500">
                  Your session level — change it anytime from Settings
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              id="change-level-link"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-teal-500/50 hover:text-teal-300"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              Change
            </Link>
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading state — non-dismissible full-screen overlay */}
          {loading && <QuizGeneratingOverlay words={words} />}

          {/* Start button */}
          {!loading && (
            <Button
              id="start-session-btn"
              onClick={() => void handleStart()}
              disabled={!canStart}
              size="lg"
              className="w-full"
            >
              Generate Quiz
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
