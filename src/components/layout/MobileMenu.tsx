import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  X,
  Zap,
} from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  title: string;
  subtitle: string;
  icon: typeof Zap;
  color: string;
  badge?: string;
  badgeColor?: string;
  category: 'core' | 'labs' | 'progress' | 'system';
}

interface MenuSection {
  id: 'core' | 'labs' | 'progress' | 'system';
  number: string;
  title: string;
  tag: string;
  badgeColor: string;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'core',
    number: '01',
    title: 'Core Practice',
    tag: 'Active Recall',
    badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  },
  {
    id: 'labs',
    number: '02',
    title: 'AI Practice Labs',
    tag: 'Interactive',
    badgeColor: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  {
    id: 'progress',
    number: '03',
    title: 'Progress & Analytics',
    tag: 'Performance',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  {
    id: 'system',
    number: '04',
    title: 'System & Guide',
    tag: 'Preferences',
    badgeColor: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300',
  },
];

const ALL_MENU_ITEMS: MenuItem[] = [
  // ─── 1. Core Practice ───
  {
    path: '/',
    title: 'Home',
    subtitle: 'Overview & quick launch',
    icon: Home,
    color: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',
    category: 'core',
  },
  {
    path: '/session',
    title: 'New Gauntlet Session',
    subtitle: '6-round cognitive active recall',
    icon: Zap,
    color: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
    category: 'core',
  },
  {
    path: '/daily',
    title: 'Daily Word',
    subtitle: 'Curated daily vocabulary & drills',
    icon: Sparkles,
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    category: 'core',
  },
  {
    path: '/story',
    title: 'Story Immersion Lab',
    subtitle: 'Contextual reading & audio stories',
    icon: BookOpen,
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    category: 'core',
  },

  // ─── 2. AI Interactive Labs ───
  {
    path: '/tutor',
    title: 'AI English Tutor',
    subtitle: 'Interactive conversational mentor',
    icon: MessageSquare,
    color: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
    category: 'labs',
  },
  {
    path: '/voice-chat',
    title: 'Live Voice Chat',
    subtitle: 'Real-time spoken audio conversation',
    icon: Speech,
    color: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    category: 'labs',
  },
  {
    path: '/pronounce',
    title: 'Pronunciation Lab',
    subtitle: 'Phonetic IPA & syllable stress',
    icon: Mic,
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    category: 'labs',
  },
  {
    path: '/confusables',
    title: 'Confusable Words',
    subtitle: 'Master tricky word pairs & homophones',
    icon: Layers,
    color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    category: 'labs',
  },

  // ─── 3. Progress & Performance ───
  {
    path: '/level',
    title: 'Proficiency & Level Test',
    subtitle: 'CEFR diagnostic assessment',
    icon: GraduationCap,
    color: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
    category: 'progress',
  },
  {
    path: '/dashboard',
    title: 'Analytics & Weak Words',
    subtitle: 'Retention velocity & XP charts',
    icon: LayoutDashboard,
    color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    category: 'progress',
  },
  {
    path: '/history',
    title: 'Session History',
    subtitle: 'Past drill records & review log',
    icon: History,
    color: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    category: 'progress',
  },

  // ─── 4. System & Help ───
  {
    path: '/provider',
    title: 'AI Provider & Keys',
    subtitle: 'Configure Gemini, Groq, OpenAI...',
    icon: KeyRound,
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    category: 'system',
  },
  {
    path: '/settings',
    title: 'App Settings',
    subtitle: 'Audio speech, theme & preferences',
    icon: Settings,
    color: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    category: 'system',
  },
  {
    path: '/how-to',
    title: 'How to Use',
    subtitle: '6-round system guide & tutorials',
    icon: CircleHelp,
    color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    category: 'system',
  },
  {
    path: '/about',
    title: 'About Kelma',
    subtitle: 'Pedagogy, mission & creator',
    icon: Info,
    color: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
    category: 'system',
  },
  {
    path: '/support',
    title: 'Help & Feedback',
    subtitle: 'Get support or suggest features',
    icon: HeartHandshake,
    color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    category: 'system',
  },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const location = useLocation();
  const { play } = useSoundEffects();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isExact = item.path === '/';
    const isActive = isExact
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => {
          play('click');
          handleClose();
        }}
        className={`group flex items-center justify-between rounded-2xl p-3 transition-all ${
          isActive
            ? 'bg-teal-500/15 border border-teal-500/30 text-teal-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/30'
            : 'border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5'
        }`}
        id={`m-nav-${item.path.replace('/', '') || 'home'}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${item.color}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {item.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
              {item.subtitle}
            </p>
          </div>
        </div>

      </NavLink>
    );
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-start">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              play('click');
              handleClose();
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 flex h-full w-full max-w-sm sm:max-w-md flex-col bg-white shadow-2xl dark:bg-[#0b1120] border-r border-slate-200/80 dark:border-white/10"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* ─── Drawer Header ─── */}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  <span className="gradient-text">K</span>elma
                </span>
                <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  Navigation
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  play('click');
                  handleClose();
                }}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ─── Scrollable Menu Sections ─── */}
            <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5 custom-scrollbar">
              {MENU_SECTIONS.map(sec => {
                const items = ALL_MENU_ITEMS.filter(i => i.category === sec.id);
                return (
                  <div key={sec.id} className="space-y-2">
                    {/* Modern High-End Category Header */}
                    <div className="flex items-center justify-between px-2 pt-1 pb-1.5 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-black text-slate-600 dark:text-gray-300">
                          {sec.number}
                        </span>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          {sec.title}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${sec.badgeColor}`}
                      >
                        {sec.tag}
                      </span>
                    </div>

                    {/* Section Items */}
                    <div className="space-y-1 pt-1">
                      {items.map(renderItem)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
