import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Ear,
  Headphones,
  Keyboard,
  Layers,
  Lightbulb,
  Quote,
  Sparkles,
  Speech,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { NO_KEY_PROVIDERS } from '@/types/index';
import { Button } from '@/components/ui/Button';

const HIGHLIGHT_MODULES = [
  {
    icon: Speech,
    title: 'Real-Time Voice Chat',
    desc: 'Speak English out loud in live conversations. The mic listens, the AI replies, your ear sharpens.',
    path: '/voice-chat',
    accent: 'from-pink-500/15 to-rose-500/0',
    iconWrap: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Story Immersion Lab',
    desc: 'Target words woven into contextual narratives at your CEFR level, with dual-speed narration.',
    path: '/story',
    accent: 'from-blue-500/15 to-indigo-500/0',
    iconWrap: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Layers,
    title: 'Confusables Disambiguator',
    desc: 'Subtle distinctions between tricky pairs, homophones, and near-synonyms in one clear comparison.',
    path: '/confusables',
    accent: 'from-indigo-500/15 to-violet-500/0',
    iconWrap: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    icon: Volume2,
    title: 'Pronunciation & Phonetics',
    desc: 'IPA, syllable stress, instant synthesis. Train the ear so the mouth can follow.',
    path: '/pronounce',
    accent: 'from-amber-500/15 to-orange-500/0',
    iconWrap: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Weak-Word Recovery',
    desc: 'Retention velocity, streaks, XP. Re-drill struggled words in a single tap until they stick.',
    path: '/dashboard',
    accent: 'from-emerald-500/15 to-teal-500/0',
    iconWrap: 'bg-emerald-500/10 text-emerald-500',
  },
];

