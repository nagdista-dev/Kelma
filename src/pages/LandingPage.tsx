import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Brain, Trophy, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

const features = [
  {
    icon: Brain,
    title: '4-Round Active Recall',
    desc: 'Every word goes through Recognition → Comprehension → Translation → Fill-in-blank',
  },
  {
    icon: Zap,
    title: 'AI-Generated Quizzes',
    desc: 'Smart distractors, level-matched examples, and personalized Arabic feedback',
  },
  {
    icon: Trophy,
    title: 'XP & Streaks',
    desc: 'Earn XP for every correct answer. Build streaks. Track your mastery.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const apiKey = useSettingsStore(s => s.apiKey);

  return (
    <div className="page-container flex flex-col items-center text-center min-h-[calc(100svh-56px)] justify-center">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center glow-teal animate-float">
            <BookOpen className="w-10 h-10 text-teal-400" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
          Master English Vocabulary
          <br />
          <span className="gradient-text">Through Active Recall</span>
        </h1>

        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Powered by AI. Built for Arabic speakers.
          Add up to 10 words and let the AI quiz you through 4 progressively harder rounds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            id="cta-start"
            onClick={() => navigate(apiKey ? '/session' : '/settings')}
            className="btn-primary text-base px-8 py-3.5 gap-2"
          >
            {apiKey ? (
              <>Start a Session <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Set Up API Key <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          {apiKey && (
            <button
              id="cta-history"
              onClick={() => navigate('/history')}
              className="btn-secondary text-base px-8 py-3.5"
            >
              View History
            </button>
          )}
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-3 gap-4 w-full">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            className="glass rounded-2xl p-5 text-left"
          >
            <f.icon className="w-6 h-6 text-teal-400 mb-3" />
            <h2 className="text-sm font-semibold text-white mb-1.5">{f.title}</h2>
            <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 w-full"
      >
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          The 4-Round Pipeline
        </h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { n: 1, label: 'Recognition', sub: 'Arabic → English' },
            { n: 2, label: 'Comprehension', sub: 'Definition → Word' },
            { n: 3, label: 'Translation', sub: 'English → Arabic' },
            { n: 4, label: 'Fill in Blank', sub: 'Sentence gap' },
          ].map((r, i) => (
            <div key={r.n} className="flex items-center gap-2">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-sm mb-1 mx-auto">
                  {r.n}
                </div>
                <p className="text-xs font-medium text-gray-300">{r.label}</p>
                <p className="text-[10px] text-gray-500">{r.sub}</p>
              </div>
              {i < 3 && <span className="text-gray-600 text-lg">→</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
