import { NavLink, useNavigate } from 'react-router-dom';
import { CircleHelp, KeyRound, Settings, History, Tag, Zap } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { MobileMenu } from '@/components/layout/MobileMenu';

export function Navbar() {
  const navigate = useNavigate();
  const phase = useQuizStore(s => s.phase);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-500/25 text-teal-200'
        : 'text-gray-300 hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md bg-white/85 dark:border-white/10 dark:bg-bg-primary/80">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex shrink-0 items-center gap-2 font-bold text-slate-950 hover:text-teal-700 transition-colors dark:text-white dark:hover:text-teal-300"
          id="nav-logo"
        >
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="gradient-text">Kelma</span>
          <span className="hidden md:inline-flex items-center h-4 rounded-full border border-slate-300/70 dark:border-white/15 px-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-gray-500">
            Nagdista
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {phase === 'active' || phase === 'feedback' ? (
            <span className="badge-teal animate-pulse">
              <Zap className="w-3 h-3" />
              Quiz Active
            </span>
          ) : (
            <>
              <nav className="hidden sm:flex items-center gap-0.5 sm:gap-1" aria-label="Main navigation">
                <NavLink to="/session" end className={navLinkClass} id="nav-session" title="New Session">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Session</span>
                </NavLink>
                <NavLink to="/provider" className={navLinkClass} id="nav-provider" title="AI Provider">
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Provider</span>
                </NavLink>
                <NavLink to="/how-to" className={navLinkClass} id="nav-howto" title="How to use">
                  <CircleHelp className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Guide</span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass} id="nav-history" title="History">
                  <History className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">History</span>
                </NavLink>
                <NavLink to="/pricing" className={navLinkClass} id="nav-pricing" title="Pricing">
                  <Tag className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Pricing</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} id="nav-settings" title="Settings">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Settings</span>
                </NavLink>
              </nav>

              {/* Mobile hamburger menu */}
              <MobileMenu>
                <NavLink to="/session" end className={mobileLinkClass} id="m-nav-session">
                  <Zap className="w-4 h-4 text-teal-400" />
                  New Session
                </NavLink>
                <NavLink to="/provider" className={mobileLinkClass} id="m-nav-provider">
                  <KeyRound className="w-4 h-4 text-teal-400" />
                  AI Provider
                </NavLink>
                <NavLink to="/how-to" className={mobileLinkClass} id="m-nav-howto">
                  <CircleHelp className="w-4 h-4 text-teal-400" />
                  How to Use
                </NavLink>
                <NavLink to="/history" className={mobileLinkClass} id="m-nav-history">
                  <History className="w-4 h-4 text-teal-400" />
                  History
                </NavLink>
                <NavLink to="/pricing" className={mobileLinkClass} id="m-nav-pricing">
                  <Tag className="w-4 h-4 text-teal-400" />
                  Pricing
                </NavLink>
                <NavLink to="/settings" className={mobileLinkClass} id="m-nav-settings">
                  <Settings className="w-4 h-4 text-teal-400" />
                  Settings
                </NavLink>
              </MobileMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
