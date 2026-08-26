import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * Support page — placeholder. Details (payment links, message) coming later.
 */
export function SupportPage() {
  usePageMeta(
    'Support the project',
    'Kelma is free forever. If it helped you, support the project to keep it alive and growing.',
    '/support'
  );

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
            <HeartHandshake className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Support Kelma</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Kelma is free forever — keep it that way
            </p>
          </div>
        </div>

        <Card className="py-16 text-center">
          <HeartHandshake className="mx-auto mb-4 h-12 w-12 text-amber-500/60" />
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Something is being prepared here.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
