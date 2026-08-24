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
  maxStreak: number;
  accuracy: number; // 0–100
  mastered: number;
  total: number;
  onViewReport: () => void;
  onNewSession: () => void;
}

function tierFor(accuracy: number, perfect: boolean) {
  if (perfect)
    return {
      title: 'أسطوري! 👑',
      sub: 'كل الكلمات من أول مرة — مستوى نادر',
      ring: 'border-gold/50 bg-gold/15',
      icon: 'text-gold',
    };
  if (accuracy >= 80)
    return {
      title: 'عمل رائع! 🔥',
      sub: 'أنت بتتحسن مع كل جلسة',
      ring: 'border-teal-500/40 bg-teal-500/10',
      icon: 'text-teal-300',
    };
  return {
    title: 'خلصت الجلسة! 💪',
    sub: 'الغلطة أول خطوة في التعلم',
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '110%', opacity: [0, 1, 1, 0], rotate: p.drift * 4 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute top-0"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.6, backgroundColor: p.color, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen celebration shown the moment a session completes.
 * Blocks the page behind it until the player picks their next move.
 */
export function QuizCompleteModal({
  xp,
  maxStreak,
  accuracy,
  mastered,
  total,
  onViewReport,
  onNewSession,
}: QuizCompleteModalProps) {
  const perfect = accuracy === 100 && mastered === total && total > 0;
  const tier = tierFor(accuracy, perfect);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onViewReport();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onViewReport]);

  const stats = [
    { Icon: Zap, value: xp, label: 'XP', tone: 'text-amber-300' },
    { Icon: Target, value: `${Math.round(accuracy)}%`, label: 'الدقة', tone: 'text-teal-300' },
    { Icon: Flame, value: maxStreak, label: 'سلسلة', tone: 'text-orange-300' },
    { Icon: CheckCircle2, value: `${mastered}/${total}`, label: 'إتقان', tone: 'text-emerald-300' },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-bg-primary/90 p-4 backdrop-blur-lg"
      role="dialog"
      aria-label="انتهت الجلسة"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.55, bounce: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-bg-primary p-6 text-center shadow-2xl sm:p-8"
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
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 ${tier.ring} bg-bg-primary`}
          >
            <Trophy className={`h-11 w-11 ${tier.icon}`} />
          </motion.div>
        </div>

        <h2
          dir="rtl"
          style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          className="text-2xl font-extrabold text-white sm:text-3xl"
        >
          {tier.title}
        </h2>
        <p
          dir="rtl"
          style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          className="mt-1 text-sm text-gray-400"
        >
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
              className="flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
            >
              <Icon className={`mb-0.5 h-4 w-4 ${tone}`} />
              <span dir="ltr" className={`text-lg font-extrabold tabular-nums ${tone}`}>
                {value}
              </span>
              <span
                dir="rtl"
                style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                className="text-[10px] font-semibold text-gray-500"
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <Button onClick={onViewReport} size="lg" className="w-full" id="complete-report-btn">
            <BookOpen className="h-4 w-4" />
            شوف التقرير الكامل
          </Button>
          <Button
            onClick={onNewSession}
            variant="secondary"
            size="lg"
            className="w-full"
            id="complete-new-session-btn"
          >
            <RotateCcw className="h-4 w-4" />
            جلسة جديدة
          </Button>
        </div>

        <p
          dir="rtl"
          style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
          className="mt-4 text-[11px] text-gray-600"
        >
          اضغط Enter لعرض التقرير
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}
