import { Check } from 'lucide-react';
import type { WordProgress } from '@/types/index';

interface WordPipelineTrackerProps {
  words: WordProgress[];
}

/**
 * Progress tracker that does NOT reveal the current word.
 * Mastered words are shown with a check; everything else is an
 * anonymous dot so the user has to think to answer.
 */
export function WordPipelineTracker({ words }: WordPipelineTrackerProps) {
  const mastered = words.filter(w => w.status === 'mastered');
  const remaining = words.length - mastered.length;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" role="list" aria-label="Word pipeline">
      {mastered.map(w => (
        <span
          key={w.word}
          role="listitem"
          className="pipeline-word pipeline-word-mastered inline-flex items-center gap-1.5"
        >
          <Check className="h-3 w-3" />
          {w.word}
        </span>
      ))}
      {Array.from({ length: remaining }).map((_, i) => (
        <span
          key={`dot-${i}`}
          role="listitem"
          aria-label="Remaining word"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500"
        >
          ?
        </span>
      ))}
    </div>
  );
}
