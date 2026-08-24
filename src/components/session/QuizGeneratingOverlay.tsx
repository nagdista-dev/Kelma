import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BrainCircuit, Ear, Keyboard, Link2, PenLine, RotateCcw, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: BrainCircuit, text: 'Analyzing your words…' },
  { icon: Sparkles, text: 'Writing clear definitions…' },
  { icon: Ear, text: 'Preparing pronunciation rounds…' },
  { icon: Link2, text: 'Finding real-world collocations…' },
  { icon: PenLine, text: 'Crafting example sentences…' },
  { icon: Keyboard, text: 'Building your 6-round quiz…' },
];

const FACTS = [
  'Words learned in context are remembered up to 3× better.',
  'Hearing a word out loud strengthens your memory of it.',
  'Short daily sessions beat one long weekly session.',
  'Your mistakes are gold — the report turns them into review rounds.',
  'Collocations teach you how words really live in sentences.',
];

interface QuizGeneratingOverlayProps {
  words: string[];
  /** When set, the overlay switches to an error state instead of loading */
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * Full-screen, non-dismissible loading experience shown while the AI
 * generates quiz data — keeps the user engaged and blocks navigation
 * so the request is never interrupted. On failure it shows the error
 * in place (with retry) so the user never loses context.
 */
export function QuizGeneratingOverlay({ words, error, onRetry, onClose }: QuizGeneratingOverlayProps) {
  const [step, setStep] = useState(0);
  const [fact, setFact] = useState(() => Math.floor(Math.random() * FACTS.length));

  useEffect(() => {
    const stepInterval = window.setInterval(
      () => setStep(s => Math.min(s + 1, STEPS.length - 1)),
      3500
    );
    const factInterval = window.setInterval(
      () => setFact(f => (f + 1) % FACTS.length),
      6000
    );
    return () => {
      window.clearInterval(stepInterval);
      window.clearInterval(factInterval);
    };
  }, []);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/97 px-4 backdrop-blur-md"
      role="alertdialog"
      aria-label="Generating your quiz"
    >
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            {/* Error state */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/15"
            >
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </motion.div>

            <h2 className="text-xl font-bold text-white">Couldn&apos;t build your quiz</h2>
            <p className="mt-1 text-xs text-gray-500">
              Something went wrong while generating this session
            </p>

            {/* Friendly error message */}
            <div className="mx-auto mt-5 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm leading-relaxed break-words text-red-300">{error}</p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              {onRetry && (
                <button
                  type="button"
                  id="overlay-retry-btn"
                  onClick={onRetry}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  id="overlay-back-btn"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                >
                  Back
                </button>
              )}
            </div>

            <p className="mt-6 text-[11px] text-gray-600">
              Your words are saved — you won&apos;t lose anything.
            </p>
          </>
        ) : (
          <>
            {/* Pulsing brain icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-500/30 bg-teal-500/15 glow-teal"
            >
              <BrainCircuit className="h-10 w-10 text-teal-300" />
            </motion.div>

            <h2 className="text-xl font-bold text-white">Building your quiz</h2>
            <p className="mt-1 text-xs text-gray-500">
              {words.length > 0 && (
                <>
                  for <span className="font-semibold text-teal-300">{words.slice(0, 4).join(', ')}</span>
                  {words.length > 4 && ` +${words.length - 4} more`}
                </>
              )}
            </p>

            {/* Progress bar */}
            <div className="mx-auto mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-300"
                initial={{ width: '5%' }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* Rotating step */}
            <div className="mt-6 flex h-8 items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-200"
                >
                  {(() => {
                    const Icon = STEPS[step].icon;
                    return <Icon className="h-4 w-4 text-teal-400" />;
                  })()}
                  {STEPS[step].text}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Learning fact */}
            <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">Did you know?</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={fact}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-1.5 text-xs leading-relaxed text-gray-400"
                >
                  {FACTS[fact]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="mt-6 text-[11px] text-gray-600">
              This usually takes 10–30 seconds — please keep this page open.
            </p>
          </>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
