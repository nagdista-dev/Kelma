import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh flex flex-col bg-slate-50 text-slate-950 dark:bg-bg-primary dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:text-gray-600 dark:border-white/5">
        Play With Words · AI-powered vocabulary trainer
      </footer>
    </div>
  );
}
