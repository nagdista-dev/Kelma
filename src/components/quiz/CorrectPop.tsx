import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

interface CorrectPopProps {
  message: string;
  xpGained?: number;
  speedBonus?: boolean;
}

export function CorrectPop({ message, xpGained, speedBonus }: CorrectPopProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: -30, opacity: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 380 }}
        className="relative flex items-center gap-4 rounded-3xl border border-emerald-400/40 bg-white/98 px-5 py-4 shadow-2xl shadow-emerald-600/20 backdrop-blur-2xl dark:border-emerald-500/30 dark:bg-[#0a1628]/98"
      >
        {/* Animated glow ring + checkmark */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/40">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 400, delay: 0.08 }}
          >
            <Check className="h-7 w-7 stroke-[3]" />
          </motion.div>
          {/* Pulse ring */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a1628]" />
          </span>
        </div>

        {/* Text + badges */}
        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-black text-slate-950 dark:text-white leading-tight"
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-1.5 flex items-center gap-1.5"
          >
            {typeof xpGained === 'number' && xpGained > 0 && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-black text-white shadow-sm shadow-amber-500/30">
                <Zap className="h-3.5 w-3.5 fill-white" />
                +{xpGained} XP
              </span>
            )}
            {speedBonus && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-teal-500/40 bg-teal-500/15 px-2.5 py-0.5 text-xs font-black text-teal-700 dark:text-teal-300">
                <Zap className="h-3.5 w-3.5 fill-current" />
                Speed Bonus
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
