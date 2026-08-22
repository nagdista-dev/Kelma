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

  // Unlock the speech engine on the first user interaction.
  // iOS/Safari refuse speak() outside a gesture until the engine
  // has been started by one; a silent utterance does the trick.
  const unlock = () => {
    const synth = window.speechSynthesis;
    synth.resume();
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    synth.speak(silent);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function createUtterance(text: string, rate: number): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = loadVoice();
  if (voice) utterance.voice = voice;
  return utterance;
}

export function useSpeech() {
  // Keep references so Chrome doesn't garbage-collect utterances mid-speech
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  const speak = useCallback((text: string, rate = 0.9) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    // Only interrupt if something is actually playing (keeps Safari happy)
    if (synth.speaking || synth.pending) synth.cancel();

    // Called synchronously so it stays inside the user-gesture context
    const utterance = createUtterance(text, rate);
    utterance.onend = () => { utterancesRef.current = []; };
    utterancesRef.current = [utterance];
    synth.speak(utterance);
  }, []);

  // Queue several clips back-to-back (e.g. word, then its example sentence)
  const speakSequence = useCallback((texts: string[], rate = 0.9) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (texts.length === 0) return;
    const synth = window.speechSynthesis;

    if (synth.speaking || synth.pending) synth.cancel();

    const utterances = texts.map(text => createUtterance(text, rate));
    utterances[utterances.length - 1].onend = () => { utterancesRef.current = []; };
    utterancesRef.current = utterances;
    utterances.forEach(u => synth.speak(u));
  }, []);

  return { speak, speakSequence };
}
