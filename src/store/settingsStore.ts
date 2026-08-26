import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState, AIProvider, LanguageLevel } from '@/types/index';
import { PROVIDER_MODELS } from '@/types/index';

// Default: a verified free, no-key provider so the app works on first open
const DEFAULT_PROVIDER: AIProvider = 'llm7';
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: DEFAULT_PROVIDER,
      apiKey: '',
      model: DEFAULT_MODEL,
      theme: 'dark',
      defaultLevel: 'B1',
      voiceURI: '',
      userName: '',

      setProvider: (provider: AIProvider) =>
        set({ provider, model: PROVIDER_MODELS[provider][0].id }),

      setApiKey: (apiKey: string) => set({ apiKey }),

      setModel: (model: string) => set({ model }),

      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setDefaultLevel: (defaultLevel: LanguageLevel) => set({ defaultLevel }),

      setVoiceURI: (voiceURI: string) => set({ voiceURI }),

      setUserName: (userName: string) => set({ userName }),

      clearApiKey: () => set({ apiKey: '' }),
    }),
    {
      name: 'pww-settings',
      version: 3,
      // Migrate v1/v2 users
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<SettingsState>;
        // v1 users on the old openai default with no key → move to free no-key default
        const staleOpenAI = !s.apiKey && (!s.provider || s.provider === 'openai');
        return {
          provider: staleOpenAI ? DEFAULT_PROVIDER : (s.provider ?? DEFAULT_PROVIDER),
          apiKey: s.apiKey ?? '',
          model: staleOpenAI ? DEFAULT_MODEL : (s.model ?? DEFAULT_MODEL),
          theme: s.theme ?? 'dark',
          defaultLevel: s.defaultLevel ?? 'B1',
          voiceURI: s.voiceURI ?? '',
          userName: s.userName ?? '',
        };
      },
      // Only persist non-sensitive / restorable settings
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        model: state.model,
        theme: state.theme,
        defaultLevel: state.defaultLevel,
        voiceURI: state.voiceURI,
        userName: state.userName,
      }),
    }
  )
);
