import { useCallback, useRef } from 'react';

/**
 * Free text-to-speech using the browser's built-in Web Speech API.
 * No API keys or external services required.
 */

let cachedVoice: SpeechSynthesisVoice | null = null;

function loadVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoice =
      voices.find(v => v.lang === 'en-US' && v.default) ??
      voices.find(v => v.lang === 'en-US') ??
      voices.find(v => v.lang.startsWith('en')) ??
      null;
  }
  return cachedVoice;
}

// Warm up voice list early (Chrome loads voices asynchronously)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoice();
  window.speechSynthesis.onvoiceschanged = () => loadVoice();
}

export function useSpeech() {
  // Keep a reference to the utterance so Chrome doesn't garbage-collect it mid-speech
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, rate = 0.9) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    // Chrome needs a tick between cancel() and speak() or the new utterance is dropped
    window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voice = loadVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => { utteranceRef.current = null; };
      utteranceRef.current = utterance;
      synth.speak(utterance);
    }, 60);
  }, []);

  return { speak };
}
