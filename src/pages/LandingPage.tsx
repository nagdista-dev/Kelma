import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Ear,
  Keyboard,
  Quote,
  Sparkles,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { NO_KEY_PROVIDERS } from '@/types/index';

const FEATURES = [
  {
    icon: Brain,
    title: '6-Round Active Recall',
    desc: 'Every word survives 6 attacks — recognition to spelling — so it never slips away',
  },
  {
    icon: Volume2,
    title: 'Real Pronunciation',
    desc: 'Hear every word out loud with your favorite voice — train your ear, not just your eyes',
  },
  {
    icon: Quote,
    title: 'YouGlish Integration',
    desc: 'One tap shows your word in thousands of real YouTube clips — context you will never forget',
  },
  {
    icon: Zap,
    title: 'XP, Streaks & Hints',
    desc: 'XP, streaks and speed bonuses that make daily practice feel like play',
  },
  {
    icon: BarChart3,
    title: 'Personal Dashboard',
    desc: 'See exactly where you stand — then re-drill weak words in one tap',
  },
  {
    icon: Trophy,
    title: 'Session Reports',
    desc: 'AI explains every mistake in Egyptian Arabic — so the next attempt is smarter',
  },
];

const ROUNDS = [
  { n: 1, label: 'Recognition', sub: 'Arabic → English' },
  { n: 2, label: 'Comprehension', sub: 'Definition → Word' },
  { n: 3, label: 'Translation', sub: 'English → Arabic' },
  { n: 4, label: 'Fill Blank', sub: 'Sentence context' },
  { n: 5, label: 'Listening', sub: 'Hear → Pick', icon: Ear },
  { n: 6, label: 'Spelling', sub: 'Meaning → Type', icon: Keyboard },
];

export function LandingPage() {
  const navigate = useNavigate();
  const apiKey = useSettingsStore(s => s.apiKey);
  const provider = useSettingsStore(s => s.provider);
  // No-key providers work with an empty key
  const ready = Boolean(apiKey) || NO_KEY_PROVIDERS.has(provider);

  return (
    <div className="page-container flex flex-col items-center text-center">
      {/* ─── Hero ─── */}
      <div className="min-h-[calc(100svh-56px)] flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center glow-teal animate-float">
              <BookOpen className="w-10 h-10 text-teal-400" />
            </div>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white mb-4 leading-tight">
            Master English Words
            <br />
            <span className="gradient-text">Like a Game</span>
          </h1>

          <p className="text-slate-500 dark:text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Stop forgetting the words you learn. Paste any word list and Kelma
            drills each word through 6 rounds of active recall — until it sticks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button
              id="cta-start"
              onClick={() => navigate(ready ? '/session' : '/provider')}
              className="btn-primary text-base px-8 py-3.5 gap-2"
            >
              {ready ? (
                <>Start a Session <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Get Started Free <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <Link to="/how-to" id="cta-howto" className="btn-secondary text-base px-8 py-3.5">
              See How It Works
            </Link>
          </div>
          <p className="mb-10 text-xs font-medium text-slate-500 dark:text-gray-500">
            Free forever · No signup · Works with free AI keys
          </p>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] font-medium text-slate-500 dark:text-gray-500">
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" /> AI-powered</span>
            <span className="hidden sm:flex items-center gap-1.5"><Ear className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" /> Listen & learn</span>
            <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" /> XP & streaks</span>
          </div>
        </motion.div>
      </div>

      {/* ─── Feature grid ─── */}
      <section className="w-full mb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 mb-6"
        >
          Everything a word needs
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-5 text-left"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/10">
                <f.icon className="w-5 h-5 text-teal-600 dark:text-teal-300" />
              </div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white mb-1.5">{f.title}</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Rounds pipeline ─── */}
      <section className="w-full mb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 mb-6"
        >
          The 6-round gauntlet
        </motion.h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full">
          {ROUNDS.map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.06 }}
              className="glass rounded-2xl p-3 sm:p-4"
            >
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-teal-500/30 to-teal-600/20 border border-teal-500/40 text-teal-700 dark:text-teal-200 font-bold text-sm">
                {r.n}
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-gray-200">{r.label}</p>
              <p className="mt-0.5 text-[9px] sm:text-[10px] text-slate-500 dark:text-gray-500">{r.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mb-8 rounded-3xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10 p-8 sm:p-10"
      >
        <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Your first session takes 5 minutes</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-gray-400">
          Bring three words you keep forgetting — and feel the difference before the session ends.
        </p>
        <button
          onClick={() => navigate(ready ? '/session' : '/provider')}
          id="cta-bottom"
          className="btn-primary mt-6 px-10 py-3.5 gap-2"
        >
          Jump In <ArrowRight className="w-4 h-4" />
        </button>
      </motion.section>
    </div>
  );
}
