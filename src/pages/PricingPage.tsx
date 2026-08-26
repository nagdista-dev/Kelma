import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Crown, KeyRound, Sparkles, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';

interface Plan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  ctaTo: string;
  featured?: boolean;
  badge?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Bring your own AI key — full access to every feature.',
    cta: 'Start Learning',
    ctaTo: '/session',
    features: [
      'Unlimited sessions with your own API key',
      'All 6 learning rounds per word',
      'Word pronunciation + voice picker',
      'YouGlish real-video exploration',
      'Session reports & history',
      'Installable app (PWA)',
    ],
  },
  {
    name: 'Pro',
    price: 'Soon',
    period: 'coming',
    tagline: 'Managed AI keys — no setup, just learn.',
    cta: 'Join Waitlist',
    ctaTo: '/help',
    featured: true,
    badge: 'Coming soon',
    features: [
      'No API key needed — fully hosted AI',
      'Everything in Free',
      'Smart review scheduling for weak words',
      'Priority model access',
      'Support Nagdista directly 💛',
    ],
  },
];

export function PricingPage() {
  usePageMeta(
    'Pricing',
    'Free forever with your own AI key — managed AI hosting coming soon. No credit card, no signup.',
    '/pricing'
  );
  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/15">
            <Tag className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Pricing</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">
              Simple and honest — bring your own key today, managed AI tomorrow.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto mb-10">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`relative flex h-full flex-col ${
                  plan.featured
                    ? 'border-amber-500/40 ring-1 ring-amber-500/30'
                    : ''
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-md">
                    <Crown className="h-3 w-3" />
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4 flex items-baseline gap-2">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{plan.name}</h2>
                  <span className={`text-2xl font-extrabold ${plan.featured ? 'text-amber-500 dark:text-amber-400' : 'text-teal-600 dark:text-teal-300'}`}>
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-500">{plan.period}</span>
                </div>

                <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">{plan.tagline}</p>

                <ul className="mb-6 space-y-2.5 text-sm text-slate-700 dark:text-gray-300">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  className="mt-auto w-full gap-2"
                  onClick={() => (window.location.href = plan.ctaTo)}
                >
                  {plan.featured && <Sparkles className="h-4 w-4" />}
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-500">
          <KeyRound className="mr-1.5 inline-block h-3.5 w-3.5 text-teal-400" />
          Free plan uses your own provider key (OpenRouter, Gemini, OpenCode…) stored only in your
          browser. See{' '}
          <Link to="/provider" className="font-semibold text-teal-300 underline-offset-2 hover:underline">
            Provider settings
          </Link>{' '}
          or the{' '}
          <Link to="/help" className="font-semibold text-teal-300 underline-offset-2 hover:underline">
            help page
          </Link>{' '}
          to get one.
        </div>
      </motion.div>
    </div>
  );
}
