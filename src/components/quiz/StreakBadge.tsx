import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { STREAK_MILESTONES } from '@/constants/index';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;

  const isMilestone = STREAK_MILESTONES.includes(streak);

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          isMilestone
            ? { scale: [0.5, 1.3, 1], opacity: 1 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: isMilestone ? 0.5 : 0.3, type: 'spring' }}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
          isMilestone
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 glow-amber'
            : 'bg-orange-500/10 border-orange-500/20 text-orange-300'
        }`}
        id="streak-badge"
      >
        <Flame className={`w-3.5 h-3.5 ${isMilestone ? 'text-amber-400' : 'text-orange-400'}`} />
        {streak}
      </motion.div>
    </AnimatePresence>
  );
}
