import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Compass,
  Ear,
  Keyboard,
  PenLine,
  Quote,
  Sparkles,
  Trophy,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STEPS = [
  {
    n: 1,
    icon: Wand2,
    title: 'Add Your Words',
    desc: 'Paste or type up to 10 English words you want to master. Fresh from a video, an article, or your course.',
    color: 'teal',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI Builds Everything',
    desc: 'In seconds, the AI creates meanings, definitions, example sentences and confusable distractors for every word.',
    color: 'amber',
  },
  {
    n: 3,
    icon: Zap,
    title: 'Play 6 Smart Rounds',
    desc: 'Recognition → Comprehension → Translation → Fill the blank → Listening → Spelling. Each round attacks the word from a new angle.',
    color: 'teal',
  },
  {
    n: 4,
    icon: Volume2,
    title: 'Hear Every Word',
    desc: 'Duolingo-style auto pronunciation after each answer. Replay anytime, or tap collocations to hear how words live together.',
    color: 'amber',
  },
  {
    n: 5,
    icon: Compass,
    title: 'Explore Real Videos',
    desc: 'One tap opens YouGlish with thousands of real clips using your word — see it, hear it, feel it in context.',
    color: 'teal',
  },
  {
    n: 6,
    icon: BarChart3,
    title: 'Review & Master',
    desc: 'Earn XP, build streaks, then get a full report. Weak words come back as one-tap practice sessions.',
    color: 'amber',
  },
];

const ROUND_BADGES = [
  { icon: BookIcon, label: 'Recognition', sub: 'Arabic → English' },
  { icon: BookIcon, label: 'Comprehension', sub: 'Definition → Word' },
  { icon: Quote, label: 'Translation', sub: 'English → Arabic' },
  { icon: PenLine, label: 'Fill Blank', sub: 'Sentence context' },
  { icon: Ear, label: 'Listening', sub: 'Hear → Pick' },
  { icon: Keyboard, label: 'Spelling', sub: 'Meaning → Type' },
];

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export function HowToPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-500/30 bg-teal-500/15 glow-teal"
          >
            <Sparkles className="h-8 w-8 text-teal-300" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Any word. <span className="gradient-text">Fully mastered</span> in 6 rounds.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed">
            Kelma turns raw word lists into a game-like brain workout —
            meaning, sound, context and spelling, all in one session.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-14">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45 }}
            >
              <Card className={`flex items-start gap-4 ${step.color === 'amber' ? 'border-amber-500/15' : ''}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  step.color === 'amber'
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-teal-500/30 bg-teal-500/10'
                }`}>
                  <step.icon className={`h-5 w-5 ${step.color === 'amber' ? 'text-amber-300' : 'text-teal-300'}`} />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-white">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.color === 'amber' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                    }`}>
                      {step.n}
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-400">{step.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rounds showcase */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            <Trophy className="h-4 w-4 text-amber-400" />
            The 6 rounds every word survives
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ROUND_BADGES.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/15">
                  <r.icon className="h-4 w-4 text-teal-300" />
                </div>
                <p className="text-xs font-bold text-white">{r.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{r.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10 p-8 text-center"
        >
          <h2 className="text-xl font-extrabold text-white">Ready to make words stick?</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
            Your first session takes less than 5 minutes — bring 3 words and feel the difference.
          </p>
          <Link to="/session" id="howto-cta-btn">
            <Button size="lg" className="mt-5 gap-2 px-8">
              Start Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="mt-3 text-[11px] text-gray-600">
            Free forever · works with OpenRouter free models · by Nagdista
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
