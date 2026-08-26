import { motion } from 'framer-motion';
import { Check, CircleHelp, X } from 'lucide-react';
import { I_DONT_KNOW } from '@/constants/index';

interface AnswerButtonProps {
  option: string;
  index: number;
  state: 'default' | 'correct' | 'wrong' | 'dimmed' | 'disabled';
  onClick: () => void;
  isArabic?: boolean;
}

export function AnswerButton({
  option,
  index,
  state,
  onClick,
  isArabic = false,
}: AnswerButtonProps) {
  const isIDontKnow = option === I_DONT_KNOW;
  const displayOption = isArabic && isIDontKnow ? 'لا أعرف' : option;
  const shouldUseArabicLayout = isArabic;

  const stateClasses = {
    default: '',
    correct: 'answer-btn-correct',
    wrong: 'answer-btn-wrong',
    dimmed: 'opacity-40 cursor-default',
    disabled: 'answer-btn-disabled',
  };

  return (
    <motion.button
      key={option}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`answer-btn ${isIDontKnow ? 'answer-btn-idontknow' : ''} ${stateClasses[state]}`}
      onClick={state === 'default' ? onClick : undefined}
      disabled={state === 'disabled' || state === 'dimmed'}
      id={`answer-${index}`}
      {...(state === 'wrong' && {
        animate: { x: [-8, 8, -8, 8, 0] },
        transition: { duration: 0.4 },
      })}
      {...(state === 'correct' && {
        animate: { scale: [1, 1.04, 1] },
        transition: { duration: 0.35 },
      })}
    >
      <span className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 dark:bg-white/10 dark:text-gray-400">
          {String.fromCharCode(65 + index)}
        </span>
        <span
          dir={shouldUseArabicLayout ? 'rtl' : 'ltr'}
          className={`min-w-0 flex-1 ${
            shouldUseArabicLayout ? 'rtl-text text-right' : ''
          }`}
        >
          {isIDontKnow && <CircleHelp className="inline-block w-4 h-4 mx-1.5 -mt-0.5" />}
          {displayOption}
        </span>
        {state === 'correct' && <Check className="w-5 h-5 ml-auto text-emerald-300" />}
        {state === 'wrong' && <X className="w-5 h-5 ml-auto text-red-300" />}
      </span>
    </motion.button>
  );
}
