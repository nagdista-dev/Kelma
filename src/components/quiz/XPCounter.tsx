import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPCounterProps {
  xp: number;
  gained?: number;
}

export function XPCounter({ xp, gained }: XPCounterProps) {
  return (
    <div className="relative flex items-center gap-1.5">
      <Zap className="w-4 h-4 text-amber-400" />
      <motion.span
        key={xp}
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-bold text-amber-500 tabular-nums dark:text-amber-300"
        id="xp-counter"
      >
        {xp}
      </motion.span>
      <span className="text-xs text-slate-500 dark:text-gray-500">XP</span>

      {/* Floating +XP indicator */}
      <AnimatePresence>
        {gained && gained > 0 && (
          <motion.span
            key={`gain-${xp}`}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -24, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-4 left-0 text-xs font-bold text-amber-300 pointer-events-none"
          >
            +{gained}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
