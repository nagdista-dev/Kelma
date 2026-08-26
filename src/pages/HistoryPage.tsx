import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, History, Trash2, Zap } from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import type { SessionRecord } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { ProgressBar } from '@/components/quiz/ProgressBar';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function HistoryPage() {
  const { getAllSessions, deleteSession, clearAll } = useSessionHistory();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let ignore = false;
    getAllSessions()
      .then(data => {
        if (ignore) return;
        setSessions(data);
        setLoading(false);
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [getAllSessions]);

  const refresh = async () => {
    const data = await getAllSessions();
    setSessions(data);
  };

  const handleDelete = async (id: number) => {
    await deleteSession(id);
    await refresh();
  };

  const handleClearAll = async () => {
    await clearAll();
    setSessions([]);
    setConfirmClear(false);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[40vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalXP = sessions.reduce((sum, s) => sum + s.totalXP, 0);
  const totalMastered = sessions.reduce((sum, s) => sum + s.masteredWords.length, 0);
  const totalWords = sessions.reduce((sum, s) => sum + s.words.length, 0);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
              <History className="h-5 w-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Session History</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved on this device
              </p>
            </div>
          </div>
          {sessions.length > 0 && (
            <Button
              id="clear-history-btn"
              variant="danger"
              size="sm"
              onClick={() => setConfirmClear(true)}
            >
              Clear All
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          /* Empty state — a next step, not a dead end */
          <Card className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-500/30 bg-teal-500/10">
              <BookOpen className="h-8 w-8 text-teal-500 dark:text-teal-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No sessions yet</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-500 dark:text-gray-400">
              Finish your first quiz and every session report will be saved here automatically.
            </p>
            <Link to="/session" id="history-start-btn" className="mt-6 inline-block">
              <Button size="lg">Start your first session</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Lifetime stats strip */}
            <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { icon: History, label: 'Sessions', value: String(sessions.length) },
                { icon: Zap, label: 'Total XP', value: totalXP.toLocaleString() },
                {
                  icon: CheckCircle2,
                  label: 'Words mastered',
                  value: `${totalMastered}/${totalWords}`,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass rounded-2xl p-3 text-center sm:p-4"
                >
                  <stat.icon className="mx-auto mb-1.5 h-4 w-4 text-teal-500 dark:text-teal-300" />
                  <p className="text-lg font-extrabold tabular-nums text-slate-950 dark:text-white sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Session cards */}
            <div className="space-y-3">
              {sessions.map((s, i) => {
                const xpPct =
                  s.maxPossibleXP > 0
                    ? Math.round((s.totalXP / s.maxPossibleXP) * 100)
                    : 0;
                const masteredCount = s.masteredWords.length;

                return (
                  <motion.div
                    key={s.id ?? i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <Card className="p-4 sm:p-5">
                      {/* Top row: date + level + delete */}
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="badge-teal shrink-0">{s.level}</span>
                          <p className="truncate text-xs font-semibold text-slate-600 dark:text-gray-300">
                            {formatDate(s.date)}
                          </p>
                          {s.durationMinutes > 0 && (
                            <span className="hidden shrink-0 text-xs text-slate-400 dark:text-gray-500 sm:inline">
                              · {s.durationMinutes} min
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => s.id !== undefined && void handleDelete(s.id)}
                          aria-label="Delete session"
                          id={`delete-session-${s.id ?? i}`}
                          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Words chips */}
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {s.words.map(w => (
                          <span
                            key={w}
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                              s.masteredWords.includes(w)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
                            }`}
                          >
                            {w}
                          </span>
                        ))}
                      </div>

                      {/* Bottom row: XP progress */}
                      <ProgressBar
                        value={xpPct}
                        label={`${s.totalXP} XP · ${masteredCount}/${s.words.length} mastered`}
                        color={xpPct >= 80 ? 'emerald' : 'amber'}
                      />
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* Branded confirmation — replaces window.confirm */}
      <ConfirmDialog
        open={confirmClear}
        title="Delete all session history?"
        message="Every saved session, XP record and report will be removed from this device. This cannot be undone."
        confirmLabel="Delete all"
        cancelLabel="Keep them"
        variant="danger"
        onConfirm={() => void handleClearAll()}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
