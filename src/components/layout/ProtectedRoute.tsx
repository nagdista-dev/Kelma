import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';

interface ProtectedRouteProps {
  children: ReactNode;
  require?: 'apiKey' | 'activeSession';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  require,
  redirectTo,
}: ProtectedRouteProps) {
  const apiKey = useSettingsStore(s => s.apiKey);
  const phase = useQuizStore(s => s.phase);

  if (require === 'apiKey' && !apiKey) {
    return <Navigate to={redirectTo ?? '/settings'} replace />;
  }

  if (require === 'activeSession' && phase === 'idle') {
    return <Navigate to={redirectTo ?? '/session'} replace />;
  }

  return <>{children}</>;
}
