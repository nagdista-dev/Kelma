import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  CircleHelp,
  GraduationCap,
  HeartHandshake,
  History,
  Home,
  Info,
  KeyRound,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  Speech,
  Zap,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { PROVIDER_LABELS } from '@/types/index';

interface NavSection {
  number: string;
  title: string;
  tag: string;
  badgeColor: string;
  items: {
    path: string;
    label: string;
    icon: typeof Zap;
    badge?: string;
    badgeColor?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    number: '01',
    title: 'Core Practice',
    tag: 'Core',
    badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
    items: [
      { path: '/', label: 'Home', icon: Home },
      { path: '/session', label: 'New Session', icon: Zap },
      { path: '/daily', label: 'Daily Word', icon: Sparkles },
      { path: '/story', label: 'Story Mode', icon: BookOpen },
    ],
  },
  {
    number: '02',
    title: 'AI Practice Labs',
    tag: 'Labs',
    badgeColor: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    items: [
      { path: '/tutor', label: 'AI English Tutor', icon: MessageSquare },
      { path: '/voice-chat', label: 'Voice Chat', icon: Speech },
      { path: '/pronounce', label: 'Pronunciation Lab', icon: Mic },
      { path: '/confusables', label: 'Confusable Words', icon: Layers },
    ],
  },
  {
    number: '03',
    title: 'Progress & Mastery',
    tag: 'Stats',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    items: [
      { path: '/level', label: 'Your Level & Test', icon: GraduationCap },
      { path: '/dashboard', label: 'Dashboard & Stats', icon: LayoutDashboard },
      { path: '/history', label: 'Session History', icon: History },
    ],
  },
  {
    number: '04',
    title: 'System & Guide',
    tag: 'Help',
    badgeColor: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300',
    items: [
      { path: '/provider', label: 'AI Provider & Keys', icon: KeyRound },
      { path: '/settings', label: 'App Settings', icon: Settings },
      { path: '/how-to', label: 'How to Use', icon: CircleHelp },
      { path: '/about', label: 'About Kelma', icon: Info },
      { path: '/support', label: 'Support & Feedback', icon: HeartHandshake },
    ],
  },
];

interface DesktopSidebarProps {
  collapsed?: boolean;
}

export function DesktopSidebar({ collapsed = false }: DesktopSidebarProps) {
  const location = useLocation();
  const { defaultLevel, provider } = useSettingsStore();
  const phase = useQuizStore(s => s.phase);
  const { play } = useSoundEffects();

  if (collapsed) {
    // Compact YouTube-style Mini Sidebar
    return (
      <aside
        className="hidden lg:flex flex-col w-18 shrink-0 border-r border-slate-200/90 bg-white/95 dark:border-white/10 dark:bg-[#0b1120]/95 backdrop-blur-xl sticky top-14 h-[calc(100vh-3.5rem)] z-30 select-none py-3 items-center justify-between"
        aria-label="Compact Navigation Sidebar"
      >
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {NAV_SECTIONS.flatMap(s => s.items).slice(0, 7).map(item => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => play('click')}
                title={item.label}
                className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5 mb-1 shrink-0" />
                <span className="truncate max-w-[56px] text-center leading-tight">{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    );
  }

  // Full Expanded Sidebar
  return (
    <aside
      className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 border-r border-slate-200/90 bg-white/95 dark:border-white/10 dark:bg-[#0b1120]/95 backdrop-blur-xl sticky top-14 h-[calc(100vh-3.5rem)] z-30 select-none"
      aria-label="Desktop Navigation Sidebar"
    >
      {/* ─── Scrollable Navigation Pillars ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* Active Quiz Card (If in progress) */}
        {(phase === 'active' || phase === 'feedback') && (
          <NavLink
            to="/quiz"
            onClick={() => play('click')}
            className="flex items-center justify-between rounded-2xl border border-teal-500/40 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 p-3 shadow-md shadow-teal-500/10 animate-pulse"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500 text-white">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div>
                <p className="text-xs font-black text-teal-900 dark:text-teal-200">Session in Progress</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-300">Resume your gauntlet →</p>
              </div>
            </div>
          </NavLink>
        )}

        {/* Navigation Sections */}
        {NAV_SECTIONS.map(section => (
          <div key={section.title} className="space-y-1.5">
            {/* Modern Section Header Pill */}
            <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-100 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-gray-400">
                  {section.number}
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {section.title}
                </p>
              </div>

              <span
                className={`rounded-md border px-1.5 py-0.2 text-[8px] font-bold ${section.badgeColor}`}
              >
                {section.tag}
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => play('click')}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-800 border border-teal-500/30 shadow-xs dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/30'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-teal-600 dark:text-teal-300'
                            : 'text-slate-400 dark:text-gray-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Learner Status Footer ─── */}
      <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-black/20 space-y-2">
        <NavLink
          to="/level"
          onClick={() => play('click')}
          className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-300 transition-colors"
        >
          <span className="text-[11px] text-slate-400 dark:text-gray-500">Target Level:</span>
          <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-black">
            {defaultLevel}
          </span>
        </NavLink>

        <NavLink
          to="/provider"
          onClick={() => play('click')}
          className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-teal-600 dark:text-gray-500 dark:hover:text-teal-300 transition-colors"
        >
          <span className="truncate">AI: {PROVIDER_LABELS[provider] ?? provider}</span>
          <span className="text-[10px] font-bold underline">Change</span>
        </NavLink>
      </div>
    </aside>
  );
}
