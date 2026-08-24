import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Atom,
  BookOpen,
  Bot,
  Boxes,
  BrainCircuit,
  Braces,
  CheckCircle,
  CircuitBoard,
  Cloud,
  CloudCog,
  Command,
  Cpu,
  Database,
  Fish,
  Flower2,
  Gem,
  Globe,
  HelpCircle,
  Hexagon,
  KeyRound,
  Layers,
  Library,
  Loader2,
  Network,
  Orbit,
  Plug,
  Rocket,
  Send,
  Server,
  ServerCog,
  Shapes,
  Share2,
  Smile,
  Sparkles,
  Terminal,
  Wind,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ApiKeyInput } from '@/components/ui/ApiKeyInput';
import { PROVIDER_MODELS, NO_KEY_PROVIDERS } from '@/types/index';
import { validateApiKey } from '@/lib/quizDataGenerator';
import type { AIProvider } from '@/types/index';

type ValidationState = 'idle' | 'loading' | 'valid' | 'invalid';

const PROVIDERS: { id: AIProvider; label: string; Icon: LucideIcon }[] = [
  { id: 'kilo', label: 'Kilo Code', Icon: Braces },
  { id: 'llm7', label: 'LLM7.io', Icon: Rocket },
  { id: 'ovh', label: 'OVHcloud', Icon: Server },
  { id: 'pollinations', label: 'Pollinations', Icon: Flower2 },
  { id: 'openai', label: 'OpenAI', Icon: Bot },
  { id: 'google', label: 'Google Gemini', Icon: Gem },
  { id: 'anthropic', label: 'Anthropic Claude', Icon: CloudCog },
  { id: 'cohere', label: 'Cohere', Icon: Cpu },
  { id: 'mistral', label: 'Mistral', Icon: Wind },
  { id: 'groq', label: 'Groq', Icon: Zap },
  { id: 'cerebras', label: 'Cerebras', Icon: BrainCircuit },
  { id: 'deepseek', label: 'DeepSeek', Icon: Fish },
  { id: 'openrouter', label: 'OpenRouter', Icon: Network },
  { id: 'opencode', label: 'OpenCode', Icon: Terminal },
  { id: 'commandcode', label: 'CommandCode', Icon: Command },
  { id: 'xai', label: 'xAI Grok', Icon: Sparkles },
  { id: 'zai', label: 'Z AI GLM', Icon: Hexagon },
  { id: 'nvidia', label: 'NVIDIA NIM', Icon: Atom },
  { id: 'ollama', label: 'Ollama Cloud', Icon: Boxes },
  { id: 'cloudflare', label: 'Cloudflare AI', Icon: Cloud },
  { id: 'huggingface', label: 'Hugging Face', Icon: Smile },
  { id: 'aionlabs', label: 'Aion Labs', Icon: BookOpen },
  { id: 'sambanova', label: 'SambaNova', Icon: Database },
  { id: 'alibaba', label: 'Alibaba Qwen', Icon: Globe },
  { id: 'modelscope', label: 'ModelScope', Icon: Library },
  { id: 'siliconflow', label: 'SiliconFlow', Icon: CircuitBoard },
  { id: 'ai21', label: 'AI21 Jamba', Icon: Layers },
  { id: 'glhf', label: 'Glhf.chat', Icon: Shapes },
  { id: 'nscale', label: 'Nscale', Icon: ServerCog },
  { id: 'nebius', label: 'Nebius', Icon: Orbit },
  { id: 'chutes', label: 'Chutes.ai', Icon: Send },
  { id: 'kluster', label: 'Kluster AI', Icon: Share2 },
];

const KEY_PLACEHOLDERS: Record<AIProvider, string> = {
  openai: 'sk-…',
  commandcode: 'CommandCode API key',
  openrouter: 'sk-or-v1-…',
  opencode: 'OpenCode API key',
  google: 'AQ… or AIza…',
  anthropic: 'sk-ant-…',
  cohere: 'co-…',
  groq: 'gsk_…',
  deepseek: 'sk-…',
  mistral: 'Free mode key',
  xai: 'xai-…',
  aionlabs: 'Aion Labs API key',
  zai: 'Z AI API key',
  huggingface: 'hf_…',
  kilo: 'Not required — leave empty',
  llm7: 'Optional — free token',
  nvidia: 'nvapi-…',
  ollama: 'Ollama API key',
  ovh: 'Not required — leave empty',
  cloudflare: '<account-id>:<api-token>',
  modelscope: 'ms-…',
  siliconflow: 'sk-…',
  pollinations: 'Free tier key — enter.pollinations.ai/keys',
  cerebras: 'csk-…',
  sambanova: 'SambaNova API key',
  ai21: 'AI21 API key',
  glhf: 'Glhf API key',
  nscale: 'Nscale API key',
  nebius: 'Nebius API key',
  chutes: 'Chutes API key',
  kluster: 'Kluster API key',
  alibaba: 'sk-…',
  together: 'Together API key',
  fireworks: 'fw_…',
  novita: 'Novita API key',
  hyperbolic: 'Hyperbolic API key',
  deepinfra: 'DeepInfra API key',
  scaleway: 'Scaleway API key',
  upstage: 'up_…',
  wandb: 'W&B API key',
  typhoon: 'Typhoon API key',
  arli: 'Arli API key',
  poolside: 'Poolside API key',
};

