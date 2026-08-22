import { useState } from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft } from 'lucide-react';

interface SpellingInputProps {
  onSubmit: (word: string) => void;
  disabled?: boolean;
}

export function SpellingInput({ onSubmit, disabled }: SpellingInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <input
        type="text"
        dir="ltr"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder="Type the English word…"
        aria-label="Type the English word"
        id="spelling-input"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-lg font-semibold text-slate-950 outline-none transition-all placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-400"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        id="spelling-submit-btn"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Check
        <CornerDownLeft className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
