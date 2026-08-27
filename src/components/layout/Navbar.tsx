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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#0e1420]/95 select-none">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
          {/* Left: Hamburger Menu Trigger + Brand Typography Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Menu Trigger: On mobile opens Drawer, on desktop triggers sidebar toggle */}
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
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 active:scale-95 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
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
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 text-slate-950 transition-transform active:scale-95 dark:text-white cursor-pointer"
              id="nav-logo"
            >
              <span className="font-black text-lg sm:text-xl tracking-tight">
                <span className="gradient-text">K</span>elma
              </span>
              <span className="hidden xs:inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                {defaultLevel}
              </span>
            </button>
          </div>

          {/* Center (Desktop): Fast shortcuts */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/session"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/15 dark:text-teal-300'
                }`
              }
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>New Session</span>
            </NavLink>

            <NavLink
              to="/daily"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5'
                }`
              }
            >
              <span>Daily Word</span>
            </NavLink>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Active Quiz Indicator */}
            {isQuizActive && (
              <NavLink
                to="/quiz"
                className="flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/15 px-2.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-300 animate-pulse"
              >
                <Zap className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">In Quiz</span>
              </NavLink>
            )}

            {/* XP / Streak Pill — hidden on smallest screens to free up space */}
            {(streak > 0 || xp > 0) && (
              <div className="hidden xs:flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-current" />
                  {xp} XP
                </span>
                {streak > 0 && (
                  <>
                    <span className="h-3 w-px bg-amber-500/30" />
                    <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      {streak}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* User Avatar → Settings (circle only, no gear icon alternative) */}
            <NavLink
              to="/settings"
              title={userName ? `${userName}'s Settings` : 'Settings'}
              aria-label="Settings"
              id="nav-settings-avatar"
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 transition-all hover:border-teal-500 active:scale-95 dark:border-white/10 dark:hover:border-teal-500/60 overflow-hidden cursor-pointer"
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
      </header>

      {/* Slide-over Drawer for Mobile */}
      <MobileMenu open={mobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