export function ProviderPage() {
  const {
    provider, apiKey, model,
    setProvider, setApiKey, setModel, clearApiKey,
  } = useSettingsStore();

  const [validation, setValidation] = useState<ValidationState>('idle');
  const [validationMsg, setValidationMsg] = useState('');

  const handleValidate = async () => {
    if (!apiKey && !NO_KEY_PROVIDERS.has(provider)) return;
    setValidation('loading');
    setValidationMsg('');
    const result = await validateApiKey(provider, apiKey, model);
    if (result.valid) {
      setValidation('valid');
      setValidationMsg('API key is working.');
    } else {
      setValidation('invalid');
      setValidationMsg(result.error ?? 'Invalid key.');
    }
  };

  const isNoKey = NO_KEY_PROVIDERS.has(provider);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Plug className="w-6 h-6 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Provider</h1>
            <p className="text-sm text-gray-400">
              Choose the provider, model and key used to generate your quizzes
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Provider</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {PROVIDERS.map(({ id, label, Icon }) => {
                const noKey = NO_KEY_PROVIDERS.has(id);
                const selected = provider === id;
                return (
                  <button
                    key={id}
                    id={`provider-${id}`}
                    onClick={() => { setProvider(id); setValidation('idle'); }}
                    className={`relative py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200 text-center ${
                      selected
                        ? noKey
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20'
                          : 'bg-teal-500/20 border-teal-500 text-teal-200'
                        : noKey
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300/80 hover:border-emerald-400 hover:text-emerald-200'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-teal-500/50 hover:text-gray-200'
                    }`}
                  >
                    {noKey && (
                      <span
                        className={`absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          selected ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-500/25 text-emerald-300'
                        }`}
                      >
                        No key
                      </span>
                    )}
                    <Icon
                      className={`w-5 h-5 mx-auto mb-1.5 ${noKey && !selected ? 'text-emerald-400' : ''}`}
                      aria-hidden="true"
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Model selector */}
            <div>
              <label htmlFor="model-select" className="block text-xs text-gray-400 mb-1.5">Model</label>
              <select
                id="model-select"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="input-base text-sm"
              >
                {PROVIDER_MODELS[provider].map(m => (
                  <option key={m.id} value={m.id} className="bg-gray-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* API Key */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">API Key</h2>

            {isNoKey ? (
              <div className="flex items-start gap-2 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This provider is free and needs no API key — pick a model above and start quizzing right away.
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <p className="text-xs text-gray-500">
                  Your key is stored only in your browser&apos;s LocalStorage. It is never sent to any server except directly to the AI provider.
                </p>
                <Link
                  to="/help"
                  id="get-keys-link"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-500 active:scale-95 shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Get keys
                </Link>
              </div>
            )}

            {!isNoKey && (
              <ApiKeyInput
                value={apiKey}
                onChange={(v) => { setApiKey(v); setValidation('idle'); }}
                placeholder={KEY_PLACEHOLDERS[provider]}
                id="settings-api-key"
              />
            )}

            {/* Validation feedback */}
            {validation !== 'idle' && (
              <div className={`flex items-start gap-2 mt-3 text-sm min-w-0 ${
                validation === 'valid' ? 'text-emerald-400' :
                validation === 'invalid' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {validation === 'loading' && <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />}
                {validation === 'valid' && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {validation === 'invalid' && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span className="min-w-0 break-words">{validationMsg || 'Validating…'}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                id="validate-key-btn"
                onClick={() => void handleValidate()}
                disabled={!apiKey || validation === 'loading'}
                loading={validation === 'loading'}
                size="sm"
              >
                Test Key
              </Button>
              {apiKey && (
                <Button
                  id="clear-key-btn"
                  variant="danger"
                  size="sm"
                  onClick={() => { clearApiKey(); setValidation('idle'); setValidationMsg(''); }}
                >
                  Clear Key
                </Button>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <HelpCircle className="w-3.5 h-3.5" />
            Model choice affects token cost — free models are marked as such.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
