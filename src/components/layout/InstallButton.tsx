import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'pww-install-dismissed-at';
const DISMISS_DAYS = 7;

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function recentlyDismissed() {
  const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Install app popup. Shows a dismissible bottom banner when the app
 * is installable (Android/Chrome native prompt, iOS manual instructions).
 * A compact button also lives in the navbar.
 */
export function InstallButton() {
  const [available, setAvailable] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onAvailable = () => {
      setAvailable(true);
      window.setTimeout(() => setShowPopup(true), 1500);
    };
    window.addEventListener('pww-install-available', onAvailable);

    // iOS Safari never fires beforeinstallprompt — offer manual instructions
    if (isIos()) {
      setIosMode(true);
      window.setTimeout(() => setShowPopup(true), 2000);
    }

    return () => window.removeEventListener('pww-install-available', onAvailable);
  }, []);

  const dismiss = () => {
    setShowPopup(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    const prompt = (window as unknown as Record<string, unknown>).__pwwInstallPrompt as
      | BeforeInstallPromptEvent
      | undefined;
    if (prompt) {
      setShowPopup(false);
      await prompt.prompt();
      return;
    }
    if (isIos()) {
      setShowPopup(false);
      toast.custom(
        () => (
          <div className="flex items-start gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl border border-white/10 max-w-xs">
            <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
            <span>
              On iPhone: tap <b>Share</b>, then choose <b>Add to Home Screen</b> to install the app.
            </span>
          </div>
        ),
        { duration: 6000 }
      );
    }
  };

  const showNavbarButton = !isStandalone() && (available || iosMode);

  return (
    <>
      {/* Compact navbar button */}
      {showNavbarButton && (
        <button
          type="button"
          id="install-app-btn"
          onClick={() => void handleInstall()}
          aria-label="Install Kelma app"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
      )}

      {/* Bottom popup banner */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
            role="dialog"
            aria-label="Install Kelma app"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="absolute right-3 top-3 cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <img src="/favicon.svg" alt="" className="h-11 w-11 rounded-xl border border-white/10" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">
                  Install Kelma
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    by Nagdista
                  </span>
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  {iosMode
                    ? 'Add Kelma to your Home Screen for a full-screen app experience.'
                    : 'Install Kelma on your device — faster, full-screen, works offline.'}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleInstall()}
                    id="popup-install-btn"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95"
                  >
                    {iosMode ? <Share2 className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                    {iosMode ? 'How to install' : 'Install app'}
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="cursor-pointer rounded-lg border border-white/10 px-3.5 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-white/5"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
