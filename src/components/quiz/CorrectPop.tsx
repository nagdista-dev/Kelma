import { motion } from 'framer-motion';

interface CorrectPopProps {
  message: string;
  xpGained?: number;
  speedBonus?: boolean;
}

const SPARK_COLORS = ['#f59e0b', '#14b8a6', '#fbbf24', '#34d399'];

/**
 * Non-blocking celebration burst for correct answers — sparks fly outward
 * from a popping badge. No button: the quiz advances itself after a beat.
 */
export function CorrectPop({ message, xpGained, speedBonus }: CorrectPopProps) {
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    angle: (i / 10) * Math.PI * 2,
    color: SPARK_COLORS[i % SPARK_COLORS.length],
    distance: 56 + ((i * 23) % 40),
    size: 5 + ((i * 7) % 5),
    delay: i * 0.02,
  }));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center pb-[22vh]"
      role="status"
      aria-live="polite"
    >
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos(s.angle) * s.distance,
            y: Math.sin(s.angle) * s.distance,
            scale: [0, 1, 0.4],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.7, delay: s.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{ width: s.size, height: s.size, backgroundColor: s.color }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.4, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: -20, opacity: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 320 }}
        className="glass-strong relative flex items-center gap-2.5 rounded-2xl px-5 py-3"
      >
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.08, bounce: 0.55 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-white shadow-md shadow-emerald-600/30"
        >
          ✓
        </motion.span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{message}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            {typeof xpGained === 'number' && xpGained > 0 && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-700 dark:text-amber-300">
                +{xpGained} XP
              </span>
            )}
            {speedBonus && (
              <span className="rounded-full border border-teal-500/40 bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                ⚡ سريع!
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
