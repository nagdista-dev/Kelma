import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InlineCorrectBarProps {
  message: string;
  xpGained?: number;
  speedBonus?: boolean;
  onNext: () => void;
}

/**
 * Slim non-blocking banner for correct answers — celebrate briefly,
 * keep the momentum, never interrupt the flow.
 */
export function InlineCorrectBar({
  message,
  xpGained,
  speedBonus,
  onNext,
}: InlineCorrectBarProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-emerald-500/30 bg-gradient-to-t from-emerald-600/25 via-bg-primary/95 to-bg-primary/95 backdrop-blur-md"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-emerald-300">{message}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {typeof xpGained === 'number' && xpGained > 0 && (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-300">
                  +{xpGained} XP
                </span>
              )}
              {speedBonus && (
                <span className="rounded-full border border-teal-500/40 bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                  ⚡ سريع!
                </span>
              )}
            </div>
          </div>

          <Button onClick={onNext} size="lg" className="shrink-0 px-8" id="correct-continue-btn">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
