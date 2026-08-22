import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
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

  // Expose the captured event so the in-app Install popup can use it
  useEffect(() => {
    if (deferred) {
      (window as unknown as Record<string, unknown>).__pwwInstallPrompt = deferred;
      window.dispatchEvent(new CustomEvent('pww-install-available'));
    }
  }, [deferred]);

  return null;
}

/**
 * Detects a newly deployed service worker version and offers a one-tap
 * "Update" pill. Tapping activates the waiting worker and reloads.
 */
function UpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.register('/sw.js').then(reg => {
      // A worker may already be waiting on repeat visits
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(next);
          }
        });
      });

      // Poll for new deployments once per hour while the app is open
      window.setInterval(() => void reg.update().catch(() => {}), 60 * 60 * 1000);
    }).catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    setReloading(true);
    waiting?.postMessage({ type: 'SKIP_WAITING' });
    // Fallback reload in case controllerchange is slow
    window.setTimeout(() => window.location.reload(), 1200);
  };

  return createPortal(
    <AnimatePresence>
      {waiting && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          onClick={applyUpdate}
          aria-label="Update Kelma to the latest version"
          className="fixed left-1/2 top-3 z-[90] flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full border border-teal-400/30 bg-slate-900/95 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-teal-300 ${reloading ? 'animate-spin' : ''}`} />
          {reloading ? 'Updating…' : 'New version — tap to update'}
        </motion.button>
      )}
    </AnimatePresence>,
    document.body
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <ServiceWorkerRegistrar />
    <InstallPromptRegistrar />
    <UpdatePrompt />
    <App />
  </StrictMode>,
)
