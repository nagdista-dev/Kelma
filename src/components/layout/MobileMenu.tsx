import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
  children: React.ReactNode;
}

/**
 * Hamburger menu for small screens. Renders a trigger button and a
 * dropdown panel below the navbar containing `children` (nav links).
 */
export function MobileMenu({ children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  // Close whenever the route changes (parent re-renders with new location)
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        id="mobile-menu-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-14 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              aria-label="Mobile navigation"
              onClick={() => setOpen(false)}
              className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0f172a]"
            >
              <div className="flex flex-col gap-1">{children}</div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
