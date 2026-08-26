import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

interface HintButtonProps {
  onHint: () => string;
  disabled?: boolean;
}

export function HintButton({ onHint, disabled }: HintButtonProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [used, setUsed] = useState(false);

  const handleHint = () => {
    if (used) return;
    const result = onHint();
    setHint(result);
    setUsed(true);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleHint}
        disabled={disabled || used}
        id="hint-btn"
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
          used
            ? 'border-amber-500/30 text-amber-400 bg-amber-500/10 cursor-default'
            : 'border-slate-200 text-slate-500 bg-white hover:border-amber-500/50 hover:text-amber-600 hover:bg-amber-50 cursor-pointer dark:border-white/10 dark:text-gray-400 dark:bg-white/5 dark:hover:border-amber-500/40 dark:hover:text-amber-300 dark:hover:bg-amber-500/10'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Lightbulb className="w-3.5 h-3.5" />
        {used ? 'Hint used (−3 XP)' : 'Show hint (−3 XP)'}
      </button>
      {hint && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-xs dark:text-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{hint}</p>
        </div>
      )}
    </div>
  );
}
