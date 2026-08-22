import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  Flame,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { useSpeech } from '@/hooks/useSpeech';
import { MAX_XP_PER_WORD } from '@/constants/index';

const statColorClasses = {
  amber: {
    icon: 'text-amber-500 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
  },
  emerald: {
    icon: 'text-emerald-500 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    icon: 'text-violet-500 dark:text-violet-300',
    value: 'text-violet-700 dark:text-violet-300',
  },
  orange: {
    icon: 'text-orange-500 dark:text-orange-300',
    value: 'text-orange-700 dark:text-orange-300',
  },
};

export function SummaryPage() {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const { words, xp, maxStreak, level, sessionStartTime, resetQuiz } = useQuizStore();

  const report = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter(w => w.status === 'mastered');
    const totalAttempts = words.reduce((sum, w) => sum + w.attempts.length, 0);
    const correctAttempts = words.reduce(
      (sum, w) => sum + w.attempts.filter(a => a.correct).length,
      0
    );
    const struggledWords = words.filter(w => w.attempts.some(a => !a.correct));
    const perfectWords = words.filter(w => w.attempts.length > 0 && w.attempts.every(a => a.correct));
    const maxPossibleXP = totalWords * MAX_XP_PER_WORD;
    const xpPct = maxPossibleXP > 0 ? Math.round((xp / maxPossibleXP) * 100) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    const durationMs = sessionStartTime ? Date.now() - sessionStartTime.getTime() : 0;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));

    let focus = 'Keep reviewing these words tomorrow to lock them into memory.';
    if (accuracy >= 90) focus = 'Strong session. Move these words into sentence practice next.';
    else if (struggledWords.length > 0) focus = 'Review the struggled words first, then repeat the quiz.';

    return {
      totalWords,
      masteredWords,
      struggledWords,
      perfectWords,
      maxPossibleXP,
      xpPct,
      accuracy,
      durationMin,
      focus,
    };
  }, [maxStreak, sessionStartTime, words, xp]);

  const handleNewSession = () => {
    resetQuiz();
    navigate('/session');
  };

  const handleDownload = () => {
    const lines = [
      'Play With Words - Session Report',
      '='.repeat(40),
      `Date: ${new Date().toLocaleDateString('en-US')}`,
      `Level: ${level}`,
      `XP: ${xp} / ${report.maxPossibleXP} (${report.xpPct}%)`,
      `Accuracy: ${report.accuracy}%`,
      `Best streak: ${maxStreak}`,
      `Duration: ~${report.durationMin} min`,
      '',
      `Mastered: ${report.masteredWords.map(w => w.word).join(', ') || 'None'}`,
      `Needs review: ${report.struggledWords.map(w => w.word).join(', ') || 'None'}`,
      '',
      'Word details:',
      ...words.map(w => {
        const correct = w.attempts.filter(a => a.correct).length;
        const total = w.attempts.length;
        return `${w.word}: ${correct}/${total} correct, ${w.xpEarned} XP`;
      }),
      '',
      `Recommended focus: ${report.focus}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pww-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/20">
            <Trophy className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Session Report</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              {report.totalWords} word{report.totalWords !== 1 ? 's' : ''} completed at{' '}
              <span className="font-semibold text-violet-700 dark:text-violet-300">{level}</span> level
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          {([
            { icon: Zap, label: 'XP Earned', value: `${xp}`, color: 'amber' },
            { icon: CheckCircle2, label: 'Mastered', value: `${report.masteredWords.length}/${report.totalWords}`, color: 'emerald' },
            { icon: Target, label: 'Accuracy', value: `${report.accuracy}%`, color: 'violet' },
            { icon: Flame, label: 'Best Streak', value: `${maxStreak}`, color: 'orange' },
          ] as const).map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <stat.icon className={`mx-auto mb-2 h-5 w-5 ${statColorClasses[stat.color].icon}`} />
              <p className={`text-xl font-bold ${statColorClasses[stat.color].value}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Card className="mb-6">
          <ProgressBar value={report.xpPct} label={`${xp} / ${report.maxPossibleXP} XP earned`} color="amber" />
          <p className="mt-4 text-sm text-slate-600 dark:text-gray-300">{report.focus}</p>
        </Card>

        <div className="grid gap-4 mb-6 sm:grid-cols-2">
          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Strong Words
            </h2>
            <div className="flex flex-wrap gap-2">
              {(report.perfectWords.length ? report.perfectWords : report.masteredWords).map(w => (
                <button
                  key={w.word}
                  type="button"
                  onClick={() => speak(w.word)}
                  aria-label={`Pronounce ${w.word}`}
                  className="badge-emerald cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  {w.word}
                </button>
              ))}
              {report.masteredWords.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-gray-400">No mastered words yet.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-gray-300">
              <BookOpen className="h-4 w-4 text-violet-500" />
              Review First
            </h2>
            <div className="flex flex-wrap gap-2">
              {report.struggledWords.map(w => (
                <button
                  key={w.word}
                  type="button"
                  onClick={() => speak(w.word)}
                  aria-label={`Pronounce ${w.word}`}
                  className="badge-amber cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  {w.word}
                </button>
              ))}
              {report.struggledWords.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-gray-400">No weak words found in this session.</p>
              )}
            </div>
          </Card>
        </div>

        {words.length > 0 && (
          <Card className="mb-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-gray-300">
              Word Breakdown
            </h2>
            <div className="space-y-2">
              {words.map(w => {
                const correctAttempts = w.attempts.filter(a => a.correct).length;
                const totalAttempts = w.attempts.length;
                const mastered = w.status === 'mastered';
                return (
                  <div
                    key={w.word}
                    className="flex items-center justify-between gap-4 border-b border-slate-200 py-2 last:border-0 dark:border-white/5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {mastered ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <BookOpen className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => speak(w.word)}
                        aria-label={`Pronounce ${w.word}`}
                        className="truncate cursor-pointer text-sm font-medium text-slate-950 hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
                      >
                        {w.word}
                      </button>
                      <a
                        href={`https://youglish.com/pronounce/${encodeURIComponent(w.word)}/english/us`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${w.word} on YouGlish`}
                        className="shrink-0 text-slate-400 transition-colors hover:text-red-500 dark:text-gray-500"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        {correctAttempts}/{totalAttempts} correct
                      </span>
                      <span className="badge-amber text-[10px]">+{w.xpEarned} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button id="new-session-btn" onClick={handleNewSession} className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            New Session
          </Button>
          <Button id="download-report-btn" variant="secondary" onClick={handleDownload} className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button id="view-history-btn" variant="secondary" onClick={() => navigate('/history')} className="flex-1">
            History
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
