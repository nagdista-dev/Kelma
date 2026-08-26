import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuizCompleteModalProps {
  xp: number;
  accuracy: number;
  maxStreak: number;
  mastered: number;
  total: number;
  onViewReport: () => void;
  onNewSession: () => void;
}

function tierFor(accuracy: number, perfect: boolean) {
  if (perfect)
    return {
      title: 'Legendary Performance!',
      sub: 'Every single word mastered on the first attempt.',
      ring: 'border-amber-400/50 bg-amber-400/15',
      icon: 'text-amber-400',
    };
  if (accuracy >= 80)
    return {
      title: 'Outstanding Work!',
      sub: 'Consistent active recall and rapid vocabulary retention.',
      ring: 'border-teal-500/40 bg-teal-500/10',
      icon: 'text-teal-300',
    };
  return {
    title: 'Session Complete!',
    sub: 'Mistakes are the first step to permanent retention.',
    ring: 'border-slate-500/40 bg-slate-500/10',
    icon: 'text-gray-300',
  };
}

/** One-shot confetti rain behind the trophy */
function Confetti({ seed }: { seed: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: (i * 37 + seed * 13) % 100,
        delay: ((i * 7 + seed * 3) % 12) * 0.08,
        size: 5 + ((i * 11 + seed * 5) % 7),
        color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#14b8a6' : '#fbbf24',
        drift: (((i * 29 + seed * 7) % 9) - 4) * 18,
        duration: 1.6 + ((i * 5) % 8) * 0.12,
      })),
    [seed]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: 320,
            x: p.drift,
            opacity: [0, 1, 1, 0],
            rotate: p.drift * 8,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          className="absolute top-0 rounded-sm"
        />
      ))}
    </div>
  );
}

export function QuizCompleteModal({
  xp,
  accuracy,
  maxStreak,
  mastered,
  total,
  onViewReport,
  onNewSession,
}: QuizCompleteModalProps) {
  const perfect = accuracy >= 100;
  const tier = tierFor(accuracy, perfect);

  // Keyboard shortcut: Enter views report
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onViewReport();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onViewReport]);

  const stats = [
    { Icon: Zap, value: `${xp}`, label: 'XP Gained', tone: 'text-amber-400' },
    { Icon: Target, value: `${Math.round(accuracy)}%`, label: 'Accuracy', tone: 'text-teal-400' },
    { Icon: Flame, value: `${maxStreak}`, label: 'Max Streak', tone: 'text-orange-400' },
    { Icon: CheckCircle2, value: `${mastered}/${total}`, label: 'Mastered', tone: 'text-emerald-400' },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-label="Session Complete"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.55, bounce: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-[#0b1120] p-6 text-center shadow-2xl sm:p-8"
      >
        <Confetti seed={xp + maxStreak} />

        {/* Trophy with pulsing rings */}
        <div className="relative mx-auto mb-5 h-24 w-24">
          <motion.span
            animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-full border-2 ${tier.ring}`}
          />
          <motion.span
            animate={{ scale: [1, 1.45], opacity: [0.35, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut', delay: 0.5 }}
            className={`absolute inset-0 rounded-full border ${tier.ring}`}
          />
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.15, bounce: 0.5 }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 ${tier.ring} bg-slate-900`}
          >
            <Trophy className={`h-11 w-11 ${tier.icon}`} />
          </motion.div>
        </div>

        <h2 className="text-2xl font-black text-white sm:text-3xl">
          {tier.title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {tier.sub}
        </p>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ Icon, value, label, tone }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
            >
              <Icon className={`mb-0.5 h-4 w-4 ${tone}`} />
              <span className={`text-lg font-black tabular-nums ${tone}`}>
                {value}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <Button onClick={onViewReport} size="lg" className="w-full gap-2 font-bold" id="complete-report-btn">
            <BookOpen className="h-4 w-4" />
            View Full Session Report
          </Button>
          <Button
            onClick={onNewSession}
            variant="secondary"
            size="lg"
            className="w-full gap-2 font-bold"
            id="complete-new-session-btn"
          >
            <RotateCcw className="h-4 w-4" />
            Start New Session
          </Button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          Press <kbd className="rounded border border-white/10 px-1 py-0.5 font-mono">Enter ↵</kbd> to view report
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}
