import { NavLink, useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  LayoutDashboard,
  Settings,
  History,
  Zap,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/** Titled group of links inside the mobile menu */
function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500">
        {label}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
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
        ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/25 dark:text-teal-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md bg-white/85 dark:border-white/10 dark:bg-bg-primary/80">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => { play('click'); navigate('/'); }}
          className="flex shrink-0 items-center gap-2 font-bold text-slate-950 hover:text-teal-700 transition-colors dark:text-white dark:hover:text-teal-300"
          id="nav-logo"
        >
          <span className="text-slate-950 dark:text-white">
            <span className="gradient-text">K</span>elma
          </span>
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
                <NavLink to="/level" className={navLinkClass} id="nav-level" title="Your level">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Level</span>
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass} id="nav-dashboard" title="Dashboard">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Stats</span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass} id="nav-history" title="History">
                  <History className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">History</span>
                </NavLink>
                <NavLink to="/how-to" className={navLinkClass} id="nav-howto" title="How to use">
                  <CircleHelp className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Guide</span>
                </NavLink>
                <NavLink to="/support" className={navLinkClass} id="nav-support" title="Support">
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Support</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} id="nav-settings" title="Settings">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">Settings</span>
                </NavLink>
              </nav>

              {/* Mobile hamburger menu — grouped by purpose */}
              <MobileMenu>
                <MenuSection label="Learn">
                  <NavLink to="/session" end className={mobileLinkClass} id="m-nav-session">
                    <Zap className="w-4 h-4 text-teal-400" />
                    New Session
                  </NavLink>
                  <NavLink to="/level" className={mobileLinkClass} id="m-nav-level">
                    <GraduationCap className="w-4 h-4 text-teal-400" />
                    Your Level
                  </NavLink>
                  <NavLink to="/dashboard" className={mobileLinkClass} id="m-nav-dashboard">
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/history" className={mobileLinkClass} id="m-nav-history">
                    <History className="w-4 h-4 text-teal-400" />
                    History
                  </NavLink>
                </MenuSection>

                <MenuSection label="Setup">
                  <NavLink to="/provider" className={mobileLinkClass} id="m-nav-provider">
                    <KeyRound className="w-4 h-4 text-teal-400" />
                    AI Provider
                  </NavLink>
                  <NavLink to="/settings" className={mobileLinkClass} id="m-nav-settings">
                    <Settings className="w-4 h-4 text-teal-400" />
                    Settings
                  </NavLink>
                </MenuSection>

                <MenuSection label="More">
                  <NavLink to="/how-to" className={mobileLinkClass} id="m-nav-howto">
                    <CircleHelp className="w-4 h-4 text-teal-400" />
                    How to Use
                  </NavLink>
                  <NavLink to="/support" className={mobileLinkClass} id="m-nav-support">
                    <HeartHandshake className="w-4 h-4 text-teal-400" />
                    Support
                  </NavLink>
                </MenuSection>
              </MobileMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
