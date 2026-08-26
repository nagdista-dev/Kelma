import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
  children: React.ReactNode;
}

/**
 * Hamburger menu for small screens — a full-screen blurred layer
 * below the navbar containing `children` (nav links).
 * Portaled to <body> so navbar effects never affect positioning.
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

      {/* Full-screen menu — portaled to body */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label="Mobile navigation"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 flex flex-col gap-1 overflow-y-auto bg-white/92 p-4 backdrop-blur-lg dark:bg-slate-950/85"
              style={{ top: '56px' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
