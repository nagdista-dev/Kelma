import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Flame,
  LayoutDashboard,
  Plus,
  Target,
  Zap,
} from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SessionRecord } from '@/types/index';

export function DashboardPage() {
  const { getAllSessions } = useSessionHistory();
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null);

  useEffect(() => {
    void getAllSessions().then(setSessions);
  }, [getAllSessions]);

  const stats = (() => {
    if (!sessions) return null;
    const totalXP = sessions.reduce((s, x) => s + x.totalXP, 0);
    const maxXP = sessions.reduce((s, x) => s + x.maxPossibleXP, 0);
    const mastered = sessions.reduce((s, x) => s + x.masteredWords.length, 0);
    const minutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
    const accuracy = maxXP > 0 ? Math.round((totalXP / maxXP) * 100) : 0;
    return { count: sessions.length, totalXP, mastered, minutes, accuracy };
  })();

  const recent = (sessions ?? []).slice(0, 8).reverse();
  const peak = Math.max(1, ...recent.map(s => Math.round((s.totalXP / Math.max(1, s.maxPossibleXP)) * 100)));

  if (sessions && sessions.length === 0) {
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-500/30 bg-teal-500/10">
          <LayoutDashboard className="h-8 w-8 text-teal-300" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your dashboard awaits</h1>
        <p className="mt-2 max-w-xs text-sm text-gray-400">
          Complete your first session and your learning stats will light up here.
        </p>
        <Link to="/session" id="dashboard-start-btn">
          <Button className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            Start a Session
          </Button>
        </Link>
      </div>
    );
  }

  const cards = stats && [
    { icon: Zap, label: 'Total XP', value: stats.totalXP.toLocaleString(), color: 'text-amber-400' },
    { icon: BookOpen, label: 'Words Mastered', value: String(stats.mastered), color: 'text-emerald-400' },
    { icon: Target, label: 'Overall Accuracy', value: `${stats.accuracy}%`, color: 'text-teal-300' },
    { icon: Flame, label: 'Learning Time', value: `${stats.minutes}m`, color: 'text-orange-400' },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <LayoutDashboard className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">Dashboard</h1>
            <p className="text-xs text-gray-400 sm:text-sm">
              {stats?.count ?? 0} session{stats?.count !== 1 ? 's' : ''} on record
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
          {(cards ?? []).map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-4"
            >
              <c.icon className={`mb-2 h-5 w-5 ${c.color}`} />
              <p className={`text-xl font-extrabold ${c.color}`}>{c.value}</p>
              <p className="mt-0.5 text-[11px] text-gray-500">{c.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress chart */}
        <Card className="mb-8">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400">Session Performance</h2>
          <div className="flex h-40 items-end justify-between gap-2 sm:gap-3">
            {recent.map((s, i) => {
              const pct = Math.round((s.totalXP / Math.max(1, s.maxPossibleXP)) * 100);
              const d = new Date(s.date);
              return (
                <motion.div
                  key={s.id ?? i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, (pct / peak) * 100)}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                  className="group relative flex-1 rounded-t-lg bg-gradient-to-t from-teal-700 to-teal-400"
                  title={`${pct}% · ${d.toLocaleDateString()}`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-teal-300 opacity-0 transition-opacity group-hover:opacity-100">
                    {pct}%
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2 text-[9px] text-gray-600">
            {recent.map((s, i) => (
              <span key={s.id ?? i} className="flex-1 text-center">
                {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </Card>

        {/* Recent list */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">Recent Sessions</h2>
          <div className="space-y-2">
            {(sessions ?? []).slice(0, 6).map(s => {
              const pct = Math.round((s.totalXP / Math.max(1, s.maxPossibleXP)) * 100);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-200">
                      {s.words.slice(0, 5).join(', ')}
                      {s.words.length > 5 && ` +${s.words.length - 5}`}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(s.date).toLocaleDateString()} · {s.durationMinutes} min · {s.level}
                    </p>
                  </div>
                  <span className="badge-teal shrink-0 text-[10px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
