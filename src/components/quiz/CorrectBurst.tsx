import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame } from 'lucide-react';

const PRAISE_AR = ['أحسنت!', 'رائع!', 'ممتاز!', 'برافو!', 'شاطر!'];

interface CorrectBurstProps {
  /** change this key/value to fire a new burst */
  trigger: number;
  xpGained?: number;
  streak?: number;
  isMilestone?: boolean;
  onDone?: () => void;
}

interface Particle {
  angle: number;
  distance: number;
  size: number;
  color: string;
  round: boolean;
  delay: number;
}

function buildParticles(seed: number): Particle[] {
  return Array.from({ length: 16 }, (_, i) => ({
    angle: ((i * 360) / 16 + (seed * 37) % 22) * (Math.PI / 180),
    distance: 70 + ((seed * 53 + i * 29) % 60),
    size: 6 + ((seed * 17 + i * 13) % 8),
    color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#2DD4BF' : '#fbbf24',
    round: i % 2 === 0,
    delay: (i % 5) * 0.02,
  }));
}

/**
 * Micro-celebration fired after every correct answer — a gold/teal star
 * burst with an Arabic praise word and the earned XP. Auto-dismisses so
 * the quiz flow never stalls.
 */
export function CorrectBurst({
  trigger,
  xpGained,
  streak,
  isMilestone,
  onDone,
}: CorrectBurstProps) {
  const active = trigger > 0;

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => onDone?.(), 1500);
    return () => window.clearTimeout(t);
  }, [active, trigger, onDone]);

  const praise = PRAISE_AR[trigger % PRAISE_AR.length];
  const particles = buildParticles(trigger);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[75] flex items-start justify-center"
          aria-hidden="true"
        >
          {/* Particle burst */}
          <div className="relative mt-24 flex items-center justify-center">
            {particles.map((p, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance - 20,
                  scale: [0, 1.2, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                className="absolute"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.round ? '9999px' : '3px',
                }}
              />
            ))}

            {/* Center badge */}
            <motion.div
              initial={{ scale: 0, rotate: -12, y: 16 }}
              animate={{ scale: [0, 1.15, 1], rotate: 0, y: 0 }}
              exit={{ scale: 0.8, y: -18, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.55, bounce: 0.45 }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border px-6 py-4 shadow-2xl ${
                isMilestone
                  ? 'border-gold/50 bg-gradient-to-b from-amber-500/25 to-amber-500/5 shadow-gold/20'
                  : 'border-teal-500/40 bg-gradient-to-b from-teal-500/25 to-teal-500/5 shadow-teal-900/30'
              }`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <motion.span
                animate={isMilestone ? { rotate: [0, -14, 14, 0] } : {}}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20"
              >
                {isMilestone ? (
                  <Flame className="h-6 w-6 text-amber-400" />
                ) : (
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                )}
              </motion.span>

              <p
                dir="rtl"
                style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                className={`text-xl font-extrabold ${
                  isMilestone ? 'text-amber-300' : 'text-teal-200'
                }`}
              >
                {isMilestone ? `🔥 ${streak} متتالية!` : praise}
              </p>

              {typeof xpGained === 'number' && xpGained > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-amber-300"
                >
                  +{xpGained} XP
                </motion.span>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
