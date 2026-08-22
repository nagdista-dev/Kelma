import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, CircleHelp, Settings, History, Zap } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { InstallButton } from '@/components/layout/InstallButton';

export function Navbar() {
  const navigate = useNavigate();
  const phase = useQuizStore(s => s.phase);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30'
        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md bg-white/85 dark:border-white/10 dark:bg-bg-primary/80">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-slate-950 hover:text-violet-700 transition-colors dark:text-white dark:hover:text-violet-300"
          id="nav-logo"
        >
          <BookOpen className="w-5 h-5 text-violet-400" />
          <span className="gradient-text">Play With Words</span>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <InstallButton />
          {phase === 'active' || phase === 'feedback' ? (
            <span className="badge-violet animate-pulse">
              <Zap className="w-3 h-3" />
              Quiz Active
            </span>
          ) : (
            <>
              <NavLink to="/session" className={navLinkClass} id="nav-session">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">New Session</span>
              </NavLink>
              <NavLink to="/history" className={navLinkClass} id="nav-history">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </NavLink>
              <NavLink to="/help" className={navLinkClass} id="nav-help">
                <CircleHelp className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </NavLink>
              <NavLink to="/settings" className={navLinkClass} id="nav-settings">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
