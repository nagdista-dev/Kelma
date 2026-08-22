import { useCallback } from 'react';

/**
 * Free text-to-speech using the browser's built-in Web Speech API.
 * No API keys or external services required.
 */
export function useSpeech() {
  const speak = useCallback((text: string, rate = 0.9) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;

    // Prefer a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(v => v.lang === 'en-US') ??
      voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}
