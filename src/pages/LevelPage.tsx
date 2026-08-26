import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  GraduationCap,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { generatePlacementQuiz } from '@/lib/placementTest';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { usePlacementStore } from '@/store/placementStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NO_KEY_PROVIDERS, type LanguageLevel } from '@/types/index';
import { usePageMeta } from '@/hooks/usePageMeta';

interface LevelMetadata {
  level: LanguageLevel;
  name: string;
  category: string;
  vocabRange: string;
  description: string;
  sampleSentence: string;
  sampleWords: string[];
  color: string;
  badgeColor: string;
}

const LEVEL_DETAILS: Record<LanguageLevel, LevelMetadata> = {
  A1: {
    level: 'A1',
    name: 'Starter / Beginner',
    category: 'Basic User',
    vocabRange: '500 – 1,000 words',
    description: 'Basic everyday expressions, introductions, simple greetings, and fundamental vocabulary.',
    sampleSentence: 'They gave us a very warm welcome when we arrived at the hotel.',
    sampleWords: ['welcome', 'journey', 'delicious', 'friendly'],
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  A2: {
    level: 'A2',
    name: 'Elementary',
    category: 'Basic User',
    vocabRange: '1,000 – 2,000 words',
    description: 'Routine conversations, personal background, shopping, local geography, and immediate needs.',
    sampleSentence: 'Daily speaking practice will quickly improve your confidence in English.',
    sampleWords: ['encourage', 'improve', 'convenient', 'patient'],
    color: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
  },
  B1: {
    level: 'B1',
    name: 'Intermediate',
    category: 'Independent User',
    vocabRange: '2,000 – 4,000 words',
    description: 'Main points of clear standard input, travel situations, expressing opinions, hopes, and ambitions.',
    sampleSentence: 'She practiced consistently until she became completely fluent in professional discussions.',
    sampleWords: ['hesitate', 'fluent', 'accomplish', 'reliable'],
    color: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  B2: {
    level: 'B2',
    name: 'Upper-Intermediate',
    category: 'Independent User',
    vocabRange: '4,000 – 6,000 words',
    description: 'Complex technical ideas, nuanced arguments, spontaneous fluency, and professional workplace communication.',
    sampleSentence: 'Great founders must remain resilient when navigating complex market shifts.',
    sampleWords: ['resilient', 'articulate', 'compelling', 'proactive'],
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  C1: {
    level: 'C1',
    name: 'Advanced Mastery',
    category: 'Proficient User',
    vocabRange: '8,000+ words',
    description: 'Sophisticated academic & professional expression, subtle nuances, idioms, and effortless eloquence.',
    sampleSentence: 'Meeting my current venture partner at a tech conference was pure serendipity.',
    sampleWords: ['serendipity', 'eloquent', 'ubiquitous', 'pragmatic'],
    color: 'from-purple-500/20 via-pink-500/10 to-transparent',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
};

const ALL_LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

type LoadPhase = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string };

export function LevelPage() {
  usePageMeta(
    'CEFR Level & Placement',
    'Select your target English proficiency tier or take the adaptive AI placement diagnostic assessment.',
    '/level'
  );

  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel, setDefaultLevel } = useSettingsStore();
  const { play } = useSoundEffects();
  const startPlacement = usePlacementStore(st => st.start);
  const [phase, setPhase] = useState<LoadPhase>({ kind: 'idle' });

  const isNoKey = NO_KEY_PROVIDERS.has(provider);
  const canTest = Boolean(apiKey) || isNoKey;

  const handleSelectLevel = (lvl: LanguageLevel) => {
    play('click');
    setDefaultLevel(lvl);
    toast.success(`Target proficiency updated to CEFR ${lvl}!`, { id: 'level-saved' });
  };

  const handleStartTest = async () => {
    play('click');
    setPhase({ kind: 'loading' });
    try {
      const questions = await generatePlacementQuiz(provider, apiKey, model);
      startPlacement(questions);
      navigate('/placement');
    } catch (err) {
      setPhase({ kind: 'error', message: getFriendlyAIErrorMessage(err) });
      toast.error('Could not generate placement test');
    }
  };

  const currentMeta = LEVEL_DETAILS[defaultLevel] ?? LEVEL_DETAILS.B1;

  return (
    <div className="page-container pb-28 lg:pb-12 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Header ─── */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15 shadow-sm">
              <GraduationCap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                CEFR Proficiency & Placement
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Calibrate vocabulary difficulty across sessions, daily words, stories, and AI labs
              </p>
            </div>
          </div>
        </div>

        {/* ─── Active Level Overview Banner ─── */}
        <Card className="mb-8 p-6 sm:p-7 border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-slate-50 to-blue-500/5 dark:from-teal-500/15 dark:via-slate-900 dark:to-blue-500/10 shadow-xl overflow-hidden relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-teal-600 text-white px-3 py-1 text-sm font-black tracking-wider shadow-sm">
                  {currentMeta.level}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Current Target Tier
                </span>
                <span className="text-xs text-slate-400 dark:text-gray-500 font-semibold">
                  • {currentMeta.vocabRange}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                {currentMeta.name}
              </h2>

              <p className="text-sm text-slate-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                {currentMeta.description}
              </p>

              {/* Sample sentence */}
              <div className="pt-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 max-w-2xl">
                  <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <p className="text-xs italic text-slate-800 dark:text-gray-200">
                    "{currentMeta.sampleSentence}"
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Fast Switcher */}
            <div className="flex lg:flex-col items-center gap-2 bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 px-1 hidden lg:block">
                Switch Tier
              </span>
              <div className="flex gap-1">
                {ALL_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSelectLevel(lvl)}
                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      defaultLevel === lvl
                        ? 'bg-teal-600 text-white shadow-xs scale-105'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ─── AI Diagnostic Placement Card ─── */}
        <Card className="mb-8 p-6 sm:p-7 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/15 dark:via-slate-900 dark:to-transparent shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-sm">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                    Adaptive AI Placement Assessment
                  </h3>
                  {isNoKey && (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black uppercase">
                      Free Included
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 max-w-xl">
                  Unsure of your level? Complete 15 quick word challenges across A1 to C1 to let the AI automatically calibrate your ideal tier.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> 15 Questions
                  </span>
                  <span>•</span>
                  <span>~3 Minutes</span>
                  <span>•</span>
                  <span>Vocabulary Focused</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {phase.kind === 'idle' && (
                <Button
                  id="start-placement-btn"
                  type="button"
                  onClick={() => void handleStartTest()}
                  disabled={!canTest}
                  size="lg"
                  className="w-full md:w-auto gap-2 font-bold shadow-xl cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Diagnostic Test</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {phase.kind === 'loading' && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-white/80 dark:bg-white/5 px-5 py-3 text-sm font-bold text-slate-800 dark:text-gray-200">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span>Generating Adaptive Questions…</span>
                </div>
              )}

              {phase.kind === 'error' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{phase.message}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPhase({ kind: 'idle' })}
                    className="self-end"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ─── 5-Tier Level Comparison Cards ─── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
              All CEFR Proficiency Tiers
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-gray-500">
              Tap any card to set as your default level
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_LEVELS.map(lvl => {
              const meta = LEVEL_DETAILS[lvl];
              const isSelected = defaultLevel === lvl;

              return (
                <motion.div
                  key={lvl}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card
                    onClick={() => handleSelectLevel(lvl)}
                    className={`p-5 h-full flex flex-col justify-between transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? 'border-teal-500 bg-gradient-to-b from-teal-500/10 to-transparent dark:from-teal-500/15 ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 bg-white hover:border-teal-500/50 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-sm ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300'
                            }`}
                          >
                            {lvl}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-950 dark:text-white leading-none">
                              {meta.name.split('/')[0].trim()}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500">
                              {meta.category}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                            <Check className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed min-h-[48px]">
                        {meta.description}
                      </p>

                      {/* Vocabulary Range */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-white/5 pt-2.5">
                        <span>Target Vocab Size:</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{meta.vocabRange}</span>
                      </div>

                    </div>

                    {/* Select CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                      <Button
                        type="button"
                        variant={isSelected ? 'primary' : 'secondary'}
                        size="sm"
                        className="w-full font-bold text-xs"
                      >
                        {isSelected ? 'Selected Level' : `Set as Target Level (${lvl})`}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
