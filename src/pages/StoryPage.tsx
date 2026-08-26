import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Clipboard,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Trash2,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateStory, type StoryResult } from '@/lib/storyGenerator';
import { generateSessionData, getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

function sanitizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z'-]/g, '').trim();
}

export function StoryPage() {
  usePageMeta(
    'Story Immersion Lab',
    'Generate engaging contextual English stories from your target vocabulary. Listen to audio narration and launch practice quizzes.',
    '/story'
  );

  const { provider, apiKey, model, defaultLevel } = useSettingsStore();
  const startSession = useQuizStore(s => s.startSession);
  const setPhase = useQuizStore(s => s.setPhase);
  const { speak, stop } = useSpeech();
  const { play } = useSoundEffects();
  const navigate = useNavigate();

  const [inputWord, setInputWord] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRate, setAudioRate] = useState<number>(0.9);

  const handleAddWord = (raw: string) => {
    const cleaned = sanitizeWord(raw);
    if (!cleaned || cleaned.length < 2) return;
    if (words.includes(cleaned)) {
      toast.error(`"${cleaned}" is already added`);
      return;
    }
    if (words.length >= 8) {
      toast.error('Maximum 8 words per story for optimal narrative density');
      return;
    }
    setWords(prev => [...prev, cleaned]);
    setInputWord('');
  };

  const handleRemoveWord = (wordToRemove: string) => {
    play('click');
    setWords(prev => prev.filter(w => w !== wordToRemove));
  };

  const handlePaste = async () => {
    try {
      play('click');
      const text = await navigator.clipboard.readText();
      const extracted = text
        .split(/[,;\n\s]+/)
        .map(sanitizeWord)
        .filter(w => w.length >= 2);
      if (extracted.length === 0) {
        toast.error('No valid English words found in clipboard');
        return;
      }
      const unique = Array.from(new Set([...words, ...extracted])).slice(0, 8);
      setWords(unique);
      toast.success(`Added ${unique.length - words.length} words from clipboard`);
    } catch {
      toast.error('Clipboard access denied by browser');
    }
  };

  const handleGenerateStory = async () => {
    if (words.length < 2) {
      toast.error('Please enter at least 2 words to create a meaningful story');
      return;
    }
    play('click');
    setLoading(true);
    setError(null);
    setStory(null);
    stop();
    setIsPlayingAudio(false);

    try {
      const res = await generateStory(provider, apiKey, model, words, defaultLevel);
      setStory(res);
      toast.success('Story generated successfully!');
    } catch (err) {
      setError(getFriendlyAIErrorMessage(err));
      toast.error('Failed to generate story');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudio = () => {
    if (!story) return;
    play('click');
    if (isPlayingAudio) {
      stop();
      setIsPlayingAudio(false);
    } else {
      speak(story.story, audioRate);
      setIsPlayingAudio(true);
    }
  };

  const handleLaunchQuiz = async () => {
    if (!story || words.length === 0) return;
    play('click');
    setGeneratingQuiz(true);
    try {
      setPhase('idle');
      const quizData = await generateSessionData(words, defaultLevel, provider, apiKey, model);
      startSession(words, defaultLevel, quizData);
      navigate('/quiz');
    } catch (err) {
      toast.error('Could not start quiz: ' + getFriendlyAIErrorMessage(err));
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const renderedStoryParts = useMemo(() => {
    if (!story?.story) return null;
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return story.story;

    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = story.story.split(regex);

    return parts.map((part, index) => {
      const isTargetWord = words.includes(part.toLowerCase());
      if (isTargetWord) {
        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              stop();
              speak(part, 0.9);
              toast.success(`Pronouncing "${part}"`, { id: `pronounce-${part}` });
            }}
            className="inline-flex items-center gap-0.5 rounded-lg bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 font-black text-teal-700 dark:text-teal-300 hover:bg-teal-500/25 transition-all cursor-pointer shadow-2xs"
            title="Click to hear pronunciation"
          >
            <span>{part}</span>
            <Volume2 className="h-3 w-3 inline opacity-60 ml-0.5" />
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [story?.story, words, speak, stop]);

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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/15 shadow-sm">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Story Immersion Lab
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Transform your target vocabulary into rich contextual stories
              </p>
            </div>
          </div>

        </div>

        {/* ─── Story Builder Card ─── */}
        <Card className="mb-6 p-5 sm:p-6 border-slate-200/90 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
              Your Target Words ({words.length}/8 words)
            </label>
            {words.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  play('click');
                  setWords([]);
                  toast.success('Cleared words');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Word Input & Add Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                id="story-word-input"
                type="text"
                value={inputWord}
                onChange={e => setInputWord(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWord(inputWord);
                  }
                }}
                placeholder="Type any English word and press Enter…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <Button
              type="button"
              onClick={() => handleAddWord(inputWord)}
              disabled={!inputWord.trim()}
              className="shrink-0 font-bold px-4 cursor-pointer"
            >
              Add
            </Button>

            <button
              type="button"
              onClick={() => void handlePaste()}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition-all hover:border-teal-500 hover:text-teal-600 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-teal-300"
              title="Paste words from clipboard"
              aria-label="Paste words from clipboard"
            >
              <Clipboard className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Active Word Chips */}
          <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-black/20 mb-5">
            {words.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-gray-500 flex items-center gap-1.5 py-1 px-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                No words added yet. Type your words or paste from clipboard!
              </span>
            ) : (
              words.map(w => (
                <motion.span
                  key={w}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/15 border border-teal-500/30 px-3 py-1.5 text-xs font-extrabold text-teal-800 dark:text-teal-300 shadow-2xs"
                >
                  <span>{w}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(w)}
                    className="cursor-pointer text-teal-600 hover:text-red-500 dark:text-teal-400 dark:hover:text-red-400"
                    aria-label={`Remove ${w}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))
            )}
          </div>

          {/* Generate Action Button */}
          <Button
            id="story-generate-btn"
            type="button"
            onClick={() => void handleGenerateStory()}
            disabled={loading || words.length < 2}
            size="lg"
            className="w-full gap-2 py-4 text-base font-bold shadow-xl cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Crafting Immersive Story…</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4.5 w-4.5" />
                <span>Generate Story with AI ({words.length} words)</span>
              </>
            )}
          </Button>
        </Card>

        {/* ─── Error Display ─── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Loading Skeleton / Animation ─── */}
        {loading && (
          <Card className="p-8 text-center border-slate-200/90 dark:border-white/10 animate-pulse">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weaving your target words into a story…
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                Adapting grammar complexity and contextual clarity for your level.
              </p>
            </div>
          </Card>
        )}

        {/* ─── Story Reader Canvas ─── */}
        <AnimatePresence>
          {story && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-0 overflow-hidden shadow-2xl border-slate-200/90 dark:border-white/10">
                {/* Story Top Bar */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-transparent px-6 py-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500">
                          {words.length} Target Words
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                        {story.title}
                      </h2>
                    </div>

                    {/* Audio Narration Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-[10px] font-bold dark:border-white/10 dark:bg-white/5">
                        {[0.75, 0.9, 1.1].map(rate => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setAudioRate(rate);
                              if (isPlayingAudio) {
                                stop();
                                speak(story.story, rate);
                              }
                            }}
                            className={`rounded-lg px-2 py-0.5 transition-all cursor-pointer ${
                              audioRate === rate
                                ? 'bg-teal-600 text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <Button
                        type="button"
                        onClick={handleToggleAudio}
                        size="sm"
                        className="gap-1.5 font-bold cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Story Body Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-gray-200 font-normal">
                    {renderedStoryParts}
                  </div>



                  {/* Key Words Summary Bar */}
                  <div className="border-t border-slate-100 dark:border-white/5 pt-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
                      Interactive Pronunciation (Tap any word)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {words.map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            stop();
                            speak(w, 0.9);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-teal-300 transition-all cursor-pointer"
                        >
                          <span>{w}</span>
                          <Volume2 className="h-3 w-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch Gauntlet CTA */}
                  <div className="border-t border-slate-100 dark:border-white/5 pt-5">
                    <Button
                      id="story-quiz-btn"
                      type="button"
                      onClick={() => void handleLaunchQuiz()}
                      disabled={generatingQuiz}
                      size="lg"
                      className="w-full gap-2 py-4 text-base font-bold shadow-xl cursor-pointer"
                    >
                      {generatingQuiz ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span>Generating 6-Round Practice Gauntlet…</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4.5 w-4.5 fill-current" />
                          <span>Practice These Words in 6-Round Gauntlet</span>
                          <ArrowRight className="h-4.5 w-4.5 ml-auto" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
