import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** e.g. "3 / 10 words mastered" */
  label?: string;
  color?: 'teal' | 'emerald' | 'amber';
}

const colorMap = {
  teal: 'from-teal-600 to-teal-400',
  emerald: 'from-emerald-600 to-emerald-400',
  amber: 'from-amber-600 to-amber-400',
};

export function ProgressBar({ value, label, color = 'teal' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500 dark:text-gray-400">
          <span>{label}</span>
          <span className="font-semibold text-slate-700 dark:text-gray-200">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-white/10">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
