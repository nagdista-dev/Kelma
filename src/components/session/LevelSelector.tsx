import type { LanguageLevel } from '@/types/index';
import { LEVEL_DESCRIPTIONS } from '@/types/index';

interface LevelSelectorProps {
  value: LanguageLevel;
  onChange: (level: LanguageLevel) => void;
}

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LEVELS.map(lvl => (
        <button
          key={lvl}
          type="button"
          id={`level-${lvl}`}
          onClick={() => onChange(lvl)}
          className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
            value === lvl
              ? 'bg-teal-500/30 border-teal-500 text-teal-200 glow-teal'
              : 'bg-white border-slate-200 text-slate-500 hover:border-teal-500/60 hover:text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:border-teal-500/50 dark:hover:text-gray-200'
          }`}
        >
          {lvl}
          <span className="block text-[10px] font-normal opacity-70">{LEVEL_DESCRIPTIONS[lvl]}</span>
        </button>
      ))}
    </div>
  );
}
