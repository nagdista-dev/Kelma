import { NavLink, useNavigate } from 'react-router-dom';
import { CircleHelp, KeyRound, Settings, History, Tag, Zap } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { InstallButton } from '@/components/layout/InstallButton';
import { MobileMenu } from '@/components/layout/MobileMenu';

export function Navbar() {
  const navigate = useNavigate();
  const phase = useQuizStore(s => s.phase);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md bg-white/85 dark:border-white/10 dark:bg-bg-primary/80">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-slate-950 hover:text-teal-700 transition-colors dark:text-white dark:hover:text-teal-300"
          id="nav-logo"
        >
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="gradient-text">Kelma</span>
          <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-500">
            by Nagdista
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="flex items-center gap-1">
          <InstallButton />
          {phase === 'active' || phase === 'feedback' ? (
            <span className="badge-teal animate-pulse">
              <Zap className="w-3 h-3" />
              Quiz Active
            </span>
          ) : (
            <>
              <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
                <NavLink to="/session" className={navLinkClass} id="nav-session" title="New Session">
                  <Zap className="w-4 h-4" />
                  <span className="hidden lg:inline">Session</span>
                </NavLink>
                <NavLink to="/provider" className={navLinkClass} id="nav-provider" title="AI Provider">
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden lg:inline">Provider</span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass} id="nav-history" title="History">
                  <History className="w-4 h-4" />
                  <span className="hidden lg:inline">History</span>
                </NavLink>
                <NavLink to="/pricing" className={navLinkClass} id="nav-pricing" title="Pricing">
                  <Tag className="w-4 h-4" />
                  <span className="hidden lg:inline">Pricing</span>
                </NavLink>
                <NavLink to="/help" className={navLinkClass} id="nav-help" title="Help">
                  <CircleHelp className="w-4 h-4" />
                  <span className="hidden lg:inline">Help</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} id="nav-settings" title="Settings">
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Settings</span>
                </NavLink>
              </nav>

              {/* Mobile hamburger menu */}
              <MobileMenu>
                <NavLink to="/session" end className={mobileLinkClass} id="m-nav-session">
                  <Zap className="w-4 h-4 text-teal-500" />
                  New Session
                </NavLink>
                <NavLink to="/provider" className={mobileLinkClass} id="m-nav-provider">
                  <KeyRound className="w-4 h-4 text-teal-500" />
                  AI Provider
                </NavLink>
                <NavLink to="/history" className={mobileLinkClass} id="m-nav-history">
                  <History className="w-4 h-4 text-teal-500" />
                  History
                </NavLink>
                <NavLink to="/pricing" className={mobileLinkClass} id="m-nav-pricing">
                  <Tag className="w-4 h-4 text-teal-500" />
                  Pricing
                </NavLink>
                <NavLink to="/help" className={mobileLinkClass} id="m-nav-help">
                  <CircleHelp className="w-4 h-4 text-teal-500" />
                  Help
                </NavLink>
                <NavLink to="/settings" className={mobileLinkClass} id="m-nav-settings">
                  <Settings className="w-4 h-4 text-teal-500" />
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
