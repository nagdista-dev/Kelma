import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { generatePlacementQuiz } from '@/lib/placementTest';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { usePlacementStore } from '@/store/placementStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LEVEL_DESCRIPTIONS, NO_KEY_PROVIDERS, type LanguageLevel } from '@/types/index';
import { usePageMeta } from '@/hooks/usePageMeta';

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

type LoadPhase = { kind: 'pick' } | { kind: 'loading' } | { kind: 'error'; message: string };

export function LevelPage() {
  usePageMeta(
    'Your level',
    'Pick your English level manually or let the AI placement test find it in 12 quick questions.',
    '/level'
  );
  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel, setDefaultLevel } = useSettingsStore();
  const { play } = useSoundEffects();
  const startPlacement = usePlacementStore(st => st.start);
  const [phase, setPhase] = useState<LoadPhase>({ kind: 'pick' });
  const [savedFlash, setSavedFlash] = useState(false);

  const isNoKey = NO_KEY_PROVIDERS.has(provider);
  const canTest = Boolean(apiKey) || isNoKey;

  const pickManual = (level: LanguageLevel) => {
    play('click');
    setDefaultLevel(level);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const startTest = async () => {
    play('next');
    setPhase({ kind: 'loading' });
    try {
      const questions = await generatePlacementQuiz(provider, apiKey, model);
      startPlacement(questions);
      navigate('/placement');
    } catch (err) {
      setPhase({ kind: 'error', message: getFriendlyAIErrorMessage(err) });
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Sparkles className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Your Level</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">Sets the level of the words you will study</p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          {/* ─── Manual picker ─── */}
          <Card className="p-4 sm:p-6 lg:col-span-3">
            <h2 className="mb-1 text-sm font-bold text-slate-950 dark:text-white">Choose manually</h2>
            <p className="mb-5 text-xs text-slate-500 dark:text-gray-500">
              Know your level? One tap and you are set.
            </p>

            {/* Level chips */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="CEFR level">
              {LEVELS.map(level => {
                const active = defaultLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    id={`level-${level}`}
                    onClick={() => pickManual(level)}
                    aria-pressed={active}
                    className={`flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-2.5 transition-all duration-200 active:scale-[0.97] ${
                      active
                        ? 'border-teal-500 bg-teal-500/10 shadow-md shadow-teal-500/10 dark:bg-teal-500/15'
                        : 'border-slate-200 bg-white hover:border-teal-500/50 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-teal-500/40'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1 text-base font-extrabold ${
                        active ? 'text-teal-600 dark:text-teal-300' : 'text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {level}
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400 dark:text-gray-600">
                      {level === 'A1' ? 'starter' : level === 'A2' ? 'basic' : level === 'B1' ? 'mid' : level === 'B2' ? 'upper' : 'advanced'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected level description */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-gray-300">
                <span className="badge-teal mr-2 align-middle">{defaultLevel}</span>
                {LEVEL_DESCRIPTIONS[defaultLevel]}
              </p>
              {savedFlash && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  Saved
                </motion.p>
              )}
            </div>
          </Card>

          {/* ─── AI placement test ─── */}
          <Card className="relative overflow-hidden p-4 sm:p-6 lg:col-span-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl"
            />
            <div className="flex items-start gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                <BrainCircuit className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                {isNoKey && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1 py-px text-[8px] font-black uppercase text-emerald-950">
                    free
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-950 dark:text-white sm:text-base">AI Placement Test</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-gray-400">
                  Not sure? Answer 15 quick word questions from A1 to C1 —
                  words only, no grammar — and the AI picks the level your
                  vocabulary sessions will use.
                </p>
              </div>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              15 word questions · about 3 minutes
            </p>

            {phase.kind === 'pick' && (
              <Button onClick={() => void startTest()} disabled={!canTest} size="lg" className="mt-5 w-full" id="start-placement-btn">
                <Sparkles className="h-4 w-4" />
                Start AI Test
              </Button>
            )}

            {phase.kind === 'loading' && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500 dark:text-teal-400" />
                Preparing your test…
              </div>
            )}

            {phase.kind === 'error' && (
              <div className="mt-5 space-y-3">
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                  {phase.message}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setPhase({ kind: 'pick' })}>
                  Back
                </Button>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
