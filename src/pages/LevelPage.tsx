import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronLeft,
  GraduationCap,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  generatePlacementQuiz,
  inferLevel,
  type PlacementQuestion,
} from '@/lib/placementTest';
import { getFriendlyAIErrorMessage } from '@/lib/quizDataGenerator';
import { usePlacementStore } from '@/store/placementStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LEVEL_DESCRIPTIONS, NO_KEY_PROVIDERS, type LanguageLevel } from '@/types/index';

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

type Phase =
  | { kind: 'pick' }
  | { kind: 'loading' }
  | { kind: 'test'; questions: PlacementQuestion[]; index: number; answers: { level: LanguageLevel; correct: boolean }[] }
  | { kind: 'result'; recommended: LanguageLevel; correctCount: number; total: number }
  | { kind: 'error'; message: string };

export function LevelPage() {
  const navigate = useNavigate();
  const { provider, apiKey, model, defaultLevel, setDefaultLevel } = useSettingsStore();
  const { play } = useSoundEffects();
  const [phase, setPhase] = useState<Phase>({ kind: 'pick' });
  const [savedFlash, setSavedFlash] = useState(false);
  const startPlacement = usePlacementStore(st => st.start);

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
      navigate('/quiz'); // runs inside the real quiz page experience
    } catch (err) {
      setPhase({ kind: 'error', message: getFriendlyAIErrorMessage(err) });
    }
  };

  const answerQuestion = (q: PlacementQuestion, optionIndex: number) => {
    play('click');
    setPhase(prev => {
      if (prev.kind !== 'test') return prev;
      const answers = [
        ...prev.answers,
        { level: q.level, correct: optionIndex === q.correctIndex },
      ];
      if (prev.index + 1 < prev.questions.length) {
        return { ...prev, index: prev.index + 1, answers };
      }
      const correctCount = answers.filter(a => a.correct).length;
      const recommended = inferLevel(answers);
      return { kind: 'result', recommended, correctCount, total: answers.length };
    });
  };

  const saveResult = (level: LanguageLevel) => {
    play('next');
    setDefaultLevel(level);
    navigate('/session');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/settings"
            aria-label="Back to settings"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-teal-500/50 hover:text-teal-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <GraduationCap className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">Your Level</h1>
            <p className="text-xs text-gray-400 sm:text-sm">Pick it yourself — or let the AI find it</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* ─── Manual picker ─── */}
          <Card className="p-4 sm:p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 sm:text-sm">
              Choose manually
            </h2>
            <div className="space-y-2">
              {LEVELS.map(level => {
                const active = defaultLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    id={`level-${level}`}
                    onClick={() => pickManual(level)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${
                      active
                        ? 'border-teal-500 bg-teal-500/15'
                        : 'border-white/10 bg-white/5 hover:border-teal-500/40'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                        active ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {level}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-200">
                      {LEVEL_DESCRIPTIONS[level]}
                    </span>
                    {active && (
                      <span className="badge-emerald shrink-0 text-[10px]">
                        <Check className="h-3 w-3" /> Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {savedFlash && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                dir="rtl"
                style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                className="mt-3 text-right text-xs font-semibold text-emerald-400"
              >
                تم الحفظ ✓
              </motion.p>
            )}
          </Card>

          {/* ─── AI placement test ─── */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                <BrainCircuit className="h-5 w-5 text-amber-400" />
                {isNoKey && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1 py-px text-[8px] font-black uppercase text-emerald-950">
                    free
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-gray-100 sm:text-base">AI Placement Test</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Answer 12 quick questions from A1 to C1 and the AI will place you at the right
                  level automatically.
                </p>
              </div>
            </div>

            {phase.kind === 'pick' && (
              <Button onClick={() => void startTest()} disabled={!canTest} size="lg" className="mt-4 w-full" id="start-placement-btn">
                <Sparkles className="h-4 w-4" />
                Start AI Test
              </Button>
            )}

            {phase.kind === 'loading' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                Preparing your test…
              </div>
            )}

            {phase.kind === 'error' && (
              <div className="mt-4 space-y-3">
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {phase.message}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setPhase({ kind: 'pick' })}>
                  <RotateCcw className="h-3.5 w-3.5" /> Back
                </Button>
              </div>
            )}

            {phase.kind === 'test' && (
              <div className="mt-4">
                {/* Progress */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-300 transition-all"
                      style={{ width: `${((phase.index + 1) / phase.questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-bold tabular-nums text-gray-500">
                    {phase.index + 1}/{phase.questions.length}
                  </span>
                </div>

                {(() => {
                  const q = phase.questions[phase.index];
                  return (
                    <div key={phase.index}>
                      <p className="mb-3 text-base font-semibold leading-relaxed text-slate-950 dark:text-white">
                        <bdi>{q.question}</bdi>
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => answerQuestion(q, i)}
                            className="answer-btn"
                            id={`placement-opt-${i}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <bdi className="min-w-0 flex-1">{opt}</bdi>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {phase.kind === 'result' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p
                  dir="rtl"
                  style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                  className="text-xs text-gray-400"
                >
                  صحّحت {phase.correctCount} من {phase.total} — مستواك المقترح:
                </p>
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="glow-teal mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-teal-500/40 bg-teal-500/15 text-2xl font-extrabold text-teal-300"
                >
                  {phase.recommended}
                </motion.div>
                <p className="mt-2 text-sm text-gray-300">{LEVEL_DESCRIPTIONS[phase.recommended]}</p>
                <Button onClick={() => saveResult(phase.recommended)} size="lg" className="mt-4 w-full" id="save-level-btn">
                  Save level & go to session
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => void startTest()}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-teal-300"
                >
                  <RotateCcw className="h-3 w-3" /> Retake test
                </button>
              </motion.div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
