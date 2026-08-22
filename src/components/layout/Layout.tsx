import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const FOOTER_LINKS: { to: string; label: string }[] = [
  { to: '/how-to', label: 'How to Use' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh flex flex-col bg-slate-50 text-slate-950 dark:bg-bg-primary dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t border-slate-200 py-8 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" className="h-6 w-6" />
              <div className="text-left">
                <p className="text-sm font-bold gradient-text">Kelma</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">by Nagdista</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
              {FOOTER_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-teal-600 dark:text-gray-500 dark:hover:text-teal-300"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <a
              href="https://github.com/nagdista-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-teal-500 transition-colors hover:text-teal-300 dark:text-teal-400"
            >
              GitHub ↗
            </a>
          </div>

          <p className="mt-6 text-center text-[11px] italic text-gray-500 dark:text-gray-600">
            Keep Learning, Keep Building — © {new Date().getFullYear()} Nagdista
          </p>
        </div>
      </footer>
    </div>
  );
}
