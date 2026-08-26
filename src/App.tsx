import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { LandingPage } from '@/pages/LandingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProviderPage } from '@/pages/ProviderPage';
import { LevelPage } from '@/pages/LevelPage';
import { PlacementPage } from '@/pages/PlacementPage';
import { SupportPage } from '@/pages/SupportPage';
import { HowToPage } from '@/pages/HowToPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AboutPage } from '@/pages/AboutPage';
import { HelpPage } from '@/pages/HelpPage';
import { SessionSetupPage } from '@/pages/SessionSetupPage';
import { QuizPage } from '@/pages/QuizPage';
import { SummaryPage } from '@/pages/SummaryPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { useSettingsStore } from '@/store/settingsStore';

function App() {
  const theme = useSettingsStore(s => s.theme);

  // Apply dark mode class on mount and theme change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/provider" element={<ProviderPage />} />
          <Route path="/level" element={<LevelPage />} />
          <Route path="/placement" element={<PlacementPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/how-to" element={<HowToPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* Requires API key */}
          <Route
            path="/session"
            element={
              <ProtectedRoute require="apiKey" redirectTo="/provider">
                <SessionSetupPage />
              </ProtectedRoute>
            }
          />

          {/* Requires active session */}
          <Route
            path="/quiz"
            element={
              <ProtectedRoute require="activeSession" redirectTo="/session">
                <QuizPage />
              </ProtectedRoute>
            }
          />

          {/* Report — accessible as long as words exist in store */}
          <Route path="/report" element={<SummaryPage />} />
          <Route path="/summary" element={<SummaryPage />} />

          {/* 404 → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* Global toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
