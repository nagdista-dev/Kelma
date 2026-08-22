import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

interface QuizTimerProps {
  startedAt: number;
}

/**
 * Counts up from zero so the user knows how long the session has been open.
 */
export function QuizTimer({ startedAt }: QuizTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  return (
    <div
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
      title="Time since the quiz opened"
    >
      <Timer className="h-3.5 w-3.5 text-sky-500" />
      <span dir="ltr">{formatElapsed(elapsed)}</span>
    </div>
  );
}
