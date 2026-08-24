import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame, Heart } from 'lucide-react';

const PRAISE_AR = ['أحسنت!', 'رائع!', 'ممتاز!', 'برافو!', 'شاطر!'];
const ENCOURAGE_AR = ['قرّبت!', 'حاول تاني!', 'عادي جدًا!', 'الغلط بداية التعلم!', 'كمّل!'];

interface BurstProps {
  /** change this key/value to fire a new burst */
  trigger: number;
  variant?: 'correct' | 'wrong';
  xpGained?: number;
  speedBonus?: boolean;
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

function buildParticles(seed: number, variant: 'correct' | 'wrong'): Particle[] {
  const palette =
    variant === 'correct'
      ? ['#f59e0b', '#2DD4BF', '#fbbf24']
      : ['#f59e0b', '#64748b', '#fbbf24'];
  return Array.from({ length: 22 }, (_, i) => ({
    angle: ((i * 360) / 22 + (seed * 37) % 20) * (Math.PI / 180),
    distance: 90 + ((seed * 53 + i * 31) % 70),
    size: 8 + ((seed * 17 + i * 13) % 10),
    color: palette[i % palette.length],
    round: i % 2 === 0,
    delay: (i % 6) * 0.03,
  }));
}

/**
 * Micro-celebration after each answer — gold/teal star burst for correct
 * answers, a softer encouraging burst for wrong ones. Auto-dismisses so
 * the quiz flow never stalls.
 */
export function CorrectBurst({
  trigger,
  variant = 'correct',
  xpGained,
  speedBonus,
  streak,
  isMilestone,
  onDone,
}: BurstProps) {
  const active = trigger > 0;

  useEffect(() => {
    if (!active) return;
    // Micro-celebration must NEVER stall the quiz flow — keep it brief
    const t = window.setTimeout(() => onDone?.(), variant === 'correct' ? 1100 : 1500);
    return () => window.clearTimeout(t);
  }, [active, trigger, variant, onDone]);

  const praise = PRAISE_AR[trigger % PRAISE_AR.length];
  const encourage = ENCOURAGE_AR[trigger % ENCOURAGE_AR.length];
  const particles = buildParticles(trigger, variant);

  const badgeTone =
    isMilestone && variant === 'correct'
      ? { border: 'border-gold/50', bg: 'from-amber-500/25 to-amber-500/5' }
      : variant === 'wrong'
        ? { border: 'border-slate-500/40', bg: 'from-slate-500/20 to-slate-500/5' }
        : { border: 'border-teal-500/40', bg: 'from-teal-500/25 to-teal-500/5' };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center bg-bg-primary/55 backdrop-blur-[2px]"
          aria-hidden="true"
        >
          {/* Soft radial flash */}
          <motion.div
            initial={{ opacity: 0.7, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 ${
              variant === 'wrong'
                ? 'bg-[radial-gradient(600px_400px_at_50%_45%,rgba(100,116,139,0.18),transparent_70%)]'
                : 'bg-[radial-gradient(600px_400px_at_50%_45%,rgba(245,158,11,0.16),transparent_70%)]'
            }`}
          />

          {/* Particle burst */}
          <div className="relative flex items-center justify-center">
            {particles.map((p, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance - 24,
                  scale: [0, 1.2, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1, delay: p.delay, ease: 'easeOut' }}
                className="absolute"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.round ? '9999px' : '3px',
                }}
              />
            ))}

            {/* Center badge — zooms in big then settles */}
            <motion.div
              initial={{ scale: 1.7, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: -20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.55, bounce: 0.4 }}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-8 py-5 shadow-2xl ${badgeTone.border} bg-gradient-to-b ${badgeTone.bg}`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <motion.span
                animate={isMilestone && variant === 'correct' ? { rotate: [0, -14, 14, 0] } : {}}
                transition={{ duration: 0.7, delay: 0.15 }}
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  variant === 'wrong' ? 'bg-slate-500/20' : 'bg-gold/20'
                }`}
              >
                {variant === 'wrong' ? (
                  <Heart className="h-8 w-8 fill-amber-400 text-amber-400" />
                ) : isMilestone ? (
                  <Flame className="h-8 w-8 text-amber-400" />
                ) : (
                  <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                )}
              </motion.span>

              <p
                dir="rtl"
                style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                className={`text-2xl font-extrabold sm:text-3xl ${
                  variant === 'wrong'
                    ? 'text-gray-200'
                    : isMilestone
                      ? 'text-amber-300'
                      : 'text-teal-200'
                }`}
              >
                {variant === 'wrong' ? encourage : isMilestone ? `🔥 ${streak} متتالية!` : praise}
              </p>

              {(variant === 'correct' &&
                (typeof xpGained === 'number' && xpGained > 0 || speedBonus)) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-1.5"
                >
                  {typeof xpGained === 'number' && xpGained > 0 && (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-amber-300">
                      +{xpGained} XP
                    </span>
                  )}
                  {speedBonus && (
                    <span className="rounded-full border border-teal-500/40 bg-teal-500/15 px-2.5 py-0.5 text-xs font-bold text-teal-300">
                      ⚡ سريع!
                    </span>
                  )}
                </motion.div>
              )}

              {variant === 'wrong' && (
                <p
                  dir="rtl"
                  style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
                  className="max-w-[240px] text-center text-[11px] leading-relaxed text-gray-400"
                >
                  اقرأ الشرح تحت وكمّل — أنت أقرب مما تتخيل
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
