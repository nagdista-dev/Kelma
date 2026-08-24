import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ResumeQuizButton } from './ResumeQuizButton';

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
      <ResumeQuizButton />
    </div>
  );
}
