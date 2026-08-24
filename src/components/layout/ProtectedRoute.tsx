import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { NO_KEY_PROVIDERS } from '@/types/index';

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
  const provider = useSettingsStore(s => s.provider);
  const phase = useQuizStore(s => s.phase);

  // No-key providers work with an empty key
  const canUseProvider = Boolean(apiKey) || NO_KEY_PROVIDERS.has(provider);

  if (require === 'apiKey' && !canUseProvider) {
    return <Navigate to={redirectTo ?? '/settings'} replace />;
  }

  if (require === 'activeSession' && phase === 'idle') {
    return <Navigate to={redirectTo ?? '/session'} replace />;
  }

  return <>{children}</>;
}
