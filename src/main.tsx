import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function InstallPromptRegistrar() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Expose the captured event so the in-app Install button can use it
  useEffect(() => {
    if (deferred) {
      (window as unknown as Record<string, unknown>).__pwwInstallPrompt = deferred;
      window.dispatchEvent(new CustomEvent('pww-install-available'));
    }
  }, [deferred]);

  return null;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <ServiceWorkerRegistrar />
    <InstallPromptRegistrar />
    <App />
  </StrictMode>,
)
