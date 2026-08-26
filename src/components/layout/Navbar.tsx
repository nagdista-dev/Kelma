import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CircleHelp,
  GraduationCap,
  HeartHandshake,
  History,
  KeyRound,
  Layers,
  LayoutDashboard,
  Mic,
  MessageCircle,
  Settings,
  Sparkles,
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
    `flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
      isActive
        ? 'bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/30'
        : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100 dark:text-gray-300 dark:hover:bg-white/5 dark:active:bg-white/10'
    }`;

  const mobileIconClass = (isActive: boolean) =>
    `h-4 w-4 shrink-0 ${isActive ? 'text-teal-500 dark:text-teal-300' : 'text-slate-400 dark:text-gray-500'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 backdrop-blur-xl bg-white/90 dark:border-white/10 dark:bg-[#0e1420]/85">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
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

        {/* Right side: desktop nav + mobile hamburger */}
        <div className="flex items-center gap-1">
          {phase === 'active' || phase === 'feedback' ? (
            <span className="badge-teal animate-pulse">
              <Zap className="w-3 h-3" />
              Quiz Active
            </span>
          ) : (
            <>
              {/* ─── Desktop: icons on md, icons+text on lg ─── */}
              <nav className="hidden sm:flex items-center gap-0.5" aria-label="Main navigation">
                <NavLink to="/wotd" className={navLinkClass} id="nav-wotd" title="Word of the Day">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Word</span>
                </NavLink>
                <NavLink to="/session" end className={navLinkClass} id="nav-session" title="New Session">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Session</span>
                </NavLink>
                <NavLink to="/story" className={navLinkClass} id="nav-story" title="Story Mode">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Story</span>
                </NavLink>
                <NavLink to="/pronounce" className={navLinkClass} id="nav-pronounce" title="Pronunciation">
                  <Mic className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Pronounce</span>
                </NavLink>
                <NavLink to="/confusables" className={navLinkClass} id="nav-confusables" title="Confusables">
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Confusables</span>
                </NavLink>
                <NavLink to="/voice-chat" className={navLinkClass} id="nav-voicechat" title="Voice Chat">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Chat</span>
                </NavLink>

                <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" aria-hidden />

                <NavLink to="/level" className={navLinkClass} id="nav-level" title="Your Level">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Level</span>
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass} id="nav-dashboard" title="Dashboard">
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Stats</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} id="nav-settings" title="Settings">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Settings</span>
                </NavLink>
              </nav>

              {/* ─── Mobile: hamburger menu ─── */}
              <MobileMenu>
                <MenuSection label="Learn">
                  <NavLink to="/wotd" className={mobileLinkClass} id="m-nav-wotd">
                    <Sparkles className={mobileIconClass(false)} />
                    Word of the Day
                  </NavLink>
                  <NavLink to="/session" end className={mobileLinkClass} id="m-nav-session">
                    <Zap className={mobileIconClass(false)} />
                    New Session
                  </NavLink>
                  <NavLink to="/story" className={mobileLinkClass} id="m-nav-story">
                    <BookOpen className={mobileIconClass(false)} />
                    Story Mode
                  </NavLink>
                </MenuSection>

                <MenuSection label="Practice">
                  <NavLink to="/pronounce" className={mobileLinkClass} id="m-nav-pronounce">
                    <Mic className={mobileIconClass(false)} />
                    Pronunciation Lab
                  </NavLink>
                  <NavLink to="/confusables" className={mobileLinkClass} id="m-nav-confusables">
                    <Layers className={mobileIconClass(false)} />
                    Confusable Words
                  </NavLink>
                  <NavLink to="/voice-chat" className={mobileLinkClass} id="m-nav-voicechat">
                    <MessageCircle className={mobileIconClass(false)} />
                    Voice Chat
                  </NavLink>
                </MenuSection>

                <MenuSection label="Progress">
                  <NavLink to="/level" className={mobileLinkClass} id="m-nav-level">
                    <GraduationCap className={mobileIconClass(false)} />
                    Your Level
                  </NavLink>
                  <NavLink to="/dashboard" className={mobileLinkClass} id="m-nav-dashboard">
                    <LayoutDashboard className={mobileIconClass(false)} />
                    Dashboard
                  </NavLink>
                  <NavLink to="/history" className={mobileLinkClass} id="m-nav-history">
                    <History className={mobileIconClass(false)} />
                    History
                  </NavLink>
                </MenuSection>

                <MenuSection label="Setup">
                  <NavLink to="/provider" className={mobileLinkClass} id="m-nav-provider">
                    <KeyRound className={mobileIconClass(false)} />
                    AI Provider
                  </NavLink>
                  <NavLink to="/settings" className={mobileLinkClass} id="m-nav-settings">
                    <Settings className={mobileIconClass(false)} />
                    Settings
                  </NavLink>
                </MenuSection>

                <MenuSection label="Help">
                  <NavLink to="/how-to" className={mobileLinkClass} id="m-nav-howto">
                    <CircleHelp className={mobileIconClass(false)} />
                    How to Use
                  </NavLink>
                  <NavLink to="/support" className={mobileLinkClass} id="m-nav-support">
                    <HeartHandshake className={mobileIconClass(false)} />
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
