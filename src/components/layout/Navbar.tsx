import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Flame,
  Menu,
  Zap,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useSettingsStore } from '@/store/settingsStore';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface NavbarProps {
  onToggleDesktopSidebar?: () => void;
}

export function Navbar({ onToggleDesktopSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const phase = useQuizStore(s => s.phase);
  const streak = useQuizStore(s => s.streak);
  const xp = useQuizStore(s => s.xp);
  const { defaultLevel, userName } = useSettingsStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);


  const isQuizActive = phase === 'active' || phase === 'feedback';

  const initial = userName.trim() ? userName.trim().charAt(0).toUpperCase() : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full select-none bg-white/90 backdrop-blur-xl transition-colors dark:bg-[#0e1420]/92">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
          {/* Left: Menu Trigger + Brand Wordmark */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                play('click');
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(true);
                } else if (onToggleDesktopSidebar) {
                  onToggleDesktopSidebar();
                } else {
                  setMobileMenuOpen(true);
                }
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 sm:h-9 sm:w-9 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Toggle navigation menu"
              id="global-menu-btn"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <button
              onClick={() => {
                play('click');
                navigate('/');
              }}
              className="flex shrink-0 cursor-pointer items-baseline gap-2 transition-transform active:scale-95"
              id="nav-logo"
            >
              <span className="text-lg font-black uppercase tracking-[0.06em] text-slate-950 sm:text-xl dark:text-white">
                Kelma<span aria-hidden="true" className="ml-[3px] inline-block h-[7px] w-[7px] rounded-[2px] bg-amber-400 align-super" />
              </span>
              <span className="hidden rounded border border-teal-500/30 bg-teal-500/[0.08] px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider text-teal-600 xs:inline-flex dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-300">
                {defaultLevel}
              </span>
            </button>
          </div>

          {/* Center (Desktop): Fast shortcuts */}
          <nav aria-label="Quick navigation" className="hidden items-center gap-7 md:flex">
            <NavLink
              to="/session"
              className={({ isActive }) =>
                `relative flex h-14 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Zap className={`h-3.5 w-3.5 ${isActive ? 'fill-current' : ''}`} />
                  <span>Session</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[2px] rounded-t-full bg-amber-400 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink
              to="/daily"
              className={({ isActive }) =>
                `relative flex h-14 items-center text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Daily Word</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[2px] rounded-t-full bg-amber-400 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Active Quiz Indicator */}
            {isQuizActive && (
              <NavLink
                to="/quiz"
                className="flex animate-pulse items-center gap-1.5 rounded-lg border border-dashed border-teal-500/50 bg-teal-500/[0.08] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300"
              >
                <Zap className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">In Quiz</span>
              </NavLink>
            )}

            {/* XP / Streak Pill — hidden on smallest screens to free up space */}
            {(streak > 0 || xp > 0) && (
              <div className="hidden items-center divide-x divide-amber-500/30 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] xs:flex">
                <span className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <Zap className="h-3 w-3 fill-current" />
                  {xp} XP
                </span>
                {streak > 0 && (
                  <span className="flex items-center gap-0.5 px-2 py-1 font-mono text-[10px] font-bold text-orange-600 dark:text-orange-400">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    {streak}
                  </span>
                )}
              </div>
            )}

            {/* User Avatar → Settings (circle only, no gear icon alternative) */}
            <NavLink
              to="/settings"
              title={userName ? `${userName}'s Settings` : 'Settings'}
              aria-label="Settings"
              id="nav-settings-avatar"
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg ring-1 ring-slate-200 transition-transform hover:scale-105 active:scale-95 sm:h-9 sm:w-9 dark:ring-white/15"
            >
              {initial ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-400 text-white">
                  <span className="text-sm font-black">{initial}</span>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-white/10">
                  <span className="text-sm font-black text-slate-500 dark:text-gray-400">?</span>
                </div>
              )}
            </NavLink>
          </div>
        </div>

        {/* Signature gradient hairline */}
        <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
      </header>

      {/* Slide-over Drawer for Mobile */}
      <MobileMenu open={mobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
