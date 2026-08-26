import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Code2,
  Cpu,
  Eye,
  Globe,
  HeartHandshake,
  Keyboard,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  PenLine,
  Rocket,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const PILLARS = [
  {
    icon: Brain,
    title: 'Active Recall vs Passive Swiping',
    desc: 'Most apps drill passive flashcards. Kelma demands active cognitive retrieval, requiring you to produce definitions, spellings, and context from memory.',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
  },
  {
    icon: Layers,
    title: '6-Dimensional Cognitive Gauntlet',
    desc: 'Every word is tested across 6 cognitive angles: Meaning recognition, definition comprehension, context synthesis, audio discrimination, and active typing.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    icon: Cpu,
    title: 'AI Multi-Provider Independence',
    desc: 'Total freedom to use Google Gemini, Groq Llama 3, OpenAI, DeepSeek, or local Ollama with zero vendor lock-in and instant zero-key fallback.',
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
  {
    icon: Lock,
    title: 'Local-First & Privacy Sovereign',
    desc: 'All vocabulary lists, drill performance, analytics, and session history remain securely stored in your browser storage. Zero tracking.',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
];

const GAUNTLET_STEPS = [
  {
    n: 1,
    title: 'Recognition',
    sub: 'Meaning → English Word',
    desc: 'Rapidly identify the target word from semantic cues.',
    icon: Eye,
  },
  {
    n: 2,
    title: 'Comprehension',
    sub: 'Definition → Target Word',
    desc: 'Associate full English definitions with the target term.',
    icon: Lightbulb,
  },
  {
    n: 3,
    title: 'Translation',
    sub: 'English → Context Meaning',
    desc: 'Cross-lingual context mapping for bilingual precision.',
    icon: Globe,
  },
  {
    n: 4,
    title: 'Context Fill',
    sub: 'Sentence Cloze',
    desc: 'Produce the missing word within realistic narrative sentences.',
    icon: PenLine,
  },
  {
    n: 5,
    title: 'Audio Discrimination',
    sub: 'Listen & Identify',
    desc: 'Train your ear to recognize spoken cadence and stress.',
    icon: Volume2,
  },
  {
    n: 6,
    title: 'Active Spelling',
    sub: 'Produce from Memory',
    desc: 'Final test: Type the exact word with zero hints or options.',
    icon: Keyboard,
  },
];

export function AboutPage() {
  usePageMeta(
    'About Kelma',
    'Learn about Kelma’s cognitive active recall pedagogy, 6-round vocabulary gauntlet, and privacy-first local AI architecture crafted by Nagdista.',
    '/about'
  );

  const { play } = useSoundEffects();

  return (
    <div className="page-container pb-28 lg:pb-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ─── Hero Banner ─── */}
        <section className="mb-12 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-black text-teal-700 dark:text-teal-300 mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 fill-current text-teal-500" />
            <span>Built on Cognitive Science & Active Retrieval</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight max-w-3xl mx-auto leading-[1.15]">
            A Word is Only Yours When You Can <span className="gradient-text">Produce It Under Load</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Kelma was built on a simple cognitive reality: passive recognition gives the illusion of learning. True language fluency requires multi-layered retrieval, contextual synthesis, and audio discrimination.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/session"
              onClick={() => play('click')}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg shadow-teal-500/25 cursor-pointer"
              id="about-try-btn"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Start 6-Round Gauntlet</span>
            </Link>

            <Link
              to="/tutor"
              onClick={() => play('click')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-teal-500 hover:bg-slate-50 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 shadow-xs cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-violet-500" />
              <span>Explore AI Practice Labs</span>
            </Link>
          </div>
        </section>

        {/* ─── Story & Mission Deep Dive ─── */}
        <section className="mb-12">
          <Card className="p-6 sm:p-10 border-slate-200/90 dark:border-white/10 shadow-xl bg-gradient-to-br from-teal-500/5 via-white to-transparent dark:from-teal-500/10 dark:via-[#0c1322]">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">
              <Rocket className="h-4 w-4" />
              <span>The Origin & Vision</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white mb-4">
              Why We Engineered Kelma
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed font-normal">
              <p>
                Traditional vocabulary tools encourage passive card flipping. You see a word, flip the card, tell yourself <em>"I knew that,"</em> and move on. But when you step into an executive presentation, an interview, or a natural conversation, that word fails to surface.
              </p>
              <p>
                In cognitive psychology, this is known as the <strong className="font-bold text-slate-950 dark:text-white">Retrieval Practice Effect</strong>. Memory traces are strengthened not by passively consuming information, but by forcing the brain to construct the answer under variable constraints.
              </p>
              <p>
                Kelma solves this by subjecting your chosen vocabulary to a relentless 6-round battery — testing meaning, definition, synthesis, phonetics, audio perception, and typing until that word is hardcoded into your active vocabulary.
              </p>
            </div>
          </Card>
        </section>

        {/* ─── The 4 Architectural Pillars ─── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              The Four Architectural Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              Engineered with cognitive rigor, privacy Sovereignty, and AI autonomy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map(p => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.title}
                  className="p-6 border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border mb-4 ${p.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-black text-slate-950 dark:text-white mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ─── The 6-Round Gauntlet Journey ─── */}
        <section className="mb-12">
          <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-white/10 shadow-xl">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  The 6-Round Gauntlet Breakdown
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  How a single session guides you from recognition to active mastery
                </p>
              </div>
              <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-[11px] font-extrabold text-teal-700 dark:text-teal-300">
                100% Mastery Gauntlet
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAUNTLET_STEPS.map(step => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.n}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/5 dark:bg-white/[0.02] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                          Round 0{step.n}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white mb-0.5">
                        {step.title}
                      </h3>
                      <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-2">
                        {step.sub}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* ─── Creator & Brand Profile ─── */}
        <section className="mb-12">
          <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-white/10 shadow-xl text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-[#0c1322]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white shadow-xl shadow-teal-500/25 mb-4">
              <span className="text-2xl font-black">N</span>
            </div>

            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400">
              Crafted by Nagdista
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
              Mahmoud Elnagdy
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Full-Stack Software Engineer & AI Product Builder focusing on high-performance interfaces and cognitive learning systems.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/nagdista-dev"
                target="_blank"
                rel="noopener noreferrer"
                id="about-github-link"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white shadow-xs"
              >
                <Code2 className="h-4 w-4" />
                <span>GitHub @nagdista-dev</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </a>

              <Link
                to="/support"
                onClick={() => play('click')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white shadow-xs"
              >
                <HeartHandshake className="h-4 w-4 text-rose-500" />
                <span>Help & Feedback</span>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs italic text-slate-400 dark:text-gray-500 font-serif">
                "Keep Learning, Keep Building."
              </p>
            </div>
          </Card>
        </section>

        {/* ─── Bottom High-Impact Call to Action ─── */}
        <section className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/15 via-slate-900 to-blue-500/10 p-8 sm:p-10 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to Lock Your Next Vocabulary List into Permanent Memory?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              No cards to swipe. Just enter the words you want to master and experience the 6-round active recall engine.
            </p>
            <div className="pt-2">
              <Link
                to="/session"
                onClick={() => play('click')}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-teal-500/30 hover:bg-teal-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Launch Your First Session</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
