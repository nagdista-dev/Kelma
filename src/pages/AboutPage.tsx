import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Heart, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePageMeta } from '@/hooks/usePageMeta';

export function AboutPage() {
  usePageMeta(
    'About',
    'Kelma is built by Mahmoud Elnagdy (Nagdista) on a simple belief: a word is only yours when you can use it, not just recognize it.',
    '/about'
  );
  return (
    <div className="page-container max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Brand header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Sparkles className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-wide gradient-text sm:text-2xl">NAGDISTA</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-gray-500 sm:text-sm">A product by Nagdista</p>
          </div>
        </div>

        {/* Story */}
        <Card className="mb-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-teal-300">
            <BookOpen className="h-4 w-4" />
            Why Kelma exists
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-gray-300">
            Most vocabulary apps drill random words with no context. Kelma was built
            on a simple belief: <span className="font-semibold text-slate-950 dark:text-white">a word is only
            yours when you have heard it, used it, misspelled it once, and seen it in
            real life.</span> That is exactly what the 6 rounds make you do — every single time.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-gray-400">
            It is designed for Arabic speakers learning English, with Egyptian-Arabic
            meanings, memory tips and AI feedback that talks to you like a teacher, not a robot.
          </p>
        </Card>

        {/* Values */}
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Active Recall', desc: 'No passive flashcards — your brain does the work.' },
            { icon: Heart, title: 'Made with Care', desc: 'Every round tuned for real learning, not screen time.' },
            { icon: ArrowUpRight, title: 'Always Growing', desc: 'Keep Learning, Keep Building — more rounds coming.' },
          ].map(v => (
            <div key={v.title} className="glass rounded-2xl p-4 text-center">
              <v.icon className="mx-auto mb-2 h-5 w-5 text-amber-400" />
              <p className="text-xs font-bold text-slate-950 dark:text-white">{v.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Maker */}
        <Card className="mb-8 text-center">
          <p className="text-sm font-bold text-slate-950 dark:text-white">Mahmoud Elnagdy</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">MERN Developer · Cairo, Egypt</p>
          <a
            href="https://github.com/nagdista-dev"
            target="_blank"
            rel="noopener noreferrer"
            id="about-github-link"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-300 underline-offset-4 hover:underline"
          >
            Follow the build on GitHub
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Card>

        <p className="text-center text-sm italic text-slate-500 dark:text-gray-500">"Keep Learning, Keep Building"</p>

        <div className="mt-6 text-center">
          <Link to="/session" id="about-cta" className="btn-primary inline-flex px-8 py-3">
            Try Kelma Now
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
