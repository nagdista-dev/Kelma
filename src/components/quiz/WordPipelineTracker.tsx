import { Check } from 'lucide-react';
import type { WordProgress } from '@/types/index';

interface WordPipelineTrackerProps {
  words: WordProgress[];
  currentWord: string;
}

export function WordPipelineTracker({ words, currentWord }: WordPipelineTrackerProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Word pipeline">
      {words.map(w => {
        const isCurrent = w.word === currentWord;
        const cls =
          w.status === 'mastered'
            ? 'pipeline-word pipeline-word-mastered'
            : isCurrent
            ? 'pipeline-word pipeline-word-active'
            : 'pipeline-word pipeline-word-pending';

        return (
          <span key={w.word} role="listitem" className={`${cls} inline-flex items-center gap-1.5`} title={`Round ${w.currentRound}`}>
            {w.status === 'mastered' && <Check className="h-3 w-3" />}
            {w.word}
            {w.status !== 'mastered' && (
              <span className="ml-1 text-[10px] opacity-60">R{w.currentRound}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
