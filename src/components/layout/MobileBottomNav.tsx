import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
  isPrimary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/daily', label: 'Daily', icon: Sparkles },
  { path: '/session', label: 'Session', icon: Zap, isPrimary: true },
  { path: '/tutor', label: 'Tutor', icon: MessageSquare },
  { path: '/dashboard', label: 'Stats', icon: LayoutDashboard },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const phase = useQuizStore(s => s.phase);

  // Hide bottom nav during active quiz sessions or focused quiz pages to give 100% screen space
  const isQuizActive = phase === 'active' || phase === 'feedback';
  const isQuizPage = location.pathname.startsWith('/quiz');
  if (isQuizActive || isQuizPage) return null;

  return (
    <nav
      aria-label="Mobile navigation bar"
      className="fixed inset-x-0 bottom-0 z-40 block md:hidden"
    >
      <div className="mx-auto border-t border-slate-200/80 bg-white/95 px-3 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1420]/95">
        <div className="flex items-center justify-around gap-1">
          {NAV_ITEMS.map(item => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            if (item.isPrimary) {
              return (
                <motion.button
                  key={item.path}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    play('click');
                    navigate(item.path);
                  }}
                  className="relative -top-3 flex flex-col items-center justify-center focus:outline-none"
                  aria-label={item.label}
                  id={`mob-nav-${item.label.toLowerCase()}`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-teal-500/40 ring-4 ring-teal-500/20'
                        : 'bg-gradient-to-tr from-teal-500 to-teal-400 text-white shadow-teal-500/30'
                    }`}
                  >
                    <Icon className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-bold tracking-tight ${
                      isActive
                        ? 'text-teal-600 dark:text-teal-300'
                        : 'text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  play('click');
                  navigate(item.path);
                }}
                className={`relative flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 transition-all focus:outline-none ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-label={item.label}
                id={`mob-nav-${item.label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  {isActive && (
                    <motion.div
                      layoutId="activeBottomTabDot"
                      className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal-500 dark:bg-teal-400"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </div>
                <span className={`mt-1 text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
