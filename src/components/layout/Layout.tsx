import { useState, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { ResumeQuizButton } from './ResumeQuizButton';
import { InstallButton } from './InstallButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-svh flex flex-col bg-slate-50 text-slate-950 dark:bg-bg-primary dark:text-white antialiased selection:bg-teal-500 selection:text-white">
      {/* Top YouTube-style Full-width Navbar */}
      <Navbar onToggleDesktopSidebar={() => setSidebarCollapsed(prev => !prev)} />

      {/* Body Frame: Persistent Desktop Sidebar + Content Canvas */}
      <div className="flex-1 flex min-w-0">
        <DesktopSidebar collapsed={sidebarCollapsed} />

        <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-16 lg:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile-only Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Floating Resumption CTA */}
      <ResumeQuizButton />

      {/* PWA Install Button */}
      <InstallButton />
    </div>
  );
}
