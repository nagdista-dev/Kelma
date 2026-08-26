import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, History, Trash2, BookOpen, Zap } from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import type { SessionRecord } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function HistoryPage() {
  const { getAllSessions, deleteSession, clearAll } = useSessionHistory();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getAllSessions();
    setSessions(data);
    setLoading(false);
  };

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

  const handleDelete = async (id: number) => {
    await deleteSession(id);
    await load();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all session history?')) return;
    await clearAll();
    setSessions([]);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[40vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
              <History className="h-5 w-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Session History</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">{sessions.length} session{sessions.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
          {sessions.length > 0 && (
            <Button
              id="clear-history-btn"
              variant="danger"
              size="sm"
              onClick={() => void handleClearAll()}
            >
              Clear All
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-gray-500">No sessions yet. Start your first quiz!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, i) => {
              const xpPct = s.maxPossibleXP > 0
                ? Math.round((s.totalXP / s.maxPossibleXP) * 100)
                : 0;
              const dateStr = new Date(s.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              });

              return (
                <motion.div
                  key={s.id ?? i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Date + level */}
                    <div className="shrink-0">
                      <p className="text-xs text-slate-500 dark:text-gray-500">{dateStr}</p>
                      <span className="badge-teal mt-1">{s.level}</span>
                    </div>

                    {/* Words */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.words.map(w => (
                          <span
                            key={w}
                            className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                              s.masteredWords.includes(w)
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300'
                                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300'
                            }`}
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {s.totalXP} XP ({xpPct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
                          {s.masteredWords.length}/{s.words.length}
                        </span>
                        {s.durationMinutes > 0 && (
                          <span>~{s.durationMinutes} min</span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => s.id !== undefined && void handleDelete(s.id)}
                      aria-label="Delete session"
                      id={`delete-session-${s.id ?? i}`}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0 dark:text-gray-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
