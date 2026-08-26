import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clipboard,
  Loader2,
  Volume2,
} from 'lucide-react';
import { generateStory, type StoryResult } from '@/lib/storyGenerator';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Strip anything that is not a Latin letter, space, hyphen, or apostrophe */
function onlyEnglish(v: string): string {
  return v.replace(/[^a-zA-Z\s\-']/g, '');
}

export function StoryPage() {
  usePageMeta('Story Mode', 'Type words, read a short story using all of them, and practice them with a quiz. Perfect for contextual learning.', '/story');

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const { speak, stop } = useSpeech();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [storyWords, setStoryWords] = useState<string[]>([]);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const words = input
      .split(/[,;\s]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1 && w.length <= 24 && /^[a-z]+$/.test(w));
    if (words.length < 2 || words.length > 10) {
      setError('Enter 2-10 English words, separated by commas');
      return;
    }
    setStoryWords(words);
    setLoading(true);
    setError(null);
    setStory(null);
    try {
      const res = await generateStory(provider, apiKey, model, words, defaultLevel);
      setStory(res);
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(onlyEnglish(text));
    } catch {
      /* clipboard access denied */
    }
  };

  const handlePlayStory = () => {
    if (!story) return;
    stop();
    speak(story.story, 0.85);
  };

  const handlePractice = async () => {
    if (!storyWords.length) return;
    setGenerating(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData(storyWords, defaultLevel, provider, apiKey, model);
      startSession(storyWords, defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const highlightStory = (text: string, words: string[]) => {
    if (!words.length) return text;
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.split(regex).map((part, i) => {
      if (words.includes(part.toLowerCase())) {
        return (
          <span key={i} className="rounded bg-teal-500/15 px-1 font-bold text-teal-700 dark:text-teal-300">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const wordCount = input.split(/[,;\s]+/).filter(w => w.trim().length > 1).length;

  return (
    <div className="page-container pb-28 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <BookOpen className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Story Mode</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Type words, read a short story using all of them
            </p>
          </div>
        </div>

        {/* Word input */}
        <form onSubmit={e => void handleGenerate(e)}>
          <Card className="mb-6 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="story-words" className="text-[11px] font-bold text-slate-500 dark:text-gray-500">
                Enter 2-10 English words
              </label>
              <span className={`text-[11px] font-bold ${wordCount >= 2 ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-500'}`}>
                {wordCount}/10
              </span>
            </div>
            <div className="flex gap-2">
              <input
                id="story-words"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={input}
                onChange={e => setInput(onlyEnglish(e.target.value))}
                placeholder="journey, brave, improve"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-teal-500/60 hover:text-teal-500 active:scale-95 dark:border-white/10 dark:text-gray-500 dark:hover:text-teal-300"
                title="Paste words from clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </button>
            </div>
            <Button
              id="story-generate-btn"
              type="submit"
              disabled={loading || !input.trim()}
              loading={loading}
              size="lg"
              className="mt-3 w-full gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {loading ? 'Writing story…' : 'Generate story'}
            </Button>
          </Card>
        </form>

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
            Writing your story…
          </div>
        )}

        {/* Story result */}
        {story && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
            <Card className="mb-6 p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">{story.title}</h2>

              {/* Highlighted story */}
              <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-gray-300">
                {highlightStory(story.story, storyWords)}
              </p>

              {/* Play aloud */}
              <Button
                id="story-play-btn"
                onClick={handlePlayStory}
                size="lg"
                variant="secondary"
                className="w-full gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Read aloud
              </Button>
            </Card>

            {/* Word list */}
            <Card className="mb-6 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-gray-500">
                Words in this story
              </p>
              <div className="flex flex-wrap gap-1.5">
                {storyWords.map(w => (
                  <span key={w} className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                    {w}
                  </span>
                ))}
              </div>
            </Card>

            {/* Practice CTA */}
            <Button
              id="story-practice-btn"
              onClick={() => void handlePractice()}
              disabled={generating}
              loading={generating}
              size="lg"
              className="w-full gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              {generating ? 'Generating quiz…' : 'Practice these words'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