const GAUNTLET_ROUNDS = [
  { n: 1, label: 'Recognition', sub: 'Meaning → word', icon: Sparkles, xp: 5 },
  { n: 2, label: 'Comprehension', sub: 'Definition → word', icon: BookOpen, xp: 5 },
  { n: 3, label: 'Translation', sub: 'Word → Arabic', icon: Layers, xp: 5 },
  { n: 4, label: 'Context Fill', sub: 'Sentence blank', icon: Lightbulb, xp: 10 },
  { n: 5, label: 'Audio Recall', sub: 'Listen → identify', icon: Ear, xp: 10 },
  { n: 6, label: 'Active Spelling', sub: 'Produce from memory', icon: Keyboard, xp: 15 },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const reduce = useReducedMotion();
  const apiKey = useSettingsStore(s => s.apiKey);
  const provider = useSettingsStore(s => s.provider);
  const ready = Boolean(apiKey) || NO_KEY_PROVIDERS.has(provider);

  const handleStart = () => {
    play('click');
    navigate(ready ? '/session' : '/provider');
  };

  const fadeUp = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.5, ease: 'easeOut' as const },
      };

  return (
    <div className="page-container pb-24 lg:pb-16 flex flex-col items-center">
      {/* ─── HERO — asymmetric split ─── */}
      <section className="w-full max-w-6xl pt-10 sm:pt-14 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: text block (7 cols) */}
          <motion.div
            {...fadeUp}
            className="lg:col-span-7 space-y-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Active Recall Pipeline</span>
            </div>

            <h1
              className="font-black text-slate-950 dark:text-white tracking-[-0.025em] leading-[1.05]"
              style={{ fontSize: 'clamp(2rem, 1.4rem + 3.2vw, 4.25rem)' }}
            >
              <span className="block">Master English words.</span>
              <span className="block">
                <span className="gradient-text">Forget them once</span>
                <span className="text-slate-400 dark:text-slate-500"> — never again.</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Paste any list. Kelma attacks each word through 6 progressive rounds of
              active recall, then locks it in with stories, voice, and analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <Button
                id="cta-start"
                type="button"
                onClick={handleStart}
                size="lg"
                className="w-full sm:w-auto px-7 py-4 text-base font-bold gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Start a session</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Link
                to="/daily"
                onClick={() => play('click')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:border-teal-500/60 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Today's word</span>
              </Link>
            </div>
          </motion.div>

          {/* Right: live word card (5 cols) — the signature element */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' as const }}
            className="lg:col-span-5 w-full max-w-[22rem] sm:max-w-md mx-auto lg:max-w-none lg:ml-auto"
          >
            <HeroWordCard reduce={!!reduce} />
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST STRIP — separated from hero ─── */}
      <section className="w-full max-w-5xl border-y border-slate-200/80 dark:border-white/10 py-5 mb-20">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free forever
          </span>
          <span className="hidden sm:block h-3 w-px bg-slate-300 dark:bg-white/10" />
          <span className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-teal-500" /> Native audio
          </span>
          <span className="hidden sm:block h-3 w-px bg-slate-300 dark:bg-white/10" />
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> XP & streak game
          </span>
          <span className="hidden sm:block h-3 w-px bg-slate-300 dark:bg-white/10" />
          <span className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-blue-500" /> Voice + listening
          </span>
        </div>
      </section>

      {/* ─── HOW IT WORKS — quote as section header ─── */}
      <section className="w-full max-w-5xl mb-20">
        <motion.figure
          {...fadeUp}
          className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] px-6 sm:px-10 py-10 sm:py-12"
        >
          <Quote className="absolute top-5 left-5 h-7 w-7 text-teal-500/40 -scale-x-100" />
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-snug tracking-[-0.01em]">
              One word. Six angles. <span className="text-teal-600 dark:text-teal-400">Zero shortcuts</span> to long-term memory.
            </p>
            <figcaption className="mt-5 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500 dark:text-gray-400">
              <span className="h-px w-8 bg-slate-300 dark:bg-white/15" />
              The Cognitive Gauntlet
              <span className="h-px w-8 bg-slate-300 dark:bg-white/15" />
            </figcaption>
          </blockquote>
        </motion.figure>
      </section>

      {/* ─── 6-ROUND GAUNTLET — asymmetric bento, 6 cells ─── */}
      <section className="w-full max-w-6xl mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Header cell — bento left, full width on mobile */}
          <motion.div
            {...fadeUp}
            className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 sm:p-8 lg:p-9 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
              <Brain className="h-3.5 w-3.5" />
              <span>The pipeline</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.05]">
                Six rounds.<br />One permanent word.
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-400 max-w-md leading-relaxed">
                Each round attacks the word from a different cognitive angle. Skip
                one and the memory cracks; finish all six and it sticks for good.
              </p>
            </div>
          </motion.div>

          {/* Featured round (round 6 — Spelling) — the hardest, biggest visual */}
          <motion.div
            {...fadeUp}
            className="lg:col-span-5 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent p-6 sm:p-8 lg:p-9 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                Final round
              </span>
              <span className="rounded-full bg-teal-600 text-white text-[10px] font-black px-2.5 py-1">
                +15 XP
              </span>
            </div>
            <div className="relative space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm shadow-lg shadow-teal-500/30">
                  R6
                </span>
                <Keyboard className="h-5 w-5 text-teal-600 dark:text-teal-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                Active Spelling
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Type the word from its Arabic meaning. Production — the hardest
                round — proves the word is yours.
              </p>
            </div>
          </motion.div>

          {/* Round cards 1-5 — two-column bento */}
          {GAUNTLET_ROUNDS.slice(0, 5).map((r, i) => {
            const Icon = r.icon;
            const isWide = i === 0;
            return (
              <motion.div
                key={r.n}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.05 * i, ease: 'easeOut' as const }}
                className={
                  isWide
                    ? 'lg:col-span-5'
                    : 'lg:col-span-3'
                }
              >
                <div className="h-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 hover:border-teal-500/40 transition-colors flex flex-col gap-3 min-h-[140px] sm:min-h-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-black">
                      R{r.n}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">
                      +{r.xp} XP
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {r.label}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                      {r.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Footer cell — total XP callout, right of last 3 cards */}
          <motion.div
            {...fadeUp}
            className="lg:col-span-7 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">
                One mastered word
              </p>
              <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                = <span className="text-teal-600 dark:text-teal-400">50 XP</span> + permanent
              </p>
            </div>
            <Trophy className="h-9 w-9 text-amber-500 shrink-0" />
          </motion.div>
        </div>
      </section>

      {/* ─── AI PRACTICE LABS — non-symmetric bento ─── */}
      <section className="w-full max-w-6xl mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.05] max-w-md">
              The full lab, beyond the gauntlet.
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-md">
              Every tool you need to go from "I sort of know it" to fluent and
              production-ready.
            </p>
          </div>
          <Link
            to="/how-to"
            onClick={() => play('click')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400 hover:gap-2.5 transition-all"
          >
            See how it works <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {HIGHLIGHT_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const isHero = idx === 0;
            return (
              <motion.div
                key={mod.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: idx * 0.04, ease: 'easeOut' as const }}
                className={isHero ? 'sm:col-span-2 lg:col-span-3' : 'lg:col-span-3'}
              >
                <Link
                  to={mod.path}
                  onClick={() => play('click')}
                  className="block h-full"
                >
                  <div
                    className={`relative h-full rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 hover:border-teal-500/50 hover:-translate-y-0.5 transition-all overflow-hidden group ${
                      isHero ? 'min-h-[260px]' : 'min-h-[200px]'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${mod.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                    />
                    <div className="relative h-full flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${mod.iconWrap}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-teal-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="space-y-1.5">
                        <h3
                          className={`font-black text-slate-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors ${
                            isHero ? 'text-2xl' : 'text-lg'
                          }`}
                        >
                          {mod.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* "More coming" filler cell — completes the 6-col grid without empty space */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' as const }}
            className="md:col-span-2 lg:col-span-3"
          >
            <div className="h-full rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-6 flex items-center gap-5 min-h-[200px]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-amber-500/20 border border-white/10">
                <Sparkles className="h-5 w-5 text-teal-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  And more, every month
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                  New labs ship regularly — voice tutoring, AI stories, and adaptive
                  review are already on the roadmap.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BOTTOM CTA — full-bleed dark, with live "session" feel ─── */}
      <motion.section
        {...fadeUp}
        className="w-full max-w-6xl rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-950 dark:bg-bg-tertiary p-8 sm:p-12 lg:p-16 relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-400">
              Your next 5 minutes
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
              Three words you keep forgetting.<br />
              <span className="text-teal-400">One session.</span> Permanent.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed">
              Bring three words right now. Feel the 6-round gauntlet work before
              your coffee gets cold.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                id="cta-bottom"
                type="button"
                onClick={handleStart}
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Launch first session</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                to="/about"
                onClick={() => play('click')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-colors"
              >
                Why I built this
              </Link>
            </div>
          </div>

          {/* Right column — a live XP / streak preview */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Session preview
                </span>
                <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Stat label="XP" value="50" sub="per word" />
                <Stat label="Streak" value="5" sub="days" />
                <Stat label="Rounds" value="6" sub="per word" />
              </div>

              <div className="space-y-2">
                <RoundStat n={1} label="Recognition" xp={5} done />
                <RoundStat n={6} label="Spelling" xp={15} active />
                <RoundStat n={4} label="Context Fill" xp={10} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 sm:p-3 text-center">
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-black text-white mt-1">{value}</p>
      <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>
    </div>
  );
}

function RoundStat({
  n,
  label,
  xp,
  done,
  active,
}: {
  n: number;
  label: string;
  xp: number;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border ${
        active
          ? 'border-teal-400/40 bg-teal-400/10'
          : done
            ? 'border-white/5 bg-white/[0.02]'
            : 'border-white/5 bg-transparent'
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black ${
            done
              ? 'bg-emerald-500 text-white'
              : active
                ? 'bg-teal-400 text-slate-900'
                : 'bg-white/10 text-slate-400'
          }`}
        >
          {done ? '✓' : `R${n}`}
        </span>
        <span className={done ? 'text-slate-400 line-through' : 'text-white font-semibold'}>
          {label}
        </span>
      </span>
      <span className="text-slate-400 font-bold">+{xp}</span>
    </div>
  );
}

function HeroWordCard({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative">
      {/* Backdrop glow */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-500/20 via-blue-500/10 to-transparent blur-2xl pointer-events-none" />

      <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Round 4 / 6
          </span>
          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
            +10 XP
          </span>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Context fill
            </p>
            <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-snug font-medium">
              She finally made the{' '}
              <span className="inline-block min-w-[5.5rem] border-b-2 border-teal-500 mx-1 text-center text-teal-600 dark:text-teal-400 font-black">
                decision
              </span>{' '}
              to leave the city.
            </p>
          </div>

          {/* 4-option grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { w: 'decision', correct: true },
              { w: 'division' },
              { w: 'collision' },
              { w: 'revision' },
            ].map((o, i) => (
              <motion.div
                key={o.w}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${
                  o.correct
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
                }`}
              >
                {o.w}
              </motion.div>
            ))}
          </div>

          {/* Hint strip */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>make a ___</span>
            </span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              3 of 10 correct
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
