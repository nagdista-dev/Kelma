import { motion } from 'framer-motion';
import {
  Bot,
  CloudCog,
  Command,
  Cpu,
  ExternalLink,
  Gem,
  HelpCircle,
  KeyRound,
  Network,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePageMeta } from '@/hooks/usePageMeta';

interface ProviderHelp {
  name: string;
  keyFormat: string;
  link: string;
  linkLabel: string;
  Icon: typeof Bot;
  steps: string[];
  notes: string[];
}

const PROVIDER_HELP: ProviderHelp[] = [
  {
    name: 'OpenAI',
    keyFormat: 'sk-proj-...',
    link: 'https://platform.openai.com/api-keys',
    linkLabel: 'OpenAI API keys',
    Icon: Bot,
    steps: [
      'Sign in to the OpenAI Platform.',
      'Open API keys and create a new secret key.',
      'Make sure the project has billing and model access.',
      'Choose OpenAI in Settings and paste the new key.',
    ],
    notes: ['Try GPT-4o Mini first if a stronger model fails.'],
  },
  {
    name: 'CommandCode',
    keyFormat: 'CommandCode API key',
    link: 'https://commandcode.ai/docs/provider',
    linkLabel: 'CommandCode Provider API docs',
    Icon: Command,
    steps: [
      'Sign in to CommandCode Studio.',
      'Use a plan with Provider API access.',
      'Create an API key from Studio.',
      'Choose CommandCode in Settings and paste that key.',
    ],
    notes: ['CommandCode uses an OpenAI-compatible endpoint for non-Claude models.'],
  },
  {
    name: 'OpenRouter',
    keyFormat: 'sk-or-v1-...',
    link: 'https://openrouter.ai/keys',
    linkLabel: 'OpenRouter keys',
    Icon: Network,
    steps: [
      'Sign in to OpenRouter.',
      'Open Keys and create a new API key.',
      'Add credits if the selected model is not free.',
      'Choose OpenRouter in Settings and paste the key.',
    ],
    notes: ['OpenRouter model names use provider/model, such as openai/gpt-4o.'],
  },
  {
    name: 'OpenCode',
    keyFormat: 'OpenCode API key',
    link: 'https://opencode.ai/zen',
    linkLabel: 'OpenCode Zen',
    Icon: Terminal,
    steps: [
      'Sign in at opencode.ai.',
      'Open your console and create an API key.',
      'Pick a model from the OpenCode list in Settings.',
      'Choose OpenCode in Settings and paste the key.',
    ],
    notes: ['OpenCode Zen uses an OpenAI-compatible endpoint.'],
  },
  {
    name: 'Google Gemini',
    keyFormat: 'AQ... or AIza...',
    link: 'https://aistudio.google.com/app/apikey',
    linkLabel: 'Google AI Studio API keys',
    Icon: Gem,
    steps: [
      'Sign in to Google AI Studio.',
      'Create an API key for the Gemini API.',
      'Use a key shown on the AI Studio API keys page.',
      'Choose Google Gemini in Settings and paste the key.',
    ],
    notes: ['New Google AI Studio auth keys may start with AQ. Older Gemini API keys may start with AIza.'],
  },
  {
    name: 'Anthropic Claude',
    keyFormat: 'sk-ant-...',
    link: 'https://console.anthropic.com/settings/keys',
    linkLabel: 'Anthropic API keys',
    Icon: CloudCog,
    steps: [
      'Sign in to the Anthropic Console.',
      'Open Settings, then API keys.',
      'Create a key and choose an expiration.',
      'Choose Anthropic Claude in Settings and paste the key.',
    ],
    notes: ['Make sure your Anthropic workspace has credits or billing enabled.'],
  },
  {
    name: 'Cohere',
    keyFormat: 'co-...',
    link: 'https://dashboard.cohere.com/api-keys',
    linkLabel: 'Cohere API keys',
    Icon: Cpu,
    steps: [
      'Sign in to the Cohere dashboard.',
      'Open API Keys.',
      'Copy a trial or production key.',
      'Choose Cohere in Settings and paste the key.',
    ],
    notes: ['Cohere keys only work with the Cohere provider, not CommandCode.'],
  },
];

export function HelpPage() {
  usePageMeta(
    'API Key Help',
    'Where to create AI provider keys and what to check when validation fails.',
    '/help'
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
            <HelpCircle className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">API Key Help</h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 sm:text-sm">Where to create keys and what to check when they fail</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-slate-700 dark:text-gray-300">
                <h2 className="font-semibold text-slate-950 dark:text-white">Keep keys private</h2>
                <p className="text-slate-500 dark:text-gray-400">
                  Never paste API keys in chat, screenshots, public repos, or support messages.
                  If a key is exposed, revoke it and create a new one.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {PROVIDER_HELP.map(({ name, keyFormat, link, linkLabel, Icon, steps, notes }) => (
              <Card key={name} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-teal-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <h2 className="text-base font-semibold text-slate-950 dark:text-white">{name}</h2>
                        <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-gray-400">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span className="font-mono break-all">{keyFormat}</span>
                        </div>
                      </div>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-teal-300 hover:text-teal-200 transition-colors"
                      >
                        {linkLabel}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <ol className="space-y-1.5 text-sm text-slate-700 dark:text-gray-300 list-decimal list-inside">
                      {steps.map(step => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>

                    <div className="mt-3 space-y-1">
                      {notes.map(note => (
                        <p key={note} className="text-xs text-slate-500 dark:text-gray-500">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-widest mb-3">
              If Test Key Fails
            </h2>
            <div className="grid gap-2 text-sm text-slate-500 dark:text-gray-400">
              <p>Check that the provider selected in Settings matches the key source.</p>
              <p>Check billing, credits, rate limits, and model access on the provider dashboard.</p>
              <p>Use a fresh key if the old one was pasted anywhere public.</p>
              <p>Try a faster or cheaper model first, then switch to stronger models after validation works.</p>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
