import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Ear,
  Keyboard,
  Layers,
  Lightbulb,
  Sparkles,
  Speech,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { NO_KEY_PROVIDERS } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const HIGHLIGHT_MODULES = [
  {
    icon: Brain,
    title: '6-Round Cognitive Gauntlet',
    desc: 'Every word survives 6 progressive attacks — from fast recognition to active spelling — locking it permanently into long-term memory.',
    tag: 'Core Engine',
    tagColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
    path: '/session',
  },
  {
    icon: Speech,
    title: 'Real-Time Voice Chat Tutor',
    desc: 'Speak English out loud in live interactive conversations. Real-time microphone transcription with instant audio feedback.',
    tag: 'Voice Lab',
    tagColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
    path: '/voice-chat',
  },
  {
    icon: BookOpen,
    title: 'Story Immersion Lab',
    desc: 'Weave your target words into engaging contextual narratives adapted to your exact CEFR level with dual-speed audio narration.',
    tag: 'Narrative',
    tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    path: '/story',
  },
  {
    icon: Layers,
    title: 'Confusable Words Disambiguator',
    desc: 'Uncover subtle distinctions between tricky word pairs, homophones, and near-synonyms with clear usage comparisons.',
    tag: 'Nuance',
    tagColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    path: '/confusables',
  },
  {
    icon: Volume2,
    title: 'Pronunciation & Phonetics',
    desc: 'Phonetic IPA breakdowns, syllable stress indicators, and instant speech synthesis to train your ear alongside your memory.',
    tag: 'Phonetics',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    path: '/pronounce',
  },
  {
    icon: BarChart3,
    title: 'Weak-Word Recovery & Analytics',
    desc: 'Deep analytics track retention velocity, streaks, and XP. Re-drill struggled words in a single tap until 100% mastered.',
    tag: 'Mastery',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    path: '/dashboard',
  },
];

const GAUNTLET_ROUNDS = [
  { n: 1, label: 'Fast Recognition', sub: 'Meaning → English Word', icon: Sparkles },
  { n: 2, label: 'Comprehension', sub: 'Definition → Target Word', icon: BookOpen },
  { n: 3, label: 'Translation', sub: 'English → Context Meaning', icon: Layers },
  { n: 4, label: 'Context Fill', sub: 'Real Sentence Context', icon: Lightbulb },
  { n: 5, label: 'Audio Recall', sub: 'Listen & Identify', icon: Ear },
  { n: 6, label: 'Active Spelling', sub: 'Produce from Memory', icon: Keyboard },
];



export function LandingPage() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const apiKey = useSettingsStore(s => s.apiKey);
  const provider = useSettingsStore(s => s.provider);
  const ready = Boolean(apiKey) || NO_KEY_PROVIDERS.has(provider);

  const handleStart = () => {
    play('click');
    navigate(ready ? '/session' : '/provider');
  };

  return (
    <div className="page-container pb-28 lg:pb-16 flex flex-col items-center">
      {/* ─── Hero Section ─── */}
      <section className="min-h-[calc(100svh-5rem)] flex flex-col items-center justify-center w-full max-w-4xl text-center py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Announcement Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-black text-teal-800 dark:text-teal-300 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>AI-Powered Cognitive Vocabulary Mastery</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
            Master English Words.
            <br />
            <span className="gradient-text">Never Forget Them.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Paste any list of English words. Kelma attacks each word through 6 progressive rounds of cognitive active recall, live AI conversations, and contextual stories until it becomes permanent.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              id="cta-start"
              type="button"
              onClick={handleStart}
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold gap-2 cursor-pointer"
            >
              <span>Start Practice Session</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>

            <Link
              to="/daily"
              onClick={() => play('click')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 shadow-xs hover:border-teal-500/60 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Today's Daily Word</span>
            </Link>

            <Link
              to="/how-to"
              onClick={() => play('click')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-5 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-white/5 max-w-md mx-auto">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-teal-500" /> Native Audio Speech
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" /> XP & Streak Game
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─── 6-Round Gauntlet Architecture ─── */}
      <section className="w-full max-w-5xl mb-20">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[11px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider">
            Active Recall Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            The 6-Round Cognitive Gauntlet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-xl mx-auto">
            Every session forces your brain to retrieve words from 6 different angles, transforming passive recognition into active fluency.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {GAUNTLET_ROUNDS.map((r, i) => {
            const RoundIcon = r.icon;
            return (
              <motion.div
                key={r.n}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-4 h-full flex flex-col items-center text-center justify-between border-slate-200/90 dark:border-white/10 hover:border-teal-500/50 shadow-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-xs mb-2 shadow-xs">
                    R{r.n}
                  </div>
                  <RoundIcon className="h-5 w-5 text-teal-600 dark:text-teal-400 mb-1.5" />
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {r.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                    {r.sub}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── AI Practice Labs Grid ─── */}
      <section className="w-full max-w-5xl mb-20">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Comprehensive Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            Everything You Need for Total Vocabulary Mastery
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-xl mx-auto">
            From speaking and stories to phonetics and confusable disambiguation — built with cutting-edge language pedagogy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHT_MODULES.map((mod, idx) => {
            const ModIcon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={mod.path}
                  onClick={() => play('click')}
                  className="block h-full"
                >
                  <Card className="p-6 h-full flex flex-col justify-between border-slate-200/90 dark:border-white/10 hover:border-teal-500/50 hover:shadow-xl transition-all group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                          <ModIcon className="h-5 w-5" />
                        </div>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${mod.tagColor}`}>
                          {mod.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                      <span>Explore lab</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>



      {/* ─── Bottom High-Impact Call to Action ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-5xl rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/15 via-slate-900 to-blue-500/10 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden"
      >
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
              <Zap className="h-7 w-7 fill-current" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Next 5 Minutes Will Change How You Learn Words
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Bring three words you keep forgetting right now. Experience 6-round active recall and feel the permanent retention before your session finishes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              id="cta-bottom"
              type="button"
              onClick={handleStart}
              size="lg"
              className="w-full sm:w-auto px-10 py-4 text-base font-bold shadow-xl gap-2 cursor-pointer"
            >
              <span>Launch First Session</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
