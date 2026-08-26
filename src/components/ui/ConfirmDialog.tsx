import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Branded confirmation dialog — replaces window.confirm so every
 * destructive action speaks the app's visual language.
 * Portaled to <body>, closes on backdrop click or Escape.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <span
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                variant === 'danger'
                  ? 'border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400'
                  : 'border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300'
              }`}
            >
              <TriangleAlert className="h-6 w-6" />
            </span>

            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
            {message && (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-gray-400">
                {message}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2.5" ref={cancelRef}>
              <Button variant="secondary" onClick={onCancel} id="confirm-cancel-btn">
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                id="confirm-ok-btn"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
