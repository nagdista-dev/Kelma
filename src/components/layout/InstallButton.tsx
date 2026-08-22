import { useEffect, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

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

/**
 * "Install app" button shown on mobile browsers.
 * Android/Chrome: fires the native install prompt.
 * iOS Safari: shows Add-to-Home-Screen instructions.
 */
export function InstallButton() {
  const [available, setAvailable] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onAvailable = () => setAvailable(true);
    window.addEventListener('pww-install-available', onAvailable);

    // iOS Safari never fires beforeinstallprompt — offer manual instructions
    if (isIos()) setIosHint(true);

    return () => window.removeEventListener('pww-install-available', onAvailable);
  }, []);

  const handleInstall = async () => {
    const prompt = (window as unknown as Record<string, unknown>).__pwwInstallPrompt as
      | BeforeInstallPromptEvent
      | undefined;
    if (prompt) {
      await prompt.prompt();
      return;
    }
    if (isIos()) {
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

  if (isStandalone()) return null;
  if (!available && !iosHint) return null;

  return (
    <button
      type="button"
      id="install-app-btn"
      onClick={() => void handleInstall()}
      aria-label="Install Kelma app"
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95"
    >
      <Download className="h-4 w-4" />
      Install App
    </button>
  );
}
