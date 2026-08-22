import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState, AIProvider, LanguageLevel } from '@/types/index';
import { PROVIDER_MODELS } from '@/types/index';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'openai',
      apiKey: '',
      model: PROVIDER_MODELS.openai[0].id,
      theme: 'dark',
      defaultLevel: 'B1',

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

      clearApiKey: () => set({ apiKey: '' }),
    }),
    {
      name: 'pww-settings',
      // Only persist non-sensitive / restorable settings
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        model: state.model,
        theme: state.theme,
        defaultLevel: state.defaultLevel,
      }),
    }
  )
);
